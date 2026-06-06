import { NextResponse } from "next/server"

import { parsePagination } from "@/lib/api/pagination"
import { getLoopLeaderboard } from "@/lib/db/clients/leaderboard.client"
import { toRankedLeaderboardEntry } from "@/lib/scoring/responses"

export const dynamic = "force-dynamic"

export async function GET(
  req: Request,
  { params }: { params: { chainId: string; loopAddress: string } }
) {
  const { limit, offset } = parsePagination(req.url)
  const chainId = Number(params.chainId)
  if (!Number.isInteger(chainId) || chainId <= 0) {
    return NextResponse.json(
      { success: false, error: "Invalid chainId" },
      { status: 400 }
    )
  }

  const entries = await getLoopLeaderboard({
    chainId,
    loopAddress: params.loopAddress,
    limit,
    offset,
  })

  return NextResponse.json({
    success: true,
    limit,
    offset,
    chainId,
    loopAddress: params.loopAddress.toLowerCase(),
    entries: entries.map((entry, index) =>
      toRankedLeaderboardEntry(entry, offset + index + 1)
    ),
  })
}
