import { NextResponse } from "next/server"

import { databaseUnavailableResponse } from "@/lib/api/database-error"
import { getLeaderboardSummary } from "@/lib/leaderboard/get-leaderboard-data"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    return NextResponse.json(await getLeaderboardSummary())
  } catch (error) {
    const response = databaseUnavailableResponse(error, "leaderboard-summary")
    if (response) return response
    throw error
  }
}
