export interface ClaimActivityItem {
  id: string
  chainId: number
  chainName: string
  loopName: string
  logoSrc: string
  period: string
  periodKind: "current" | "previous"
  amount: string
  tokenSymbol: string
  timestamp: number
  transactionUrl: string
  loopAddress?: string
  transactionHash?: string
  logIndex?: number
  blockNumber?: number
  tokenAddress?: string
  tokenDecimals?: number
  source?: "receipt" | "indexed"
}

export interface ActivityLoopScope {
  chainId: number
  loopAddress: string
  /** Receipt-proven period, included while a shared public schedule catches up. */
  period?: string
}

export interface ActivityCoverage extends ActivityLoopScope {
  currentPeriod: string
  indexedBlock: number
}

export interface LatestActivityData {
  address: string
  items: ClaimActivityItem[]
  totals: { chainId: number; tokenSymbol: string; amount: string }[]
  unavailableChains: string[]
  fetchedAt: string
  coverage?: ActivityCoverage[]
  indexingStatus?: "syncing" | "delayed"
  /** A scoped receipt refresh must not replace the initial full wallet load. */
  fullSnapshot?: boolean
  fullFetchedAt?: string
}
