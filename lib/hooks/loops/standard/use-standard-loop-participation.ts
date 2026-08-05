"use client"

import { useQuery } from "@tanstack/react-query"
import { isAddress, parseAbiItem, type Address, type Log } from "viem"
import { usePublicClient } from "wagmi"

import { getLogsChunked } from "@/lib/hooks/app/get-logs-chunked"
import { calculateStandardLoopParticipation } from "@/lib/loops/standard-loop-state"

const legacyRegisterEvent = parseAbiItem(
  "event Register(address indexed sender, uint256 indexed periodNumber)"
)
const tokenRegisterEvent = parseAbiItem(
  "event Register(address indexed sender, address indexed token, uint256 indexed periodNumber)"
)
const legacyClaimEvent = parseAbiItem(
  "event Claim(address indexed claimer, uint256 periodNumber, uint256 payout)"
)
const tokenClaimEvent = parseAbiItem(
  "event Claim(address indexed claimer, address indexed token, uint256 indexed periodNumber, uint256 payout)"
)
const LOG_LOOKBACK_BLOCKS = 100_000n
type LegacyRegisterLog = Log<bigint, number, false, typeof legacyRegisterEvent>
type TokenRegisterLog = Log<bigint, number, false, typeof tokenRegisterEvent>
type LegacyClaimLog = Log<bigint, number, false, typeof legacyClaimEvent>
type TokenClaimLog = Log<bigint, number, false, typeof tokenClaimEvent>

interface UseStandardLoopParticipationParams {
  address: Address
  chainId: number
  currentPeriod?: bigint
  enabled?: boolean
}

export function useStandardLoopParticipation({
  address,
  chainId,
  currentPeriod,
  enabled = true,
}: UseStandardLoopParticipationParams) {
  const publicClient = usePublicClient({ chainId })
  const query = useQuery({
    queryKey: [
      "standard-loop",
      "participation",
      chainId,
      address.toLowerCase(),
      currentPeriod?.toString(),
    ],
    queryFn: async () => {
      if (!publicClient || currentPeriod == null) {
        throw new Error("Loop participation is not ready")
      }

      const latestBlock = await publicClient.getBlockNumber()
      const fromBlock =
        latestBlock > LOG_LOOKBACK_BLOCKS
          ? latestBlock - LOG_LOOKBACK_BLOCKS
          : 0n
      const [
        legacyRegistrations,
        tokenRegistrations,
        legacyClaims,
        tokenClaims,
      ] = await Promise.all([
        getLogsChunked(publicClient, {
          address,
          event: legacyRegisterEvent,
          args: { periodNumber: currentPeriod },
          fromBlock,
          toBlock: latestBlock,
        }).then((logs) => logs as LegacyRegisterLog[]),
        getLogsChunked(publicClient, {
          address,
          event: tokenRegisterEvent,
          args: { periodNumber: currentPeriod },
          fromBlock,
          toBlock: latestBlock,
        }).then((logs) => logs as TokenRegisterLog[]),
        getLogsChunked(publicClient, {
          address,
          event: legacyClaimEvent,
          fromBlock,
          toBlock: latestBlock,
        }).then((logs) => logs as LegacyClaimLog[]),
        getLogsChunked(publicClient, {
          address,
          event: tokenClaimEvent,
          args: { periodNumber: currentPeriod },
          fromBlock,
          toBlock: latestBlock,
        }).then((logs) => logs as TokenClaimLog[]),
      ])

      return calculateStandardLoopParticipation({
        registeredUsers: [...legacyRegistrations, ...tokenRegistrations]
          .map((log) => log.args.sender)
          .filter((user): user is Address => Boolean(user)),
        claimedUsers: [...legacyClaims, ...tokenClaims]
          .filter((log) => log.args.periodNumber === currentPeriod)
          .map((log) => log.args.claimer)
          .filter((user): user is Address => Boolean(user)),
      })
    },
    enabled:
      enabled &&
      isAddress(address) &&
      Boolean(publicClient) &&
      currentPeriod != null,
    staleTime: 10_000,
    refetchOnWindowFocus: false,
  })

  return {
    data: query.data,
    error: query.error,
    isError: query.isError,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}
