import { NextResponse } from "next/server"
import { z } from "zod"

import { syncUserClaimFromReceipt } from "@/lib/scoring/user-claim-sync"

export const dynamic = "force-dynamic"
export const maxDuration = 30

const addressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/)
const syncUserClaimSchema = z.object({
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  chainId: z.coerce.number().int().positive(),
  loopId: z.coerce.number().int().nonnegative(),
  contractAddress: addressSchema,
  periodNumber: z.coerce.number().int().nonnegative().optional(),
})

export async function POST(
  req: Request,
  { params }: { params: { user: string } }
) {
  const userAddress = params.user.toLowerCase()
  if (!addressSchema.safeParse(userAddress).success) {
    return NextResponse.json(
      { success: false, error: "Invalid user address" },
      { status: 400 }
    )
  }

  const body = await req.json().catch(() => ({}))
  const parsed = syncUserClaimSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid request payload" },
      { status: 400 }
    )
  }

  try {
    const result = await syncUserClaimFromReceipt({
      ...parsed.data,
      txHash: parsed.data.txHash as `0x${string}`,
      userAddress,
    })

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("[scoring-user-sync] failed", error)
    return NextResponse.json(
      { success: false, error: "User scoring sync failed" },
      { status: 500 }
    )
  }
}
