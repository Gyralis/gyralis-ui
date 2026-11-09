import { NextResponse } from "next/server"
import { isAddress } from "viem"

import { databaseUnavailableResponse } from "@/lib/api/database-error"
import { seasonErrorResponse } from "@/lib/api/season-errors"
import { getCurrentSeasonStreaks } from "@/lib/scoring/season-api"

export const dynamic = "force-dynamic"

export async function GET(
  _req: Request,
  { params }: { params: { address: string } }
) {
  if (!isAddress(params.address, { strict: false })) {
    return NextResponse.json(
      { success: false, error: "Invalid address" },
      { status: 400 }
    )
  }
  try {
    return NextResponse.json(
      {
        success: true,
        ...(await getCurrentSeasonStreaks(params.address.toLowerCase())),
      },
      {
        headers: { "Cache-Control": "private, no-store" },
      }
    )
  } catch (error) {
    const response =
      seasonErrorResponse(error) ??
      databaseUnavailableResponse(error, "season-streaks")
    if (response) return response
    throw error
  }
}
