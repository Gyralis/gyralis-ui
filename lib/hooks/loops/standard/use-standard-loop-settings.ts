import { useCallback, useMemo } from "react"
import { isAddress, zeroAddress, type Address } from "viem"
import { useReadContract } from "wagmi"

import {
  getLoopContractAbi,
  loopContractMethods,
} from "@/lib/contracts/loop-contracts"

export interface StandardLoopSettingsData {
  currentPeriod: bigint
  firstPeriodStart: bigint
  percentPerPeriod: bigint
  periodLength: bigint
  token: Address
}

interface UseStandardLoopSettingsParams {
  address?: Address
  chainId: number
  enabled?: boolean
}

export function useStandardLoopSettings({
  address,
  chainId,
  enabled = true,
}: UseStandardLoopSettingsParams) {
  const abi = useMemo(() => getLoopContractAbi(chainId, "loop"), [chainId])
  const validAddress = Boolean(address && isAddress(address))
  const detailsQuery = useReadContract({
    address: address ?? zeroAddress,
    abi,
    functionName: loopContractMethods.loop.getDetails,
    chainId,
    query: {
      enabled: enabled && validAddress,
    },
  })
  const periodQuery = useReadContract({
    address: address ?? zeroAddress,
    abi,
    functionName: loopContractMethods.loop.getCurrentPeriod,
    chainId,
    query: {
      enabled: enabled && validAddress,
    },
  })

  const data = useMemo<StandardLoopSettingsData | undefined>(() => {
    if (!detailsQuery.data || periodQuery.data == null) return undefined

    const settings = detailsQuery.data as readonly [
      Address,
      bigint,
      bigint,
      bigint
    ]

    return {
      token: settings[0],
      periodLength: settings[1],
      percentPerPeriod: settings[2],
      firstPeriodStart: settings[3],
      currentPeriod: periodQuery.data as bigint,
    }
  }, [detailsQuery.data, periodQuery.data])

  const refetchDetails = detailsQuery.refetch
  const refetchCurrentPeriod = periodQuery.refetch
  // Explicit refresh/retry still reloads both parts, including owner configuration.
  const refetch = useCallback(
    () => Promise.all([refetchDetails(), refetchCurrentPeriod()]),
    [refetchDetails, refetchCurrentPeriod]
  )

  return {
    data,
    error: detailsQuery.error ?? periodQuery.error,
    isError: detailsQuery.isError || periodQuery.isError,
    isFetching: detailsQuery.isFetching || periodQuery.isFetching,
    isLoading: detailsQuery.isLoading || periodQuery.isLoading,
    refetch,
    refetchCurrentPeriod,
  }
}
