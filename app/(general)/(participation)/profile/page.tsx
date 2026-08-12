"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"

import { Skeleton } from "@/components/ui/skeleton"
import { useIsMounted } from "@/lib/hooks/use-is-mounted"

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
    return <ProfileLoadingState />
  }

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

function ProfileLoadingState() {
  return (
    <main className="px-4 py-8 sm:py-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="overflow-hidden rounded-[2.25rem] border border-border/70 bg-card/90 shadow-[0_28px_90px_rgba(15,23,42,0.09)]">
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <Skeleton className="size-24 shrink-0 rounded-[2rem]" />
              <div className="min-w-0 flex-1 space-y-4">
                <Skeleton className="h-3 w-44 rounded-full" />
                <Skeleton className="h-12 w-full max-w-sm rounded-2xl" />
                <Skeleton className="h-4 w-full max-w-xl rounded-full" />
              </div>
            </div>

            <div className="grid gap-3 rounded-[1.75rem] border border-border/70 bg-background/70 p-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-4 rounded-2xl bg-card/80 px-4 py-3"
                >
                  <Skeleton className="h-3 w-28 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-[1.75rem] border border-border/70 bg-card/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]"
            >
              <Skeleton className="h-3 w-32 rounded-full" />
              <Skeleton className="mt-4 h-10 w-24 rounded-2xl" />
              <Skeleton className="mt-3 h-4 w-full rounded-full" />
            </div>
          ))}
        </section>
      </div>
    </main>
  )
}
