import { NextResponse } from "next/server"
import { isAddress } from "viem"

import { getProfileStatsData } from "@/lib/profile/get-profile-page-data"
import type { ProfileSummary } from "@/lib/profile/profile-level"

export const dynamic = "force-dynamic"

export async function GET(
  _request: Request,
  { params }: { params: { address: string } }
) {
  if (!isAddress(params.address)) {
    return NextResponse.json({ error: "Invalid user address" }, { status: 400 })
  }

  try {
    const stats = await getProfileStatsData(params.address)
    if (!stats)
      return NextResponse.json(
        { error: "Invalid user address" },
        { status: 400 }
      )
    const summary = stats.loopStats.reduce<ProfileSummary>(
      (total, loop) => ({
        address: stats.address,
        totalPoints: total.totalPoints + loop.totalPoints,
        totalClaims: total.totalClaims + loop.totalClaims,
      }),
      { address: stats.address, totalPoints: 0, totalClaims: 0 }
    )
    return NextResponse.json(summary, {
      headers: { "Cache-Control": "private, no-store" },
    })
  } catch (error) {
    console.error("[profile-summary] Failed to load profile stats", error)
    return NextResponse.json(
      { error: "Unable to load profile stats" },
      { status: 503 }
    )
  }
}
