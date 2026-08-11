"use client"

import { useQuery } from "@tanstack/react-query"
import { isAddress, type Address } from "viem"
import { usePublicClient } from "wagmi"

import {
  getLoopContractAbi,
  loopContractMethods,
} from "@/lib/contracts/loop-contracts"

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
  const publicClient = usePublicClient({ chainId })
  const query = useQuery({
    queryKey: [
      "standard-loop",
      "participation",
      chainId,
      address.toLowerCase(),
      currentPeriod?.toString(),
    ],
    queryFn: async () => {
      if (!publicClient || currentPeriod == null) {
        throw new Error("Loop participation is not ready")
      }

      const abi = getLoopContractAbi(chainId, "loop")
      const [periodData, individualPayout] = await publicClient.multicall({
        allowFailure: false,
        contracts: [
          {
            address,
            abi,
            functionName: loopContractMethods.loop.getCurrentPeriodData,
          },
          {
            address,
            abi,
            functionName: loopContractMethods.loop.getPeriodIndividualPayout,
            args: [currentPeriod],
          },
        ],
      })
      const [registeredCount] = periodData as readonly [bigint, bigint]
      const periodIndividualPayout = individualPayout as bigint

      return {
        registeredCount: Number(registeredCount),
        totalPeriodPayout: periodIndividualPayout * registeredCount,
      }
    },
    enabled:
      enabled &&
      isAddress(address) &&
      Boolean(publicClient) &&
      currentPeriod != null,
    staleTime: 10_000,
    refetchOnWindowFocus: false,
  })

  return {
    data: query.data,
    error: query.error,
    isError: query.isError,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}
