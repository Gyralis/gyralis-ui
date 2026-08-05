"use client"

import { useMemo } from "react"
import { isAddress, zeroAddress, type Address } from "viem"
import { useReadContract } from "wagmi"

import {
  getLoopContractAbi,
  loopContractMethods,
} from "@/lib/contracts/loop-contracts"

interface UseSuperLoopParticipationParams {
  address?: Address
  chainId: number
  enabled?: boolean
}

export function useSuperLoopParticipation({
  address,
  chainId,
  enabled = true,
}: UseSuperLoopParticipationParams) {
  const abi = useMemo(() => getLoopContractAbi(chainId, "superLoop"), [chainId])
  const validAddress = Boolean(address && isAddress(address))
  const query = useReadContract({
    address: address ?? zeroAddress,
    abi,
    functionName: loopContractMethods.superLoop.getCurrentPeriodData,
    chainId,
    query: {
      enabled: enabled && validAddress,
      refetchInterval: 10_000,
      staleTime: 10_000,
      refetchOnWindowFocus: false,
    },
  })
  const data = useMemo(() => {
    if (!query.data) return undefined

    const [registered] = query.data as readonly [bigint, bigint]

    return {
      registeredCount: Number(registered),
    }
  }, [query.data])

  return {
    data,
    error: query.error,
    isError: query.isError,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    refetch: query.refetch,
    refreshKey: 0,
  }
}
