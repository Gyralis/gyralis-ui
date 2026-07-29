import { NextResponse } from "next/server"
import { DEFAULT_NEXTAUTH_SECRET, env } from "@/env.mjs"
import { z } from "zod"

import { runScoringSync } from "@/lib/scoring/sync"

export const dynamic = "force-dynamic"
export const maxDuration = 60

const syncRequestSchema = z.object({
  mode: z.enum(["incremental", "full"]).optional(),
  loopId: z.coerce.number().int().nonnegative().optional(),
  chainId: z.coerce.number().int().positive().optional(),
})

function getProvidedApiKey(req: Request) {
  const bearer = req.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)
  return req.headers.get("x-nextauth-secret") ?? bearer?.[1]
}

function validatePostSecret(req: Request): NextResponse | undefined {
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
}

function validateCronSecret(req: Request): NextResponse | undefined {
  if (!env.CRON_SECRET) {
    return NextResponse.json(
      { success: false, error: "Cron secret is not configured" },
      { status: 500 }
    )
  }

  if (req.headers.get("authorization") !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    )
  }
}

async function runSync(input: z.infer<typeof syncRequestSchema>) {
  try {
    const result = await runScoringSync(input)
    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("[scoring-sync] failed", error)
    return NextResponse.json(
      { success: false, error: "Scoring sync failed" },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  const unauthorized = validateCronSecret(req)
  if (unauthorized) return unauthorized

  return runSync({ mode: "incremental" })
}

export async function POST(req: Request) {
  const unauthorized = validatePostSecret(req)
  if (unauthorized) return unauthorized

  const body = await req.json().catch(() => ({}))
  const parsed = syncRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid request payload" },
      { status: 400 }
    )
  }

  return runSync(parsed.data)
}
