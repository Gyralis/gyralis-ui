import { useMemo } from "react"
import { isAddress, type Address } from "viem"
import { useReadContracts } from "wagmi"

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
  const query = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        address: address as Address,
        abi,
        functionName: loopContractMethods.loop.getDetails,
        chainId,
      },
      {
        address: address as Address,
        abi,
        functionName: loopContractMethods.loop.getCurrentPeriod,
        chainId,
      },
    ],
    query: {
      enabled: enabled && validAddress,
    },
  })

  const data = useMemo<StandardLoopSettingsData | undefined>(() => {
    if (!query.data) return undefined

    const [settings, currentPeriod] = query.data as readonly [
      readonly [Address, bigint, bigint, bigint],
      bigint
    ]

    return {
      token: settings[0],
      periodLength: settings[1],
      percentPerPeriod: settings[2],
      firstPeriodStart: settings[3],
      currentPeriod,
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
