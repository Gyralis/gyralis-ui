import { LoopCardsData, type LoopCardData } from "@/data/loops-data"
import { isAddress } from "viem"

import type { ProfileLoopStats } from "@/lib/profile/get-profile-page-data"
import { scoringConfig } from "@/lib/scoring/config"
import { isIncludedScoringLoopId } from "@/lib/scoring/loop-filters"

type ClaimSummary = Pick<ProfileLoopStats, "chainId" | "loopId" | "totalClaims">

export interface AchievementLoopStatus {
  key: string
  title: string
  logoUrl?: string
  active: boolean
  earned: boolean
}

export function getAchievementLoopStatuses(
  stats: readonly ProfileLoopStats[],
  streak: number,
  catalog: readonly LoopCardData[] = LoopCardsData
): AchievementLoopStatus[] {
  const statsByLoop = new Map(
    stats.map((loop) => [`${loop.chainId}-${loop.loopId}`, loop])
  )
  const activeLoops = catalog.filter(
    (loop) =>
      loop.enabled &&
      loop.achievementActive !== false &&
      loop.address != null &&
      isAddress(loop.address) &&
      isIncludedScoringLoopId(loop.id)
  )
  const statuses: AchievementLoopStatus[] = activeLoops.map((loop) => {
    const key = `${loop.chainId}-${loop.id}`
    return {
      key,
      title: loop.title,
      logoUrl:
        loop.communityLogoUrl ?? loop.eligibilityLogoUrl ?? loop.sponsorLogoUrl,
      active: true,
      earned:
        statsByLoop
          .get(key)
          ?.earnedStreakBonuses.some((bonus) => bonus.streak === streak) ??
        false,
    }
  })
  const activeKeys = new Set(statuses.map((loop) => loop.key))

  // Keep inactive earned bonuses in the tooltip history, not the active logos.
  for (const loop of stats) {
    const key = `${loop.chainId}-${loop.loopId}`
    if (
      !activeKeys.has(key) &&
      isIncludedScoringLoopId(loop.loopId) &&
      loop.earnedStreakBonuses.some((bonus) => bonus.streak === streak)
    ) {
      statuses.push({
        key,
        title: loop.metadata.title,
        logoUrl: loop.metadata.logoUrl,
        active: false,
        earned: true,
      })
    }
  }

  return statuses
}

export function getUnclaimedLoops(
  stats: readonly ClaimSummary[],
  catalog: readonly LoopCardData[] = LoopCardsData
) {
  const claimedLoops = new Set(
    stats
      .filter((loop) => loop.totalClaims > 0)
      .map((loop) => `${loop.chainId}-${loop.loopId}`)
  )

  return catalog.filter(
    (loop) =>
      loop.enabled &&
      loop.address != null &&
      isAddress(loop.address) &&
      isIncludedScoringLoopId(loop.id) &&
      !claimedLoops.has(`${loop.chainId}-${loop.id}`)
  )
}

export function getNextStreakMilestone(loop: ProfileLoopStats) {
  if (
    !loop.metadata.enabled ||
    loop.metadata.archived ||
    loop.metadata.contractType === "archived" ||
    !loop.metadata.address ||
    !isAddress(loop.metadata.address) ||
    !isIncludedScoringLoopId(loop.loopId) ||
    loop.currentStreak <= 0 ||
    loop.lastClaimedPeriod == null
  ) {
    return null
  }

  const next = scoringConfig.streakBonuses.find(
    (milestone) =>
      !loop.earnedStreakBonuses.some(
        (earned) => earned.streak === milestone.streak
      )
  )

  // A reached but uncredited milestone needs a scoring refresh, not a promise.
  return next && next.streak > loop.currentStreak ? next : null
}

export function getNextStreakBonus(
  loop: ProfileLoopStats,
  currentPeriod: bigint | null
) {
  const milestone = getNextStreakMilestone(loop)
  if (
    !milestone ||
    currentPeriod == null ||
    currentPeriod < 0n ||
    loop.lastClaimedPeriod == null ||
    !Number.isSafeInteger(loop.lastClaimedPeriod) ||
    loop.lastClaimedPeriod < 0
  ) {
    return null
  }

  const periodGap = currentPeriod - BigInt(loop.lastClaimedPeriod)
  // Older records may be stale or need catch-up claims (SuperLoops).
  // Only show a precise hint when the last scored period is current or previous.
  if (periodGap < 0n || periodGap > 1n) return null

  return {
    streak: milestone.streak,
    points: milestone.points,
    remainingClaims: milestone.streak - loop.currentStreak,
  }
}
