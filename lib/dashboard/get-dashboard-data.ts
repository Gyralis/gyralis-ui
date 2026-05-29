import "server-only"

import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { formatUnits } from "viem"

import { defaultDashboardLoopKeys, loopDashboardMeta } from "@/data/loop-dashboard-meta"

import type {
  DashboardCurrentPeriodOverview,
  DashboardDistributionByPeriodRow,
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
  RawGlobalTokenTotal,
  RawLoopCacheEntry,
  RawLoopPeriodEntry,
  RawLoopRegistrationCache,
} from "./types"

const DEFAULT_CACHE_FILE_PATH = resolve(process.cwd(), "data/loop-registration-cache.json")
const DEFAULT_PERIODS_BACK = 6

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

function toPeriodStats(
  period: number,
  periodEntry: RawLoopPeriodEntry | undefined,
  includeForDashboard: boolean
): DashboardPeriodStats | null {
  if (!periodEntry || !includeForDashboard) return null

  return {
    period,
    periodStartUtc: periodEntry.periodStart?.utc ?? null,
    periodEndUtc: periodEntry.periodEndExclusive?.utc ?? null,
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
    periods,
    currentPeriodStats,
    updatedAt: rawLoop.updatedAt ?? null,
  }
}

function buildOverview(
  loopSummaries: DashboardLoopSummary[],
  tokenSummary: DashboardTokenSummary | undefined,
  uniqueRegisteredUsers: number,
  uniqueClaimUsers: number
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

function buildMetricRows(
  loopSummaries: DashboardLoopSummary[],
  periods: number[],
  selector: (period: DashboardPeriodStats) => number | null
): DashboardMetricByPeriodRow[] {
  return periods.map((period) => ({
    period,
    values: Object.fromEntries(
      loopSummaries.map((loop) => [
        loop.loopKey,
        selector(loop.periods.find((loopPeriod) => loopPeriod.period === period) ?? nullPeriod(period)),
      ])
    ) as Partial<Record<DashboardLoopKey, number | null>>,
  }))
}

function nullPeriod(period: number): DashboardPeriodStats {
  return {
    period,
    periodStartUtc: null,
    periodEndUtc: null,
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

export async function getDashboardPageData(
  options: GetDashboardDataOptions = {}
): Promise<DashboardPageData> {
  const cacheFilePath = options.cacheFilePath
    ? resolve(process.cwd(), options.cacheFilePath)
    : DEFAULT_CACHE_FILE_PATH
  const selectedLoopKeys = filterLoopKeys(options.loopKeys)
  const periodsBack = options.periodsBack ?? DEFAULT_PERIODS_BACK
  const cache = await readLoopRegistrationCache(cacheFilePath)

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

  const overview = buildOverview(
    loopSummaries,
    primaryTokenSummary,
    uniqueUsers.size,
    uniqueClaimUsers.size
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
