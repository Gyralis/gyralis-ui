import { describe, expect, it } from "vitest"

import { formatTokenAmount } from "./token-amount"

describe("shared token display formatting", () => {
  it("uses the supplied token decimals for raw chain units", () => {
    expect(formatTokenAmount(1_234_567n, { decimals: 6 })).toBe("1.2345")
    expect(formatTokenAmount(1_234_567n, { decimals: 18 })).toBe("<0.0001")
    expect(formatTokenAmount(123n, { decimals: 0 })).toBe("123")
  })

  it("preserves large balances and fractional precision without Number conversion", () => {
    expect(
      formatTokenAmount("9007199254740993123456789.123456", {
        maximumFractionDigits: 6,
        useGrouping: true,
        symbol: "HNY",
      })
    ).toBe("9,007,199,254,740,993,123,456,789.123456 HNY")
  })

  it("supports exact truncation and decimal rounding with carry", () => {
    expect(formatTokenAmount("9.99999", { maximumFractionDigits: 3 })).toBe(
      "9.999"
    )
    expect(
      formatTokenAmount("9.99999", {
        maximumFractionDigits: 3,
        rounding: "round",
        minimumFractionDigits: 3,
      })
    ).toBe("10.000")
    expect(
      formatTokenAmount("999.9", {
        maximumFractionDigits: 0,
        rounding: "round",
        useGrouping: true,
      })
    ).toBe("1,000")
  })

  it("keeps fixed claim precision distinct from trimmed display values", () => {
    expect(
      formatTokenAmount("1.2", {
        maximumFractionDigits: 3,
        minimumFractionDigits: 3,
      })
    ).toBe("1.200")
    expect(formatTokenAmount("1.2000")).toBe("1.2")
    expect(formatTokenAmount("1.00009", { trimTrailingZeros: false })).toBe(
      "1.0000"
    )
  })

  it("distinguishes a tiny nonzero amount, a real zero and unavailable metadata", () => {
    expect(
      formatTokenAmount(1n, { decimals: 18, maximumFractionDigits: 3 })
    ).toBe("<0.001")
    expect(formatTokenAmount(0n, { decimals: 18 })).toBe("0")
    expect(formatTokenAmount(1n)).toBe("—")
    expect(formatTokenAmount(undefined, { symbol: "HNY" })).toBe("—")
    expect(formatTokenAmount(null, { missingValue: "--" })).toBe("--")
    expect(formatTokenAmount("NaN")).toBe("—")
    expect(formatTokenAmount("Infinity")).toBe("—")
  })

  it("handles negative flow displays and suppresses negative zero", () => {
    expect(formatTokenAmount("-0.0000001", { maximumFractionDigits: 6 })).toBe(
      ">-0.000001"
    )
    expect(formatTokenAmount("-1.23456", { rounding: "round" })).toBe("-1.2346")
    expect(formatTokenAmount("-0.0000001", { showSmallValues: false })).toBe(
      "0"
    )
  })

  it("can show fixed zero frames for animations", () => {
    expect(
      formatTokenAmount(1n, {
        decimals: 18,
        maximumFractionDigits: 7,
        minimumFractionDigits: 7,
        showSmallValues: false,
      })
    ).toBe("0.0000000")
  })

  it("rejects invalid display precision", () => {
    expect(() => formatTokenAmount("1", { maximumFractionDigits: -1 })).toThrow(
      RangeError
    )
    expect(() => formatTokenAmount("1", { minimumFractionDigits: 5 })).toThrow(
      RangeError
    )
  })
})
