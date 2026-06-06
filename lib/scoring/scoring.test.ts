import { describe, expect, it } from "vitest"

import { computeGlobalStatsFromLoops } from "./aggregate"
import { parseScoringConfig, scoringConfig } from "./config"
import { parseEarnedStreakBonuses, toRankedLeaderboardEntry } from "./responses"
import {
  applyClaimToLoopStats,
  computeLoopStatsFromClaims,
  createEmptyLoopStats,
  normalizeClaimEvents,
} from "./rules"
import { ClaimScoringEvent, ScoringConfig } from "./types"

const userAddress = "0x00000000000000000000000000000000000000aa"
const secondUserAddress = "0x00000000000000000000000000000000000000bb"
const loopAddress = "0x00000000000000000000000000000000000000cc"
const secondLoopAddress = "0x00000000000000000000000000000000000000dd"
const chainId = 100
const testConfig: ScoringConfig = {
  claimPoints: 1,
  streakBonuses: [
    { streak: 3, points: 2 },
    { streak: 7, points: 5 },
  ],
}

function claim(
  periodNumber: number,
  overrides: Partial<ClaimScoringEvent> = {}
): ClaimScoringEvent {
  return {
    id: `${overrides.loopAddress ?? loopAddress}-${periodNumber}`,
    userAddress,
    loopAddress,
    chainId,
    periodNumber,
    blockNumber: periodNumber,
    timestamp: new Date(periodNumber * 1000),
    txHash: `0x${periodNumber}`,
    payout: "100",
    ...overrides,
  }
}

describe("scoring config", () => {
  it("loads the repo scoring json", () => {
    expect(scoringConfig).toEqual({
      claimPoints: 1,
      streakBonuses: [
        { streak: 3, points: 2 },
        { streak: 7, points: 5 },
        { streak: 14, points: 12 },
        { streak: 30, points: 30 },
      ],
    })
  })

  it("sorts valid streak bonuses", () => {
    expect(
      parseScoringConfig({
        claimPoints: 2,
        streakBonuses: [
          { streak: 7, points: 5 },
          { streak: 3, points: 2 },
        ],
      })
    ).toEqual({
      claimPoints: 2,
      streakBonuses: [
        { streak: 3, points: 2 },
        { streak: 7, points: 5 },
      ],
    })
  })

  it("rejects invalid scoring configs clearly", () => {
    expect(() => parseScoringConfig(null)).toThrow(
      "Scoring config must be an object"
    )
    expect(() =>
      parseScoringConfig({ claimPoints: -1, streakBonuses: [] })
    ).toThrow("claimPoints must be non-negative")
    expect(() =>
      parseScoringConfig({
        claimPoints: 1,
        streakBonuses: [
          { streak: 3, points: 1 },
          { streak: 3, points: 2 },
        ],
      })
    ).toThrow("Duplicate streak bonus threshold: 3")
  })

  it("rejects malformed streak bonus entries", () => {
    expect(() =>
      parseScoringConfig({ claimPoints: 1, streakBonuses: "none" })
    ).toThrow("streakBonuses must be an array")
    expect(() =>
      parseScoringConfig({ claimPoints: 1, streakBonuses: [null] })
    ).toThrow("streakBonuses[0] must be an object")
    expect(() =>
      parseScoringConfig({
        claimPoints: 1,
        streakBonuses: [{ streak: 0, points: 1 }],
      })
    ).toThrow("streakBonuses[0].streak must be positive")
    expect(() =>
      parseScoringConfig({
        claimPoints: 1,
        streakBonuses: [{ streak: 1, points: 0 }],
      })
    ).toThrow("streakBonuses[0].points must be positive")
  })

  it("rejects non-integer scoring values", () => {
    expect(() =>
      parseScoringConfig({ claimPoints: 1.5, streakBonuses: [] })
    ).toThrow("claimPoints must be an integer")
    expect(() =>
      parseScoringConfig({
        claimPoints: 1,
        streakBonuses: [{ streak: "3", points: 1 }],
      })
    ).toThrow("streakBonuses[0].streak must be an integer")
    expect(() =>
      parseScoringConfig({
        claimPoints: 1,
        streakBonuses: [{ streak: 3, points: "1" }],
      })
    ).toThrow("streakBonuses[0].points must be an integer")
  })
})

describe("loop scoring", () => {
  it("gives a single claim the configured claim points", () => {
    const stats = computeLoopStatsFromClaims([claim(1)], {
      claimPoints: 10,
      streakBonuses: [],
    })

    expect(stats.totalClaims).toBe(1)
    expect(stats.claimPoints).toBe(10)
    expect(stats.streakBonusPoints).toBe(0)
    expect(stats.totalPoints).toBe(10)
  })

  it("separates claim points from streak bonus points", () => {
    const stats = computeLoopStatsFromClaims(
      [claim(1), claim(2), claim(3)],
      testConfig
    )

    expect(stats.claimPoints).toBe(3)
    expect(stats.streakBonusPoints).toBe(2)
    expect(stats.totalPoints).toBe(5)
    expect(stats.earnedStreakBonuses).toEqual([{ streak: 3, points: 2 }])
  })

  it("increases streaks for consecutive claimed periods", () => {
    const stats = computeLoopStatsFromClaims(
      [claim(1), claim(2), claim(3)],
      testConfig
    )

    expect(stats.currentStreak).toBe(3)
    expect(stats.longestStreak).toBe(3)
    expect(stats.lastClaimedPeriod).toBe(3)
  })

  it("resets the current streak when a period is missed", () => {
    const stats = computeLoopStatsFromClaims(
      [claim(1), claim(2), claim(4)],
      testConfig
    )

    expect(stats.currentStreak).toBe(1)
    expect(stats.longestStreak).toBe(2)
  })

  it("applies configured streak bonuses once", () => {
    const stats = computeLoopStatsFromClaims(
      [claim(1), claim(2), claim(3), claim(4), claim(5), claim(6)],
      testConfig
    )

    expect(stats.earnedStreakBonuses).toEqual([{ streak: 3, points: 2 }])
    expect(stats.streakBonusPoints).toBe(2)
  })

  it("does not apply bonuses twice after recompute", () => {
    const first = computeLoopStatsFromClaims(
      [claim(1), claim(2), claim(3), claim(4), claim(5), claim(6), claim(7)],
      testConfig
    )
    const second = computeLoopStatsFromClaims(
      [claim(7), claim(3), claim(2), claim(1), claim(6), claim(5), claim(4)],
      testConfig
    )

    expect(second).toEqual(first)
    expect(second.earnedStreakBonuses).toEqual([
      { streak: 3, points: 2 },
      { streak: 7, points: 5 },
    ])
  })

  it("keeps loop streaks independent for the same wallet", () => {
    const firstLoop = computeLoopStatsFromClaims(
      [claim(1), claim(2), claim(3)],
      testConfig
    )
    const secondLoop = computeLoopStatsFromClaims(
      [
        claim(1, { loopAddress: secondLoopAddress }),
        claim(3, { loopAddress: secondLoopAddress }),
      ],
      testConfig
    )

    expect(firstLoop.currentStreak).toBe(3)
    expect(secondLoop.currentStreak).toBe(1)
    expect(secondLoop.longestStreak).toBe(1)
  })

  it("normalizes out-of-order claim events before scoring", () => {
    const stats = computeLoopStatsFromClaims(
      [claim(3), claim(1), claim(2)],
      testConfig
    )

    expect(stats.totalClaims).toBe(3)
    expect(stats.currentStreak).toBe(3)
  })

  it("ignores duplicate claim events idempotently", () => {
    const stats = computeLoopStatsFromClaims(
      [claim(1), claim(1), claim(1, { id: "same-period-different-id" })],
      testConfig
    )

    expect(stats.totalClaims).toBe(1)
    expect(stats.totalPoints).toBe(1)
  })

  it("makes full recompute and incremental replay produce the same stats", () => {
    const events = [claim(1), claim(2), claim(4), claim(5), claim(6)]
    const full = computeLoopStatsFromClaims(events, testConfig)
    const incremental = events.reduce(
      (stats, event) => applyClaimToLoopStats(stats, event, testConfig),
      createEmptyLoopStats({ userAddress, loopAddress, chainId })
    )

    expect(incremental).toEqual(full)
  })

  it("normalizes address casing", () => {
    const [event] = normalizeClaimEvents([
      claim(1, {
        userAddress: userAddress.toUpperCase(),
        loopAddress: loopAddress.toUpperCase(),
      }),
    ])

    expect(event.userAddress).toBe(userAddress)
    expect(event.loopAddress).toBe(loopAddress)
  })

  it("can return empty stats when fallback identity is provided", () => {
    const stats = computeLoopStatsFromClaims([], testConfig, {
      userAddress,
      loopAddress,
      chainId,
    })

    expect(stats).toEqual(
      createEmptyLoopStats({ userAddress, loopAddress, chainId })
    )
  })

  it("requires identity when computing stats without events", () => {
    expect(() => computeLoopStatsFromClaims([], testConfig)).toThrow(
      "Cannot compute loop stats without events or identity"
    )
  })
})

describe("global scoring", () => {
  it("aggregates global score from per-loop points", () => {
    const firstLoop = computeLoopStatsFromClaims(
      [claim(1), claim(2), claim(3)],
      testConfig
    )
    const secondLoop = computeLoopStatsFromClaims(
      [
        claim(1, { loopAddress: secondLoopAddress }),
        claim(2, { loopAddress: secondLoopAddress }),
      ],
      testConfig
    )
    const global = computeGlobalStatsFromLoops(userAddress, [
      firstLoop,
      secondLoop,
    ])

    expect(global.totalClaims).toBe(5)
    expect(global.claimPoints).toBe(5)
    expect(global.streakBonusPoints).toBe(2)
    expect(global.totalPoints).toBe(
      firstLoop.totalPoints + secondLoop.totalPoints
    )
  })

  it("aggregates global streak breakdowns across loops", () => {
    const firstLoop = computeLoopStatsFromClaims(
      [claim(1), claim(2), claim(3)],
      testConfig
    )
    const secondLoop = computeLoopStatsFromClaims(
      [
        claim(1, {
          userAddress: secondUserAddress,
          loopAddress: secondLoopAddress,
        }),
        claim(2, {
          userAddress: secondUserAddress,
          loopAddress: secondLoopAddress,
        }),
        claim(3, {
          userAddress: secondUserAddress,
          loopAddress: secondLoopAddress,
        }),
      ],
      testConfig
    )
    const global = computeGlobalStatsFromLoops(userAddress, [
      firstLoop,
      secondLoop,
    ])

    expect(global.earnedStreakBonuses).toEqual([{ streak: 3, points: 4 }])
    expect(global.activeLoopStreaks).toBe(2)
    expect(global.longestStreak).toBe(3)
  })
})

describe("leaderboard scoring responses", () => {
  it("parses earned streak bonus breakdowns defensively", () => {
    expect(
      parseEarnedStreakBonuses([
        { streak: 3, points: 2 },
        { streak: "7", points: 5 },
        null,
      ])
    ).toEqual([{ streak: 3, points: 2 }])
    expect(parseEarnedStreakBonuses(undefined)).toEqual([])
  })

  it("adds rank and parsed streak breakdown to leaderboard entries", () => {
    expect(
      toRankedLeaderboardEntry(
        {
          userAddress,
          totalPoints: 5,
          earnedStreakBonuses: [{ streak: 3, points: 2 }],
        },
        4
      )
    ).toEqual({
      rank: 4,
      userAddress,
      totalPoints: 5,
      earnedStreakBonuses: [{ streak: 3, points: 2 }],
    })
  })
})
