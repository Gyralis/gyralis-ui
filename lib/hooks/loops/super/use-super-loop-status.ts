"use client"

import { useCallback, useMemo } from "react"
import { isAddress, zeroAddress, type Address } from "viem"
import { useReadContract } from "wagmi"

import {
  getLoopContractAbi,
  loopContractMethods,
} from "@/lib/contracts/loop-contracts"
import {
  getPreviousSuperLoopPeriod,
  normalizeSuperLoopStatusReads,
  type SuperLoopClaimerStatus,
  type SuperLoopOwedAmounts,
} from "@/lib/loops/super-loop-status"

interface UseSuperLoopStatusParams {
  address?: Address
  chainId: number
  enabled?: boolean
  user?: Address
}

export function useSuperLoopStatus({
  address,
  chainId,
  enabled = true,
  user,
}: UseSuperLoopStatusParams) {
  const abi = useMemo(() => getLoopContractAbi(chainId, "superLoop"), [chainId])
  const contractAddress = address ?? zeroAddress
  const account = user ?? zeroAddress
  const contractEnabled = enabled && Boolean(address && isAddress(address))
  const accountEnabled = contractEnabled && Boolean(user && isAddress(user))

  const currentPeriodQuery = useReadContract({
    address: contractAddress,
    abi,
    functionName: loopContractMethods.superLoop.getCurrentPeriod,
    chainId,
    query: {
      enabled: contractEnabled,
      staleTime: 10_000,
      refetchOnWindowFocus: false,
    },
  })
  const claimerStatusQuery = useReadContract({
    address: contractAddress,
    abi,
    functionName: loopContractMethods.superLoop.getClaimerStatus,
    args: [account],
    chainId,
    query: {
      enabled: accountEnabled,
      staleTime: 10_000,
      refetchOnWindowFocus: false,
    },
  })
  const userPhaseQuery = useReadContract({
    address: contractAddress,
    abi,
    functionName: loopContractMethods.superLoop.getUserPhase,
    args: [account],
    chainId,
    query: {
      enabled: accountEnabled,
      staleTime: 10_000,
      refetchOnWindowFocus: false,
    },
  })
  const owedQuery = useReadContract({
    address: contractAddress,
    abi,
    functionName: loopContractMethods.superLoop.owedToMe,
    args: [account],
    chainId,
    query: {
      enabled: accountEnabled,
      staleTime: 10_000,
      refetchOnWindowFocus: false,
    },
  })

  const currentPeriod =
    typeof currentPeriodQuery.data === "bigint"
      ? currentPeriodQuery.data
      : undefined
  const previousPeriod = getPreviousSuperLoopPeriod(currentPeriod)
  const previousPeriodPayoutQuery = useReadContract({
    address: contractAddress,
    abi,
    functionName: loopContractMethods.superLoop.getPeriodIndividualPayout,
    args: [previousPeriod ?? 0n],
    account: user,
    chainId,
    query: {
      enabled: accountEnabled && previousPeriod != null,
      staleTime: 10_000,
      refetchOnWindowFocus: false,
    },
  })

  const data = useMemo(
    () =>
      normalizeSuperLoopStatusReads({
        claimerStatus: claimerStatusQuery.data as
          | SuperLoopClaimerStatus
          | undefined,
        currentPeriod,
        owedAmounts: owedQuery.data as SuperLoopOwedAmounts | undefined,
        previousPeriodPayout:
          typeof previousPeriodPayoutQuery.data === "bigint"
            ? previousPeriodPayoutQuery.data
            : undefined,
        userPhase:
          typeof userPhaseQuery.data === "number"
            ? userPhaseQuery.data
            : undefined,
      }),
    [
      claimerStatusQuery.data,
      currentPeriod,
      owedQuery.data,
      previousPeriodPayoutQuery.data,
      userPhaseQuery.data,
    ]
  )
  const refetchCurrentPeriod = currentPeriodQuery.refetch
  const refetchClaimerStatus = claimerStatusQuery.refetch
  const refetchUserPhase = userPhaseQuery.refetch
  const refetchOwed = owedQuery.refetch
  const refetchPreviousPeriodPayout = previousPeriodPayoutQuery.refetch
  const refetch = useCallback(async () => {
    const requests = contractEnabled ? [refetchCurrentPeriod()] : []

    if (accountEnabled) {
      requests.push(refetchClaimerStatus(), refetchUserPhase(), refetchOwed())
    }
    if (accountEnabled && previousPeriod != null) {
      requests.push(refetchPreviousPeriodPayout())
    }

    await Promise.allSettled(requests)
  }, [
    accountEnabled,
    contractEnabled,
    previousPeriod,
    refetchClaimerStatus,
    refetchCurrentPeriod,
    refetchOwed,
    refetchPreviousPeriodPayout,
    refetchUserPhase,
  ])
  const errors = {
    claimerStatus: claimerStatusQuery.error,
    currentPeriod: currentPeriodQuery.error,
    owed: owedQuery.error,
    previousPeriodPayout: previousPeriodPayoutQuery.error,
    userPhase: userPhaseQuery.error,
  }
  const error = Object.values(errors).find(Boolean) ?? null

  return {
    data,
    error,
    errors,
    isError: Boolean(error),
    isFetching:
      currentPeriodQuery.isFetching ||
      claimerStatusQuery.isFetching ||
      userPhaseQuery.isFetching ||
      owedQuery.isFetching ||
      previousPeriodPayoutQuery.isFetching,
    isLoading:
      currentPeriodQuery.isLoading ||
      claimerStatusQuery.isLoading ||
      userPhaseQuery.isLoading ||
      owedQuery.isLoading ||
      previousPeriodPayoutQuery.isLoading,
    refetch,
  }
}
