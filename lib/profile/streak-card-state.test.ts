import { rwagmiTestLoop } from "@/data/loops-data"
import { describe, expect, it } from "vitest"

import {
  findProfileStreak,
  getStreakCardState,
  type ProfileStreakRecord,
} from "./streak-card-state"

function record(
  currentStreak: number,
  earned: number[] = []
): ProfileStreakRecord {
  return {
    chainId: 8453,
    loopId: 7,
    totalClaims: 50,
    currentStreak,
    longestStreak: 37,
    earnedStreakBonuses: earned.map((streak) => ({ streak, points: 2 })),
  }
}

describe("profile streak card state", () => {
  it("uses the real profile's 3/7/14/30 milestones and only the current target is in progress", () => {
    const state = getStreakCardState(record(6, [3]))
    expect(
      state.milestones.map((milestone) => [milestone.streak, milestone.status])
    ).toEqual([
      [3, "completed"],
      [7, "in-progress"],
      [14, "locked"],
      [30, "locked"],
    ])
    expect(state.completed).toBe(1)
    expect(state.next?.streak).toBe(7)
  })

  it("preserves previously earned milestones after the current streak resets", () => {
    const state = getStreakCardState(record(2, [3, 7]))
    expect(state.streak).toBe(2)
    expect(state.completed).toBe(2)
    expect(state.next).toMatchObject({ streak: 14, status: "in-progress" })
  })

  it("does not invent credited bonuses when a milestone is reached but missing from profile stats", () => {
    const state = getStreakCardState(record(7, [3]))
    expect(state.completed).toBe(1)
    expect(state.next).toMatchObject({ streak: 7, status: "uncredited" })
  })

  it("shows no fabricated activity when no profile record exists", () => {
    const state = getStreakCardState()
    expect(state.streak).toBe(0)
    expect(state.completed).toBe(0)
    expect(
      state.milestones.every((milestone) => milestone.status === "locked")
    ).toBe(true)
  })

  it("keeps the full streak count after all four milestones are earned", () => {
    const state = getStreakCardState(record(128, [3, 7, 14, 30]))
    expect(state.streak).toBe(128)
    expect(state.completed).toBe(4)
    expect(state.goal).toBe(30)
    expect(state.next).toBeUndefined()
  })

  it("resolves RWAGMI's existing scoring ID without mixing chains or summing duplicate identities", () => {
    const legacy = record(15, [3, 7, 14])
    const otherChain = { ...legacy, chainId: 1868 }
    expect(findProfileStreak(rwagmiTestLoop, [otherChain])).toBeUndefined()
    expect(findProfileStreak(rwagmiTestLoop, [otherChain, legacy])).toBe(legacy)
    const current = { ...legacy, loopId: rwagmiTestLoop.id, currentStreak: 16 }
    expect(findProfileStreak(rwagmiTestLoop, [legacy, current])).toBe(current)
  })
})
