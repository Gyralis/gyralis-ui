import type { Chain } from "viem"

export const gnosisServerChain = {
  id: 100,
  name: "Gnosis",
  nativeCurrency: { decimals: 18, name: "xDAI", symbol: "XDAI" },
  rpcUrls: {
    default: { http: ["https://rpc.gnosischain.com"] },
  },
  blockExplorers: {
    default: { name: "Gnosisscan", url: "https://gnosisscan.io" },
  },
} satisfies Chain

export const baseServerChain = {
  id: 8453,
  name: "Base",
  nativeCurrency: { decimals: 18, name: "Ether", symbol: "ETH" },
  rpcUrls: {
    default: { http: ["https://mainnet.base.org"] },
  },
  blockExplorers: {
    default: { name: "Basescan", url: "https://basescan.org" },
  },
} satisfies Chain

export const supportedServerChains = [gnosisServerChain, baseServerChain]

export function getSupportedServerChain(chainId: string | number): Chain {
  const chain = supportedServerChains.find((item) => item.id === Number(chainId))
  if (chain) return chain
  throw new Error(`Chain with id ${chainId} not found`)
}
