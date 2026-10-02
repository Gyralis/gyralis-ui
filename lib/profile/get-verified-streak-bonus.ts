import "server-only"

import { createPublicClient, http, isAddress, parseAbi } from "viem"
import { base, gnosis } from "viem/chains"

import { getLoopContractMethods } from "@/lib/contracts/loop-contracts"
import type { ProfileLoopStats } from "@/lib/profile/get-profile-page-data"
import {
  getNextStreakBonus,
  getNextStreakMilestone,
} from "@/lib/profile/profile-opportunities"

const currentPeriodAbi = parseAbi([
  "function getCurrentPeriod() view returns (uint256)",
  "function getStreamingCurrentPeriod() view returns (uint256)",
])

export async function getVerifiedStreakBonus(loop: ProfileLoopStats) {
  const { address, contractType } = loop.metadata
  if (
    !getNextStreakMilestone(loop) ||
    !address ||
    !isAddress(address) ||
    contractType === "archived"
  ) {
    return null
  }

  const chain = [gnosis, base].find((entry) => entry.id === loop.chainId)
  if (!chain) return null

  const rpcUrl =
    chain.id === base.id
      ? process.env.NEXT_PUBLIC_BASE_RPC_URL?.trim() || undefined
      : undefined
  try {
    const client = createPublicClient({
      chain,
      transport: http(rpcUrl, {
        timeout: 2_500,
        retryCount: 0,
        fetchOptions: { cache: "no-store" },
      }),
    })
    const currentPeriod = await client.readContract({
      address,
      abi: currentPeriodAbi,
      functionName: getLoopContractMethods(contractType).getCurrentPeriod,
    })

    return getNextStreakBonus(loop, currentPeriod)
  } catch {
    // Optional hints must not prevent the rest of the profile from rendering.
    console.warn(
      `Unable to verify profile streak for loop ${loop.loopId} on chain ${loop.chainId}`
    )
    return null
  }
}
