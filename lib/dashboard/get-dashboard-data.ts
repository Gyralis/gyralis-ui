import "server-only"

import {
  defaultDashboardLoopKeys,
  loopDashboardMeta,
} from "@/data/loop-dashboard-meta"
import { env } from "@/env.mjs"
import { createPublicClient, formatUnits, http, parseAbi } from "viem"
import { gnosis } from "viem/chains"

import type {
  DashboardCurrentPeriodOverview,
  DashboardDistributionByPeriodRow,
  DashboardLoopKey,
  DashboardLoopSummary,
  DashboardMetricByPeriodRow,
  DashboardPageData,
  DashboardPeriodStats,
  DashboardTokenSummary,
  GetDashboardDataOptions,
} from "./types"

const REVALIDATE_SECONDS = 300
const EVENT_PAGE_SIZE = 1000
const DEFAULT_PERIODS_BACK = 7

const loopAbi = parseAbi([
  "function getCurrentPeriod() view returns (uint256)",
  "function getLoopDetails() view returns (address token, uint256 periodLength, uint256 percentPerPeriod, uint256 firstPeriodStart)",
])
const erc20Abi = parseAbi([
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
])

const liveLoopSources = {
  "1hive": {
    subgraphId: "3",
    address: "0x8995641fb3E452bC1359E79A738a6DE556015696",
  },
  blockscout: {
    subgraphId: "4",
    address: "0xaB25dBaFD11b1eb606B2455Eecec67e6746E409b",
  },
} as const

interface SubgraphPeriod {
  periodNumber: string
  totalRegisteredUsers: string
  totalClaims: string
  totalPayout: string
}

interface SubgraphLoop {
  id: string
  token: string | null
  registersCount: string
  claimsCount: string
  totalPayout: string
  periods: SubgraphPeriod[]
}

interface SubgraphEvent {
  id: string
  periodNumber: string
  timestamp: string
  account: { id: string }
}

interface LoopSchedule {
  currentPeriod: number
  firstPeriodStart: bigint
  periodLength: bigint
  tokenAddress: string | null
  tokenSymbol: string
  tokenDecimals: number
}

interface LiveLoopData {
  loopKey: DashboardLoopKey
  loop: SubgraphLoop
  registerEvents: SubgraphEvent[]
  claimEvents: SubgraphEvent[]
  schedule: LoopSchedule
}

const dashboardQuery = `
  query Dashboard($loopIds: [ID!]!) {
    _meta { block { number } hasIndexingErrors }
    loops(where: { id_in: $loopIds }, orderBy: id, orderDirection: asc) {
      id
      token
      registersCount
      claimsCount
      totalPayout
      periods(first: 1000, orderBy: periodNumber, orderDirection: asc) {
        periodNumber
        totalRegisteredUsers
        totalClaims
        totalPayout
      }
    }
  }
`

function eventQuery(entity: "registerEvents" | "claimEvents") {
  return `
    query Events($loopId: ID!, $first: Int!, $afterId: ID!) {
      ${entity}(
        first: $first
        orderBy: id
        orderDirection: asc
        where: { loop: $loopId, id_gt: $afterId }
      ) {
        id
        periodNumber
        timestamp
        account { id }
      }
    }
  `
}

async function querySubgraph<T>(
  query: string,
  variables: Record<string, unknown>
): Promise<T> {
  if (!env.GYRALIS_SUBGRAPH_URL) {
    throw new Error("GYRALIS_SUBGRAPH_URL is required for the live dashboard")
  }

  const response = await fetch(env.GYRALIS_SUBGRAPH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: REVALIDATE_SECONDS },
  })
  if (!response.ok) {
    throw new Error(
      `Dashboard subgraph request failed with status ${response.status}`
    )
  }

  const payload = (await response.json()) as {
    data?: T
    errors?: Array<{ message: string }>
  }
  if (payload.errors?.length || !payload.data) {
    throw new Error(
      payload.errors?.map((error) => error.message).join("; ") ??
        "Dashboard subgraph returned no data"
    )
  }
  return payload.data
}

async function fetchAllEvents(
  entity: "registerEvents" | "claimEvents",
  loopId: string
): Promise<SubgraphEvent[]> {
  const events: SubgraphEvent[] = []
  let afterId = ""

  for (;;) {
    const data = await querySubgraph<Record<typeof entity, SubgraphEvent[]>>(
      eventQuery(entity),
      { loopId, first: EVENT_PAGE_SIZE, afterId }
    )
    const page = data[entity]
    events.push(...page)
    if (page.length < EVENT_PAGE_SIZE) return events
    afterId = page[page.length - 1]?.id ?? afterId
  }
}

async function fetchLoopSchedule(
  address: `0x${string}`,
  fallbackPeriod: number,
  fallbackToken: string | null
): Promise<LoopSchedule> {
  const client = createPublicClient({ chain: gnosis, transport: http() })

  try {
    const [currentPeriod, details] = await Promise.all([
      client.readContract({
        address,
        abi: loopAbi,
        functionName: "getCurrentPeriod",
      }),
      client.readContract({
        address,
        abi: loopAbi,
        functionName: "getLoopDetails",
      }),
    ])
    const tokenAddress = details[0]
    const [tokenSymbol, tokenDecimals] = await Promise.all([
      client.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "symbol",
      }),
      client.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "decimals",
      }),
    ])

    return {
      currentPeriod: Number(currentPeriod),
      firstPeriodStart: details[3],
      periodLength: details[1],
      tokenAddress,
      tokenSymbol,
      tokenDecimals,
    }
  } catch (error) {
    console.error(`[dashboard] failed to read schedule for ${address}`, error)
    return {
      currentPeriod: fallbackPeriod,
      firstPeriodStart: 0n,
      periodLength: 0n,
      tokenAddress: fallbackToken,
      tokenSymbol: "HNY",
      tokenDecimals: 18,
    }
  }
}

function percent(numerator: number, denominator: number): number | null {
  if (denominator === 0) return null
  return Number(((numerator / denominator) * 100).toFixed(2))
}

function eventTimestamp(events: SubgraphEvent[]): number {
  return events.reduce(
    (latest, event) => Math.max(latest, Number(event.timestamp)),
    0
  )
}

function periodWindow(schedule: LoopSchedule, period: number) {
  if (schedule.firstPeriodStart === 0n || schedule.periodLength === 0n) {
    return { start: null, end: null }
  }
  const start =
    schedule.firstPeriodStart + BigInt(period) * schedule.periodLength
  const end = start + schedule.periodLength
  return {
    start: new Date(Number(start) * 1000),
    end: new Date(Number(end) * 1000),
  }
}

const shortDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
})
const longDate = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
})

function buildPeriodStats(data: LiveLoopData): DashboardPeriodStats[] {
  const firstRegistrationPeriod = new Map<string, number>()
  for (const event of data.registerEvents) {
    const account = event.account.id.toLowerCase()
    const period = Number(event.periodNumber)
    const current = firstRegistrationPeriod.get(account)
    if (current == null || period < current)
      firstRegistrationPeriod.set(account, period)
  }

  let cumulativeUniqueUsers = 0
  const newUsersByPeriod = new Map<number, number>()
  for (const period of firstRegistrationPeriod.values()) {
    newUsersByPeriod.set(period, (newUsersByPeriod.get(period) ?? 0) + 1)
  }

  return data.loop.periods
    .filter(
      (period) => Number(period.periodNumber) <= data.schedule.currentPeriod
    )
    .sort((a, b) => Number(a.periodNumber) - Number(b.periodNumber))
    .map((period) => {
      const periodNumber = Number(period.periodNumber)
      const registrations = Number(period.totalRegisteredUsers)
      const claims = Number(period.totalClaims)
      const claimedRaw = BigInt(period.totalPayout)
      const payoutPerUser = claims > 0 ? claimedRaw / BigInt(claims) : 0n
      const distributedRaw = payoutPerUser * BigInt(registrations)
      const unclaimedRaw =
        distributedRaw > claimedRaw ? distributedRaw - claimedRaw : 0n
      const newUsers = newUsersByPeriod.get(periodNumber) ?? 0
      cumulativeUniqueUsers += newUsers
      const window = periodWindow(data.schedule, periodNumber)

      return {
        period: periodNumber,
        periodStartUtc: window.start?.toUTCString() ?? null,
        periodEndUtc: window.end?.toUTCString() ?? null,
        periodEndedAtUnix: window.end
          ? Math.floor(window.end.getTime() / 1000).toString()
          : null,
        periodEndedShortLabel: window.end ? shortDate.format(window.end) : null,
        periodEndedLongLabel: window.end ? longDate.format(window.end) : null,
        registeredUserCount: registrations,
        claimEventCount: claims,
        claimRatePercent: percent(claims, registrations),
        totalRegisteredAmount: formatUnits(
          distributedRaw,
          data.schedule.tokenDecimals
        ),
        totalClaimedAmount: formatUnits(
          claimedRaw,
          data.schedule.tokenDecimals
        ),
        totalUnclaimedAmount: formatUnits(
          unclaimedRaw,
          data.schedule.tokenDecimals
        ),
        newUserCount: newUsers,
        cumulativeUniqueUserCount: cumulativeUniqueUsers,
      }
    })
}

function sumAmounts(
  periods: DashboardPeriodStats[],
  key: "totalRegisteredAmount" | "totalClaimedAmount" | "totalUnclaimedAmount"
) {
  return periods
    .reduce((total, period) => total + Number(period[key] ?? 0), 0)
    .toString()
}

function buildLoopSummary(data: LiveLoopData): DashboardLoopSummary {
  const periods = buildPeriodStats(data)
  const uniqueUsers = new Set(
    data.registerEvents.map((event) => event.account.id.toLowerCase())
  )
  const uniqueClaimUsers = new Set(
    data.claimEvents.map((event) => event.account.id.toLowerCase())
  )
  const registrations = Number(data.loop.registersCount)
  const claims = Number(data.loop.claimsCount)
  const totalDistributedAmount = sumAmounts(periods, "totalRegisteredAmount")
  const totalClaimedAmount = formatUnits(
    BigInt(data.loop.totalPayout),
    data.schedule.tokenDecimals
  )
  const totalUnclaimedAmount = Math.max(
    Number(totalDistributedAmount) - Number(totalClaimedAmount),
    0
  ).toString()
  const latestTimestamp = Math.max(
    eventTimestamp(data.registerEvents),
    eventTimestamp(data.claimEvents)
  )

  return {
    loopKey: data.loopKey,
    meta: loopDashboardMeta[data.loopKey],
    currentPeriod: data.schedule.currentPeriod,
    lastProcessedPeriod: data.schedule.currentPeriod,
    uniqueUserCount: uniqueUsers.size,
    uniqueClaimUserCount: uniqueClaimUsers.size,
    registeredButNeverClaimedCount: Math.max(
      uniqueUsers.size - uniqueClaimUsers.size,
      0
    ),
    claimParticipationRatePercent: percent(claims, registrations),
    totalRegistrationsCount: registrations,
    totalClaimsCount: claims,
    totalDistributedAmount,
    totalClaimedAmount,
    totalUnclaimedAmount,
    claimedAmountRatePercent: percent(
      Number(totalClaimedAmount),
      Number(totalDistributedAmount)
    ),
    periods,
    currentPeriodStats:
      periods.find((period) => period.period === data.schedule.currentPeriod) ??
      null,
    updatedAt: latestTimestamp
      ? new Date(latestTimestamp * 1000).toISOString()
      : null,
  }
}

function buildMetricRows(
  loops: DashboardLoopSummary[],
  periods: number[],
  select: (period: DashboardPeriodStats) => number | null
): DashboardMetricByPeriodRow[] {
  return periods.map((periodNumber) => {
    const reference = loops
      .flatMap((loop) => loop.periods)
      .find((period) => period.period === periodNumber)
    return {
      period: periodNumber,
      periodEndedAtUnix: reference?.periodEndedAtUnix ?? null,
      periodEndedShortLabel: reference?.periodEndedShortLabel ?? null,
      periodEndedLongLabel: reference?.periodEndedLongLabel ?? null,
      values: Object.fromEntries(
        loops.map((loop) => {
          const period = loop.periods.find(
            (item) => item.period === periodNumber
          )
          return [loop.loopKey, period ? select(period) : 0]
        })
      ),
    }
  })
}

function buildDistributionRows(
  loops: DashboardLoopSummary[],
  periods: number[]
): DashboardDistributionByPeriodRow[] {
  return periods.flatMap((periodNumber) =>
    loops.map((loop) => {
      const period = loop.periods.find((item) => item.period === periodNumber)
      return {
        period: periodNumber,
        periodEndedAtUnix: period?.periodEndedAtUnix ?? null,
        periodEndedShortLabel: period?.periodEndedShortLabel ?? null,
        periodEndedLongLabel: period?.periodEndedLongLabel ?? null,
        loopKey: loop.loopKey,
        loopName: loop.meta.title,
        distributedAmount: period?.totalRegisteredAmount ?? null,
        claimedAmount: period?.totalClaimedAmount ?? null,
        unclaimedAmount: period?.totalUnclaimedAmount ?? null,
      }
    })
  )
}

function buildCurrentPeriodOverview(
  loops: DashboardLoopSummary[],
  currentPeriod: number | null
): DashboardCurrentPeriodOverview | null {
  if (currentPeriod == null) return null
  const periods = loops
    .map((loop) =>
      loop.periods.find((period) => period.period === currentPeriod)
    )
    .filter((period): period is DashboardPeriodStats => period != null)
  if (!periods.length) return null
  const registrations = periods.reduce(
    (sum, period) => sum + period.registeredUserCount,
    0
  )
  const claims = periods.reduce(
    (sum, period) => sum + period.claimEventCount,
    0
  )
  return {
    period: currentPeriod,
    periodEndedAtUnix: periods[0]?.periodEndedAtUnix ?? null,
    periodEndedShortLabel: periods[0]?.periodEndedShortLabel ?? null,
    periodEndedLongLabel: periods[0]?.periodEndedLongLabel ?? null,
    registrations,
    claims,
    claimRatePercent: percent(claims, registrations),
    distributedAmount: sumAmounts(periods, "totalRegisteredAmount"),
    claimedAmount: sumAmounts(periods, "totalClaimedAmount"),
    unclaimedAmount: sumAmounts(periods, "totalUnclaimedAmount"),
  }
}

export async function getDashboardPageData(
  options: GetDashboardDataOptions = {}
): Promise<DashboardPageData> {
  const selectedLoopKeys = (
    options.loopKeys?.length ? options.loopKeys : [...defaultDashboardLoopKeys]
  ).filter(
    (key): key is keyof typeof liveLoopSources =>
      loopDashboardMeta[key]?.isVisibleInDashboard && key in liveLoopSources
  )
  const loopIds = selectedLoopKeys.map((key) => liveLoopSources[key].subgraphId)
  const dashboard = await querySubgraph<{
    _meta: { block: { number: number }; hasIndexingErrors: boolean }
    loops: SubgraphLoop[]
  }>(dashboardQuery, { loopIds })

  const liveLoops = await Promise.all(
    selectedLoopKeys.map(async (loopKey): Promise<LiveLoopData> => {
      const source = liveLoopSources[loopKey]
      const loop = dashboard.loops.find((item) => item.id === source.subgraphId)
      if (!loop)
        throw new Error(`Subgraph loop ${source.subgraphId} is missing`)
      const fallbackPeriod = loop.periods.reduce(
        (latest, period) =>
          Number(period.totalClaims) > 0
            ? Math.max(latest, Number(period.periodNumber))
            : latest,
        0
      )
      const [registerEvents, claimEvents, schedule] = await Promise.all([
        fetchAllEvents("registerEvents", loop.id),
        fetchAllEvents("claimEvents", loop.id),
        fetchLoopSchedule(source.address, fallbackPeriod, loop.token),
      ])
      return { loopKey, loop, registerEvents, claimEvents, schedule }
    })
  )

  const loopSummaries = liveLoops.map(buildLoopSummary)
  const maxPeriod = loopSummaries.reduce(
    (latest, loop) => Math.max(latest, loop.lastProcessedPeriod ?? 0),
    0
  )
  const periodsBack = options.periodsBack ?? DEFAULT_PERIODS_BACK
  const periods = Array.from(
    { length: Math.min(periodsBack, maxPeriod) },
    (_, index) => maxPeriod - Math.min(periodsBack, maxPeriod) + 1 + index
  )
  const globalUsers = new Set(
    liveLoops.flatMap((loop) =>
      loop.registerEvents.map((event) => event.account.id.toLowerCase())
    )
  )
  const globalClaimUsers = new Set(
    liveLoops.flatMap((loop) =>
      loop.claimEvents.map((event) => event.account.id.toLowerCase())
    )
  )
  const totalRegistrations = loopSummaries.reduce(
    (sum, loop) => sum + loop.totalRegistrationsCount,
    0
  )
  const totalClaims = loopSummaries.reduce(
    (sum, loop) => sum + loop.totalClaimsCount,
    0
  )
  const totalDistributedAmount = loopSummaries
    .reduce((sum, loop) => sum + Number(loop.totalDistributedAmount ?? 0), 0)
    .toString()
  const totalClaimedAmount = loopSummaries
    .reduce((sum, loop) => sum + Number(loop.totalClaimedAmount ?? 0), 0)
    .toString()
  const totalUnclaimedAmount = Math.max(
    Number(totalDistributedAmount) - Number(totalClaimedAmount),
    0
  ).toString()
  const token = liveLoops[0]?.schedule
  const tokenSummaries: DashboardTokenSummary[] = token
    ? [
        {
          tokenAddress: token.tokenAddress,
          tokenSymbol: token.tokenSymbol,
          tokenDecimals: token.tokenDecimals,
          totalDistributedAmount,
          totalClaimedAmount,
          totalUnclaimedAmount,
          claimedAmountRatePercent: percent(
            Number(totalClaimedAmount),
            Number(totalDistributedAmount)
          ),
        },
      ]
    : []
  const generatedAt =
    loopSummaries
      .map((loop) => loop.updatedAt)
      .filter((value): value is string => value != null)
      .sort()
      .at(-1) ?? null

  return {
    generatedAt,
    indexedBlocks: [
      {
        chainId: gnosis.id,
        chainName: "Gnosis",
        blockNumber: dashboard._meta.block.number,
        hasIndexingErrors: dashboard._meta.hasIndexingErrors,
      },
    ],
    filters: {
      selectedLoopKeys,
      availableLoopKeys: [...defaultDashboardLoopKeys],
      availablePeriodRange: {
        min: periods[0] ?? null,
        max: periods.at(-1) ?? null,
      },
      periodsBack,
    },
    overview: {
      globalUniqueRegisteredUsers: globalUsers.size,
      globalUniqueClaimUsers: globalClaimUsers.size,
      globalRegisteredButNeverClaimedUsers: Math.max(
        globalUsers.size - globalClaimUsers.size,
        0
      ),
      totalRegistrations,
      totalClaims,
      claimParticipationRatePercent: percent(totalClaims, totalRegistrations),
      totalDistributedAmount,
      totalClaimedAmount,
      totalUnclaimedAmount,
      claimedAmountRatePercent: percent(
        Number(totalClaimedAmount),
        Number(totalDistributedAmount)
      ),
      currentPeriod: maxPeriod,
      newUsersThisPeriod: loopSummaries.reduce(
        (sum, loop) => sum + (loop.currentPeriodStats?.newUserCount ?? 0),
        0
      ),
    },
    currentPeriodOverview: buildCurrentPeriodOverview(loopSummaries, maxPeriod),
    loopSummaries,
    tokenSummaries,
    charts: {
      periods,
      registrationsByPeriod: buildMetricRows(
        loopSummaries,
        periods,
        (period) => period.registeredUserCount
      ),
      claimsByPeriod: buildMetricRows(
        loopSummaries,
        periods,
        (period) => period.claimEventCount
      ),
      claimRateByPeriod: buildMetricRows(
        loopSummaries,
        periods,
        (period) => period.claimRatePercent
      ),
      cumulativeUniqueUsersByPeriod: buildMetricRows(
        loopSummaries,
        periods,
        (period) => period.cumulativeUniqueUserCount
      ),
      distributionByPeriod: buildDistributionRows(loopSummaries, periods),
    },
    tables: {
      loopSummary: loopSummaries.map((loop) => ({
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
      })),
      periodSummary: periods.flatMap((periodNumber) =>
        loopSummaries.map((loop) => {
          const period = loop.periods.find(
            (item) => item.period === periodNumber
          )
          return {
            period: periodNumber,
            periodEndedAtUnix: period?.periodEndedAtUnix ?? null,
            periodEndedShortLabel: period?.periodEndedShortLabel ?? null,
            periodEndedLongLabel: period?.periodEndedLongLabel ?? null,
            loopKey: loop.loopKey,
            loopName: loop.meta.title,
            registrations: period?.registeredUserCount ?? 0,
            claims: period?.claimEventCount ?? 0,
            claimRatePercent: period?.claimRatePercent ?? null,
            distributedAmount: period?.totalRegisteredAmount ?? null,
            claimedAmount: period?.totalClaimedAmount ?? null,
            unclaimedAmount: period?.totalUnclaimedAmount ?? null,
            newUsers: period?.newUserCount ?? 0,
          }
        })
      ),
    },
  }
}
