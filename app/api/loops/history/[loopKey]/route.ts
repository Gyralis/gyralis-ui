import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { NextResponse } from "next/server"

import type { DashboardLoopKey } from "@/lib/dashboard/types"

export const dynamic = "force-dynamic"

type LoopHistorySnapshot = {
  loopKey?: string
  loopName?: string
  uniqueUserCount?: number
  totalClaimsCount?: number
  totalDistributedAmountFormatted?: string | null
  tokenSymbol?: string | null
}

type HistorySnapshotEntry = {
  date?: string
  recordedAt?: string
  loops?: Partial<Record<DashboardLoopKey, LoopHistorySnapshot>>
}

type LoopStatsHistory = {
  snapshots?: HistorySnapshotEntry[]
}

const HISTORY_FILE_PATH = resolve(
  process.cwd(),
  "data/history/loop-stats-history.json"
)

const LOOP_KEYS = new Set<DashboardLoopKey>([
  "1hive",
  "blockscout",
  "test-superloops",
])

function parseLoopKey(value: string): DashboardLoopKey | null {
  return LOOP_KEYS.has(value as DashboardLoopKey)
    ? (value as DashboardLoopKey)
    : null
}

export async function GET(
  _req: Request,
  { params }: { params: { loopKey: string } }
) {
  const loopKey = parseLoopKey(params.loopKey)
  if (!loopKey) {
    return NextResponse.json(
      { success: false, error: "Invalid loopKey" },
      { status: 400 }
    )
  }

  const raw = await readFile(HISTORY_FILE_PATH, "utf8")
  const history = JSON.parse(raw) as LoopStatsHistory
  const latestSnapshot = history.snapshots?.at(-1)
  const loopSnapshot = latestSnapshot?.loops?.[loopKey]

  if (!latestSnapshot || !loopSnapshot) {
    return NextResponse.json(
      { success: false, error: "Loop history not found" },
      { status: 404 }
    )
  }

  return NextResponse.json({
    success: true,
    loopKey,
    snapshotDate: latestSnapshot.date ?? null,
    recordedAt: latestSnapshot.recordedAt ?? null,
    stats: {
      loopName: loopSnapshot.loopName ?? null,
      uniqueUsers: loopSnapshot.uniqueUserCount ?? 0,
      claims: loopSnapshot.totalClaimsCount ?? 0,
      distributedAmount:
        loopSnapshot.totalDistributedAmountFormatted ?? null,
      tokenSymbol: loopSnapshot.tokenSymbol ?? null,
    },
  })
}
