import { describe, expect, it } from "vitest"

import { formatDailyRewardAmount } from "./daily-reward"

describe("daily reward estimates", () => {
  it("normalizes a half-day payout to 24 hours without assuming token decimals", () => {
    expect(
      formatDailyRewardAmount({
        periodPayout: 1_250_000n,
        periodLength: 43_200n,
        decimals: 6,
      })
    ).toBe("2.5")
    expect(
      formatDailyRewardAmount({
        periodPayout: 562396691539443564128n,
        periodLength: 86_400n,
        decimals: 18,
      })
    ).toBe("562.396692")
  })

  it("distinguishes zero rewards from an unavailable estimate", () => {
    expect(
      formatDailyRewardAmount({
        periodPayout: 0n,
        periodLength: 43_200n,
        decimals: 18,
      })
    ).toBe("0")
    expect(
      formatDailyRewardAmount({ periodLength: 43_200n, decimals: 18 })
    ).toBe("—")
    expect(
      formatDailyRewardAmount({
        periodPayout: 100n,
        periodLength: 0n,
        decimals: 18,
      })
    ).toBe("—")
  })

  it("does not round a positive small reward to zero", () => {
    expect(
      formatDailyRewardAmount({
        periodPayout: 1n,
        periodLength: 86_400n,
        decimals: 18,
      })
    ).toBe("<0.000001")
    expect(
      formatDailyRewardAmount({
        periodPayout: 1n,
        periodLength: 172_800n,
        decimals: 18,
      })
    ).toBe("<0.000001")
  })
})
