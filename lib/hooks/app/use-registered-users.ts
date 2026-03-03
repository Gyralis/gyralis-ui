"use client"

import { useEffect, useState } from "react"
import { parseAbiItem, type Address } from "viem"
import { usePublicClient } from "wagmi"

const registerEventAbiItem = parseAbiItem(
  "event Register(address indexed sender, uint256 indexed periodNumber)"
)

interface UseRegisteredUsersResult {
  users: Address[]
  loading: boolean
}

export function useRegisteredUsers(
  loopAddress: Address,
  chainId: number,
  periodNumber?: bigint
): UseRegisteredUsersResult {
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
        const logs = await publicClient.getLogs({
          address: loopAddress,
          event: registerEventAbiItem,
          args: {
            periodNumber,
          },
          fromBlock: 0n,
          toBlock: "latest",
        })

        if (cancelled) {
          return
        }

        const registered = logs.map((log) => log.args.sender as Address)
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
  }, [chainId, loopAddress, periodNumber, publicClient])

  return { users, loading }
}
