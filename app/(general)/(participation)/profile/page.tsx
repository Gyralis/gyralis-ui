"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"

export default function ProfilePage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()

  useEffect(() => {
    if (address && isConnected) {
      router.replace(`/profile/${address}`)
    }
  }, [address, isConnected, router])

  return (
    <main className="flex min-h-[calc(100vh-7rem)] items-center justify-center px-4 py-12">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 rounded-[2rem] border border-border/70 bg-card/90 p-6 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-8">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Your profile
          </p>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Connect your wallet
          </h1>
          <p className="mx-auto max-w-md text-base text-muted-foreground">
            Connect to open your Gyralis participation profile.
          </p>
        </div>

        <ConnectButton.Custom>
          {({ account, mounted, openConnectModal, openAccountModal }) => {
            const connected = mounted && account
            return (
              <button
                type="button"
                onClick={connected ? openAccountModal : openConnectModal}
                className="tamagotchi-button min-h-12 px-6 text-sm"
              >
                {connected ? "Opening profile..." : "Connect wallet"}
              </button>
            )
          }}
        </ConnectButton.Custom>
      </div>
    </main>
  )
}
