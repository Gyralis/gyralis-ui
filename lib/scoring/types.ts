export interface StreakBonusConfig {
  streak: number
  points: number
}

export interface ScoringConfig {
  claimPoints: number
  streakBonuses: StreakBonusConfig[]
}

export interface ClaimScoringEvent {
  id: string
  userAddress: string
  loopId: number
  chainId: number
  periodNumber: number
  blockNumber: number
  timestamp?: Date
  txHash?: string
  payout?: string
  logIndex?: number
}

export interface EarnedStreakBonus {
  streak: number
  points: number
}

export interface UserLoopScoringStats {
  userAddress: string
  loopId: number
  chainId: number
  totalClaims: number
  claimPoints: number
  streakBonusPoints: number
  totalPoints: number
  currentStreak: number
  longestStreak: number
  lastClaimedPeriod: number | null
  earnedStreakBonuses: EarnedStreakBonus[]
}

export interface UserGlobalScoringStats {
  userAddress: string
  totalClaims: number
  claimPoints: number
  streakBonusPoints: number
  totalPoints: number
  activeLoopStreaks: number
  longestStreak: number
  loopCount: number
  earnedStreakBonuses: EarnedStreakBonus[]
}

export const leaderboardSortFields = [
  "totalPoints",
  "claimPoints",
  "streakBonusPoints",
  "totalClaims",
  "currentStreak",
  "activeLoopStreaks",
  "longestStreak",
  "userAddress",
  "createdAt",
  "updatedAt",
] as const

export type LeaderboardSortField = (typeof leaderboardSortFields)[number]

export type SortOrder = "asc" | "desc"

export interface LeaderboardFilters {
  userAddress?: string
  minTotalPoints?: number
  maxTotalPoints?: number
  minClaimPoints?: number
  maxClaimPoints?: number
  minStreakBonusPoints?: number
  maxStreakBonusPoints?: number
  minTotalClaims?: number
  maxTotalClaims?: number
  minCurrentStreak?: number
  maxCurrentStreak?: number
  minActiveLoopStreaks?: number
  maxActiveLoopStreaks?: number
  minLongestStreak?: number
  maxLongestStreak?: number
}

export interface LeaderboardQuery {
  limit: number
  offset: number
  sortBy: LeaderboardSortField
  sortOrder: SortOrder
  filters: LeaderboardFilters
}

export interface LeaderboardRequestParams extends Partial<LeaderboardFilters> {
  limit?: number
  offset?: number
  sortBy?: LeaderboardSortField
  sortOrder?: SortOrder
}

export interface LeaderboardEntryResponse {
  id: string
  createdAt: string
  updatedAt: string
  scope: string
  userAddress: string
  chainId: number | null
  loopId: number | null
  totalPoints: number
  claimPoints: number
  streakBonusPoints: number
  totalClaims: number
  currentStreak: number
  activeLoopStreaks: number
  longestStreak: number
  earnedStreakBonuses: EarnedStreakBonus[]
  rank: number
}

export interface GlobalLeaderboardResponse {
  success: true
  limit: number
  offset: number
  sortBy: LeaderboardSortField
  sortOrder: SortOrder
  filters: LeaderboardFilters
  entries: LeaderboardEntryResponse[]
}

export interface LoopLeaderboardResponse extends GlobalLeaderboardResponse {
  chainId: number
  loopId: number
}
