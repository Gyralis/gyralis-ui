import { describe, expect, it } from "vitest"

import { formatMonthlyIncoming } from "./use-flowing-balance"

describe("formatMonthlyIncoming", () => {
  it("supports a two-decimal flow-rate display", () => {
    expect(
      formatMonthlyIncoming({
        decimals: 6,
        flowRatePerSecond: 123n,
        maximumFractionDigits: 2,
        symbol: "HNY",
      })
    ).toBe("318.82 HNY / mo")
  })
})
