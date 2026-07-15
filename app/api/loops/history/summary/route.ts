import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

type GlobalHistorySnapshot = {
  uniqueUserCount?: number
  uniqueClaimUserCount?: number
  totalRegistrationsCount?: number
  totalClaimsCount?: number
  totalDistributedAmountFormatted?: string | null
  tokenSymbol?: string | null
  tokenTotals?: Array<{
    tokenSymbol?: string | null
    totalDistributedAmountFormatted?: string | null
  }>
}

type HistorySnapshotEntry = {
  date?: string
  recordedAt?: string
  global?: GlobalHistorySnapshot
}

type LoopStatsHistory = {
  snapshots?: HistorySnapshotEntry[]
}

const HISTORY_FILE_PATH = resolve(
  process.cwd(),
  "data/history/loop-stats-history.json"
)

export async function GET() {
  const raw = await readFile(HISTORY_FILE_PATH, "utf8")
  const history = JSON.parse(raw) as LoopStatsHistory
  const latestSnapshot = history.snapshots?.at(-1)
  const globalStats = latestSnapshot?.global

  if (!latestSnapshot || !globalStats) {
    return NextResponse.json(
      { success: false, error: "History summary not found" },
      { status: 404 }
    )
  }

  const totalClaims = globalStats.totalClaimsCount ?? 0
  const totalRegistrations = globalStats.totalRegistrationsCount ?? 0
  const claimRatePercent =
    totalRegistrations > 0 ? (totalClaims / totalRegistrations) * 100 : null
  const distributedToken =
    globalStats.tokenTotals?.find((token) => {
      const amount = Number(token.totalDistributedAmountFormatted ?? "0")
      return Number.isFinite(amount) && amount > 0
    }) ?? null
  const totalDistributedAmount =
    distributedToken?.totalDistributedAmountFormatted ??
    globalStats.totalDistributedAmountFormatted ??
    null
  const totalDistributedSymbol =
    distributedToken?.tokenSymbol ?? globalStats.tokenSymbol ?? null

  return NextResponse.json({
    success: true,
    snapshotDate: latestSnapshot.date ?? null,
    recordedAt: latestSnapshot.recordedAt ?? null,
    stats: {
      totalClaims,
      totalRegistrations,
      uniqueUsers: globalStats.uniqueUserCount ?? 0,
      uniqueClaimUsers: globalStats.uniqueClaimUserCount ?? 0,
      claimRatePercent,
      totalDistributedAmount,
      totalDistributedSymbol,
    },
  })
}
