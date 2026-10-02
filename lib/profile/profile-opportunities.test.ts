import { LoopCardsData, type LoopCardData } from "@/data/loops-data"
import { afterEach, describe, expect, it, vi } from "vitest"

import type { ProfileLoopStats } from "@/lib/profile/get-profile-page-data"
import { getVerifiedStreakBonus } from "@/lib/profile/get-verified-streak-bonus"
import {
  getAchievementLoopStatuses,
  getNextStreakBonus,
  getNextStreakMilestone,
  getUnclaimedLoops,
} from "@/lib/profile/profile-opportunities"
import { scoringConfig } from "@/lib/scoring/config"

const { readContract } = vi.hoisted(() => ({ readContract: vi.fn() }))

vi.mock("server-only", () => ({}))
vi.mock("viem", async (importOriginal) => ({
  ...(await importOriginal<typeof import("viem")>()),
  createPublicClient: () => ({ readContract }),
}))

const catalogLoop: LoopCardData = {
  ...LoopCardsData[0],
  id: 3,
  chainId: 100,
  enabled: true,
  contractType: "loop",
}

function makeLoop(overrides: Partial<ProfileLoopStats> = {}): ProfileLoopStats {
  return {
    id: "test-loop",
    userAddress: "0x0000000000000000000000000000000000000001",
    loopId: 3,
    chainId: 100,
    totalClaims: 5,
    claimPoints: 5,
    streakBonusPoints: 2,
    totalPoints: 7,
    currentStreak: 5,
    longestStreak: 5,
    lastClaimedPeriod: 10,
    earnedStreakBonuses: [{ streak: 3, points: 2 }],
    metadata: {
      id: 3,
      title: "Example loop",
      by: "Example sponsor",
      sponsorName: "Example sponsor",
      address: "0x0000000000000000000000000000000000000002",
      chainId: 100,
      chainName: "Gnosis",
      contractType: "loop",
      enabled: true,
      archived: false,
    },
    ...overrides,
  }
}

afterEach(() => {
  vi.resetAllMocks()
  vi.restoreAllMocks()
})

describe("achievement loop logos", () => {
  it("includes both active loops even when the user has no scoring records", () => {
    const loops = getAchievementLoopStatuses([], 3)
    expect(loops.map((loop) => loop.title)).toEqual([
      "1Hive Gardens",
      "Blockscout Merits",
    ])
    expect(loops.every((loop) => loop.active && !loop.earned)).toBe(true)
  })

  it("counts one earned loop out of two active loops, including the unvisited loop", () => {
    const active = getAchievementLoopStatuses([makeLoop()], 3).filter(
      (loop) => loop.active
    )
    expect(active).toHaveLength(2)
    expect(active.filter((loop) => loop.earned)).toHaveLength(1)
  })

  it("keeps historical rewards out of the active completion count", () => {
    const loops = getAchievementLoopStatuses(
      [
        makeLoop(),
        makeLoop({ id: "inactive-markee", loopId: 5, chainId: 8453 }),
      ],
      3
    )
    expect(loops.filter((loop) => loop.earned)).toHaveLength(2)
    expect(loops.filter((loop) => loop.active)).toHaveLength(2)
    expect(loops.filter((loop) => loop.active && loop.earned)).toHaveLength(1)
  })

  it("counts eight available bonuses across two active loops", () => {
    const activeBonuses = scoringConfig.streakBonuses.flatMap((milestone) =>
      getAchievementLoopStatuses([makeLoop()], milestone.streak).filter(
        (loop) => loop.active
      )
    )
    expect(activeBonuses).toHaveLength(8)
    expect(activeBonuses.filter((loop) => loop.earned)).toHaveLength(1)
  })

  it("matches earned bonuses by chain, loop and milestone, not current streak", () => {
    const catalog = [catalogLoop, { ...catalogLoop, chainId: 8453 }]
    const stats = [makeLoop({ currentStreak: 0 })]
    expect(
      getAchievementLoopStatuses(stats, 3, catalog).map((loop) => loop.earned)
    ).toEqual([true, false])
    expect(
      getAchievementLoopStatuses(stats, 7, catalog).map((loop) => loop.earned)
    ).toEqual([false, false])
  })

  it("keeps inactive earned bonuses in history without treating them as active", () => {
    const loops = getAchievementLoopStatuses([makeLoop()], 3, [
      { ...catalogLoop, achievementActive: false },
    ])
    expect(loops).toMatchObject([{ key: "100-3", active: false, earned: true }])
    expect(
      getAchievementLoopStatuses([makeLoop()], 7, [
        { ...catalogLoop, achievementActive: false },
      ])
    ).toEqual([])
  })

  it("excludes disabled, ignored and unconfigured loops from the active roster", () => {
    expect(
      getAchievementLoopStatuses([], 3, [
        { ...catalogLoop, enabled: false },
        { ...catalogLoop, achievementActive: false },
        { ...catalogLoop, id: 1 },
        { ...catalogLoop, id: 2 },
        { ...catalogLoop, address: undefined },
        { ...catalogLoop, address: "0xinvalid" },
      ])
    ).toEqual([])
  })

  it("does not cap the active roster at four logos", () => {
    const catalog = Array.from({ length: 6 }, (_, index) => ({
      ...catalogLoop,
      id: index + 3,
    }))
    expect(getAchievementLoopStatuses([], 30, catalog)).toHaveLength(6)
  })
})

describe("profile loop discovery", () => {
  it("offers active loops for a wallet with no claims", () => {
    expect(getUnclaimedLoops([], [catalogLoop])).toEqual([catalogLoop])
    expect(
      getUnclaimedLoops([makeLoop({ totalClaims: 0 })], [catalogLoop])
    ).toEqual([catalogLoop])
  })

  it("matches claims by both chain and loop ID", () => {
    const otherChain = { ...catalogLoop, chainId: 8453 }
    expect(getUnclaimedLoops([makeLoop()], [catalogLoop, otherChain])).toEqual([
      otherChain,
    ])
  })

  it("excludes disabled, ignored and unconfigured loops", () => {
    expect(
      getUnclaimedLoops(
        [],
        [
          { ...catalogLoop, enabled: false },
          { ...catalogLoop, id: 1 },
          { ...catalogLoop, id: 2 },
          { ...catalogLoop, address: undefined },
        ]
      )
    ).toEqual([])
  })

  it("offers nothing once every active loop has a recorded claim", () => {
    expect(getUnclaimedLoops([makeLoop()], [catalogLoop])).toEqual([])
  })
})

describe("next streak bonuses", () => {
  it.each([10n, 11n])(
    "uses the current streak when period %s confirms it is recent",
    (currentPeriod) => {
      expect(
        getNextStreakBonus(makeLoop({ longestStreak: 23 }), currentPeriod)
      ).toEqual({ streak: 7, points: 5, remainingClaims: 2 })
    }
  )

  it.each([null, -1n, 9n, 12n, 100n])(
    "hides precise progress for unknown, future or outdated claim periods (%s)",
    (currentPeriod) => {
      expect(getNextStreakBonus(makeLoop(), currentPeriod)).toBeNull()
    }
  )

  it("skips a previously earned milestone after a streak restarts", () => {
    expect(
      getNextStreakBonus(
        makeLoop({
          earnedStreakBonuses: [
            { streak: 3, points: 2 },
            { streak: 7, points: 5 },
          ],
        }),
        11n
      )
    ).toEqual({ streak: 14, points: 12, remainingClaims: 9 })
  })

  it("handles one claim remaining without rounding", () => {
    expect(getNextStreakBonus(makeLoop({ currentStreak: 6 }), 11n)).toEqual({
      streak: 7,
      points: 5,
      remainingClaims: 1,
    })
  })

  it.each([
    { currentStreak: 0 },
    { currentStreak: 7 },
    { lastClaimedPeriod: null },
    { lastClaimedPeriod: Number.NaN },
    { lastClaimedPeriod: -1 },
    { earnedStreakBonuses: scoringConfig.streakBonuses },
    { loopId: 1 },
  ])("omits impossible or completed progress (%j)", (overrides) => {
    expect(getNextStreakBonus(makeLoop(overrides), 11n)).toBeNull()
  })

  it("never recommends continuing an archived loop", () => {
    const loop = makeLoop()
    loop.metadata.archived = true
    loop.metadata.enabled = false
    expect(getNextStreakMilestone(loop)).toBeNull()
  })
})

describe("live streak verification", () => {
  it.each([
    ["loop", "getCurrentPeriod"],
    ["superLoop", "getStreamingCurrentPeriod"],
  ] as const)(
    "checks the correct period method for %s",
    async (type, method) => {
      readContract.mockResolvedValue(11n)
      const loop = makeLoop()
      loop.metadata.contractType = type

      await expect(getVerifiedStreakBonus(loop)).resolves.toEqual({
        streak: 7,
        points: 5,
        remainingClaims: 2,
      })
      expect(readContract).toHaveBeenCalledWith(
        expect.objectContaining({
          address: loop.metadata.address,
          functionName: method,
        })
      )
    }
  )

  it("does not fetch when there is no next milestone", async () => {
    await expect(
      getVerifiedStreakBonus(
        makeLoop({ earnedStreakBonuses: scoringConfig.streakBonuses })
      )
    ).resolves.toBeNull()
    expect(readContract).not.toHaveBeenCalled()
  })

  it("omits a hint when the RPC is unavailable", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined)
    readContract.mockRejectedValue(new Error("RPC timeout"))
    await expect(getVerifiedStreakBonus(makeLoop())).resolves.toBeNull()
  })
})
