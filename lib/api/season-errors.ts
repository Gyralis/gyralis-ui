import { NextResponse } from "next/server"

import {
  SeasonNotFoundError,
  SeasonRebuildRequiredError,
} from "@/lib/scoring/season-api"

export function seasonErrorResponse(error: unknown) {
  if (error instanceof SeasonNotFoundError) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 404 }
    )
  }
  if (error instanceof SeasonRebuildRequiredError) {
    return NextResponse.json(
      { success: false, error: "Season scoring rebuild required" },
      { status: 503 }
    )
  }
}
