"use client"

import { useEffect, useState } from "react"
import { parseAbiItem, type Address, type Log } from "viem"
import { usePublicClient } from "wagmi"

import { getLogsChunked } from "./get-logs-chunked"

const legacyClaimEventAbiItem = parseAbiItem(
  "event Claim(address indexed claimer, uint256 periodNumber, uint256 payout)"
)
const upgradedClaimEventAbiItem = parseAbiItem(
  "event Claim(address indexed claimer, address indexed token, uint256 indexed periodNumber, uint256 payout)"
)

const LOG_LOOKBACK_BLOCKS = 100_000n
type ClaimLog = Log<bigint, number, false, typeof legacyClaimEventAbiItem>
type UpgradedClaimLog = Log<
  bigint,
  number,
  false,
  typeof upgradedClaimEventAbiItem
>

interface UseClaimedUsersResult {
  users: Address[]
  payouts: Record<string, bigint>
  loading: boolean
}

export function useClaimedUsers(
  loopAddress: Address,
  chainId: number,
  periodNumber?: bigint,
  refreshKey = 0,
  enabled = true,
  blockRange?: { fromBlock: bigint; toBlock: bigint }
): UseClaimedUsersResult {
  const publicClient = usePublicClient({ chainId })
  const [users, setUsers] = useState<Address[]>([])
  const [payouts, setPayouts] = useState<Record<string, bigint>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!enabled || !publicClient || periodNumber == null) {
      setUsers([])
      setPayouts({})
      setLoading(false)
      return
    }

    let cancelled = false

    const fetchLogs = async () => {
      setLoading(true)

      try {
        const latestBlock = await publicClient.getBlockNumber()
        const fromBlock =
          blockRange?.fromBlock ??
          (latestBlock > LOG_LOOKBACK_BLOCKS
            ? latestBlock - LOG_LOOKBACK_BLOCKS
            : 0n)
        const toBlock = blockRange?.toBlock ?? latestBlock
        const chunkSize = blockRange ? 9n : undefined
        const [legacyLogs, upgradedLogs] = await Promise.all([
          getLogsChunked(
            publicClient,
            {
              address: loopAddress,
              event: legacyClaimEventAbiItem,
              fromBlock,
              toBlock,
            },
            chunkSize
          ).then((logs) => logs as ClaimLog[]),
          getLogsChunked(
            publicClient,
            {
              address: loopAddress,
              event: upgradedClaimEventAbiItem,
              fromBlock,
              toBlock,
            },
            chunkSize
          ).then((logs) => logs as UpgradedClaimLog[]),
        ])

        if (cancelled) {
          return
        }

        const claimed = [...legacyLogs, ...upgradedLogs]
          .filter((log) => log.args.periodNumber === periodNumber)
          .reduce<Record<string, { address: Address; payout: bigint }>>(
            (acc, log) => {
              const claimer = log.args.claimer as Address
              const key = claimer.toLowerCase()

              acc[key] = {
                address: claimer,
                payout: log.args.payout ?? 0n,
              }

              return acc
            },
            {}
          )

        setUsers(Object.values(claimed).map((claim) => claim.address))
        setPayouts(
          Object.fromEntries(
            Object.entries(claimed).map(([address, claim]) => [
              address,
              claim.payout,
            ])
          )
        )
      } catch (error) {
        if (!cancelled) {
          console.error("Error fetching Claim logs:", error)
          setUsers([])
          setPayouts({})
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void fetchLogs()

    return () => {
      cancelled = true
    }
  }, [
    blockRange?.fromBlock,
    blockRange?.toBlock,
    chainId,
    enabled,
    loopAddress,
    periodNumber,
    publicClient,
    refreshKey,
  ])

  return { users, payouts, loading }
}
