"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAccount } from "wagmi"

function normalizeAddress(address: string) {
  return address.toLowerCase()
}

export function ProfileWalletAddressSync() {
  const router = useRouter()
  const { address, isConnected, isConnecting, isReconnecting } = useAccount()
  const previousAddressRef = useRef<string | null>(null)
  const initializedRef = useRef(false)
  const walletReady = !isConnecting && !isReconnecting

  useEffect(() => {
    if (!walletReady) return

    if (!isConnected || !address) {
      previousAddressRef.current = null
      initializedRef.current = true
      return
    }

    const nextAddress = normalizeAddress(address)

    if (!initializedRef.current) {
      previousAddressRef.current = nextAddress
      initializedRef.current = true
      return
    }

    if (
      previousAddressRef.current &&
      previousAddressRef.current !== nextAddress
    ) {
      router.replace(`/profile/${address}`)
    }

    previousAddressRef.current = nextAddress
  }, [address, isConnected, router, walletReady])

  return null
}
