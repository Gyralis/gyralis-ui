"use client"

import { useEffect, useState } from "react"
import { parseAbiItem, type Address } from "viem"
import { usePublicClient } from "wagmi"

const legacyClaimEventAbiItem = parseAbiItem(
  "event Claim(address indexed claimer, uint256 periodNumber, uint256 payout)"
)
const upgradedClaimEventAbiItem = parseAbiItem(
  "event Claim(address indexed claimer, address indexed token, uint256 indexed periodNumber, uint256 payout)"
)

interface UseClaimedUsersResult {
  users: Address[]
  loading: boolean
}

export function useClaimedUsers(
  loopAddress: Address,
  chainId: number,
  periodNumber?: bigint
): UseClaimedUsersResult {
  const publicClient = usePublicClient({ chainId })
  const [users, setUsers] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!publicClient || periodNumber == null) {
      setUsers([])
      setLoading(false)
      return
    }

    let cancelled = false

    const fetchLogs = async () => {
      setLoading(true)

      try {
        const [legacyLogs, upgradedLogs] = await Promise.all([
          publicClient.getLogs({
            address: loopAddress,
            event: legacyClaimEventAbiItem,
            fromBlock: 0n,
            toBlock: "latest",
          }),
          publicClient.getLogs({
            address: loopAddress,
            event: upgradedClaimEventAbiItem,
            fromBlock: 0n,
            toBlock: "latest",
          }),
        ])

        if (cancelled) {
          return
        }

        const claimed = [...legacyLogs, ...upgradedLogs]
          .filter((log) => log.args.periodNumber === periodNumber)
          .map((log) => log.args.claimer as Address)

        setUsers(Array.from(new Set(claimed)))
      } catch (error) {
        if (!cancelled) {
          console.error("Error fetching Claim logs:", error)
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
  }, [chainId, loopAddress, periodNumber, publicClient])

  return { users, loading }
}
