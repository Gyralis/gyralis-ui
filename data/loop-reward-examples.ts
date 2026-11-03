import type { LoopCardData } from "@/data/loops-data"
import { formatUnits } from "viem"

interface RewardExample {
  period: number
  payoutRaw: string
  periodSeconds: number
  decimals: number
  symbol: string
  note?: string
}

// Read-only contract snapshots for the card design, not a live reward quote.
// UTC timestamp corresponds to November 2 in the user's Uruguay timezone.
export const rewardExamplesCheckedAt = "2026-11-03T02:48:15Z"

const rewardExamples: Record<string, RewardExample> = {
  "100:0x8995641fb3e452bc1359e79a738a6de556015696": {
    period: 181,
    payoutRaw: "36414699878409818",
    periodSeconds: 86400,
    decimals: 18,
    symbol: "HNY",
  },
  "100:0xab25dbafd11b1eb606b2455eecec67e6746e409b": {
    period: 181,
    payoutRaw: "19570059080118519",
    periodSeconds: 86400,
    decimals: 18,
    symbol: "HNY",
  },
  "8453:0xe714bc7f58726490a15d2197bcded598223f5319": {
    period: 21,
    payoutRaw: "562396691539443564128",
    periodSeconds: 86400,
    decimals: 18,
    symbol: "RWAGMI",
  },
  "8453:0xb7902fae80eb57abac621dc68eb30ffff42f76f0": {
    period: 66,
    payoutRaw: "0",
    periodSeconds: 43200,
    decimals: 18,
    symbol: "USDCx",
    note: "No active reward stream at the time of this snapshot.",
  },
  "1868:0x72a7388ece62b2bac4cee2e4754372cec211336b": {
    period: 657,
    payoutRaw: "0",
    periodSeconds: 3600,
    decimals: 18,
    symbol: "MCK",
    note: "Hourly periods, normalized to a daily estimate.",
  },
  "1868:0x6297f2951dbbf0b3a797d6d6c4496de1d6735034": {
    period: 27,
    payoutRaw: "0",
    periodSeconds: 86400,
    decimals: 18,
    symbol: "oMCK",
  },
}

export function getLoopRewardExample(
  loop: Pick<LoopCardData, "chainId" | "address">
) {
  if (!loop.address) return undefined
  const example =
    rewardExamples[`${loop.chainId}:${loop.address.toLowerCase()}`]
  if (!example) return undefined
  // Preserve token precision before converting hourly/12-hour payouts to a day.
  const dailyRaw =
    (BigInt(example.payoutRaw) * 86400n) / BigInt(example.periodSeconds)
  return {
    ...example,
    dailyAmount: formatUnits(dailyRaw, example.decimals),
    checkedAt: rewardExamplesCheckedAt,
  }
}
