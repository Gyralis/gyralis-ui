import type { Abi } from "viem"

import deployedContracts from "@/lib/generated/deployed-contracts"

export const loopContractTypes = ["loop", "superLoop"] as const

export type LoopContractType = (typeof loopContractTypes)[number]

export const DEFAULT_LOOP_CONTRACT_TYPE: LoopContractType = "loop"

export const loopContractMethods = {
  loop: {
    claim: "claim",
    claimAndRegister: "claimAndRegister",
    getCurrentPeriod: "getCurrentPeriod",
    getDetails: "getLoopDetails",
  },
  superLoop: {
    claimAndRegister: "streamingClaimAndRegister",
    getCurrentPeriod: "getStreamingCurrentPeriod",
    getDetails: "getStreamingLoopDetails",
  },
} as const satisfies Record<
  LoopContractType,
  {
    claim?: string
    claimAndRegister: string
    getCurrentPeriod: string
    getDetails: string
  }
>

type LoopContractEntry = {
  abi: Abi
}

export function getLoopContractAbi(
  chainId: number,
  contractType: LoopContractType = DEFAULT_LOOP_CONTRACT_TYPE
): Abi {
  const contracts = deployedContracts[
    chainId as keyof typeof deployedContracts
  ] as Partial<Record<LoopContractType, LoopContractEntry>> | undefined

  return contracts?.[contractType]?.abi ?? contracts?.loop?.abi ?? []
}

export function getLoopContractMethods(
  contractType: LoopContractType = DEFAULT_LOOP_CONTRACT_TYPE
) {
  return loopContractMethods[contractType]
}
