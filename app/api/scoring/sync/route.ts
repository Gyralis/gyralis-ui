import { NextResponse } from "next/server"
import { DEFAULT_NEXTAUTH_SECRET, env } from "@/env.mjs"
import { z } from "zod"

import { runScoringSync } from "@/lib/scoring/sync"

export const dynamic = "force-dynamic"

const syncRequestSchema = z.object({
  mode: z.enum(["incremental", "full"]).optional(),
  loopAddress: z.string().min(1).optional(),
  chainId: z.coerce.number().int().positive().optional(),
})

function getProvidedApiKey(req: Request) {
  const bearer = req.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)
  return req.headers.get("x-nextauth-secret") ?? bearer?.[1]
}

export async function POST(req: Request) {
  if (env.NEXTAUTH_SECRET === DEFAULT_NEXTAUTH_SECRET) {
    return NextResponse.json(
      { success: false, error: "Scoring sync secret is not configured" },
      { status: 500 }
    )
  }

  if (getProvidedApiKey(req) !== env.NEXTAUTH_SECRET) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    )
  }

  try {
    const body = await req.json().catch(() => ({}))
    const parsed = syncRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request payload" },
        { status: 400 }
      )
    }

    const result = await runScoringSync(parsed.data)
    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("[scoring-sync] failed", error)
    return NextResponse.json(
      { success: false, error: "Scoring sync failed" },
      { status: 500 }
    )
  }
}
