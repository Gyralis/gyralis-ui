import { NextResponse } from "next/server"

import { databaseUnavailableResponse } from "@/lib/api/database-error"
import { parseLeaderboardQuery } from "@/lib/api/leaderboard-query"
import { getLeaderboardData } from "@/lib/leaderboard/get-leaderboard-data"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const query = parseLeaderboardQuery(req.url)

  try {
    const includeGlobalRank =
      new URL(req.url).searchParams.get("includeGlobalRank") === "true"
    return NextResponse.json(await getLeaderboardData(query, includeGlobalRank))
  } catch (error) {
    const response = databaseUnavailableResponse(error, "global-leaderboard")
    if (response) return response
    throw error
  }
}
