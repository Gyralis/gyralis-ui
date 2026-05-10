"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { LoopCardData } from "@/data/loops-data"
import { formatUnits } from "viem"
import { useBalance } from "wagmi"

import { LoopClaim } from "@/components/loops/loop-claim"
import { LoopersModal } from "@/components/loops/loopers-modal"
import { useLoopSettings } from "@/lib/hooks/app/use-next-period-start"
import { trimFormattedBalance } from "@/lib/utils"

interface LoopsTableProps {
  loops: LoopCardData[]
}

export function LoopsTable({ loops }: LoopsTableProps) {
  if (loops.length === 0) {
    return (
      <div className="rounded-[1.65rem] border border-border/80 bg-background/35 px-6 py-12 text-center text-sm text-muted-foreground">
        No loops match the current filters.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card text-card-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.10),inset_0_-1px_0_rgba(0,0,0,0.05),0_8px_32px_rgba(28,231,131,0.06),0_4px_16px_rgba(140,75,255,0.04),0_2px_8px_rgba(0,0,0,0.08)]">
      <div className="min-w-[68rem] xl:min-w-0">
        <div className="grid grid-cols-[1.45fr_1.1fr_1.15fr_0.9fr_1.05fr_1.35fr] items-center gap-4 border-b border-border/70 bg-muted/35 px-6 py-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <span>Loop</span>
          <span>Shield</span>
          <span>Eligibility</span>
          <span>Balance</span>
          <span>Next Distribution</span>
          <span>Action</span>
        </div>
        <div>
          {loops.map((loop) => (
            <LoopTableRow key={loop.id} loop={loop} />
          ))}
        </div>
      </div>
    </div>
  )
}

function LoopTableRow({ loop }: { loop: LoopCardData }) {
  const address = loop.address
  const eligibilityLabel = loop.eligibility.replace(/\s+required$/i, "")
  const [isLoopersModalOpen, setIsLoopersModalOpen] = useState(false)
  const [modalRefreshKey, setModalRefreshKey] = useState(0)
  const shieldThreshold = loop.shieldScore
    .match(/\+?\d+(\.\d+)?/)?.[0]
    ?.replace(/^\+/, "")
  const {
    settings,
    currentPeriod,
    isLoading,
    refetch: refetchSettings,
  } = useLoopSettings(address ?? "0x", loop.chainId)
  const { data: loopBalance, refetch: refetchLoopBalance } = useBalance({
    address,
    token: settings?.token,
    chainId: loop.chainId,
    query: {
      enabled: Boolean(address && settings?.token),
    },
  })

  const balanceLabel = useMemo(() => {
    if (!loopBalance) return "--"

    return `${trimFormattedBalance(
      formatUnits(loopBalance.value, loopBalance.decimals),
      2
    )} ${loopBalance.symbol}`
  }, [loopBalance])

  const distributionLabel = useMemo(() => {
    if (isLoading) return "Loading..."
    if (!settings || !loopBalance) return "--"

    const percent =
      settings.percentPerPeriod === 0n
        ? "Infinite"
        : `${Number(settings.percentPerPeriod)}%`

    if (settings.percentPerPeriod === 0n) return percent

    const distributedValue =
      (loopBalance.value * settings.percentPerPeriod) / 100n
    const distributedAmount = trimFormattedBalance(
      formatUnits(distributedValue, loopBalance.decimals),
      2
    )

    return `${percent} - ${distributedAmount} ${loopBalance.symbol}`
  }, [isLoading, loopBalance, settings])

  const nextPeriodStart =
    settings && currentPeriod != null
      ? BigInt(settings.firstPeriodStart) +
        BigInt(settings.periodLength) * (BigInt(currentPeriod) + 1n)
      : undefined

  return (
    <>
      <div className="grid grid-cols-[1.45fr_1.1fr_1.15fr_0.9fr_1.05fr_1.35fr] items-center gap-4 border-b border-border/70 px-6 py-5 last:border-b-0">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted/70">
          {loop.eligibilityLogoUrl ? (
            <Image
              src={loop.eligibilityLogoUrl}
              alt={`${loop.eligibility} logo`}
              width={26}
              height={26}
              className="size-6 object-contain"
            />
          ) : (
            <span className="size-2 rounded-full bg-primary" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-5 text-foreground">
            {loop.title}
          </p>
          <span className="mt-1.5 inline-flex rounded-lg bg-muted/60 px-2.5 py-1 text-xs font-semibold leading-none text-secondary-foreground">
            {loop.by}
          </span>
        </div>
      </div>

      <div className="inline-flex min-w-0 items-center gap-2 text-sm">
        <span className="text-muted-foreground">Passport Score</span>
        {shieldThreshold ? (
          <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold tabular-nums text-primary-foreground">
            {shieldThreshold}+
          </span>
        ) : (
          <span className="font-semibold leading-5 text-foreground">
            {loop.shieldScore}
          </span>
        )}
      </div>

      <div className="inline-flex min-w-0 items-center gap-2 text-sm">
        <span className="font-semibold leading-5 text-foreground">
          {eligibilityLabel}
        </span>
      </div>

      <div className="text-sm font-semibold text-foreground">
        {balanceLabel}
      </div>

      <div>
        <p className="font-mono text-sm font-semibold text-primary">
          <CountdownLabel nextPeriodStart={nextPeriodStart} />
        </p>
        <p className="mt-1 text-xs font-medium text-muted-foreground">
          {distributionLabel}
        </p>
        {address ? (
          <button
            type="button"
            onClick={() => setIsLoopersModalOpen(true)}
            className="mt-1.5 text-xs font-semibold text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            View loopers
          </button>
        ) : null}
      </div>

      <div className="flex justify-start">
        {address ? (
          <LoopClaim
            address={address}
            chainId={loop.chainId}
            eligibilityProvider={loop.eligibilityProvider}
            compact
            showHelper={false}
            onSuccess={() => {
              void refetchLoopBalance()
              void refetchSettings()
              setModalRefreshKey((key) => key + 1)
            }}
          />
        ) : (
          <span className="text-sm font-medium text-muted-foreground">
            Unavailable
          </span>
        )}
      </div>
      </div>
      {address ? (
        <LoopersModal
          chainId={loop.chainId}
          currentPeriod={currentPeriod}
          eligibilityLogoUrl={loop.eligibilityLogoUrl}
          isOpen={isLoopersModalOpen}
          loopAddress={address}
          loopIsSuper={loop.super}
          loopToken={settings?.token}
          loopTitle={loop.title}
          onOpenChange={setIsLoopersModalOpen}
          refreshKey={modalRefreshKey}
        />
      ) : null}
    </>
  )
}

function CountdownLabel({ nextPeriodStart }: { nextPeriodStart?: bigint }) {
  const [currentTime, setCurrentTime] = useState(() =>
    Math.floor(Date.now() / 1000)
  )

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000))
    }, 1000)

    return () => window.clearInterval(interval)
  }, [])

  if (nextPeriodStart == null || nextPeriodStart <= 0n) {
    return "--:--:--"
  }

  const remaining = Math.max(Number(nextPeriodStart) - currentTime, 0)
  const hours = Math.floor(remaining / 3600)
  const minutes = Math.floor((remaining % 3600) / 60)
  const seconds = remaining % 60

  return [hours, minutes, seconds]
    .map((value) => value.toString().padStart(2, "0"))
    .join(":")
}
