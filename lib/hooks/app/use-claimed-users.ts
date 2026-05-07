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
  payouts: Record<string, bigint>
  loading: boolean
}

export function useClaimedUsers(
  loopAddress: Address,
  chainId: number,
  periodNumber?: bigint,
  refreshKey = 0
): UseClaimedUsersResult {
  const publicClient = usePublicClient({ chainId })
  const [users, setUsers] = useState<Address[]>([])
  const [payouts, setPayouts] = useState<Record<string, bigint>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!publicClient || periodNumber == null) {
      setUsers([])
      setPayouts({})
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
  }, [chainId, loopAddress, periodNumber, publicClient, refreshKey])

  return { users, payouts, loading }
}
