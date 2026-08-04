"use client"

import { useCallback, useMemo, useState } from "react"
import type { Address } from "viem"

import { useClaimedUsers } from "@/lib/hooks/app/use-claimed-users"
import { useRegisteredUsers } from "@/lib/hooks/app/use-registered-users"

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
  const [refreshKey, setRefreshKey] = useState(0)
  const registration = useRegisteredUsers(
    address,
    chainId,
    currentPeriod,
    refreshKey,
    enabled
  )
  const claims = useClaimedUsers(
    address,
    chainId,
    currentPeriod,
    refreshKey,
    enabled
  )

  const data = useMemo(() => {
    const claimedUsers = new Set(claims.users.map((user) => user.toLowerCase()))
    const claimedCount = registration.users.filter((user) =>
      claimedUsers.has(user.toLowerCase())
    ).length
    const registeredCount = registration.users.length
    const claimRate =
      registeredCount > 0
        ? Math.round((claimedCount / registeredCount) * 100)
        : 0

    return {
      claimedCount,
      claimRate: Math.max(0, Math.min(claimRate, 100)),
      registeredCount,
    }
  }, [claims.users, registration.users])

  const refetch = useCallback(() => {
    setRefreshKey((key) => key + 1)
  }, [])

  return {
    data,
    isLoading: registration.loading || claims.loading,
    refetch,
    refreshKey,
  }
}
