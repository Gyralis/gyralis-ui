"use client"

import React, { useEffect, useMemo, useState } from "react"
import { LoopEligibilityProvider } from "@/data/loops-data"
import { Address } from "viem"

import { useLoopSettings } from "@/lib/hooks/app/use-next-period-start"
import { LoopClaim } from "@/components/loops/loop-claim"

interface LoopSettingsComponentProps {
  address: Address
  chainId: number
  eligibilityProvider: LoopEligibilityProvider
}

export const LoopSettings: React.FC<LoopSettingsComponentProps> = ({
  address,
  chainId,
  eligibilityProvider,
}) => {
  const { settings, currentPeriod, isLoading } = useLoopSettings(address, chainId)

  const nextPeriodStart =
    settings && currentPeriod != null
      ? BigInt(settings.firstPeriodStart) +
        BigInt(settings.periodLength) * (BigInt(currentPeriod) + BigInt(1))
      : undefined

  const periodLengthLabel = useMemo(() => {
    if (isLoading) return "Loading..."
    if (!settings) return "--"

    const periodLengthInSeconds = Number(settings.periodLength)
    const minutes = Math.floor(periodLengthInSeconds / 60)

    if (minutes >= 1 && periodLengthInSeconds % 60 === 0) {
      return `${minutes} minute${minutes === 1 ? "" : "s"}`
    }

    return `${periodLengthInSeconds}s`
  }, [isLoading, settings])

  const distributionLabel = useMemo(() => {
    if (isLoading) return "Loading..."
    if (!settings) return "--"

    const percentPerPeriod = Number(settings.percentPerPeriod)
    return percentPerPeriod === 0 ? "Infinite" : `${percentPerPeriod}%`
  }, [isLoading, settings])

  return (
    <div className="rounded-[1.65rem] border border-border/80 bg-background/32 px-6 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] md:px-7 md:py-7">
      <div className="grid grid-cols-2 gap-6 text-center">
        <SettingStatCard label="Period" value={periodLengthLabel} />
        <SettingStatCard label="Distribution" value={distributionLabel} />
      </div>

      <div className="mt-7">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Next Distribution
        </p>

        {nextPeriodStart !== undefined && nextPeriodStart > 0n ? (
          <Countdown nextPeriodStart={nextPeriodStart} />
        ) : (
          <p className="pt-5 text-center text-sm text-muted-foreground">
            {isLoading ? "Loading timer..." : "Timer unavailable."}
          </p>
        )}
      </div>

      <div className="mt-8">
        <LoopClaim
          address={address}
          chainId={chainId}
          eligibilityProvider={eligibilityProvider}
        />
      </div>
    </div>
  )
}

const SettingStatCard = ({ label, value }: { label: string; value: string }) => {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-[1.7rem] font-semibold leading-none text-foreground">
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
    <div className="pt-5 text-center">
      <div className="flex items-baseline justify-center gap-4 whitespace-nowrap">
        <TimeValue value={totalHours} />
        <TimeValue value={minutes} />
        <TimeValue value={seconds} highlight />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-4">
        <TimeLabel label="Hours" />
        <TimeLabel label="Min" />
        <TimeLabel label="Sec" />
      </div>
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

const TimeValue = ({
  value,
  highlight = false,
}: {
  value: number
  highlight?: boolean
}) => {
  const display = value.toString().padStart(2, "0")

  return (
    <span
      className={`font-heading text-[2.3rem] leading-none tracking-[0.04em] sm:text-[2.5rem] ${
        highlight ? "text-primary" : "text-foreground"
      }`}
    >
      {display}
    </span>
  )
}

const TimeLabel = ({ label }: { label: string }) => {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
      {label}
    </p>
  )
}

