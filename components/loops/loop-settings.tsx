"use client"

import React, { useEffect, useMemo, useState } from "react"
import { LuUsers } from "react-icons/lu"
import { Address } from "viem"

import { useLoopSettings } from "@/lib/hooks/app/use-next-period-start"
import { secondsToTime } from "@/lib/utils/time"
import { LoopersModal } from "@/components/loops/loopers-modal"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface LoopSettingsComponentProps {
  address: Address
  chainId: number
  loopTitle?: string
}

export const LoopSettings: React.FC<LoopSettingsComponentProps> = ({
  address,
  chainId,
  loopTitle,
}) => {
  const [isAddressesModalOpen, setIsAddressesModalOpen] = useState(false)

  const { settings, currentPeriod, isLoading } = useLoopSettings(address, chainId)

  const nextPeriodStart =
    settings && currentPeriod != null
      ? BigInt(settings.firstPeriodStart) +
        BigInt(settings.periodLength) * (BigInt(currentPeriod) + BigInt(1))
      : undefined

  const periodLengthLabel = useMemo(() => {
    if (isLoading) return "Loading..."
    if (!settings) return "--"
    return secondsToTime(Number(settings.periodLength))
  }, [isLoading, settings])

  const distributionLabel = useMemo(() => {
    if (isLoading) return "Loading..."
    if (!settings) return "--"

    const percentPerPeriod = Number(settings.percentPerPeriod)
    return percentPerPeriod === 0 ? "Infinite" : `${percentPerPeriod}%`
  }, [isLoading, settings])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <SettingStatCard label="Period Length" value={periodLengthLabel} />
        <SettingStatCard label="Distribution" value={distributionLabel} />
      </div>

      <div className="rounded-xl border border-border/60 bg-background/60 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Next Distribution
          </p>

          <TooltipProvider delayDuration={120}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setIsAddressesModalOpen(true)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border/70 bg-background px-3 text-xs font-semibold uppercase tracking-[0.12em] text-foreground transition-colors hover:border-primary hover:text-primary"
                  type="button"
                  aria-label="Open loopers modal"
                >
                  <LuUsers className="size-4" />
                  <span className="hidden sm:inline">Loopers</span>
                  <span className="sr-only">Loopers</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>View loopers</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {nextPeriodStart !== undefined && nextPeriodStart > 0n ? (
          <Countdown nextPeriodStart={nextPeriodStart} />
        ) : (
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading timer..." : "Timer unavailable."}
          </p>
        )}
      </div>

      <LoopersModal
        chainId={chainId}
        currentPeriod={currentPeriod}
        isOpen={isAddressesModalOpen}
        loopAddress={address}
        loopTitle={loopTitle}
        onOpenChange={setIsAddressesModalOpen}
      />
    </div>
  )
}

const SettingStatCard = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="rounded-xl border border-border/60 bg-background/60 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="font-heading mt-1.5 text-lg leading-tight text-foreground md:text-xl">
        {value}
      </p>
    </div>
  )
}

const Countdown = ({ nextPeriodStart }: { nextPeriodStart: bigint }) => {
  const [currentTime, setCurrentTime] = useState<number>(
    Math.floor(Date.now() / 1000)
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const remaining = useMemo(() => {
    const diff = Number(nextPeriodStart) - currentTime
    return diff > 0 ? diff : 0
  }, [nextPeriodStart, currentTime])

  const { days, hours, minutes, seconds } = formatTime(remaining)
  const totalHours = days * 24 + hours

  return (
    <div className="grid grid-cols-3 gap-2">
      <TimeBlock label="Hours" value={totalHours} />
      <TimeBlock label="Minutes" value={minutes} />
      <TimeBlock label="Seconds" value={seconds} />
    </div>
  )
}

const formatTime = (totalSeconds: number) => {
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return { days, hours, minutes, seconds }
}

const TimeBlock = ({ label, value }: { label: string; value: number }) => {
  const display = value.toString().padStart(2, "0")

  return (
    <div className="rounded-lg border border-border/60 bg-background/70 p-2 text-center">
      <div className="font-heading text-xl leading-none text-foreground sm:text-2xl">
        {display}
      </div>
      <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </div>
    </div>
  )
}

