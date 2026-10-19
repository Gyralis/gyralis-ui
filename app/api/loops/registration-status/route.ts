import { NextResponse } from "next/server"
import { isAddress } from "viem"
import { z } from "zod"

import { getRegistrationStatus } from "@/lib/loops/get-registration-status"

export const dynamic = "force-dynamic"
export const maxDuration = 30

const querySchema = z.object({
  chainId: z.coerce.number().int().positive(),
  loopAddress: z.string().refine(isAddress),
  periodNumber: z.coerce.number().int().nonnegative().safe(),
  userAddress: z.string().refine(isAddress),
})

const headers = { "Cache-Control": "private, no-store" }

export async function GET(request: Request) {
  const parsed = querySchema.safeParse(
    Object.fromEntries(new URL(request.url).searchParams)
  )
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid registration-status query" },
      { status: 400, headers }
    )
  }

  try {
    const result = await getRegistrationStatus({
      ...parsed.data,
      loopAddress: parsed.data.loopAddress,
      userAddress: parsed.data.userAddress,
    })
    return NextResponse.json({ success: true, result }, { headers })
  } catch (error) {
    console.error("[loop-registration] lookup failed", error)
    return NextResponse.json(
      {
        success: false,
        error: "Registration status is temporarily unavailable",
      },
      { status: 503, headers }
    )
  }
}
