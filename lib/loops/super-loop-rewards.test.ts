import { describe, expect, it } from "vitest"

import {
  calculateSuperLoopAnimatedReward,
  calculateSuperLoopEstimatedPeriodPayout,
} from "./super-loop-rewards"

describe("SuperLoop reward estimate", () => {
  it("estimates the per-user payout from the flow, period, and users", () => {
    expect(
      calculateSuperLoopEstimatedPeriodPayout({
        accumulatingUsers: 4,
        flowRatePerSecond: 10n,
        periodLengthSeconds: 100n,
      })
    ).toBe(250n)
  })

  it.each([undefined, 0, -1])(
    "does not estimate with an invalid user count: %s",
    (accumulatingUsers) => {
      expect(
        calculateSuperLoopEstimatedPeriodPayout({
          accumulatingUsers,
          flowRatePerSecond: 10n,
          periodLengthSeconds: 100n,
        })
      ).toBeUndefined()
    }
  )

  it("moves linearly toward the estimate with period progress", () => {
    expect(
      calculateSuperLoopAnimatedReward({
        estimatedPeriodPayout: 1_000n,
        nowMilliseconds: 1_050_000n,
        periodLengthSeconds: 100n,
        periodStartSeconds: 1_000n,
      })
    ).toBe(500n)
  })

  it("starts at zero and stops exactly at the estimated payout", () => {
    const input = {
      estimatedPeriodPayout: 1_000n,
      periodLengthSeconds: 100n,
      periodStartSeconds: 1_000n,
    }

    expect(
      calculateSuperLoopAnimatedReward({
        ...input,
        nowMilliseconds: 999_000n,
      })
    ).toBe(0n)
    expect(
      calculateSuperLoopAnimatedReward({
        ...input,
        nowMilliseconds: 1_101_000n,
      })
    ).toBe(1_000n)
  })
})
