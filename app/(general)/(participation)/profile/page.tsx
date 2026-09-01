"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"

import { Card, CardContent } from "@/components/ui/card"
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
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
          <Card className="tamagotchi-card min-h-[220px] !p-4 border-border/70 bg-card text-card-foreground">
            <CardContent className="relative z-10 flex min-h-[188px] flex-col gap-3 p-0">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Skeleton className="h-8 w-44 rounded-2xl" />
                    <Skeleton className="h-5 w-24 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-full max-w-lg rounded-full" />
                </div>

                <div className="grid grid-cols-2 gap-2 sm:max-w-[220px] xl:min-w-[220px]">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex min-h-16 flex-col items-center justify-center rounded-2xl border border-border/70 bg-background/60 px-2.5 py-2 text-center"
                    >
                      <Skeleton className="size-4 rounded-full" />
                      <Skeleton className="mt-1.5 h-4 w-10 rounded-full" />
                      <Skeleton className="mt-1 h-3 w-14 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-auto space-y-4">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-44 rounded-full" />
                  <div className="flex items-baseline gap-2">
                    <Skeleton className="h-12 w-32 rounded-3xl" />
                    <Skeleton className="h-5 w-9 rounded-full" />
                  </div>
                </div>

                <div className="space-y-3">
                  <Skeleton className="h-2 w-full rounded-full" />
                  <div className="flex items-center justify-between gap-4">
                    <Skeleton className="h-3 w-16 rounded-full" />
                    <Skeleton className="h-3 w-20 rounded-full" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="w-full max-w-[220px] justify-self-stretch overflow-hidden rounded-[2rem] border-secondary/20 bg-secondary p-0 text-secondary-foreground shadow-[0_24px_80px_-36px_hsl(var(--secondary)/0.85)] max-lg:max-w-none">
            <CardContent className="flex min-h-[220px] flex-col p-0 text-center">
              <div className="flex flex-1 flex-col items-center justify-center px-4 py-5">
                <Skeleton className="h-3 w-12 rounded-full bg-secondary-foreground/20" />
                <Skeleton className="mt-3 h-11 w-28 rounded-3xl bg-secondary-foreground/20" />
                <Skeleton className="mt-3 h-3 w-24 rounded-full bg-secondary-foreground/20" />
              </div>

              <div className="flex min-h-12 items-center justify-center bg-background/20 px-4">
                <Skeleton className="h-4 w-28 rounded-full bg-secondary-foreground/20" />
              </div>
            </CardContent>
          </Card>
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
