"use client"

import React, { useEffect, useMemo, useState } from "react"
import { LoopEligibilityProvider } from "@/data/loops-data"
import { LuUsers } from "react-icons/lu"
import { SiLoop } from "react-icons/si"
import { Address } from "viem"

import { useLoopSettings } from "@/lib/hooks/app/use-next-period-start"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { LoopClaim } from "@/components/loops/loop-claim"
import { LoopersModal } from "@/components/loops/loopers-modal"

interface LoopSettingsComponentProps {
  address: Address
  chainId: number
  eligibilityProvider: LoopEligibilityProvider
  loopTitle?: string
}

export const LoopSettings: React.FC<LoopSettingsComponentProps> = ({
  address,
  chainId,
  eligibilityProvider,
  loopTitle,
}) => {
  const { settings, currentPeriod, isLoading } = useLoopSettings(
    address,
    chainId
  )
  const [isLoopersModalOpen, setIsLoopersModalOpen] = useState(false)

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

        <div className=" flex justify-center border2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label="Open loopers"
                  className="inline-flex  items-center justify-center rounded-full border text-secondary-foreground"
                  onClick={() => setIsLoopersModalOpen(true)}
                >
                  <SiLoop className="size-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Loopers</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="mt-8">
        <LoopClaim
          address={address}
          chainId={chainId}
          eligibilityProvider={eligibilityProvider}
        />
      </div>

      <LoopersModal
        chainId={chainId}
        currentPeriod={currentPeriod}
        isOpen={isLoopersModalOpen}
        loopAddress={address}
        loopTitle={loopTitle}
        onOpenChange={setIsLoopersModalOpen}
      />
    </div>
  )
}

const SettingStatCard = ({
  label,
  value,
}: {
  label: string
  value: string
}) => {
  return (
    <div>
      <p className="text-[11px]  uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-[1rem] leading-none text-foreground">{value}</p>
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
      <div className="flex items-baseline justify-center gap-4 whitespace-nowrap border2">
        <TimeValue value={totalHours} />
        <TimeValue value={minutes} />
        <TimeValue value={seconds} highlight />
      </div>
      <div className="flex items-baseline justify-center gap-8 whitespace-nowrap border2 mt-1">
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
