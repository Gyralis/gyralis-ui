import { formatUnits } from "viem"

export interface TokenAmountFormatOptions {
  /** Required for raw bigint values; string values are already in token units. */
  decimals?: number
  maximumFractionDigits?: number
  minimumFractionDigits?: number
  rounding?: "truncate" | "round"
  trimTrailingZeros?: boolean
  useGrouping?: boolean
  /** Show <0.001 rather than zero for a positive value below display precision. */
  showSmallValues?: boolean
  missingValue?: string
  symbol?: string | null
}

/** Shared display policies; token unit decimals always come from token metadata. */
export const TOKEN_AMOUNT_FORMATS = {
  claim: {
    maximumFractionDigits: 3,
    minimumFractionDigits: 3,
    rounding: "round",
  },
  dailyReward: {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    rounding: "round",
    useGrouping: true,
  },
  balance: { maximumFractionDigits: 1 },
  distribution: { maximumFractionDigits: 2 },
  details: { maximumFractionDigits: 4 },
  estimate: { maximumFractionDigits: 7 },
} as const satisfies Record<string, TokenAmountFormatOptions>

/**
 * Shared token display formatter for raw chain values and decimal API strings.
 * Uses decimal strings and bigint arithmetic, never floating-point conversion.
 * Calculations and API payloads should retain their original precise values.
 */
export function formatTokenAmount(
  value: bigint | string | null | undefined,
  {
    decimals,
    maximumFractionDigits = TOKEN_AMOUNT_FORMATS.details.maximumFractionDigits,
    minimumFractionDigits = 0,
    rounding = "truncate",
    trimTrailingZeros = true,
    useGrouping = false,
    showSmallValues = true,
    missingValue = "—",
    symbol,
  }: TokenAmountFormatOptions = {}
): string {
  if (
    !Number.isInteger(maximumFractionDigits) ||
    maximumFractionDigits < 0 ||
    maximumFractionDigits > 255 ||
    !Number.isInteger(minimumFractionDigits) ||
    minimumFractionDigits < 0 ||
    minimumFractionDigits > maximumFractionDigits
  ) {
    throw new RangeError("Invalid token display precision")
  }
  if (value == null) return missingValue
  if (
    typeof value === "bigint" &&
    (decimals == null ||
      !Number.isInteger(decimals) ||
      decimals < 0 ||
      decimals > 255)
  ) {
    return missingValue
  }

  const decimal =
    typeof value === "bigint" ? formatUnits(value, decimals!) : value
  const match = /^(-?)(\d+)(?:\.(\d+))?$/.exec(decimal)
  if (!match) return missingValue

  const [, sign, integer, fraction = ""] = match
  let whole = integer.replace(/^0+(?=\d)/, "")
  let visible = fraction.slice(0, maximumFractionDigits)
  const nonZero = /[1-9]/.test(whole + fraction)
  const belowPrecision = nonZero && whole === "0" && !/[1-9]/.test(visible)
  const suffix = symbol ? ` ${symbol}` : ""

  if (showSmallValues && belowPrecision) {
    const threshold = maximumFractionDigits
      ? `0.${"0".repeat(maximumFractionDigits - 1)}1`
      : "1"
    return `${sign ? `>-${threshold}` : `<${threshold}`}${suffix}`
  }

  if (rounding === "round" && (fraction[maximumFractionDigits] ?? "0") >= "5") {
    const incremented = (
      BigInt(whole + visible.padEnd(maximumFractionDigits, "0")) + 1n
    )
      .toString()
      .padStart(maximumFractionDigits + 1, "0")
    whole = maximumFractionDigits
      ? incremented.slice(0, -maximumFractionDigits)
      : incremented
    visible = maximumFractionDigits
      ? incremented.slice(-maximumFractionDigits)
      : ""
  }

  if (trimTrailingZeros) visible = visible.replace(/0+$/, "")
  visible = visible.padEnd(minimumFractionDigits, "0")
  const negative = sign && /[1-9]/.test(whole + visible) ? "-" : ""
  const grouped = useGrouping
    ? whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    : whole
  return `${negative}${grouped}${visible ? `.${visible}` : ""}${suffix}`
}
