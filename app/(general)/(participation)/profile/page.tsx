"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAccount } from "wagmi"

import { useIsMounted } from "@/lib/hooks/use-is-mounted"
import { ProfileSections } from "@/components/participation/profile-sections"
import { ProfilePageSkeleton } from "@/components/profile/profile-page-skeleton"

export default function ProfilePage() {
  const router = useRouter()
  const isMounted = useIsMounted()
  const { address, isConnected, isConnecting, isReconnecting } = useAccount()
  const walletReady = isMounted && !isConnecting && !isReconnecting

  useEffect(() => {
    if (walletReady && address && isConnected) {
      router.replace(`/profile/${address}`)
    }
  }, [address, isConnected, router, walletReady])

  if (!walletReady || (isConnected && address)) {
    return <ProfilePageSkeleton />
  }

  return <ProfileSections />
}
