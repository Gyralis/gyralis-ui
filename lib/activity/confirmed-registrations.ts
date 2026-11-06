import { loopDashboardMeta } from "@/data/loop-dashboard-meta"
import { LoopCardsData } from "@/data/loops-data"
import { decodeEventLog, parseAbiItem } from "viem"
import { base, gnosis } from "viem/chains"

import type { LoopActionConfirmation } from "@/lib/loops/loop-action-confirmation"

import type { RegistrationActivityItem } from "./types"

const registerEvents = [
  parseAbiItem(
    "event Register(address indexed sender,uint256 indexed periodNumber)"
  ),
  parseAbiItem("event Register(address indexed sender,uint256 periodNumber)"),
  parseAbiItem(
    "event Register(address indexed sender,address indexed token,uint256 indexed periodNumber)"
  ),
]

/** Registration is proven by a successful receipt log, never inferred from a claim. */
export function confirmedRegistrationActivity(
  confirmation: LoopActionConfirmation,
  now = Date.now()
) {
  const result: { wallet: string; item: RegistrationActivityItem }[] = []
  const chain = [gnosis, base].find(
    (entry) => entry.id === confirmation.chainId
  )
  if (!chain) return result
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
    for (const event of registerEvents) {
      try {
        const { args } = decodeEventLog({
          abi: [event],
          data: log.data,
          topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
        })
        const meta = loopDashboardMeta[loop.historyLoopKey]
        result.push({
          wallet: args.sender.toLowerCase(),
          item: {
            kind: "registration",
            id: `${chain.id}:${confirmation.transactionHash.toLowerCase()}-${
              log.logIndex
            }`,
            chainId: chain.id,
            chainName: chain.name,
            loopName: meta.title,
            logoSrc: meta.logoSrc,
            loopAddress: log.address.toLowerCase(),
            period: args.periodNumber.toString(),
            periodKind: "next",
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
        /* Ignore non-registration logs. */
      }
    }
  }
  return result
}
