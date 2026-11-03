import type { Hash, Hex } from "viem"

/** Emitted only after a successful receipt; entry is not a claim. */
export interface LoopActionConfirmation {
  action: "enter" | "claim"
  chainId: number
  transactionHash: Hash
  blockNumber: bigint
  logs?: readonly {
    address: string
    data: Hex
    topics: readonly Hex[]
    logIndex: number | null
  }[]
}
