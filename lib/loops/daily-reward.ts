import {
  formatTokenAmount,
  TOKEN_AMOUNT_FORMATS,
} from "@/lib/utils/token-amount"

export interface DailyRewardEstimate {
  value: string
  symbol: string
}

type LoopDailyRewardInput = { decimals: number } & (
  | { totalPeriodPayout?: bigint; periodLength: bigint }
  | { flowRatePerSecond: bigint | undefined }
)

/** Total Loop rewards over 24 hours, before division between participants. */
export function formatDailyRewardAmount(input: LoopDailyRewardInput): string {
  const { decimals } = input
  const periodPayout =
    "flowRatePerSecond" in input
      ? input.flowRatePerSecond
      : input.totalPeriodPayout
  const periodLength = "flowRatePerSecond" in input ? 1n : input.periodLength
  if (periodPayout == null || periodLength <= 0n || periodPayout < 0n)
    return "—"
  if (periodPayout === 0n)
    return formatTokenAmount(0n, {
      decimals,
      ...TOKEN_AMOUNT_FORMATS.dailyReward,
    })

  // Retain one digit beyond display precision, including for low-decimal tokens.
  const extraDecimals = Math.max(
    0,
    TOKEN_AMOUNT_FORMATS.dailyReward.maximumFractionDigits + 1 - decimals
  )
  const dailyRaw =
    (periodPayout * 86_400n * 10n ** BigInt(extraDecimals)) / periodLength
  return formatTokenAmount(dailyRaw || 1n, {
    // A positive sub-unit estimate still belongs below the display threshold.
    decimals: decimals + extraDecimals,
    ...TOKEN_AMOUNT_FORMATS.dailyReward,
  })
}
