import type { Abi } from "viem"

import deployedContracts from "@/lib/generated/deployed-contracts"

export const loopContractTypes = ["loop", "superLoop"] as const

export type LoopContractType = (typeof loopContractTypes)[number]

export const DEFAULT_LOOP_CONTRACT_TYPE: LoopContractType = "loop"

export const loopContractMethods = {
  loop: {
    claim: "claim",
    claimAndRegister: "claimAndRegister",
    getClaimerStatus: "getClaimerStatus",
    getCurrentPeriod: "getCurrentPeriod",
    getDetails: "getLoopDetails",
    getPeriodIndividualPayout: "getPeriodIndividualPayout",
  },
  superLoop: {
    claimAndRegister: "streamingClaimAndRegister",
    getClaimerStatus: "getStreamingClaimerStatus",
    getCurrentPeriod: "getStreamingCurrentPeriod",
    getDetails: "getStreamingLoopDetails",
    getPeriodIndividualPayout: "getStreamingPeriodIndividualPayout",
  },
} as const satisfies Record<
  LoopContractType,
  {
    claim?: string
    claimAndRegister: string
    getClaimerStatus: string
    getCurrentPeriod: string
    getDetails: string
    getPeriodIndividualPayout: string
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
