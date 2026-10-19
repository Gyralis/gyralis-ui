import { NextResponse } from "next/server"

import { databaseUnavailableResponse } from "@/lib/api/database-error"
import { assertSeasonScoringReady } from "@/lib/scoring/season-api"
import { getCurrentSeason, publicSeason } from "@/lib/scoring/seasons"

export const dynamic = "force-dynamic"

export async function GET() {
  const current = getCurrentSeason()
  if (!current) {
    return NextResponse.json({ success: true, season: null })
  }

  try {
    await assertSeasonScoringReady(current.id)
    return NextResponse.json({ success: true, season: publicSeason(current) })
  } catch (error) {
    const { seasonErrorResponse } = await import("@/lib/api/season-errors")
    const seasonResponse = seasonErrorResponse(error)
    if (seasonResponse) return seasonResponse
    const databaseResponse = databaseUnavailableResponse(
      error,
      "current-season"
    )
    if (databaseResponse) return databaseResponse
    throw error
  }
}
