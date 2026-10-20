"use client"

import { useCallback } from "react"
import { useQuery } from "@tanstack/react-query"
import { isAddress, type Address } from "viem"

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
  const fetchRegistrationStatus = useCallback(async () => {
    if (!user || currentPeriod == null) {
      throw new Error("Wallet registration is not ready")
    }

    const params = new URLSearchParams({
      chainId: chainId.toString(),
      loopAddress: address,
      periodNumber: (currentPeriod + 1n).toString(),
      userAddress: user,
    })
    const response = await fetch(
      `/api/loops/registration-status?${params.toString()}`,
      { cache: "no-store" }
    )
    const payload = (await response.json()) as {
      error?: string
      result?: { registered?: boolean }
      success?: boolean
    }
    if (!response.ok || !payload.success || !payload.result) {
      throw new Error(payload.error ?? "Registration status lookup failed")
    }

    return Boolean(payload.result.registered)
  }, [address, chainId, currentPeriod, user])
  const query = useQuery({
    queryKey: [
      "standard-loop",
      "wallet-registration",
      chainId,
      address.toLowerCase(),
      user?.toLowerCase(),
      currentPeriod?.toString(),
    ],
    queryFn: fetchRegistrationStatus,
    enabled:
      enabled &&
      isAddress(address) &&
      Boolean(user) &&
      currentPeriod != null &&
      currentPeriod > 0n,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: 1,
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
