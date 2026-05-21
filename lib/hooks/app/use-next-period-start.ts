import { useMemo } from "react"
import { Address } from "viem"
import { useReadContracts } from "wagmi"

import {
  DEFAULT_LOOP_CONTRACT_TYPE,
  getLoopContractAbi,
  type LoopContractType,
} from "@/lib/contracts/loop-contracts"

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
  contractType: LoopContractType = DEFAULT_LOOP_CONTRACT_TYPE
): UseLoopSettingsProps {
  const loopAbi = useMemo(
    () => getLoopContractAbi(chainId, contractType),
    [chainId, contractType]
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

  const [settingsRaw, currentPeriod] = data as readonly [
    readonly [Address, bigint, bigint, bigint],
    bigint
  ]

  const settings: LoopSettingsProps = {
    token: settingsRaw[0],
    periodLength: settingsRaw[1],
    percentPerPeriod: settingsRaw[2],
    firstPeriodStart: settingsRaw[3],
  }

  return { settings, currentPeriod, isLoading, refetch }
}
