import { NextResponse } from "next/server"
import { isAddress } from "viem"

import { databaseUnavailableResponse } from "@/lib/api/database-error"
import { seasonErrorResponse } from "@/lib/api/season-errors"
import { getSeasonUserData } from "@/lib/scoring/season-api"

export const dynamic = "force-dynamic"

export async function GET(
  _req: Request,
  { params }: { params: { seasonId: string; address: string } }
) {
  if (!isAddress(params.address)) {
    return NextResponse.json(
      { success: false, error: "Invalid address" },
      { status: 400 }
    )
  }

  try {
    return NextResponse.json({
      success: true,
      ...(await getSeasonUserData(params.seasonId, params.address)),
    })
  } catch (error) {
    const seasonResponse = seasonErrorResponse(error)
    if (seasonResponse) return seasonResponse
    const databaseResponse = databaseUnavailableResponse(error, "season-user")
    if (databaseResponse) return databaseResponse
    throw error
  }
}
