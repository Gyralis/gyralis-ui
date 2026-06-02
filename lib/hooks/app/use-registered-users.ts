"use client"

import { useEffect, useState } from "react"
import { parseAbiItem, type Address, type Log } from "viem"
import { usePublicClient } from "wagmi"

import { getLogsChunked } from "./get-logs-chunked"

const legacyRegisterEventAbiItem = parseAbiItem(
  "event Register(address indexed sender, uint256 indexed periodNumber)"
)
const upgradedRegisterEventAbiItem = parseAbiItem(
  "event Register(address indexed sender, address indexed token, uint256 indexed periodNumber)"
)

const LOG_LOOKBACK_BLOCKS = 100_000n
type RegisterLog = Log<bigint, number, false, typeof legacyRegisterEventAbiItem>
type UpgradedRegisterLog = Log<
  bigint,
  number,
  false,
  typeof upgradedRegisterEventAbiItem
>

interface UseRegisteredUsersResult {
  users: Address[]
  loading: boolean
}

export function useRegisteredUsers(
  loopAddress: Address,
  chainId: number,
  periodNumber?: bigint,
  refreshKey = 0,
  enabled = true
): UseRegisteredUsersResult {
  const publicClient = usePublicClient({ chainId })
  const [users, setUsers] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!enabled || !publicClient || periodNumber == null) {
      setUsers([])
      setLoading(false)
      return
    }

    let cancelled = false

    const fetchLogs = async () => {
      setLoading(true)

      try {
        const latestBlock = await publicClient.getBlockNumber()
        const fromBlock =
          latestBlock > LOG_LOOKBACK_BLOCKS
            ? latestBlock - LOG_LOOKBACK_BLOCKS
            : 0n
        const [legacyLogs, upgradedLogs] = await Promise.all([
          getLogsChunked(publicClient, {
            address: loopAddress,
            event: legacyRegisterEventAbiItem,
            args: {
              periodNumber,
            },
            fromBlock,
            toBlock: "latest",
          }).then((logs) => logs as RegisterLog[]),
          getLogsChunked(publicClient, {
            address: loopAddress,
            event: upgradedRegisterEventAbiItem,
            args: {
              periodNumber,
            },
            fromBlock,
            toBlock: "latest",
          }).then((logs) => logs as UpgradedRegisterLog[]),
        ])

        if (cancelled) {
          return
        }

        const registered = [...legacyLogs, ...upgradedLogs].map(
          (log) => log.args.sender as Address
        )
        setUsers(Array.from(new Set(registered)))
      } catch (error) {
        if (!cancelled) {
          console.error("Error fetching Register logs:", error)
          setUsers([])
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
  }, [chainId, enabled, loopAddress, periodNumber, publicClient, refreshKey])

  return { users, loading }
}
