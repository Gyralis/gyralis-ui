import { describe, expect, it } from "vitest"

import {
  leaderboardPageNumbers,
  mobileLeaderboardPageNumbers,
} from "./pagination"

describe("leaderboard pagination", () => {
  it("matches the first, second, middle, and last page examples", () => {
    expect(leaderboardPageNumbers(1, 98)).toEqual([1, 2, 3])
    expect(leaderboardPageNumbers(2, 98)).toEqual([1, 2, 3, 4])
    expect(leaderboardPageNumbers(50, 98)).toEqual([48, 49, 50, 51, 52])
    expect(leaderboardPageNumbers(98, 98)).toEqual([96, 97, 98])
  })
  it("handles short lists and out-of-range URLs", () => {
    expect(leaderboardPageNumbers(1, 1)).toEqual([1])
    expect(leaderboardPageNumbers(2, 2)).toEqual([1, 2])
    expect(leaderboardPageNumbers(99, 3)).toEqual([1, 2, 3])
  })
  it("keeps at most three nearby numbers on narrow screens", () => {
    expect(mobileLeaderboardPageNumbers(1, 98)).toEqual([1, 2, 3])
    expect(mobileLeaderboardPageNumbers(2, 98)).toEqual([1, 2, 3])
    expect(mobileLeaderboardPageNumbers(50, 98)).toEqual([49, 50, 51])
    expect(mobileLeaderboardPageNumbers(98, 98)).toEqual([96, 97, 98])
    expect(mobileLeaderboardPageNumbers(1, 1)).toEqual([1])
  })
})
