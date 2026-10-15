import { NextResponse } from "next/server"

import { databaseUnavailableResponse } from "@/lib/api/database-error"
import { getSeasonCatalog } from "@/lib/scoring/season-api"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    return NextResponse.json({ success: true, ...(await getSeasonCatalog()) })
  } catch (error) {
    const response = databaseUnavailableResponse(error, "seasons")
    if (response) return response
    throw error
  }
}
