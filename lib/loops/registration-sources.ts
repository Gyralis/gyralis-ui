import "server-only"

import { env } from "@/env.mjs"
import type { Address, Chain } from "viem"
import { base, gnosis } from "viem/chains"

import { gnosisLoopSources } from "./gnosis-loop-sources"

export interface LoopRegistrationSource {
  address: Address
  chain: Chain
  chainId: number
  contractType: "loop" | "superLoop"
  registerEventTypes: readonly ("legacy" | "token")[]
  rpcUrl: string
  subgraphId: string
  subgraphUrl: string
}

const defaultGnosisRpcUrl = "https://rpc.gnosischain.com"
const defaultBaseRpcUrl = "https://mainnet.base.org"
const baseLoopSources = {
  markee: {
    address: "0x213310e1dbD6991cD488AB247c81faD82CD88E7A",
    subgraphId: "0x213310e1dbd6991cd488ab247c81fad82cd88e7a",
  },
  trueLoopers: {
    address: "0xb7902fAE80EB57aBac621dc68eb30FFff42F76F0",
    subgraphId: "0xb7902fae80eb57abac621dc68eb30ffff42f76f0",
  },
} as const

export function getLoopRegistrationSource(
  chainId: number,
  loopAddress: string
): LoopRegistrationSource | undefined {
  const normalizedAddress = loopAddress.toLowerCase()
  if (chainId === gnosis.id) {
    const loop = Object.values(gnosisLoopSources).find(
      (candidate) => candidate.address.toLowerCase() === normalizedAddress
    )
    if (!loop) return undefined

    return {
      address: loop.address,
      chain: gnosis,
      chainId: gnosis.id,
      contractType: "loop",
      registerEventTypes: ["legacy", "token"],
      rpcUrl: env.GNOSIS_RPC_URL ?? defaultGnosisRpcUrl,
      subgraphId: loop.subgraphId,
      subgraphUrl: env.GYRALIS_SUBGRAPH_URL,
    }
  }

  if (chainId === base.id) {
    const loop = Object.values(baseLoopSources).find(
      (candidate) => candidate.address.toLowerCase() === normalizedAddress
    )
    if (!loop) return undefined

    return {
      address: loop.address,
      chain: base,
      chainId: base.id,
      contractType: "superLoop",
      registerEventTypes: ["token"],
      rpcUrl:
        env.BASE_RPC_URL ?? env.NEXT_PUBLIC_BASE_RPC_URL ?? defaultBaseRpcUrl,
      subgraphId: loop.subgraphId,
      subgraphUrl: env.GYRALIS_BASE_SUBGRAPH_URL,
    }
  }

  return undefined
}
