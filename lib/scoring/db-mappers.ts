import { parseEarnedStreakBonuses } from "./responses"
import { UserLoopScoringStats } from "./types"

type DbUserLoopStatsLike = {
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
  earnedStreakBonuses: unknown
}

export function mapDbUserLoopStatsToScoringStats(
  stats: DbUserLoopStatsLike
): UserLoopScoringStats {
  return {
    userAddress: stats.userAddress,
    loopId: stats.loopId,
    chainId: stats.chainId,
    totalClaims: stats.totalClaims,
    claimPoints: stats.claimPoints,
    streakBonusPoints: stats.streakBonusPoints,
    totalPoints: stats.totalPoints,
    currentStreak: stats.currentStreak,
    longestStreak: stats.longestStreak,
    lastClaimedPeriod: stats.lastClaimedPeriod,
    earnedStreakBonuses: parseEarnedStreakBonuses(stats.earnedStreakBonuses),
  }
}
