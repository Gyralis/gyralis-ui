import { describe, expect, it } from "vitest"

import { formatDailyRewardAmount } from "./daily-reward"

describe("daily reward estimates", () => {
  it("shows the total daily streaming pool, including when there are no participants", () => {
    expect(
      formatDailyRewardAmount({ flowRatePerSecond: 500n, decimals: 6 })
    ).toBe("43.20")
    expect(
      formatDailyRewardAmount({ flowRatePerSecond: 0n, decimals: 6 })
    ).toBe("0.00")
    expect(
      formatDailyRewardAmount({ flowRatePerSecond: undefined, decimals: 6 })
    ).toBe("—")
  })

  it("normalizes a half-day payout to 24 hours without assuming token decimals", () => {
    expect(
      formatDailyRewardAmount({
        totalPeriodPayout: 1_250_000n,
        periodLength: 43_200n,
        decimals: 6,
      })
    ).toBe("2.50")
    expect(
      formatDailyRewardAmount({
        totalPeriodPayout: 562396691539443564128n,
        periodLength: 86_400n,
        decimals: 18,
      })
    ).toBe("562.40")
  })

  it("distinguishes zero rewards from an unavailable estimate", () => {
    expect(
      formatDailyRewardAmount({
        totalPeriodPayout: 0n,
        periodLength: 43_200n,
        decimals: 18,
      })
    ).toBe("0.00")
    expect(
      formatDailyRewardAmount({ periodLength: 43_200n, decimals: 18 })
    ).toBe("—")
    expect(
      formatDailyRewardAmount({
        totalPeriodPayout: 100n,
        periodLength: 0n,
        decimals: 18,
      })
    ).toBe("—")
  })

  it("does not round a positive small reward to zero", () => {
    expect(
      formatDailyRewardAmount({
        totalPeriodPayout: 1n,
        periodLength: 86_400n,
        decimals: 18,
      })
    ).toBe("<0.01")
    expect(
      formatDailyRewardAmount({
        totalPeriodPayout: 1n,
        periodLength: 172_800n,
        decimals: 18,
      })
    ).toBe("<0.01")
  })

  it("preserves fractional daily estimates for tokens with no fractional units", () => {
    expect(
      formatDailyRewardAmount({
        totalPeriodPayout: 1n,
        periodLength: 172_800n,
        decimals: 0,
      })
    ).toBe("0.50")
  })
})
