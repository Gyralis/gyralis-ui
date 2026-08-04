"use client"

import { useCallback, useMemo, useState } from "react"
import type { Address } from "viem"

import { useClaimedUsers } from "@/lib/hooks/app/use-claimed-users"
import { usePeriodLogBlockRange } from "@/lib/hooks/app/use-period-log-block-range"
import { useRegisteredUsers } from "@/lib/hooks/app/use-registered-users"

interface UseSuperLoopParticipationParams {
  address: Address
  chainId: number
  currentPeriod?: bigint
  enabled?: boolean
  firstPeriodStart?: bigint
  periodLength?: bigint
}

export function useSuperLoopParticipation({
  address,
  chainId,
  currentPeriod,
  enabled = true,
  firstPeriodStart,
  periodLength,
}: UseSuperLoopParticipationParams) {
  const [refreshKey, setRefreshKey] = useState(0)
  const rangesReady =
    enabled &&
    currentPeriod != null &&
    firstPeriodStart != null &&
    periodLength != null
  const registerWindowPeriod =
    currentPeriod != null && currentPeriod > 0n ? currentPeriod - 1n : 0n
  const registrationRange = usePeriodLogBlockRange({
    chainId,
    enabled: rangesReady,
    firstPeriodStart,
    periodLength,
    refreshKey,
    windowPeriod: registerWindowPeriod,
  })
  const claimRange = usePeriodLogBlockRange({
    chainId,
    enabled: rangesReady,
    firstPeriodStart,
    periodLength,
    refreshKey,
    windowPeriod: currentPeriod,
  })
  const registrationBlockRange =
    rangesReady &&
    registrationRange.fromBlock != null &&
    registrationRange.toBlock != null
      ? {
          fromBlock: registrationRange.fromBlock,
          toBlock: registrationRange.toBlock,
        }
      : undefined
  const claimBlockRange =
    rangesReady && claimRange.fromBlock != null && claimRange.toBlock != null
      ? {
          fromBlock: claimRange.fromBlock,
          toBlock: claimRange.toBlock,
        }
      : undefined
  const registration = useRegisteredUsers(
    address,
    chainId,
    currentPeriod,
    refreshKey,
    registrationBlockRange != null,
    registrationBlockRange
  )
  const claims = useClaimedUsers(
    address,
    chainId,
    currentPeriod,
    refreshKey,
    claimBlockRange != null,
    claimBlockRange
  )
  const data = useMemo(() => {
    const claimedUsers = new Set(claims.users.map((user) => user.toLowerCase()))
    const registeredUsers = new Set(
      registration.users.map((user) => user.toLowerCase())
    )
    const claimedCount = Array.from(registeredUsers).filter((user) =>
      claimedUsers.has(user)
    ).length
    const registeredCount = registeredUsers.size
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
  const error =
    registrationRange.error ??
    claimRange.error ??
    registration.error ??
    claims.error ??
    null

  return {
    data: rangesReady ? data : undefined,
    error,
    isError: Boolean(error),
    isFetching:
      registrationRange.loading ||
      claimRange.loading ||
      registration.loading ||
      claims.loading,
    isLoading:
      !rangesReady ||
      registrationRange.loading ||
      claimRange.loading ||
      registration.loading ||
      claims.loading,
    refetch,
    refreshKey,
  }
}
