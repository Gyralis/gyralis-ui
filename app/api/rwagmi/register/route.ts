import { NextResponse } from "next/server"
import { createPublicClient, http, parseAbi } from "viem"
import { base } from "viem/chains"
import { z } from "zod"

import { findAllowlistedLoop } from "@/lib/loops/eligibility"
import { generateEligibilitySignature } from "@/lib/loops/eligibility-signature"
import {
  rwagmiAddressSchema,
  rwagmiRequestSchema,
} from "@/lib/loops/rwagmi-eligibility"

import { POST as verifyEligibility } from "../route"

const requestSchema = rwagmiRequestSchema.extend({
  loopAddress: rwagmiAddressSchema,
  chainId: z.literal(8453),
})
const client = createPublicClient({
  chain: base,
  transport: http(undefined, { timeout: 8000, retryCount: 0 }),
})
const abi = parseAbi(["function getCurrentPeriod() view returns (uint256)"])
function failure(code: string, error: string, status: number) {
  return NextResponse.json(
    { success: false, code, error },
    { status, headers: { "Cache-Control": "private, no-store" } }
  )
}
export async function POST(req: Request) {
  const parsed = requestSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success)
    return failure(
      "INVALID_REQUEST",
      "Provide valid wallet, token and Loop addresses with chainId 8453.",
      400
    )
  const { userAddress, tokenAddress, loopAddress, chainId } = parsed.data
  const loop = findAllowlistedLoop("rwagmi", loopAddress, chainId)
  if (!loop || loop.contractType !== "loop")
    return failure(
      "LOOP_NOT_ENABLED",
      "This Loop is not enabled for RWAGMI registration testing.",
      403
    )
  const privateKey = process.env.TRUSTED_BACKEND_SIGNER_PK
  if (!privateKey || !/^0x[0-9a-fA-F]{64}$/.test(privateKey))
    return failure(
      "INTERNAL_ERROR",
      "The trusted backend signer is not configured for registration.",
      500
    )
  // Reuse the exact standalone checks; never trust a browser's earlier result.
  const eligibility = await verifyEligibility(
    new Request(req.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userAddress, tokenAddress }),
    })
  )
  if (!eligibility.ok) return eligibility
  let nextPeriod: number
  try {
    const currentPeriod = await client.readContract({
      address: loop.address,
      abi,
      functionName: "getCurrentPeriod",
    })
    nextPeriod = Number(currentPeriod + 1n)
    if (!Number.isSafeInteger(nextPeriod))
      throw new Error("Invalid Loop period")
  } catch {
    return failure(
      "LOOP_UNAVAILABLE",
      "Unable to read the Loop registration period. Please try again.",
      503
    )
  }
  try {
    const signature = await generateEligibilitySignature({
      userAddress: userAddress as `0x${string}`,
      loopAddress: loop.address,
      chainId,
      nextPeriod,
      privateKey: privateKey as `0x${string}`,
    })
    return NextResponse.json(
      {
        success: true,
        eligible: true,
        signature,
        nextPeriod,
        checks: { passport: "passed", creator: "passed" },
      },
      { headers: { "Cache-Control": "private, no-store" } }
    )
  } catch {
    return failure(
      "INTERNAL_ERROR",
      "Unable to generate the registration approval. Check the backend signer configuration.",
      500
    )
  }
}
