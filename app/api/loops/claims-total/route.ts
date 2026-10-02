import { NextResponse } from "next/server"

import { getTotalClaims } from "@/lib/loops/get-total-claims"

export const dynamic = "force-dynamic"

const headers = { "Cache-Control": "no-store" }

export async function GET() {
  try {
    return NextResponse.json(await getTotalClaims(), { headers })
  } catch {
    return NextResponse.json(
      { error: "Claim totals are temporarily unavailable" },
      { status: 503, headers }
    )
  }
}
