import { NextResponse } from "next/server"

import { databaseUnavailableResponse } from "@/lib/api/database-error"
import { getUserGlobalStats } from "@/lib/db/clients/global-stats.client"
import { getUserProfile } from "@/lib/db/clients/user-profile.client"
import { normalizeDbAddress } from "@/lib/db/ids"

export const dynamic = "force-dynamic"

export async function GET(
  _req: Request,
  { params }: { params: { address: string } }
) {
  const userAddress = normalizeDbAddress(params.address)

  try {
    const [profile, globalStats] = await Promise.all([
      getUserProfile(userAddress),
      getUserGlobalStats(userAddress),
    ])

    if (!profile && !globalStats) {
      return NextResponse.json(
        { success: false, error: "User profile not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      profile,
      globalStats,
    })
  } catch (error) {
    const response = databaseUnavailableResponse(error, "user-profile")
    if (response) return response
    throw error
  }
}
