import "server-only"

import { unstable_cache } from "next/cache"
import { LoopCardsData } from "@/data/loops-data"
import { createPublicClient, http, parseAbi } from "viem"
import { base, gnosis } from "viem/chains"

const abi = parseAbi([
  "function getCurrentPeriod() view returns (uint256)",
  "function getStreamingCurrentPeriod() view returns (uint256)",
])

/** Public schedules only: shared across wallets, including scoped reconciliation. */
export const getActivityPeriods = unstable_cache(
  async (chainId: number, rpcUrl?: string) => {
    const chain =
      chainId === gnosis.id ? gnosis : chainId === base.id ? base : undefined
    if (!chain) throw new Error("Unsupported activity chain")
    const loops = LoopCardsData.filter(
      (loop) =>
        loop.enabled &&
        loop.historyLoopKey &&
        loop.address &&
        loop.chainId === chainId
    )
    const client = createPublicClient({
      chain,
      transport: http(rpcUrl, { timeout: 5_000, retryCount: 0 }),
    })
    const periods = await client.multicall({
      contracts: loops.map((loop) => ({
        address: loop.address!,
        abi,
        functionName:
          loop.contractType === "superLoop"
            ? ("getStreamingCurrentPeriod" as const)
            : ("getCurrentPeriod" as const),
      })),
      allowFailure: false,
    })
    return loops.map((loop, index) => ({
      loopAddress: loop.address!.toLowerCase(),
      currentPeriod: periods[index].toString(),
    }))
  },
  ["latest-activity-periods-v1"],
  { revalidate: 15 }
)
