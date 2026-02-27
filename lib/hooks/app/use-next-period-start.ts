import { useMemo } from "react"
import { Address, type Abi } from "viem"
import { useReadContracts } from "wagmi"

import deployedContracts from "@/lib/generated/deployed-contracts"

export interface LoopSettingsProps {
  token: Address
  periodLength: bigint
  percentPerPeriod: bigint
  firstPeriodStart: bigint
}

interface UseLoopSettingsProps {
  settings?: LoopSettingsProps
  currentPeriod?: bigint
  isLoading: boolean
  refetch: () => void
}

export function useLoopSettings(
  loopAddress: Address,
  chainId: number,
  superToken: boolean
): UseLoopSettingsProps {
  const { abi, getDetailsFn, getPeriodFn } = useMemo(() => {
    const chain = deployedContracts?.[chainId as keyof typeof deployedContracts]

    if (!chain) {
      return {
        abi: [] as Abi,
        getDetailsFn: undefined,
        getPeriodFn: undefined,
      }
    }

    if (superToken) {
      return {
        abi: (chain.streaming_loop?.abi ?? []) as Abi,
        getDetailsFn: "getStreamingLoopDetails" as const,
        getPeriodFn: "getStreamingCurrentPeriod" as const,
      }
    }

    return {
      abi: (chain.loop?.abi ?? []) as Abi,
      getDetailsFn: "getLoopDetails" as const,
      getPeriodFn: "getCurrentPeriod" as const,
    }
  }, [chainId, superToken])

  const enabled = Boolean(
    loopAddress && chainId && abi.length && getDetailsFn && getPeriodFn
  )

  const { data, isLoading, refetch } = useReadContracts({
    allowFailure: false,
    contracts: enabled
      ? [
          {
            address: loopAddress,
            abi,
            functionName: getDetailsFn,
            chainId,
          },
          {
            address: loopAddress,
            abi,
            functionName: getPeriodFn,
            chainId,
          },
        ]
      : [],
    query: { enabled },
  })

  if (!data) {
    return {
      settings: undefined,
      currentPeriod: undefined,
      isLoading,
      refetch,
    }
  }

  const [settingsRaw, currentPeriod] = data

  const settings: LoopSettingsProps = {
    token: settingsRaw[0],
    periodLength: settingsRaw[1],
    percentPerPeriod: settingsRaw[2],
    firstPeriodStart: settingsRaw[3],
  }

  return { settings, currentPeriod, isLoading, refetch }
}
