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
    getCurrentPeriodData: "getCurrentPeriodData",
    getDetails: "getLoopDetails",
    getPeriodIndividualPayout: "getPeriodIndividualPayout",
  },
  superLoop: {
    claimAndRegister: "streamingClaimAndRegister",
    getClaimerStatus: "getStreamingClaimerStatus",
    getCurrentPeriod: "getStreamingCurrentPeriod",
    getCurrentPeriodData: "getStreamingCurrentPeriodData",
    getDetails: "getStreamingLoopDetails",
    getPeriodIndividualPayout: "getStreamingPeriodIndividualPayout",
    getUserPhase: "getUserPhase",
    owedToMe: "owedToMe",
  },
} as const satisfies {
  loop: {
    claim?: string
    claimAndRegister: string
    getClaimerStatus: string
    getCurrentPeriod: string
    getCurrentPeriodData: string
    getDetails: string
    getPeriodIndividualPayout: string
  }
  superLoop: {
    claimAndRegister: string
    getClaimerStatus: string
    getCurrentPeriod: string
    getCurrentPeriodData: string
    getDetails: string
    getPeriodIndividualPayout: string
    getUserPhase: string
    owedToMe: string
  }
}

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

  // Base's generated deployment registry contains only the streaming variant.
  // Standard Loop interfaces are chain-independent; use the existing standard
  // ABI for Base contracts instead of returning an empty interface.
  if (chainId === 8453 && contractType === "loop") {
    return contracts?.loop?.abi ?? deployedContracts[100].loop.abi
  }

  return contracts?.[contractType]?.abi ?? contracts?.loop?.abi ?? []
}

export function getLoopContractMethods(
  contractType: LoopContractType = DEFAULT_LOOP_CONTRACT_TYPE
) {
  return loopContractMethods[contractType]
}
