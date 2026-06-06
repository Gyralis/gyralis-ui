import { NextResponse } from "next/server"

import { parsePagination } from "@/lib/api/pagination"
import { getGlobalLeaderboard } from "@/lib/db/clients/leaderboard.client"
import { toRankedLeaderboardEntry } from "@/lib/scoring/responses"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const { limit, offset } = parsePagination(req.url)
  const entries = await getGlobalLeaderboard({ limit, offset })

  return NextResponse.json({
    success: true,
    limit,
    offset,
    entries: entries.map((entry, index) =>
      toRankedLeaderboardEntry(entry, offset + index + 1)
    ),
  })
}
