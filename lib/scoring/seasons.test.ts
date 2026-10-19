import { describe, expect, it } from "vitest"

import { SeasonConfig } from "@/config/seasons"
import { seasonErrorResponse } from "@/lib/api/season-errors"

import {
  rankSeasonLeaderboardPage,
  seasonRebuildRequired,
  SeasonRebuildRequiredError,
} from "./season-api"
import {
  computeSeasonGlobalStats,
  computeSeasonLoopStats,
  pointsFromHundredths,
  seasonConfigHash,
  validateSeasonConfigs,
} from "./seasons"
import { ClaimScoringEvent } from "./types"

const userAddress = "0x00000000000000000000000000000000000000aa"
const config: SeasonConfig = {
  id: "test-season",
  name: "Test Season",
  startsAt: "2026-01-01T00:00:00.000Z",
  endsAt: "2026-02-01T00:00:00.000Z",
  loops: [{ chainId: 8453, loopId: 6, multiplier: 1.25 }],
}
const season = validateSeasonConfigs([config])[0]!

function claim(
  periodNumber: number,
  timestamp: string,
  id = `${periodNumber}-${timestamp}`
): ClaimScoringEvent {
  return {
    id,
    userAddress,
    chainId: 8453,
    loopId: 6,
    periodNumber,
    blockNumber: periodNumber,
    timestamp: new Date(timestamp),
  }
}

describe("season config", () => {
  it("uses UTC inclusive-start and exclusive-end boundaries", () => {
    const stats = computeSeasonLoopStats({
      season,
      userAddress,
      chainId: 8453,
      loopId: 6,
      events: [
        claim(9, "2025-12-31T23:59:59.999Z"),
        claim(10, "2026-01-01T00:00:00.000Z"),
        claim(11, "2026-01-31T23:59:59.999Z"),
        claim(12, "2026-02-01T00:00:00.000Z"),
      ],
    })

    expect(stats).toMatchObject({
      totalClaims: 2,
      currentStreak: 2,
      longestStreak: 2,
      claimPointsHundredths: 250,
      totalPointsHundredths: 250,
    })
  })

  it("resets streaks at season start and after a missed period", () => {
    const stats = computeSeasonLoopStats({
      season,
      userAddress,
      chainId: 8453,
      loopId: 6,
      events: [
        claim(8, "2025-12-30T12:00:00.000Z"),
        claim(9, "2025-12-31T12:00:00.000Z"),
        claim(10, "2026-01-01T12:00:00.000Z"),
        claim(11, "2026-01-02T12:00:00.000Z"),
        claim(13, "2026-01-03T12:00:00.000Z"),
      ],
    })

    expect(stats).toMatchObject({
      totalClaims: 3,
      currentStreak: 1,
      longestStreak: 2,
    })
  })

  it("applies multipliers to claim points and streak milestones", () => {
    const stats = computeSeasonLoopStats({
      season,
      userAddress,
      chainId: 8453,
      loopId: 6,
      events: [
        claim(1, "2026-01-01T12:00:00.000Z"),
        claim(2, "2026-01-02T12:00:00.000Z"),
        claim(3, "2026-01-03T12:00:00.000Z"),
      ],
    })!

    expect(stats.claimPointsHundredths).toBe(375)
    expect(stats.streakBonusPointsHundredths).toBe(250)
    expect(stats.totalPointsHundredths).toBe(625)
    expect(pointsFromHundredths(stats.totalPointsHundredths)).toBe(6.25)
    expect(stats.earnedStreakBonuses).toEqual([
      { streak: 3, pointsHundredths: 250 },
    ])
  })

  it("deduplicates repeated claim events and periods", () => {
    const duplicate = claim(1, "2026-01-01T12:00:00.000Z", "same")
    const stats = computeSeasonLoopStats({
      season,
      userAddress,
      chainId: 8453,
      loopId: 6,
      events: [duplicate, duplicate, claim(1, "2026-01-01T13:00:00.000Z")],
    })
    expect(stats?.totalClaims).toBe(1)
  })

  it("normalizes config order into a stable hash", () => {
    const second: SeasonConfig = {
      ...config,
      id: "second",
      loops: [
        { chainId: 8453, loopId: 6, multiplier: 1.25 },
        { chainId: 8453, loopId: 1 },
      ],
    }
    const reordered: SeasonConfig = {
      ...second,
      loops: [...second.loops].reverse(),
    }
    expect(seasonConfigHash(validateSeasonConfigs([second]))).toBe(
      seasonConfigHash(validateSeasonConfigs([reordered]))
    )
  })

  it("rejects unknown loops, invalid dates, duplicates, and excess decimals", () => {
    expect(() =>
      validateSeasonConfigs([{ ...config, endsAt: config.startsAt }])
    ).toThrow("valid [startsAt, endsAt) range")
    expect(() =>
      validateSeasonConfigs([
        { ...config, loops: [{ chainId: 8453, loopId: 999 }] },
      ])
    ).toThrow("not in the scoring loop registry")
    expect(() =>
      validateSeasonConfigs([
        { ...config, loops: [{ chainId: 8453, loopId: 6, multiplier: 1.001 }] },
      ])
    ).toThrow("at most two decimals")
    expect(() => validateSeasonConfigs([config, config])).toThrow(
      "Duplicate season id"
    )
  })
})

describe("season global scoring", () => {
  it("aggregates loop projections deterministically", () => {
    const first = computeSeasonLoopStats({
      season,
      userAddress,
      chainId: 8453,
      loopId: 6,
      events: [claim(1, "2026-01-01T12:00:00.000Z")],
    })!
    const global = computeSeasonGlobalStats(season.id, userAddress, [first])
    expect(global).toMatchObject({
      totalClaims: 1,
      totalPointsHundredths: 125,
      activeLoopStreaks: 1,
      longestStreak: 1,
      loopCount: 1,
    })
  })
})

describe("season rebuild state", () => {
  it("requires a completed rebuild when the normalized hash changes", () => {
    expect(
      seasonRebuildRequired({ status: "ready", configHash: "old" }, "new", true)
    ).toBe(true)
    expect(
      seasonRebuildRequired({ status: "ready", configHash: "new" }, "new", true)
    ).toBe(false)
    expect(seasonRebuildRequired(null, "new", false)).toBe(false)
  })

  it("returns 503 for stale season projections", async () => {
    const response = seasonErrorResponse(
      new SeasonRebuildRequiredError("Season scoring rebuild required")
    )!
    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: "Season scoring rebuild required",
    })
  })
})

describe("season leaderboard pagination", () => {
  it("uses the page offset for stable one-based ranks", () => {
    const entry = {
      seasonId: season.id,
      userAddress,
      totalClaims: 3,
      claimPointsHundredths: 375,
      streakBonusPointsHundredths: 250,
      totalPointsHundredths: 625,
      activeLoopStreaks: 1,
      longestStreak: 3,
      loopCount: 1,
      earnedStreakBonuses: [{ streak: 3, pointsHundredths: 250 }],
    }
    expect(rankSeasonLeaderboardPage([entry, entry], 20)).toEqual([
      expect.objectContaining({ rank: 21, totalPoints: 6.25 }),
      expect.objectContaining({ rank: 22, totalPoints: 6.25 }),
    ])
  })
})
