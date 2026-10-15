import { beforeEach, describe, expect, it, vi } from "vitest"

import { seasonConfigHash } from "@/lib/scoring/seasons"

import { GET as getLeaderboard } from "./[seasonId]/leaderboard/route"
import { GET as getSeasonUser } from "./[seasonId]/users/[address]/route"
import { GET as getCurrentSeason } from "./current/route"
import { GET as getSeasons } from "./route"

const db = vi.hoisted(() => ({
  state: null as null | {
    status: string
    configHash: string
    rebuildCompletedAt: Date | null
  },
  getSeasonScoringState: vi.fn(),
  getSeasonUserGlobalStats: vi.fn(),
  getSeasonUserLoopStatsForUser: vi.fn(),
  getSeasonLeaderboard: vi.fn(),
  countSeasonLeaderboard: vi.fn(),
}))

vi.mock("@/lib/db/clients/season-scoring.client", () => ({
  getSeasonScoringState: db.getSeasonScoringState,
  getSeasonUserGlobalStats: db.getSeasonUserGlobalStats,
  getSeasonUserLoopStatsForUser: db.getSeasonUserLoopStatsForUser,
  getSeasonLeaderboard: db.getSeasonLeaderboard,
  countSeasonLeaderboard: db.countSeasonLeaderboard,
}))

const seasonId = "test-2026-08-10-oct-10"
const userAddress = "0x00000000000000000000000000000000000000aa"

function globalStats(address = userAddress) {
  return {
    seasonId,
    userAddress: address,
    totalClaims: 4,
    claimPointsHundredths: 400,
    streakBonusPointsHundredths: 200,
    totalPointsHundredths: 600,
    activeLoopStreaks: 1,
    longestStreak: 3,
    loopCount: 2,
    earnedStreakBonuses: [{ streak: 3, pointsHundredths: 200 }],
  }
}

describe("season API integration", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    db.state = {
      status: "ready",
      configHash: seasonConfigHash(),
      rebuildCompletedAt: new Date("2026-10-10T12:00:00.000Z"),
    }
    db.getSeasonScoringState.mockImplementation(() => Promise.resolve(db.state))
    db.getSeasonUserGlobalStats.mockResolvedValue(globalStats())
    db.getSeasonUserLoopStatsForUser.mockResolvedValue([
      {
        seasonId,
        userAddress,
        chainId: 8453,
        loopId: 6,
        totalClaims: 3,
        claimPointsHundredths: 300,
        streakBonusPointsHundredths: 200,
        totalPointsHundredths: 500,
        currentStreak: 3,
        longestStreak: 3,
        lastClaimedPeriod: 12,
        earnedStreakBonuses: [{ streak: 3, pointsHundredths: 200 }],
      },
    ])
    db.getSeasonLeaderboard.mockResolvedValue([globalStats()])
    db.countSeasonLeaderboard.mockResolvedValue(1)
  })

  it("lists the active test season and reports a ready rebuild", async () => {
    const response = await getSeasons()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toMatchObject({
      success: true,
      seasons: [
        {
          id: seasonId,
          startsAt: "2026-08-10T00:00:00.000Z",
          endsAt: "2026-10-11T00:00:00.000Z",
          loops: [
            { chainId: 8453, loopId: 1, multiplier: 1 },
            { chainId: 8453, loopId: 6, multiplier: 1 },
          ],
        },
      ],
      rebuild: { required: false, status: "ready" },
    })
  })

  it("returns the test season as current on October 10", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-10-10T23:59:59.999Z"))
    try {
      const response = await getCurrentSeason()
      expect(response.status).toBe(200)
      await expect(response.json()).resolves.toMatchObject({
        success: true,
        season: { id: seasonId },
      })
    } finally {
      vi.useRealTimers()
    }
  })

  it("returns normalized decimal scoring for a season user", async () => {
    const response = await getSeasonUser(new Request("http://localhost"), {
      params: {
        seasonId,
        address: `0x${userAddress.slice(2).toUpperCase()}`,
      },
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toMatchObject({
      success: true,
      userAddress,
      stats: {
        totalClaims: 4,
        claimPoints: 4,
        streakBonusPoints: 2,
        totalPoints: 6,
      },
      loops: [
        {
          chainId: 8453,
          loopId: 6,
          totalPoints: 5,
          earnedStreakBonuses: [{ streak: 3, points: 2 }],
        },
      ],
    })
  })

  it("ranks and paginates the season leaderboard", async () => {
    const response = await getLeaderboard(
      new Request(
        `http://localhost/api/seasons/${seasonId}/leaderboard?limit=10&offset=20`
      ),
      { params: { seasonId } }
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toMatchObject({
      success: true,
      limit: 10,
      offset: 20,
      totalMatching: 1,
      entries: [{ rank: 21, totalPoints: 6 }],
    })
    expect(db.getSeasonLeaderboard).toHaveBeenCalledWith({
      seasonId,
      limit: 10,
      offset: 20,
    })
  })

  it("rejects invalid addresses before querying season projections", async () => {
    const response = await getSeasonUser(new Request("http://localhost"), {
      params: { seasonId, address: "not-an-address" },
    })

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: "Invalid address",
    })
    expect(db.getSeasonUserGlobalStats).not.toHaveBeenCalled()
  })

  it("returns 503 when the configured season has not been rebuilt", async () => {
    db.state = { ...db.state!, configHash: "stale" }

    const response = await getLeaderboard(
      new Request(`http://localhost/api/seasons/${seasonId}/leaderboard`),
      { params: { seasonId } }
    )

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: "Season scoring rebuild required",
    })
    expect(db.getSeasonLeaderboard).not.toHaveBeenCalled()
  })
})
