import { NextResponse } from "next/server"

import { databaseUnavailableResponse } from "@/lib/api/database-error"
import { getUserGlobalStats } from "@/lib/db/clients/global-stats.client"
import { getUserLoopStatsForUser } from "@/lib/db/clients/loop-stats.client"
import { normalizeDbAddress } from "@/lib/db/ids"
import { parseEarnedStreakBonuses } from "@/lib/scoring/responses"

export const dynamic = "force-dynamic"

export async function GET(
  _req: Request,
  { params }: { params: { address: string } }
) {
  const userAddress = normalizeDbAddress(params.address)

  try {
    const [globalStats, loopStats] = await Promise.all([
      getUserGlobalStats(userAddress),
      getUserLoopStatsForUser(userAddress),
    ])

    return NextResponse.json({
      success: true,
      globalStats: globalStats
        ? {
            ...globalStats,
            earnedStreakBonuses: parseEarnedStreakBonuses(
              globalStats.earnedStreakBonuses
            ),
          }
        : null,
      loopStats: loopStats.map((stats) => ({
        ...stats,
        earnedStreakBonuses: parseEarnedStreakBonuses(
          stats.earnedStreakBonuses
        ),
      })),
    })
  } catch (error) {
    const response = databaseUnavailableResponse(error, "user-scoring")
    if (response) return response
    throw error
  }
}
