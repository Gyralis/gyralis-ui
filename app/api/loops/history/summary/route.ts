import { NextResponse } from "next/server"

import { getDashboardPageData } from "@/lib/dashboard"

export const dynamic = "force-dynamic"

export async function GET() {
  const dashboard = await getDashboardPageData()
  const tokenSummary = dashboard.tokenSummaries[0]

  return NextResponse.json({
    success: true,
    snapshotDate: dashboard.generatedAt,
    recordedAt: dashboard.generatedAt,
    stats: {
      totalClaims: dashboard.overview.totalClaims,
      totalRegistrations: dashboard.overview.totalRegistrations,
      uniqueUsers: dashboard.overview.globalUniqueRegisteredUsers,
      uniqueClaimUsers: dashboard.overview.globalUniqueClaimUsers,
      claimRatePercent: dashboard.overview.claimParticipationRatePercent,
      totalDistributedAmount: dashboard.overview.totalDistributedAmount,
      totalDistributedSymbol: tokenSummary?.tokenSymbol ?? null,
    },
  })
}
