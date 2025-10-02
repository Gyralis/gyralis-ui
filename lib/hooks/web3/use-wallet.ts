"use client"

import { useState } from "react"

interface WalletState {
  isConnected: boolean
  currentChainId: number | null
  address: string | null
  isLoading: boolean
}

export function useWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: true, // Always connected for demo
    currentChainId: 1, // Start with Ethereum mainnet
    address: "0x1234...5678", // Mock address
    isLoading: false,
  })

  const connectWallet = async () => {
    // Already connected, do nothing
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  const switchChain = async (chainId: number) => {
    // Simulate chain switching
    setWalletState((prev) => ({
      ...prev,
      currentChainId: chainId,
    }))
  }

  return {
    ...walletState,
    connectWallet,
    switchChain,
  }
}
