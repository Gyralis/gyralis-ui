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
  loopAddress: string
  chainId: number
  periodNumber: number
  blockNumber: number
  timestamp?: Date
  txHash?: string
  payout?: string
}

export interface EarnedStreakBonus {
  streak: number
  points: number
}

export interface UserLoopScoringStats {
  userAddress: string
  loopAddress: string
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
