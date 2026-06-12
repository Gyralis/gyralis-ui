import {
  EarnedStreakBonus,
  UserGlobalScoringStats,
  UserLoopScoringStats,
} from "./types"

function mergeEarnedBonuses(
  loopStats: UserLoopScoringStats[]
): EarnedStreakBonus[] {
  const byStreak = new Map<number, number>()
  for (const stats of loopStats) {
    for (const bonus of stats.earnedStreakBonuses) {
      byStreak.set(
        bonus.streak,
        (byStreak.get(bonus.streak) ?? 0) + bonus.points
      )
    }
  }
  return [...byStreak.entries()]
    .sort(([left], [right]) => left - right)
    .map(([streak, points]) => ({ streak, points }))
}

export function computeGlobalStatsFromLoops(
  userAddress: string,
  loopStats: UserLoopScoringStats[]
): UserGlobalScoringStats {
  const totals = loopStats.reduce(
    (acc, stats) => {
      acc.totalClaims += stats.totalClaims
      acc.claimPoints += stats.claimPoints
      acc.streakBonusPoints += stats.streakBonusPoints
      acc.totalPoints += stats.totalPoints
      acc.activeLoopStreaks += stats.currentStreak > 0 ? 1 : 0
      acc.longestStreak = Math.max(acc.longestStreak, stats.longestStreak)
      return acc
    },
    {
      totalClaims: 0,
      claimPoints: 0,
      streakBonusPoints: 0,
      totalPoints: 0,
      activeLoopStreaks: 0,
      longestStreak: 0,
    }
  )

  return {
    userAddress: userAddress.toLowerCase(),
    ...totals,
    loopCount: loopStats.length,
    earnedStreakBonuses: mergeEarnedBonuses(loopStats),
  }
}
