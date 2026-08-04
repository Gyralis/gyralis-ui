import { describe, expect, it } from "vitest"

import {
  getPreviousSuperLoopPeriod,
  normalizeSuperLoopStatusReads,
} from "./super-loop-status"

describe("SuperLoop status reads", () => {
  it("normalizes all five contract reads into named values", () => {
    expect(
      normalizeSuperLoopStatusReads({
        claimerStatus: [true, false],
        currentPeriod: 12n,
        owedAmounts: [3n, 5n, 8n],
        previousPeriodPayout: 4n,
        userPhase: 2,
      })
    ).toEqual({
      claimerStatus: { hasClaimed: false, isRegistered: true },
      currentPeriod: 12n,
      owed: { currentAmount: 5n, pendingAmount: 3n, total: 8n },
      previousPeriod: 11n,
      previousPeriodPayout: 4n,
      userPhase: 2,
    })
  })

  it("does not request a previous-period value during period zero", () => {
    expect(getPreviousSuperLoopPeriod(0n)).toBeUndefined()
    expect(
      normalizeSuperLoopStatusReads({
        currentPeriod: 0n,
        previousPeriodPayout: 4n,
      }).previousPeriodPayout
    ).toBeUndefined()
  })

  it("supports partial data while independent reads are loading", () => {
    expect(normalizeSuperLoopStatusReads({ currentPeriod: 7n })).toMatchObject({
      currentPeriod: 7n,
      previousPeriod: 6n,
    })
  })
})
