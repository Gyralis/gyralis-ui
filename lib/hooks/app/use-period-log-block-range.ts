"use client"

import { useEffect, useState } from "react"
import type { PublicClient } from "viem"
import { usePublicClient } from "wagmi"

interface PeriodLogBlockRange {
  fromBlock?: bigint
  loading: boolean
  toBlock?: bigint
}

interface UsePeriodLogBlockRangeOptions {
  chainId: number
  enabled?: boolean
  firstPeriodStart?: bigint
  periodLength?: bigint
  windowPeriod?: bigint
}

async function findFirstBlockAtOrAfter(
  publicClient: PublicClient,
  timestamp: bigint,
  latestBlockNumber: bigint,
  latestBlockTimestamp: bigint
) {
  if (timestamp >= latestBlockTimestamp) return latestBlockNumber

  let low = 0n
  let high = latestBlockNumber

  while (low < high) {
    const mid = (low + high) / 2n
    const block = await publicClient.getBlock({ blockNumber: mid })

    if (block.timestamp >= timestamp) {
      high = mid
    } else {
      low = mid + 1n
    }
  }

  return low
}

export function usePeriodLogBlockRange({
  chainId,
  enabled = true,
  firstPeriodStart,
  periodLength,
  windowPeriod,
}: UsePeriodLogBlockRangeOptions): PeriodLogBlockRange {
  const publicClient = usePublicClient({ chainId })
  const [range, setRange] = useState<PeriodLogBlockRange>({ loading: false })

  useEffect(() => {
    if (
      !enabled ||
      !publicClient ||
      firstPeriodStart == null ||
      periodLength == null ||
      windowPeriod == null
    ) {
      setRange({ loading: false })
      return
    }

    let cancelled = false

    const fetchRange = async () => {
      setRange({ loading: true })

      try {
        const latestBlockNumber = await publicClient.getBlockNumber()
        const latestBlock = await publicClient.getBlock({
          blockNumber: latestBlockNumber,
        })
        const periodStart = firstPeriodStart + windowPeriod * periodLength
        const periodEnd = periodStart + periodLength

        const fromBlock = await findFirstBlockAtOrAfter(
          publicClient,
          periodStart,
          latestBlockNumber,
          latestBlock.timestamp
        )
        const endBlock = await findFirstBlockAtOrAfter(
          publicClient,
          periodEnd,
          latestBlockNumber,
          latestBlock.timestamp
        )
        const toBlock =
          endBlock > fromBlock && periodEnd <= latestBlock.timestamp
            ? endBlock - 1n
            : latestBlockNumber

        if (!cancelled) setRange({ fromBlock, loading: false, toBlock })
      } catch (error) {
        if (!cancelled) {
          console.error("Error resolving period log block range:", error)
          setRange({ loading: false })
        }
      }
    }

    void fetchRange()

    return () => {
      cancelled = true
    }
  }, [
    chainId,
    enabled,
    firstPeriodStart,
    periodLength,
    publicClient,
    windowPeriod,
  ])

  return range
}
