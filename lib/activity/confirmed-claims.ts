import { loopDashboardMeta } from "@/data/loop-dashboard-meta"
import { LoopCardsData } from "@/data/loops-data"
import { decodeEventLog, formatUnits, parseAbiItem } from "viem"
import { base, gnosis } from "viem/chains"

import type { LoopActionConfirmation } from "@/lib/loops/loop-action-confirmation"

import type { ClaimActivityItem } from "./types"

const claimEvents = [
  parseAbiItem(
    "event Claim(address indexed claimer,uint256 periodNumber,uint256 payout)"
  ),
  parseAbiItem(
    "event Claim(address indexed claimer,address indexed token,uint256 indexed periodNumber,uint256 payout)"
  ),
  parseAbiItem(
    "event Claim(uint256 indexed loopId,address indexed claimer,uint256 indexed periodNumber,uint256 payout)"
  ),
]

/** Reuse successful receipt logs; no RPC lookup or guessed wallet payout. */
export function confirmedClaimActivity(
  confirmation: LoopActionConfirmation,
  decimals = 18,
  now = Date.now()
) {
  const claims: { wallet: string; item: ClaimActivityItem }[] = []
  if (confirmation.action !== "claim") return claims
  const chain = [gnosis, base].find(
    (entry) => entry.id === confirmation.chainId
  )
  if (!chain) return claims
  for (const log of confirmation.logs ?? []) {
    if (log.logIndex == null) continue
    const loop = LoopCardsData.find(
      (entry) =>
        entry.enabled &&
        entry.historyLoopKey &&
        entry.chainId === chain.id &&
        entry.address?.toLowerCase() === log.address.toLowerCase()
    )
    if (!loop?.historyLoopKey) continue
    for (const event of claimEvents) {
      try {
        const { args } = decodeEventLog({
          abi: [event],
          data: log.data,
          topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
        })
        const meta = loopDashboardMeta[loop.historyLoopKey]
        claims.push({
          wallet: args.claimer.toLowerCase(),
          item: {
            id: `${chain.id}:${confirmation.transactionHash.toLowerCase()}-${
              log.logIndex
            }`,
            chainId: chain.id,
            chainName: chain.name,
            loopName: meta.title,
            logoSrc: meta.logoSrc,
            loopAddress: log.address.toLowerCase(),
            period: args.periodNumber.toString(),
            periodKind: "current",
            amount: formatUnits(args.payout, decimals),
            tokenSymbol: meta.tokenSymbol,
            tokenAddress: loop.token.toLowerCase(),
            tokenDecimals: decimals,
            timestamp: Math.floor(now / 1000),
            transactionUrl: `${chain.blockExplorers.default.url}/tx/${confirmation.transactionHash}`,
            transactionHash: confirmation.transactionHash.toLowerCase(),
            logIndex: log.logIndex,
            blockNumber: Number(confirmation.blockNumber),
            source: "receipt",
          },
        })
        break
      } catch {
        // Other logs/event versions are not claim activity.
      }
    }
  }
  return claims
}
