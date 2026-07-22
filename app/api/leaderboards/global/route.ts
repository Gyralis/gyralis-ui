import { NextResponse } from "next/server"

import { databaseUnavailableResponse } from "@/lib/api/database-error"
import { parseLeaderboardQuery } from "@/lib/api/leaderboard-query"
import { getGlobalLeaderboard } from "@/lib/db/clients/leaderboard.client"
import { toRankedLeaderboardEntry } from "@/lib/scoring/responses"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const query = parseLeaderboardQuery(req.url)

  try {
    const entries = await getGlobalLeaderboard(query)

    return NextResponse.json({
      success: true,
      limit: query.limit,
      offset: query.offset,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      filters: query.filters,
      entries: entries.map((entry, index) =>
        toRankedLeaderboardEntry(entry, query.offset + index + 1)
      ),
    })
  } catch (error) {
    const response = databaseUnavailableResponse(error, "global-leaderboard")
    if (response) return response
    throw error
  }
}
