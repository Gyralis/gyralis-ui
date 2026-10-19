import { createHash } from "node:crypto"

import { scoringLoopRegistry } from "@/config/scoring-loops"
import { SeasonConfig, seasons } from "@/config/seasons"

import { scoringConfig } from "./config"
import { computeLoopStatsFromClaims, normalizeAddress } from "./rules"
import {
  SeasonEarnedStreakBonus,
  SeasonUserGlobalScoringStats,
  SeasonUserLoopScoringStats,
  ValidatedSeason,
} from "./season-types"
import { ClaimScoringEvent } from "./types"

function multiplierToHundredths(value: number | undefined, label: string) {
  const multiplier = value ?? 1
  const hundredths = Math.round(multiplier * 100)
  if (
    !Number.isFinite(multiplier) ||
    multiplier <= 0 ||
    Math.abs(multiplier * 100 - hundredths) > Number.EPSILON * 100
  ) {
    throw new Error(`${label} must be positive and have at most two decimals`)
  }
  return hundredths
}

export function validateSeasonConfigs(
  input: readonly SeasonConfig[]
): readonly ValidatedSeason[] {
  const ids = new Set<string>()
  return input.map((season, seasonIndex) => {
    const label = `seasons[${seasonIndex}]`
    if (!season.id.trim()) throw new Error(`${label}.id is required`)
    if (ids.has(season.id)) throw new Error(`Duplicate season id: ${season.id}`)
    ids.add(season.id)
    if (!season.name.trim()) throw new Error(`${label}.name is required`)
    if (!season.startsAt.endsWith("Z") || !season.endsAt.endsWith("Z")) {
      throw new Error(`${label} boundaries must be UTC timestamps ending in Z`)
    }
    const startsAt = new Date(season.startsAt)
    const endsAt = new Date(season.endsAt)
    if (
      Number.isNaN(startsAt.getTime()) ||
      Number.isNaN(endsAt.getTime()) ||
      startsAt >= endsAt
    ) {
      throw new Error(`${label} must use a valid [startsAt, endsAt) range`)
    }

    const loopKeys = new Set<string>()
    const loops = season.loops.map((loop, loopIndex) => {
      const loopLabel = `${label}.loops[${loopIndex}]`
      const key = `${loop.chainId}:${loop.loopId}`
      if (loopKeys.has(key)) throw new Error(`Duplicate season loop: ${key}`)
      loopKeys.add(key)
      if (
        !scoringLoopRegistry.some(
          (entry) =>
            entry.chainId === loop.chainId && entry.loopId === loop.loopId
        )
      ) {
        throw new Error(`${loopLabel} is not in the scoring loop registry`)
      }
      return {
        chainId: loop.chainId,
        loopId: loop.loopId,
        multiplierHundredths: multiplierToHundredths(
          loop.multiplier,
          `${loopLabel}.multiplier`
        ),
      }
    })

    return { ...season, startsAt, endsAt, loops }
  })
}

export const activeSeasons = validateSeasonConfigs(seasons)

function normalizedSeasonConfig(input: readonly ValidatedSeason[]) {
  return input.map((season) => ({
    id: season.id,
    name: season.name,
    startsAt: season.startsAt.toISOString(),
    endsAt: season.endsAt.toISOString(),
    loops: [...season.loops]
      .sort((left, right) =>
        `${left.chainId}:${left.loopId}`.localeCompare(
          `${right.chainId}:${right.loopId}`
        )
      )
      .map((loop) => ({
        chainId: loop.chainId,
        loopId: loop.loopId,
        multiplierHundredths: loop.multiplierHundredths,
      })),
  }))
}

export function seasonConfigHash(input = activeSeasons): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        seasons: normalizedSeasonConfig(input),
        scoring: scoringConfig,
      })
    )
    .digest("hex")
}

export function getSeasonById(seasonId: string) {
  return activeSeasons.find((season) => season.id === seasonId)
}

export function getCurrentSeason(now = new Date()) {
  return activeSeasons.find(
    (season) => season.startsAt <= now && now < season.endsAt
  )
}

export function seasonsForLoop(chainId: number, loopId: number) {
  return activeSeasons.filter((season) =>
    season.loops.some(
      (loop) => loop.chainId === chainId && loop.loopId === loopId
    )
  )
}

export function computeSeasonLoopStats(input: {
  season: ValidatedSeason
  events: ClaimScoringEvent[]
  userAddress: string
  chainId: number
  loopId: number
}): SeasonUserLoopScoringStats | null {
  const loopConfig = input.season.loops.find(
    (loop) => loop.chainId === input.chainId && loop.loopId === input.loopId
  )
  if (!loopConfig) return null

  const events = input.events.filter(
    (event) =>
      event.timestamp != null &&
      event.timestamp >= input.season.startsAt &&
      event.timestamp < input.season.endsAt
  )
  const baseStats = computeLoopStatsFromClaims(events, scoringConfig, input)
  const multiply = (points: number) => points * loopConfig.multiplierHundredths
  const earnedStreakBonuses: SeasonEarnedStreakBonus[] =
    baseStats.earnedStreakBonuses.map((bonus) => ({
      streak: bonus.streak,
      pointsHundredths: multiply(bonus.points),
    }))
  const claimPointsHundredths = multiply(baseStats.claimPoints)
  const streakBonusPointsHundredths = multiply(baseStats.streakBonusPoints)

  return {
    seasonId: input.season.id,
    userAddress: normalizeAddress(input.userAddress),
    loopId: input.loopId,
    chainId: input.chainId,
    totalClaims: baseStats.totalClaims,
    claimPointsHundredths,
    streakBonusPointsHundredths,
    totalPointsHundredths: claimPointsHundredths + streakBonusPointsHundredths,
    currentStreak: baseStats.currentStreak,
    longestStreak: baseStats.longestStreak,
    lastClaimedPeriod: baseStats.lastClaimedPeriod,
    earnedStreakBonuses,
  }
}

export function computeSeasonGlobalStats(
  seasonId: string,
  userAddress: string,
  loopStats: SeasonUserLoopScoringStats[]
): SeasonUserGlobalScoringStats {
  const bonusesByStreak = new Map<number, number>()
  for (const stats of loopStats) {
    for (const bonus of stats.earnedStreakBonuses) {
      bonusesByStreak.set(
        bonus.streak,
        (bonusesByStreak.get(bonus.streak) ?? 0) + bonus.pointsHundredths
      )
    }
  }
  const earnedStreakBonuses = [...bonusesByStreak.entries()]
    .sort(([left], [right]) => left - right)
    .map(([streak, pointsHundredths]) => ({ streak, pointsHundredths }))
  return {
    seasonId,
    userAddress: normalizeAddress(userAddress),
    totalClaims: loopStats.reduce((sum, stats) => sum + stats.totalClaims, 0),
    claimPointsHundredths: loopStats.reduce(
      (sum, stats) => sum + stats.claimPointsHundredths,
      0
    ),
    streakBonusPointsHundredths: loopStats.reduce(
      (sum, stats) => sum + stats.streakBonusPointsHundredths,
      0
    ),
    totalPointsHundredths: loopStats.reduce(
      (sum, stats) => sum + stats.totalPointsHundredths,
      0
    ),
    activeLoopStreaks: loopStats.filter((stats) => stats.currentStreak > 0)
      .length,
    longestStreak: Math.max(
      0,
      ...loopStats.map((stats) => stats.longestStreak)
    ),
    loopCount: loopStats.length,
    earnedStreakBonuses,
  }
}

export function pointsFromHundredths(value: number) {
  return value / 100
}

export function publicSeason(season: ValidatedSeason) {
  return {
    id: season.id,
    name: season.name,
    startsAt: season.startsAt.toISOString(),
    endsAt: season.endsAt.toISOString(),
    loops: season.loops.map((loop) => ({
      chainId: loop.chainId,
      loopId: loop.loopId,
      multiplier: pointsFromHundredths(loop.multiplierHundredths),
    })),
  }
}
