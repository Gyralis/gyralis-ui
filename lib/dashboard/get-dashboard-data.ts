import "server-only"

import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { formatUnits } from "viem"

import { defaultDashboardLoopKeys, loopDashboardMeta } from "@/data/loop-dashboard-meta"

import type {
  DashboardCurrentPeriodOverview,
  DashboardDistributionByPeriodRow,
  DashboardGrowthStat,
  DashboardLoopKey,
  DashboardLoopSummary,
  DashboardLoopTableRow,
  DashboardMetricByPeriodRow,
  DashboardOverviewCards,
  DashboardPageData,
  DashboardPeriodStats,
  DashboardPeriodTableRow,
  DashboardTokenSummary,
  GetDashboardDataOptions,
  RawHistorySnapshotEntry,
  RawLoopStatsHistory,
  RawGlobalTokenTotal,
  RawLoopCacheEntry,
  RawLoopPeriodEntry,
  RawLoopRegistrationCache,
} from "./types"

const DEFAULT_CACHE_FILE_PATH = resolve(process.cwd(), "data/loop-registration-cache.json")
const DEFAULT_HISTORY_FILE_PATH = resolve(
  process.cwd(),
  "data/history/loop-stats-history.json"
)
const DEFAULT_PERIODS_BACK = 6
const periodEndedShortFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
})
const periodEndedLongFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
})

function parseInteger(value: string | number | undefined | null): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value !== "string" || value.trim() === "") return null

  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : null
}

function parseCount(value: string | number | undefined | null): number {
  return parseInteger(value) ?? 0
}

function parsePercent(value: string | number | undefined | null): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value !== "string" || value.trim() === "") return null

  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : null
}

function parseAmount(value: string | undefined | null): string | null {
  return typeof value === "string" && value.length > 0 ? value : null
}

function formatBigIntPercent(
  numeratorRaw: string | undefined | null,
  denominatorRaw: string | undefined | null
): number | null {
  if (!numeratorRaw || !denominatorRaw) return null

  const numerator = BigInt(numeratorRaw)
  const denominator = BigInt(denominatorRaw)
  if (denominator === 0n) return null

  const scaled = (numerator * 10000n) / denominator
  return Number(scaled) / 100
}

function filterLoopKeys(loopKeys?: DashboardLoopKey[]): DashboardLoopKey[] {
  const requested = loopKeys?.length ? loopKeys : [...defaultDashboardLoopKeys]
  return requested.filter((loopKey) => loopDashboardMeta[loopKey]?.isVisibleInDashboard)
}

function formatPeriodEndedLabels(periodEndUnix: string | null) {
  if (!periodEndUnix) {
    return {
      periodEndedShortLabel: null,
      periodEndedLongLabel: null,
    }
  }

  const timestampMs = Number.parseInt(periodEndUnix, 10) * 1000
  if (!Number.isFinite(timestampMs)) {
    return {
      periodEndedShortLabel: null,
      periodEndedLongLabel: null,
    }
  }

  const date = new Date(timestampMs)
  return {
    periodEndedShortLabel: periodEndedShortFormatter.format(date),
    periodEndedLongLabel: periodEndedLongFormatter.format(date),
  }
}

function toPeriodStats(
  period: number,
  periodEntry: RawLoopPeriodEntry | undefined,
  includeForDashboard: boolean
): DashboardPeriodStats | null {
  if (!periodEntry || !includeForDashboard) return null

  const periodEndedAtUnix = periodEntry.periodEndExclusive?.unix ?? null
  const { periodEndedShortLabel, periodEndedLongLabel } =
    formatPeriodEndedLabels(periodEndedAtUnix)

  return {
    period,
    periodStartUtc: periodEntry.periodStart?.utc ?? null,
    periodEndUtc: periodEntry.periodEndExclusive?.utc ?? null,
    periodEndedAtUnix,
    periodEndedShortLabel,
    periodEndedLongLabel,
    registeredUserCount: parseCount(
      periodEntry.registeredUserCount ?? periodEntry.registeredUsers?.length
    ),
    claimEventCount: parseCount(periodEntry.claimEventCount),
    claimRatePercent: parsePercent(periodEntry.claimRatePercent),
    totalRegisteredAmount: parseAmount(periodEntry.totalRegisteredAmountFormatted),
    totalClaimedAmount: parseAmount(periodEntry.claimedAmountFormatted),
    totalUnclaimedAmount: parseAmount(periodEntry.unclaimedAmountFormatted),
    newUserCount: parseCount(periodEntry.newUserCount),
    cumulativeUniqueUserCount:
      periodEntry.cumulativeUniqueUserCount == null
        ? null
        : parseCount(periodEntry.cumulativeUniqueUserCount),
  }
}

function buildLoopSummary(loopKey: DashboardLoopKey, rawLoop: RawLoopCacheEntry): DashboardLoopSummary {
  const meta = loopDashboardMeta[loopKey]
  const currentPeriod = parseInteger(rawLoop.currentPeriod)
  const lastProcessedPeriod = parseInteger(rawLoop.lastProcessedPeriod)
  const uniqueUserCount = parseCount(rawLoop.uniqueUserCount ?? rawLoop.uniqueUsers?.length)
  const uniqueClaimUserCount = parseCount(
    rawLoop.uniqueClaimUserCount ?? rawLoop.uniqueClaimUsers?.length
  )

  const periods = Object.entries(rawLoop.periods ?? {})
    .map(([periodKey, periodEntry]) => {
      const period = parseInteger(periodKey)
      if (period == null) return null

      return toPeriodStats(
        period,
        periodEntry,
        lastProcessedPeriod == null || period <= lastProcessedPeriod
      )
    })
    .filter((period): period is DashboardPeriodStats => period != null)
    .sort((a, b) => a.period - b.period)

  const currentPeriodStats =
    lastProcessedPeriod == null
      ? null
      : periods.find((period) => period.period === lastProcessedPeriod) ?? null

  return {
    loopKey,
    meta,
    currentPeriod,
    lastProcessedPeriod,
    uniqueUserCount,
    uniqueClaimUserCount,
    registeredButNeverClaimedCount: Math.max(uniqueUserCount - uniqueClaimUserCount, 0),
    claimParticipationRatePercent: parsePercent(rawLoop.stats?.claimRatePercent),
    totalRegistrationsCount: parseCount(rawLoop.stats?.totalRegistrationsCount),
    totalClaimsCount: parseCount(rawLoop.stats?.totalClaimsCount),
    totalDistributedAmount: parseAmount(rawLoop.stats?.totalRegisteredAmountFormatted),
    totalClaimedAmount: parseAmount(rawLoop.stats?.totalClaimedAmountFormatted),
    totalUnclaimedAmount: parseAmount(rawLoop.stats?.totalUnclaimedAmountFormatted),
    claimedAmountRatePercent: formatBigIntPercent(
      rawLoop.stats?.totalClaimedAmountRaw,
      rawLoop.stats?.totalRegisteredAmountRaw
    ),
    tokenSnapshots: {
      balanceAtPeriod1: rawLoop.token?.snapshots?.balanceAtPeriod1
        ? {
            periodNumber: parseInteger(
              rawLoop.token.snapshots.balanceAtPeriod1.periodNumber
            ),
            blockNumber: parseInteger(
              rawLoop.token.snapshots.balanceAtPeriod1.blockNumber
            ),
            raw: rawLoop.token.snapshots.balanceAtPeriod1.raw ?? null,
            formatted:
              rawLoop.token.snapshots.balanceAtPeriod1.formatted ?? null,
          }
        : null,
      balanceAtPeriod2: rawLoop.token?.snapshots?.balanceAtPeriod2
        ? {
            periodNumber: parseInteger(
              rawLoop.token.snapshots.balanceAtPeriod2.periodNumber
            ),
            blockNumber: parseInteger(
              rawLoop.token.snapshots.balanceAtPeriod2.blockNumber
            ),
            raw: rawLoop.token.snapshots.balanceAtPeriod2.raw ?? null,
            formatted:
              rawLoop.token.snapshots.balanceAtPeriod2.formatted ?? null,
          }
        : null,
      balanceAtLastProcessedPeriod: rawLoop.token?.snapshots
        ?.balanceAtLastProcessedPeriod
        ? {
            periodNumber: parseInteger(
              rawLoop.token.snapshots.balanceAtLastProcessedPeriod.periodNumber
            ),
            blockNumber: parseInteger(
              rawLoop.token.snapshots.balanceAtLastProcessedPeriod.blockNumber
            ),
            raw:
              rawLoop.token.snapshots.balanceAtLastProcessedPeriod.raw ?? null,
            formatted:
              rawLoop.token.snapshots.balanceAtLastProcessedPeriod.formatted ??
              null,
          }
        : null,
    },
    periods,
    currentPeriodStats,
    updatedAt: rawLoop.updatedAt ?? null,
  }
}

function buildOverview(
  loopSummaries: DashboardLoopSummary[],
  tokenSummary: DashboardTokenSummary | undefined,
  uniqueRegisteredUsers: number,
  uniqueClaimUsers: number,
  weekOverWeek: DashboardOverviewCards["weekOverWeek"]
): DashboardOverviewCards {
  const currentPeriod = loopSummaries.reduce<number | null>((maxPeriod, loop) => {
    if (loop.lastProcessedPeriod == null) return maxPeriod
    return maxPeriod == null ? loop.lastProcessedPeriod : Math.max(maxPeriod, loop.lastProcessedPeriod)
  }, null)

  const currentPeriodStats = loopSummaries
    .map((loop) => loop.currentPeriodStats)
    .filter((period): period is DashboardPeriodStats => period != null && period.period === currentPeriod)

  return {
    globalUniqueRegisteredUsers: uniqueRegisteredUsers,
    globalUniqueClaimUsers: uniqueClaimUsers,
    globalRegisteredButNeverClaimedUsers: Math.max(
      uniqueRegisteredUsers - uniqueClaimUsers,
      0
    ),
    totalRegistrations: loopSummaries.reduce(
      (total, loop) => total + loop.totalRegistrationsCount,
      0
    ),
    totalClaims: loopSummaries.reduce((total, loop) => total + loop.totalClaimsCount, 0),
    claimParticipationRatePercent: formatNumberPercent(
      loopSummaries.reduce((total, loop) => total + loop.totalClaimsCount, 0),
      loopSummaries.reduce((total, loop) => total + loop.totalRegistrationsCount, 0)
    ),
    totalDistributedAmount: tokenSummary?.totalDistributedAmount ?? null,
    totalClaimedAmount: tokenSummary?.totalClaimedAmount ?? null,
    totalUnclaimedAmount: tokenSummary?.totalUnclaimedAmount ?? null,
    claimedAmountRatePercent: tokenSummary?.claimedAmountRatePercent ?? null,
    currentPeriod,
    newUsersThisPeriod: currentPeriodStats.reduce(
      (total, period) => total + period.newUserCount,
      0
    ),
    weekOverWeek,
  }
}

function formatNumberPercent(numerator: number, denominator: number): number | null {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
    return null
  }

  return Number(((numerator / denominator) * 100).toFixed(2))
}

function buildCurrentPeriodOverview(
  loopSummaries: DashboardLoopSummary[],
  currentPeriod: number | null
): DashboardCurrentPeriodOverview | null {
  if (currentPeriod == null) return null

  const periods = loopSummaries
    .map((loop) => loop.currentPeriodStats)
    .filter((period): period is DashboardPeriodStats => period != null && period.period === currentPeriod)

  if (periods.length === 0) return null

  const registrations = periods.reduce((total, period) => total + period.registeredUserCount, 0)
  const claims = periods.reduce((total, period) => total + period.claimEventCount, 0)
  const distributedAmount = periods.reduce(
    (total, period) => total + Number.parseFloat(period.totalRegisteredAmount ?? "0"),
    0
  )
  const claimedAmount = periods.reduce(
    (total, period) => total + Number.parseFloat(period.totalClaimedAmount ?? "0"),
    0
  )
  const unclaimedAmount = periods.reduce(
    (total, period) => total + Number.parseFloat(period.totalUnclaimedAmount ?? "0"),
    0
  )

  return {
    period: currentPeriod,
    periodEndedAtUnix: periods[0]?.periodEndedAtUnix ?? null,
    periodEndedShortLabel: periods[0]?.periodEndedShortLabel ?? null,
    periodEndedLongLabel: periods[0]?.periodEndedLongLabel ?? null,
    registrations,
    claims,
    claimRatePercent: formatNumberPercent(claims, registrations),
    distributedAmount: distributedAmount.toString(),
    claimedAmount: claimedAmount.toString(),
    unclaimedAmount: unclaimedAmount.toString(),
  }
}

function buildWindowPeriods(loopSummaries: DashboardLoopSummary[], periodsBack: number): number[] {
  const maxPeriod = loopSummaries.reduce<number | null>((max, loop) => {
    if (loop.lastProcessedPeriod == null) return max
    return max == null ? loop.lastProcessedPeriod : Math.max(max, loop.lastProcessedPeriod)
  }, null)

  if (maxPeriod == null) return []

  const startPeriod = Math.max(maxPeriod - periodsBack + 1, 1)
  return Array.from({ length: maxPeriod - startPeriod + 1 }, (_, index) => startPeriod + index)
}

function findReferencePeriod(
  loopSummaries: DashboardLoopSummary[],
  period: number
): DashboardPeriodStats {
  return (
    loopSummaries
      .flatMap((loop) => loop.periods)
      .find((periodEntry) => periodEntry.period === period) ?? nullPeriod(period)
  )
}

function buildMetricRows(
  loopSummaries: DashboardLoopSummary[],
  periods: number[],
  selector: (period: DashboardPeriodStats) => number | null
): DashboardMetricByPeriodRow[] {
  return periods.map((period) => {
    const referencePeriod = findReferencePeriod(loopSummaries, period)

    return {
      period,
      periodEndedAtUnix: referencePeriod.periodEndedAtUnix,
      periodEndedShortLabel: referencePeriod.periodEndedShortLabel,
      periodEndedLongLabel: referencePeriod.periodEndedLongLabel,
      values: Object.fromEntries(
        loopSummaries.map((loop) => [
          loop.loopKey,
          selector(loop.periods.find((loopPeriod) => loopPeriod.period === period) ?? nullPeriod(period)),
        ])
      ) as Partial<Record<DashboardLoopKey, number | null>>,
    }
  })
}

function nullPeriod(period: number): DashboardPeriodStats {
  return {
    period,
    periodStartUtc: null,
    periodEndUtc: null,
    periodEndedAtUnix: null,
    periodEndedShortLabel: null,
    periodEndedLongLabel: null,
    registeredUserCount: 0,
    claimEventCount: 0,
    claimRatePercent: null,
    totalRegisteredAmount: null,
    totalClaimedAmount: null,
    totalUnclaimedAmount: null,
    newUserCount: 0,
    cumulativeUniqueUserCount: null,
  }
}

function buildDistributionRows(
  loopSummaries: DashboardLoopSummary[],
  periods: number[]
): DashboardDistributionByPeriodRow[] {
  return periods.flatMap((period) =>
    loopSummaries.map((loop) => {
      const loopPeriod = loop.periods.find((entry) => entry.period === period) ?? nullPeriod(period)

      return {
        period,
        periodEndedAtUnix: loopPeriod.periodEndedAtUnix,
        periodEndedShortLabel: loopPeriod.periodEndedShortLabel,
        periodEndedLongLabel: loopPeriod.periodEndedLongLabel,
        loopKey: loop.loopKey,
        loopName: loop.meta.title,
        distributedAmount: loopPeriod.totalRegisteredAmount,
        claimedAmount: loopPeriod.totalClaimedAmount,
        unclaimedAmount: loopPeriod.totalUnclaimedAmount,
      }
    })
  )
}

function buildLoopTableRows(loopSummaries: DashboardLoopSummary[]): DashboardLoopTableRow[] {
  return loopSummaries.map((loop) => ({
    loopKey: loop.loopKey,
    loopName: loop.meta.title,
    uniqueUsers: loop.uniqueUserCount,
    uniqueClaimUsers: loop.uniqueClaimUserCount,
    registeredButNeverClaimedCount: loop.registeredButNeverClaimedCount,
    totalRegistrations: loop.totalRegistrationsCount,
    totalClaims: loop.totalClaimsCount,
    claimParticipationRatePercent: loop.claimParticipationRatePercent,
    totalDistributedAmount: loop.totalDistributedAmount,
    totalClaimedAmount: loop.totalClaimedAmount,
    totalUnclaimedAmount: loop.totalUnclaimedAmount,
    claimedAmountRatePercent: loop.claimedAmountRatePercent,
  }))
}

function buildPeriodTableRows(
  loopSummaries: DashboardLoopSummary[],
  periods: number[]
): DashboardPeriodTableRow[] {
  return periods.flatMap((period) =>
    loopSummaries.map((loop) => {
      const loopPeriod = loop.periods.find((entry) => entry.period === period) ?? nullPeriod(period)

      return {
        period,
        periodEndedAtUnix: loopPeriod.periodEndedAtUnix,
        periodEndedShortLabel: loopPeriod.periodEndedShortLabel,
        periodEndedLongLabel: loopPeriod.periodEndedLongLabel,
        loopKey: loop.loopKey,
        loopName: loop.meta.title,
        registrations: loopPeriod.registeredUserCount,
        claims: loopPeriod.claimEventCount,
        claimRatePercent: loopPeriod.claimRatePercent,
        distributedAmount: loopPeriod.totalRegisteredAmount,
        claimedAmount: loopPeriod.totalClaimedAmount,
        unclaimedAmount: loopPeriod.totalUnclaimedAmount,
        newUsers: loopPeriod.newUserCount,
      }
    })
  )
}

function toTokenSummary(rawTokenTotal: RawGlobalTokenTotal): DashboardTokenSummary {
  return {
    tokenAddress: rawTokenTotal.tokenAddress ?? null,
    tokenSymbol: rawTokenTotal.tokenSymbol ?? null,
    tokenDecimals:
      typeof rawTokenTotal.tokenDecimals === "number" ? rawTokenTotal.tokenDecimals : null,
    totalDistributedAmount: parseAmount(rawTokenTotal.totalRegisteredAmountFormatted),
    totalClaimedAmount: parseAmount(rawTokenTotal.totalClaimedAmountFormatted),
    totalUnclaimedAmount: parseAmount(rawTokenTotal.totalUnclaimedAmountFormatted),
    claimedAmountRatePercent: formatBigIntPercent(
      rawTokenTotal.totalClaimedAmountRaw,
      rawTokenTotal.totalRegisteredAmountRaw
    ),
  }
}

function buildTokenSummariesFromSelectedLoops(
  cache: RawLoopRegistrationCache,
  selectedLoopKeys: DashboardLoopKey[]
): DashboardTokenSummary[] {
  const totalsByToken = new Map<
    string,
    {
      tokenAddress: string
      tokenSymbol: string | null
      tokenDecimals: number | null
      totalRegisteredAmountRaw: bigint
      totalClaimedAmountRaw: bigint
      totalUnclaimedAmountRaw: bigint
    }
  >()

  for (const loopKey of selectedLoopKeys) {
    const rawLoop = cache.loops?.[loopKey]
    const tokenAddress = rawLoop?.token?.address
    if (!rawLoop || !tokenAddress) continue

    const existing = totalsByToken.get(tokenAddress) ?? {
      tokenAddress,
      tokenSymbol: rawLoop.token?.symbol ?? loopDashboardMeta[loopKey].tokenSymbol,
      tokenDecimals:
        typeof rawLoop.token?.decimals === "number" ? rawLoop.token.decimals : null,
      totalRegisteredAmountRaw: 0n,
      totalClaimedAmountRaw: 0n,
      totalUnclaimedAmountRaw: 0n,
    }

    existing.totalRegisteredAmountRaw += BigInt(rawLoop.stats?.totalRegisteredAmountRaw ?? "0")
    existing.totalClaimedAmountRaw += BigInt(rawLoop.stats?.totalClaimedAmountRaw ?? "0")
    existing.totalUnclaimedAmountRaw += BigInt(rawLoop.stats?.totalUnclaimedAmountRaw ?? "0")

    totalsByToken.set(tokenAddress, existing)
  }

  return Array.from(totalsByToken.values()).map((entry) => {
    const decimals = entry.tokenDecimals ?? 18

    return toTokenSummary({
      tokenAddress: entry.tokenAddress,
      tokenSymbol: entry.tokenSymbol,
      tokenDecimals: entry.tokenDecimals ?? undefined,
      totalRegisteredAmountRaw: entry.totalRegisteredAmountRaw.toString(),
      totalRegisteredAmountFormatted: formatUnits(entry.totalRegisteredAmountRaw, decimals),
      totalClaimedAmountRaw: entry.totalClaimedAmountRaw.toString(),
      totalClaimedAmountFormatted: formatUnits(entry.totalClaimedAmountRaw, decimals),
      totalUnclaimedAmountRaw: entry.totalUnclaimedAmountRaw.toString(),
      totalUnclaimedAmountFormatted: formatUnits(entry.totalUnclaimedAmountRaw, decimals),
    })
  })
}

async function readLoopRegistrationCache(cacheFilePath: string): Promise<RawLoopRegistrationCache> {
  const contents = await readFile(cacheFilePath, "utf8")
  return JSON.parse(contents) as RawLoopRegistrationCache
}

async function readLoopStatsHistory(historyFilePath: string): Promise<RawLoopStatsHistory | null> {
  try {
    const contents = await readFile(historyFilePath, "utf8")
    return JSON.parse(contents) as RawLoopStatsHistory
  } catch {
    return null
  }
}

function getSortedHistorySnapshots(
  history: RawLoopStatsHistory | null
): RawHistorySnapshotEntry[] {
  return [...(history?.snapshots ?? [])]
    .filter((snapshot) => typeof snapshot?.date === "string" && snapshot.date.length > 0)
    .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""))
}

function formatHistoryDateLabel(value: string | null | undefined) {
  if (!value) return null

  const parsed = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime())) return value

  return periodEndedShortFormatter.format(parsed)
}

function computeGrowthPercent(current: number, previous: number): number | null {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) return null
  return Number((((current - previous) / previous) * 100).toFixed(2))
}

function buildNumberGrowthStat(
  currentValue: number,
  previousValue: number | undefined,
  previousDate: string | null | undefined
): DashboardGrowthStat | null {
  if (typeof previousValue !== "number") return null

  return {
    currentValue: currentValue.toString(),
    previousValue: previousValue.toString(),
    deltaValue: (currentValue - previousValue).toString(),
    deltaPercent: computeGrowthPercent(currentValue, previousValue),
    previousDate: formatHistoryDateLabel(previousDate),
  }
}

function buildAmountGrowthStat(
  currentValue: string | null,
  previousValue: string | null | undefined,
  previousDate: string | null | undefined
): DashboardGrowthStat | null {
  if (!currentValue || !previousValue) return null

  const current = Number.parseFloat(currentValue)
  const previous = Number.parseFloat(previousValue)
  if (!Number.isFinite(current) || !Number.isFinite(previous)) return null

  return {
    currentValue,
    previousValue,
    deltaValue: (current - previous).toString(),
    deltaPercent: computeGrowthPercent(current, previous),
    previousDate: formatHistoryDateLabel(previousDate),
  }
}

function buildOverviewGrowth(
  history: RawLoopStatsHistory | null,
  selectedLoopKeys: DashboardLoopKey[],
  uniqueRegisteredUsers: number,
  totalDistributedAmount: string | null,
  totalRegistrations: number,
  totalClaims: number
): DashboardOverviewCards["weekOverWeek"] {
  const snapshots = getSortedHistorySnapshots(history)
  const previousSnapshot = snapshots.length > 1 ? snapshots[snapshots.length - 2] : null

  const previousDate = previousSnapshot?.date ?? null

  const previousTotals = selectedLoopKeys.reduce(
    (totals, loopKey) => {
      const loopSnapshot = previousSnapshot?.loops?.[loopKey]
      if (!loopSnapshot) return totals

      totals.uniqueUsers += loopSnapshot.uniqueUserCount ?? 0
      totals.totalRegistrations += loopSnapshot.totalRegistrationsCount ?? 0
      totals.totalClaims += loopSnapshot.totalClaimsCount ?? 0
      totals.totalDistributedRaw += BigInt(loopSnapshot.totalDistributedAmountRaw ?? "0")
      return totals
    },
    {
      uniqueUsers: 0,
      totalRegistrations: 0,
      totalClaims: 0,
      totalDistributedRaw: 0n,
    }
  )
  const previousLoopsIncluded = new Set(previousSnapshot?.global?.loopsIncluded ?? [])
  const selectedLoopsMatchPreviousGlobal =
    previousLoopsIncluded.size === selectedLoopKeys.length &&
    selectedLoopKeys.every((loopKey) => previousLoopsIncluded.has(loopKey))
  const previousUniqueRegisteredUsers = selectedLoopsMatchPreviousGlobal
    ? previousSnapshot?.global?.uniqueUserCount
    : undefined

  return {
    uniqueRegisteredUsers:
      previousSnapshot == null || previousUniqueRegisteredUsers == null
        ? null
        : buildNumberGrowthStat(
            uniqueRegisteredUsers,
            previousUniqueRegisteredUsers,
            previousDate
          ),
    totalDistributedAmount:
      previousSnapshot == null
        ? null
        : buildAmountGrowthStat(
            totalDistributedAmount,
            formatUnits(previousTotals.totalDistributedRaw, 18),
            previousDate
          ),
    totalRegistrations:
      previousSnapshot == null
        ? null
        : buildNumberGrowthStat(
            totalRegistrations,
            previousTotals.totalRegistrations,
            previousDate
          ),
    totalClaims:
      previousSnapshot == null
        ? null
        : buildNumberGrowthStat(totalClaims, previousTotals.totalClaims, previousDate),
  }
}

export async function getDashboardPageData(
  options: GetDashboardDataOptions = {}
): Promise<DashboardPageData> {
  const cacheFilePath = options.cacheFilePath
    ? resolve(process.cwd(), options.cacheFilePath)
    : DEFAULT_CACHE_FILE_PATH
  const historyFilePath = options.historyFilePath
    ? resolve(process.cwd(), options.historyFilePath)
    : DEFAULT_HISTORY_FILE_PATH
  const selectedLoopKeys = filterLoopKeys(options.loopKeys)
  const periodsBack = options.periodsBack ?? DEFAULT_PERIODS_BACK
  const [cache, history] = await Promise.all([
    readLoopRegistrationCache(cacheFilePath),
    readLoopStatsHistory(historyFilePath),
  ])

  const loopSummaries = selectedLoopKeys
    .map((loopKey) => {
      const rawLoop = cache.loops?.[loopKey]
      return rawLoop ? buildLoopSummary(loopKey, rawLoop) : null
    })
    .filter((loop): loop is DashboardLoopSummary => loop != null)

  const windowPeriods = buildWindowPeriods(loopSummaries, periodsBack)
  const tokenSummaries = buildTokenSummariesFromSelectedLoops(cache, selectedLoopKeys)
  const primaryTokenSummary = tokenSummaries[0]

  const uniqueUsers = new Set(
    selectedLoopKeys.flatMap((loopKey) => cache.loops?.[loopKey]?.uniqueUsers ?? [])
  )
  const uniqueClaimUsers = new Set(
    selectedLoopKeys.flatMap((loopKey) => cache.loops?.[loopKey]?.uniqueClaimUsers ?? [])
  )
  const totalRegistrations = loopSummaries.reduce(
    (total, loop) => total + loop.totalRegistrationsCount,
    0
  )
  const totalClaims = loopSummaries.reduce(
    (total, loop) => total + loop.totalClaimsCount,
    0
  )
  const weekOverWeek = buildOverviewGrowth(
    history,
    selectedLoopKeys,
    uniqueUsers.size,
    primaryTokenSummary?.totalDistributedAmount ?? null,
    totalRegistrations,
    totalClaims
  )

  const overview = buildOverview(
    loopSummaries,
    primaryTokenSummary,
    uniqueUsers.size,
    uniqueClaimUsers.size,
    weekOverWeek
  )

  return {
    generatedAt: cache.global?.updatedAt ?? null,
    filters: {
      selectedLoopKeys,
      availableLoopKeys: [...defaultDashboardLoopKeys],
      availablePeriodRange: {
        min: windowPeriods.length > 0 ? windowPeriods[0] : null,
        max: windowPeriods.length > 0 ? windowPeriods[windowPeriods.length - 1] : null,
      },
      periodsBack,
    },
    overview,
    currentPeriodOverview: buildCurrentPeriodOverview(loopSummaries, overview.currentPeriod),
    loopSummaries,
    tokenSummaries,
    charts: {
      periods: windowPeriods,
      registrationsByPeriod: buildMetricRows(
        loopSummaries,
        windowPeriods,
        (period) => period.registeredUserCount
      ),
      claimsByPeriod: buildMetricRows(loopSummaries, windowPeriods, (period) => period.claimEventCount),
      claimRateByPeriod: buildMetricRows(
        loopSummaries,
        windowPeriods,
        (period) => period.claimRatePercent
      ),
      cumulativeUniqueUsersByPeriod: buildMetricRows(
        loopSummaries,
        windowPeriods,
        (period) => period.cumulativeUniqueUserCount
      ),
      distributionByPeriod: buildDistributionRows(loopSummaries, windowPeriods),
    },
    tables: {
      loopSummary: buildLoopTableRows(loopSummaries),
      periodSummary: buildPeriodTableRows(loopSummaries, windowPeriods),
    },
  }
}
