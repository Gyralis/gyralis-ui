import type { LoopContractType } from "@/lib/contracts/loop-contracts"

export type DashboardLoopKey = "1hive" | "blockscout" | "test-superloops"

export interface DashboardLoopMeta {
  loopKey: DashboardLoopKey
  contractType: LoopContractType
  title: string
  shortTitle: string
  by: string
  description: string
  logoSrc: string
  brandColor: string
  chainName: string
  tokenSymbol: string
  isVisibleInDashboard: boolean
}

export interface DashboardPeriodStats {
  period: number
  periodStartUtc: string | null
  periodEndUtc: string | null
  periodEndedAtUnix: string | null
  periodEndedShortLabel: string | null
  periodEndedLongLabel: string | null
  registeredUserCount: number
  claimEventCount: number
  claimRatePercent: number | null
  totalRegisteredAmount: string | null
  totalClaimedAmount: string | null
  totalUnclaimedAmount: string | null
  newUserCount: number
  cumulativeUniqueUserCount: number | null
}

export interface DashboardLoopSummary {
  loopKey: DashboardLoopKey
  meta: DashboardLoopMeta
  currentPeriod: number | null
  lastProcessedPeriod: number | null
  uniqueUserCount: number
  uniqueClaimUserCount: number
  registeredButNeverClaimedCount: number
  claimParticipationRatePercent: number | null
  totalRegistrationsCount: number
  totalClaimsCount: number
  totalDistributedAmount: string | null
  totalClaimedAmount: string | null
  totalUnclaimedAmount: string | null
  claimedAmountRatePercent: number | null
  periods: DashboardPeriodStats[]
  currentPeriodStats: DashboardPeriodStats | null
  updatedAt: string | null
}

export interface DashboardOverviewCards {
  globalUniqueRegisteredUsers: number
  globalUniqueClaimUsers: number
  globalRegisteredButNeverClaimedUsers: number
  totalRegistrations: number
  totalClaims: number
  claimParticipationRatePercent: number | null
  totalDistributedAmount: string | null
  totalClaimedAmount: string | null
  totalUnclaimedAmount: string | null
  claimedAmountRatePercent: number | null
  currentPeriod: number | null
  newUsersThisPeriod: number
}

export interface DashboardCurrentPeriodOverview {
  period: number
  periodEndedAtUnix: string | null
  periodEndedShortLabel: string | null
  periodEndedLongLabel: string | null
  registrations: number
  claims: number
  claimRatePercent: number | null
  distributedAmount: string | null
  claimedAmount: string | null
  unclaimedAmount: string | null
}

export interface DashboardMetricByPeriodRow {
  period: number
  periodEndedAtUnix: string | null
  periodEndedShortLabel: string | null
  periodEndedLongLabel: string | null
  values: Partial<Record<DashboardLoopKey, number | null>>
}

export interface DashboardDistributionByPeriodRow {
  period: number
  periodEndedAtUnix: string | null
  periodEndedShortLabel: string | null
  periodEndedLongLabel: string | null
  loopKey: DashboardLoopKey
  loopName: string
  distributedAmount: string | null
  claimedAmount: string | null
  unclaimedAmount: string | null
}

export interface DashboardPeriodTableRow {
  period: number
  periodEndedAtUnix: string | null
  periodEndedShortLabel: string | null
  periodEndedLongLabel: string | null
  loopKey: DashboardLoopKey
  loopName: string
  registrations: number
  claims: number
  claimRatePercent: number | null
  distributedAmount: string | null
  claimedAmount: string | null
  unclaimedAmount: string | null
  newUsers: number
}

export interface DashboardLoopTableRow {
  loopKey: DashboardLoopKey
  loopName: string
  uniqueUsers: number
  uniqueClaimUsers: number
  registeredButNeverClaimedCount: number
  totalRegistrations: number
  totalClaims: number
  claimParticipationRatePercent: number | null
  totalDistributedAmount: string | null
  totalClaimedAmount: string | null
  totalUnclaimedAmount: string | null
  claimedAmountRatePercent: number | null
}

export interface DashboardTokenSummary {
  tokenAddress: string | null
  tokenSymbol: string | null
  tokenDecimals: number | null
  totalDistributedAmount: string | null
  totalClaimedAmount: string | null
  totalUnclaimedAmount: string | null
  claimedAmountRatePercent: number | null
}

export interface DashboardFilters {
  selectedLoopKeys: DashboardLoopKey[]
  availableLoopKeys: DashboardLoopKey[]
  availablePeriodRange: {
    min: number | null
    max: number | null
  }
  periodsBack: number
}

export interface DashboardCharts {
  periods: number[]
  registrationsByPeriod: DashboardMetricByPeriodRow[]
  claimsByPeriod: DashboardMetricByPeriodRow[]
  claimRateByPeriod: DashboardMetricByPeriodRow[]
  cumulativeUniqueUsersByPeriod: DashboardMetricByPeriodRow[]
  distributionByPeriod: DashboardDistributionByPeriodRow[]
}

export interface DashboardTables {
  loopSummary: DashboardLoopTableRow[]
  periodSummary: DashboardPeriodTableRow[]
}

export interface DashboardPageData {
  generatedAt: string | null
  indexedBlocks: Array<{
    chainId: number
    chainName: string
    blockNumber: number
    hasIndexingErrors: boolean
  }>
  filters: DashboardFilters
  overview: DashboardOverviewCards
  currentPeriodOverview: DashboardCurrentPeriodOverview | null
  loopSummaries: DashboardLoopSummary[]
  tokenSummaries: DashboardTokenSummary[]
  charts: DashboardCharts
  tables: DashboardTables
}

export interface GetDashboardDataOptions {
  loopKeys?: DashboardLoopKey[]
  periodsBack?: number
}
