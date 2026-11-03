import { NextResponse } from "next/server"
import { isAddress } from "viem"

import { getLatestActivity } from "@/lib/activity/get-latest-activity"
import { parseActivityScope } from "@/lib/activity/scope"

export const dynamic = "force-dynamic"

export async function GET(
  request: Request,
  { params }: { params: { address: string } }
) {
  if (!isAddress(params.address, { strict: false })) {
    return NextResponse.json(
      { error: "Invalid wallet address" },
      { status: 400 }
    )
  }
  let scope
  try {
    scope = parseActivityScope(new URL(request.url).searchParams.get("scope"))
  } catch {
    return NextResponse.json(
      { error: "Invalid activity scope" },
      { status: 400 }
    )
  }
  try {
    return NextResponse.json(await getLatestActivity(params.address, scope), {
      headers: { "Cache-Control": "private, no-store" },
    })
  } catch {
    return NextResponse.json(
      { error: "Latest activity is temporarily unavailable" },
      { status: 503 }
    )
  }
}
