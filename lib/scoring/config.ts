import rawScoringConfig from "@/config/scoring.json"

import { ScoringConfig } from "./types"

function assertInteger(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new Error(`${label} must be an integer`)
  }
  return value
}

export function parseScoringConfig(input: unknown): ScoringConfig {
  if (input == null || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Scoring config must be an object")
  }

  const config = input as {
    claimPoints?: unknown
    streakBonuses?: unknown
  }
  const claimPoints = assertInteger(config.claimPoints, "claimPoints")
  if (claimPoints < 0) throw new Error("claimPoints must be non-negative")
  if (!Array.isArray(config.streakBonuses)) {
    throw new Error("streakBonuses must be an array")
  }

  const seenStreaks = new Set<number>()
  const streakBonuses = config.streakBonuses.map((rawBonus, index) => {
    if (
      rawBonus == null ||
      typeof rawBonus !== "object" ||
      Array.isArray(rawBonus)
    ) {
      throw new Error(`streakBonuses[${index}] must be an object`)
    }
    const bonus = rawBonus as { streak?: unknown; points?: unknown }
    const streak = assertInteger(bonus.streak, `streakBonuses[${index}].streak`)
    const points = assertInteger(bonus.points, `streakBonuses[${index}].points`)
    if (streak <= 0) {
      throw new Error(`streakBonuses[${index}].streak must be positive`)
    }
    if (points <= 0) {
      throw new Error(`streakBonuses[${index}].points must be positive`)
    }
    if (seenStreaks.has(streak)) {
      throw new Error(`Duplicate streak bonus threshold: ${streak}`)
    }
    seenStreaks.add(streak)
    return { streak, points }
  })

  return {
    claimPoints,
    streakBonuses: streakBonuses.sort((a, b) => a.streak - b.streak),
  }
}

export const scoringConfig = parseScoringConfig(rawScoringConfig)
