"use client"

import { useQuery } from "@tanstack/react-query"
import { isAddress, parseAbiItem, type Address } from "viem"
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
  const query = useQuery({
    queryKey: [
      "standard-loop",
      "wallet-registration",
      chainId,
      address.toLowerCase(),
      user?.toLowerCase(),
      currentPeriod?.toString(),
    ],
    queryFn: async () => {
      if (!publicClient || !user || currentPeriod == null) {
        throw new Error("Wallet registration is not ready")
      }

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

      return legacyLogs.length > 0 || tokenLogs.length > 0
    },
    enabled:
      enabled &&
      isAddress(address) &&
      Boolean(publicClient && user) &&
      currentPeriod != null,
    staleTime: 10_000,
    refetchOnWindowFocus: false,
  })

  return {
    error: query.error,
    isError: query.isError,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    refetch: query.refetch,
    registeredForNextPeriod: query.data ?? false,
  }
}
