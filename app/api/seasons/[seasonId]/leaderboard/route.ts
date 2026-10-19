import { NextResponse } from "next/server"

import { databaseUnavailableResponse } from "@/lib/api/database-error"
import { parsePagination } from "@/lib/api/pagination"
import { seasonErrorResponse } from "@/lib/api/season-errors"
import {
  countSeasonLeaderboard,
  getSeasonLeaderboard,
} from "@/lib/db/clients/season-scoring.client"
import {
  assertSeasonScoringReady,
  rankSeasonLeaderboardPage,
} from "@/lib/scoring/season-api"
import { publicSeason } from "@/lib/scoring/seasons"

export const dynamic = "force-dynamic"

export async function GET(
  req: Request,
  { params }: { params: { seasonId: string } }
) {
  const { limit, offset } = parsePagination(req.url)
  try {
    const season = await assertSeasonScoringReady(params.seasonId)
    const [rows, totalMatching] = await Promise.all([
      getSeasonLeaderboard({ seasonId: season.id, limit, offset }),
      countSeasonLeaderboard(season.id),
    ])
    return NextResponse.json({
      success: true,
      season: publicSeason(season),
      limit,
      offset,
      totalMatching,
      entries: rankSeasonLeaderboardPage(rows, offset),
    })
  } catch (error) {
    const seasonResponse = seasonErrorResponse(error)
    if (seasonResponse) return seasonResponse
    const databaseResponse = databaseUnavailableResponse(
      error,
      "season-leaderboard"
    )
    if (databaseResponse) return databaseResponse
    throw error
  }
}
