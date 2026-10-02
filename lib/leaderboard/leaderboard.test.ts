import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  getGlobalLeaderboard,
  getGlobalLeaderboardRankForEntry,
  getGlobalLeaderboardSummary,
} from "@/lib/db/clients/leaderboard.client"

import { fetchLeaderboardData } from "./get-leaderboard-data"
import {
  leaderboardPageQuery,
  normalizeLeaderboardSearch,
  parseLeaderboardPage,
} from "./query"

const db = vi.hoisted(() => ({
  findMany: vi.fn(),
  count: vi.fn(),
  groupBy: vi.fn(),
  findUnique: vi.fn(),
}))
vi.mock("@/lib/db/client", () => ({
  prisma: { leaderboardEntry: db, userLoopStats: { groupBy: db.groupBy } },
}))
vi.mock("server-only", () => ({}))
vi.mock("next/cache", () => ({ unstable_cache: (fn: unknown) => fn }))

beforeEach(() => {
  vi.resetAllMocks()
})

describe("all-time leaderboard", () => {
  it("normalizes partial addresses and restores safe pages", () => {
    expect(normalizeLeaderboardSearch("  0xAbC  ")).toBe("0xabc")
    for (const value of [
      "0",
      "-1",
      "1.5",
      "Infinity",
      "bad",
      "99999999999999999",
    ])
      expect(parseLeaderboardPage(value)).toBe(1)
    expect(parseLeaderboardPage("3")).toBe(3)
    expect(leaderboardPageQuery("0xabc", 3)).toEqual({
      limit: 15,
      offset: 30,
      sortBy: "totalPoints",
      sortOrder: "desc",
      filters: { minTotalClaims: 1, userAddress: "0xabc" },
    })
  })

  it("uses deterministic order and positive claims with address filtering", async () => {
    db.findMany.mockResolvedValue([])
    await getGlobalLeaderboard(leaderboardPageQuery("0xABC", 2))
    expect(db.findMany).toHaveBeenCalledWith({
      where: {
        scope: "global",
        totalClaims: { gte: 1 },
        userAddress: { contains: "0xabc" },
      },
      orderBy: [
        { totalPoints: "desc" },
        { totalClaims: "desc" },
        { userAddress: "asc" },
      ],
      take: 15,
      skip: 15,
    })
  })

  it("counts all entries ahead using GP, claims, and address ties without the search filter", async () => {
    db.count.mockResolvedValue(46)
    expect(
      await getGlobalLeaderboardRankForEntry({
        userAddress: "0xabc",
        totalPoints: 100,
        totalClaims: 80,
      })
    ).toBe(47)
    expect(db.count).toHaveBeenCalledWith({
      where: {
        scope: "global",
        OR: [
          { totalPoints: { gt: 100 } },
          { totalPoints: 100, totalClaims: { gt: 80 } },
          { totalPoints: 100, totalClaims: 80, userAddress: { lt: "0xabc" } },
        ],
      },
    })
    expect(db.findUnique).not.toHaveBeenCalled()
  })

  it("preserves filtered rank while adding global rank and limiting expensive requests", async () => {
    const updatedAt = new Date("2026-09-21T00:00:00Z")
    db.findMany.mockResolvedValue([
      {
        id: "global:abc",
        userAddress: "0xabc",
        totalPoints: 100,
        totalClaims: 80,
        earnedStreakBonuses: [],
        createdAt: updatedAt,
        updatedAt,
      },
    ])
    db.count.mockResolvedValueOnce(1).mockResolvedValueOnce(46)
    const result = await fetchLeaderboardData(
      { ...leaderboardPageQuery("0xabc", 1), limit: 1000 },
      true
    )
    expect(result.limit).toBe(15)
    expect(result.totalMatching).toBe(1)
    expect(result.entries[0]).toMatchObject({
      rank: 1,
      globalRank: 47,
      updatedAt: updatedAt.toISOString(),
    })
    expect(db.count).toHaveBeenNthCalledWith(1, {
      where: {
        scope: "global",
        userAddress: { contains: "0xabc" },
        totalClaims: { gte: 1 },
      },
    })
  })

  it("does not run rank counts for legacy requests", async () => {
    db.findMany.mockResolvedValue([])
    db.count.mockResolvedValue(0)
    const result = await fetchLeaderboardData(leaderboardPageQuery("", 1))
    expect(result.entries).toEqual([])
    expect(db.count).toHaveBeenCalledTimes(1)
  })

  it("excludes loops 1 and 2 before grouping wallets and aggregating summary stats", async () => {
    const updatedAt = new Date("2026-09-21T00:00:00Z")
    db.groupBy.mockResolvedValue([
      {
        userAddress: "0xabc",
        _sum: { totalPoints: 80, totalClaims: 70 },
        _max: { longestStreak: 14, updatedAt },
      },
      {
        userAddress: "0xdef",
        _sum: { totalPoints: 40, totalClaims: 30 },
        _max: { longestStreak: 7, updatedAt: new Date("2026-09-20T00:00:00Z") },
      },
      {
        userAddress: "0x000",
        _sum: { totalPoints: 0, totalClaims: 0 },
        _max: { longestStreak: 0, updatedAt: new Date("2026-09-22T00:00:00Z") },
      },
    ])
    expect(await getGlobalLeaderboardSummary()).toEqual({
      success: true,
      totalPoints: 120,
      totalClaims: 100,
      totalLoopers: 2,
      longestStreak: 14,
      lastStatsUpdatedAt: updatedAt.toISOString(),
    })
    expect(db.groupBy).toHaveBeenCalledWith({
      by: ["userAddress"],
      where: { loopId: { notIn: [1, 2] } },
      _sum: { totalPoints: true, totalClaims: true },
      _max: { longestStreak: true, updatedAt: true },
    })
    expect(db.findMany).not.toHaveBeenCalled()
  })

  it("distinguishes empty eligible-loop stats from database failures", async () => {
    db.groupBy.mockResolvedValueOnce([])
    expect(await getGlobalLeaderboardSummary()).toEqual({
      success: true,
      totalPoints: 0,
      totalClaims: 0,
      totalLoopers: 0,
      longestStreak: 0,
      lastStatsUpdatedAt: null,
    })
    db.groupBy.mockRejectedValueOnce(new Error("unavailable"))
    await expect(getGlobalLeaderboardSummary()).rejects.toThrow("unavailable")
  })
})
