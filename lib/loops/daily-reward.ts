import { formatUnits } from "viem"

export interface DailyRewardEstimate {
  value: string
  symbol: string
}

/** A per-wallet 24-hour estimate, distinct from the wallet's claimable payout. */
export function formatDailyRewardAmount({
  periodPayout,
  periodLength,
  decimals,
}: {
  periodPayout?: bigint
  periodLength: bigint
  decimals: number
}): string {
  if (periodPayout == null || periodLength <= 0n || periodPayout < 0n)
    return "—"
  if (periodPayout === 0n) return "0"

  const dailyRaw = (periodPayout * 86_400n) / periodLength
  const amount = Number(formatUnits(dailyRaw, decimals))
  if (amount < 0.000001) return "<0.000001"
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 6 }).format(
    amount
  )
}
