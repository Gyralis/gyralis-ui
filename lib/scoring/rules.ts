import {
  ClaimScoringEvent,
  EarnedStreakBonus,
  ScoringConfig,
  UserLoopScoringStats,
} from "./types"

export function normalizeAddress(address: string): string {
  return address.toLowerCase()
}

export function createEmptyLoopStats(input: {
  userAddress: string
  loopId: number
  chainId: number
}): UserLoopScoringStats {
  return {
    userAddress: normalizeAddress(input.userAddress),
    loopId: input.loopId,
    chainId: input.chainId,
    totalClaims: 0,
    claimPoints: 0,
    streakBonusPoints: 0,
    totalPoints: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastClaimedPeriod: null,
    earnedStreakBonuses: [],
  }
}

function hasEarnedBonus(
  earnedBonuses: EarnedStreakBonus[],
  streak: number
): boolean {
  return earnedBonuses.some((bonus) => bonus.streak === streak)
}

export function applyClaimToLoopStats(
  currentStats: UserLoopScoringStats,
  event: ClaimScoringEvent,
  config: ScoringConfig
): UserLoopScoringStats {
  const currentStreak =
    currentStats.lastClaimedPeriod === null
      ? 1
      : event.periodNumber === currentStats.lastClaimedPeriod + 1
      ? currentStats.currentStreak + 1
      : 1

  const earnedStreakBonuses = [...currentStats.earnedStreakBonuses]
  let newBonusPoints = 0
  for (const bonus of config.streakBonuses) {
    if (
      currentStreak >= bonus.streak &&
      !hasEarnedBonus(earnedStreakBonuses, bonus.streak)
    ) {
      earnedStreakBonuses.push(bonus)
      newBonusPoints += bonus.points
    }
  }

  const claimPoints = currentStats.claimPoints + config.claimPoints
  const streakBonusPoints = currentStats.streakBonusPoints + newBonusPoints

  return {
    ...currentStats,
    totalClaims: currentStats.totalClaims + 1,
    claimPoints,
    streakBonusPoints,
    totalPoints: claimPoints + streakBonusPoints,
    currentStreak,
    longestStreak: Math.max(currentStats.longestStreak, currentStreak),
    lastClaimedPeriod: event.periodNumber,
    earnedStreakBonuses,
  }
}

function compareClaimEvents(
  left: ClaimScoringEvent,
  right: ClaimScoringEvent
): number {
  return (
    left.periodNumber - right.periodNumber ||
    left.blockNumber - right.blockNumber ||
    left.id.localeCompare(right.id)
  )
}

export function normalizeClaimEvents(
  events: ClaimScoringEvent[]
): ClaimScoringEvent[] {
  const byEventId = new Map<string, ClaimScoringEvent>()
  for (const event of events) {
    if (!byEventId.has(event.id)) {
      byEventId.set(event.id, {
        ...event,
        userAddress: normalizeAddress(event.userAddress),
      })
    }
  }

  const seenPeriods = new Set<number>()
  return [...byEventId.values()].sort(compareClaimEvents).filter((event) => {
    if (seenPeriods.has(event.periodNumber)) return false
    seenPeriods.add(event.periodNumber)
    return true
  })
}

export function computeLoopStatsFromClaims(
  events: ClaimScoringEvent[],
  config: ScoringConfig,
  fallbackIdentity?: {
    userAddress: string
    loopId: number
    chainId: number
  }
): UserLoopScoringStats {
  const normalizedEvents = normalizeClaimEvents(events)
  const firstEvent = normalizedEvents[0]
  const identity =
    firstEvent ??
    (fallbackIdentity && {
      id: "",
      blockNumber: 0,
      periodNumber: 0,
      ...fallbackIdentity,
    })

  if (!identity) {
    throw new Error("Cannot compute loop stats without events or identity")
  }

  let stats = createEmptyLoopStats(identity)
  for (const event of normalizedEvents) {
    stats = applyClaimToLoopStats(stats, event, config)
  }
  return stats
}
