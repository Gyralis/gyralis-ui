import { NextResponse } from "next/server"

import { databaseUnavailableResponse } from "@/lib/api/database-error"
import { parseLeaderboardQuery } from "@/lib/api/leaderboard-query"
import { getLoopLeaderboard } from "@/lib/db/clients/leaderboard.client"
import { toRankedLeaderboardEntry } from "@/lib/scoring/responses"

export const dynamic = "force-dynamic"

export async function GET(
  req: Request,
  { params }: { params: { chainId: string; loopId: string } }
) {
  const query = parseLeaderboardQuery(req.url)
  const chainId = Number(params.chainId)
  if (!Number.isInteger(chainId) || chainId <= 0) {
    return NextResponse.json(
      { success: false, error: "Invalid chainId" },
      { status: 400 }
    )
  }
  const loopId = Number(params.loopId)
  if (!Number.isSafeInteger(loopId) || loopId < 0) {
    return NextResponse.json(
      { success: false, error: "Invalid loopId" },
      { status: 400 }
    )
  }

  try {
    const entries = await getLoopLeaderboard({
      chainId,
      loopId,
      limit: query.limit,
      offset: query.offset,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      filters: query.filters,
    })

    return NextResponse.json({
      success: true,
      limit: query.limit,
      offset: query.offset,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      filters: query.filters,
      chainId,
      loopId,
      entries: entries.map((entry, index) =>
        toRankedLeaderboardEntry(entry, query.offset + index + 1)
      ),
    })
  } catch (error) {
    const response = databaseUnavailableResponse(error, "loop-leaderboard")
    if (response) return response
    throw error
  }
}
