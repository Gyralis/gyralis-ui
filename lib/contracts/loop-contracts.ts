import type { Abi } from "viem"

import deployedContracts from "@/lib/generated/deployed-contracts"

export const loopContractTypes = ["loop", "superLoop"] as const

export type LoopContractType = (typeof loopContractTypes)[number]

export const DEFAULT_LOOP_CONTRACT_TYPE: LoopContractType = "loop"

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
