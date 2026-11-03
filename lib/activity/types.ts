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
}

export interface LatestActivityData {
  address: string
  items: ClaimActivityItem[]
  totals: { chainId: number; tokenSymbol: string; amount: string }[]
  unavailableChains: string[]
  fetchedAt: string
}
