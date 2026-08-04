"use client"

import { useCallback, useEffect, useState } from "react"
import { parseAbiItem, type Address } from "viem"
import { usePublicClient } from "wagmi"

import { getLogsChunked } from "@/lib/hooks/app/get-logs-chunked"

const registerEvent = parseAbiItem(
  "event Register(address indexed sender, uint256 indexed periodNumber)"
)
const tokenRegisterEvent = parseAbiItem(
  "event Register(address indexed sender, address indexed token, uint256 indexed periodNumber)"
)
const LOG_LOOKBACK_BLOCKS = 100_000n

interface UseStandardLoopWalletRegistrationParams {
  address: Address
  chainId: number
  currentPeriod?: bigint
  enabled?: boolean
  user?: Address
}

export function useStandardLoopWalletRegistration({
  address,
  chainId,
  currentPeriod,
  enabled = true,
  user,
}: UseStandardLoopWalletRegistrationParams) {
  const publicClient = usePublicClient({ chainId })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error>()
  const [registeredForNextPeriod, setRegisteredForNextPeriod] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!enabled || !publicClient || !user || currentPeriod == null) {
      setError(undefined)
      setIsLoading(false)
      setRegisteredForNextPeriod(false)
      return
    }

    let cancelled = false

    const fetchRegistration = async () => {
      setError(undefined)
      setIsLoading(true)

      try {
        const latestBlock = await publicClient.getBlockNumber()
        const fromBlock =
          latestBlock > LOG_LOOKBACK_BLOCKS
            ? latestBlock - LOG_LOOKBACK_BLOCKS
            : 0n
        const periodNumber = currentPeriod + 1n
        const [legacyLogs, tokenLogs] = await Promise.all([
          getLogsChunked(publicClient, {
            address,
            event: registerEvent,
            args: { sender: user, periodNumber },
            fromBlock,
            toBlock: latestBlock,
          }),
          getLogsChunked(publicClient, {
            address,
            event: tokenRegisterEvent,
            args: { sender: user, periodNumber },
            fromBlock,
            toBlock: latestBlock,
          }),
        ])

        if (!cancelled) {
          setRegisteredForNextPeriod(
            legacyLogs.length > 0 || tokenLogs.length > 0
          )
        }
      } catch (cause) {
        if (!cancelled) {
          setRegisteredForNextPeriod(false)
          setError(
            cause instanceof Error
              ? cause
              : new Error("Unable to fetch wallet registration")
          )
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void fetchRegistration()

    return () => {
      cancelled = true
    }
  }, [address, chainId, currentPeriod, enabled, publicClient, refreshKey, user])

  const refetch = useCallback(() => {
    setRefreshKey((key) => key + 1)
  }, [])

  return {
    error,
    isError: Boolean(error),
    isLoading,
    refetch,
    registeredForNextPeriod,
  }
}
