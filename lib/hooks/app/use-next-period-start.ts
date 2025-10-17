import { useMemo } from "react"
import { Address } from "viem"
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
  chainId: number
): UseLoopSettingsProps {
  const loopAbi = useMemo(
    () =>
      deployedContracts?.[chainId as keyof typeof deployedContracts]?.loop
        ?.abi ?? [],
    [chainId]
  )

  const { data, isLoading, refetch } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        address: loopAddress,
        abi: loopAbi,
        functionName: "getLoopDetails",
        chainId,
      },
      {
        address: loopAddress,
        abi: loopAbi,
        functionName: "getCurrentPeriod",
        chainId,
      },
    ],
    query: {
      enabled: Boolean(loopAddress && chainId),
    },
  })

  if (!data) {
    return { settings: undefined, currentPeriod: undefined, isLoading, refetch }
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
