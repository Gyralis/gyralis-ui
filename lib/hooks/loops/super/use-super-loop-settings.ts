"use client"

import { useMemo } from "react"
import { isAddress, zeroAddress, type Address } from "viem"
import { useReadContract } from "wagmi"

import {
  getLoopContractAbi,
  loopContractMethods,
} from "@/lib/contracts/loop-contracts"

export interface SuperLoopSettingsData {
  firstPeriodStart: bigint
  percentPerPeriod: bigint
  periodLength: bigint
  token: Address
}

interface UseSuperLoopSettingsParams {
  address?: Address
  chainId: number
  enabled?: boolean
}

export function useSuperLoopSettings({
  address,
  chainId,
  enabled = true,
}: UseSuperLoopSettingsParams) {
  const abi = useMemo(() => getLoopContractAbi(chainId, "superLoop"), [chainId])
  const validAddress = Boolean(address && isAddress(address))
  const query = useReadContract({
    address: address ?? zeroAddress,
    abi,
    functionName: loopContractMethods.superLoop.getDetails,
    chainId,
    query: {
      enabled: enabled && validAddress,
      staleTime: 10_000,
      refetchOnWindowFocus: false,
    },
  })

  const data = useMemo<SuperLoopSettingsData | undefined>(() => {
    if (!query.data) return undefined

    const [token, periodLength, percentPerPeriod, firstPeriodStart] =
      query.data as readonly [Address, bigint, bigint, bigint]

    return {
      firstPeriodStart,
      percentPerPeriod,
      periodLength,
      token,
    }
  }, [query.data])

  return {
    data,
    error: query.error,
    isError: query.isError,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}
