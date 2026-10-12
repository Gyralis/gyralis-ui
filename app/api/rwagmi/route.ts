import { NextResponse } from "next/server"
import { z } from "zod"

import {
  lookupRwagmiLaunch,
  RwagmiVerificationError,
} from "@/lib/loops/rwagmi-creator"
import {
  rwagmiRequestSchema,
  uncheckedRwagmiChecks,
  type RwagmiChecks,
} from "@/lib/loops/rwagmi-eligibility"
import { requestPassportScore } from "@/integrations/gitcoin-passport/api/passport-score"

const scoreSchema = z.object({
  score: z.union([
    z.number().finite().nonnegative(),
    z
      .string()
      .trim()
      .regex(/^\d+(?:\.\d+)?$/)
      .refine((value) => Number.isFinite(Number(value))),
  ]),
})
function failure(
  code: string,
  error: string,
  status: number,
  checks: RwagmiChecks,
  retryAfter?: number
) {
  return NextResponse.json(
    { success: false, eligible: false, code, error, checks },
    {
      status,
      headers: {
        "Cache-Control": "private, no-store",
        ...(retryAfter ? { "Retry-After": String(retryAfter) } : {}),
      },
    }
  )
}

export async function POST(req: Request) {
  const requestId = `rwagmi:${crypto.randomUUID()}`
  const parsed = rwagmiRequestSchema.safeParse(
    await req.json().catch(() => null)
  )
  if (!parsed.success)
    return failure(
      "INVALID_REQUEST",
      "Provide valid wallet and Base token addresses.",
      400,
      uncheckedRwagmiChecks
    )
  const { userAddress, tokenAddress } = parsed.data
  const threshold = Number(process.env.THRESHOLD_SCORE ?? 0)
  if (!Number.isFinite(threshold) || threshold < 0) {
    return failure(
      "INTERNAL_ERROR",
      "Eligibility verification is not configured. Please try again later.",
      500,
      uncheckedRwagmiChecks
    )
  }
  const passportMessage = `Your Human Passport score must be at least ${threshold}. Open GyraHub to improve or sync your score, then try again.`
  // Passport is always fresh and is the first external check.
  try {
    const response = await requestPassportScore(
      userAddress,
      `${requestId}:passport-score`
    )
    if (response.status === 404)
      return failure("PASSPORT_SCORE_REQUIRED", passportMessage, 403, {
        passport: "failed",
        creator: "not_checked",
      })
    if (!response.ok) throw new Error(`Passport HTTP ${response.status}`)
    const score = scoreSchema.safeParse(await response.json())
    if (!score.success) throw new Error("Invalid Passport score")
    if (Number(score.data.score) < threshold)
      return failure("PASSPORT_SCORE_REQUIRED", passportMessage, 403, {
        passport: "failed",
        creator: "not_checked",
      })
  } catch (error) {
    console.error(`[${requestId}] Passport verification unavailable`, error)
    return failure(
      "PASSPORT_UNAVAILABLE",
      "Unable to check Human Passport right now. Please try again shortly.",
      503,
      { passport: "unavailable", creator: "not_checked" }
    )
  }
  try {
    const launch = await lookupRwagmiLaunch(tokenAddress)
    const failed: RwagmiChecks = { passport: "passed", creator: "failed" }
    if (!launch)
      return failure(
        "TOKEN_NOT_FOUND",
        "Token not found on RWAGMI. Check the address, or try again shortly if you just launched it.",
        404,
        failed
      )
    if (launch.creator.toLowerCase() !== userAddress.toLowerCase()) {
      return failure(
        "PROVIDER_ELIGIBILITY_REQUIRED",
        "This wallet did not create this token. Connect the creator wallet or change the token address.",
        403,
        failed
      )
    }
    return NextResponse.json(
      {
        success: true,
        eligible: true,
        checks: { passport: "passed", creator: "passed" },
      },
      { headers: { "Cache-Control": "private, no-store" } }
    )
  } catch (error) {
    const checks: RwagmiChecks = { passport: "passed", creator: "unavailable" }
    if (error instanceof RwagmiVerificationError)
      return failure(error.code, error.message, 503, checks, error.retryAfter)
    console.error(`[${requestId}] RWAGMI verification failed`, error)
    return failure(
      "RWAGMI_UNAVAILABLE",
      "Unable to verify your RWAGMI launch right now. Please try again shortly.",
      503,
      checks
    )
  }
}
