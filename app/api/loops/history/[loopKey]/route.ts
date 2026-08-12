import { NextResponse } from "next/server"

import { getDashboardPageData } from "@/lib/dashboard"
import type { DashboardLoopKey } from "@/lib/dashboard/types"

export const dynamic = "force-dynamic"

const LOOP_KEYS = new Set<DashboardLoopKey>([
  "1hive",
  "blockscout",
  "test-superloops",
])

function parseLoopKey(value: string): DashboardLoopKey | null {
  return LOOP_KEYS.has(value as DashboardLoopKey)
    ? (value as DashboardLoopKey)
    : null
}

export async function GET(
  _req: Request,
  { params }: { params: { loopKey: string } }
) {
  const loopKey = parseLoopKey(params.loopKey)
  if (!loopKey) {
    return NextResponse.json(
      { success: false, error: "Invalid loopKey" },
      { status: 400 }
    )
  }

  const dashboard = await getDashboardPageData({ loopKeys: [loopKey] })
  const loop = dashboard.loopSummaries[0]
  if (!loop) {
    return NextResponse.json(
      { success: false, error: "Loop not found" },
      { status: 404 }
    )
  }

  return NextResponse.json({
    success: true,
    loopKey,
    snapshotDate: loop.updatedAt,
    recordedAt: loop.updatedAt,
    stats: {
      loopName: loop.meta.title,
      uniqueUsers: loop.uniqueUserCount,
      claims: loop.totalClaimsCount,
      registrations: loop.totalRegistrationsCount,
      claimRatePercent: loop.claimParticipationRatePercent,
      distributedAmount: loop.totalDistributedAmount,
      tokenSymbol: loop.meta.tokenSymbol,
    },
  })
}
