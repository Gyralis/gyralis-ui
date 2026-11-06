interface ActivityItemBase {
  id: string
  chainId: number
  chainName: string
  loopName: string
  logoSrc: string
  period: string
  timestamp: number
  transactionUrl: string
  loopAddress?: string
  transactionHash?: string
  logIndex?: number
  blockNumber?: number
  source?: "receipt" | "indexed"
}

export interface ClaimActivityItem extends ActivityItemBase {
  kind?: "claim"
  periodKind: "current" | "previous"
  amount: string
  tokenSymbol: string
  tokenAddress?: string
  tokenDecimals?: number
}

export interface RegistrationActivityItem extends ActivityItemBase {
  kind: "registration"
  periodKind: "current" | "next"
  amount?: never
  tokenSymbol?: never
  tokenAddress?: never
  tokenDecimals?: never
}

export type ActivityItem = ClaimActivityItem | RegistrationActivityItem

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
  items: ActivityItem[]
  totals: { chainId: number; tokenSymbol: string; amount: string }[]
  unavailableChains: string[]
  fetchedAt: string
  coverage?: ActivityCoverage[]
  indexingStatus?: "syncing" | "delayed"
  /** A scoped receipt refresh must not replace the initial full wallet load. */
  fullSnapshot?: boolean
  fullFetchedAt?: string
}
