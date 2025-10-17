"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
import { motion, useSpring, useTransform } from "framer-motion"
import { Address } from "viem"
import { useWatchBlocks } from "wagmi"

import {
  LoopSettingsProps,
  useLoopSettings,
} from "@/lib/hooks/app/use-next-period-start"
import { secondsToTime } from "@/lib/utils/time"

interface LoopSettingsComponentProps {
  address: Address
  chainId: number
}

export const LoopSettings: React.FC<LoopSettingsComponentProps> = ({
  address,
  chainId,
}) => {
  const [superLoop, setSuperLoop] = useState<boolean>(false)
  const [isAddressesModalOpen, setIsAddressesModalOpen] = useState(false)

  const { settings, currentPeriod, isLoading } = useLoopSettings(
    address,
    chainId
  )

  const nextPeriodStart =
    settings && currentPeriod != null
      ? BigInt(settings.firstPeriodStart) +
        BigInt(settings.periodLength) * (currentPeriod + 1n)
      : undefined

  return (
    <div>
      <div className="border2 mb-6 grid grid-cols-2 gap-4">
        <div className="cursor-pointer rounded-xl bg-card p-3 shadow-[-2px_-2px_5px_rgba(255,255,255,0.7),2px_2px_5px_rgba(0,0,0,0.15)] transition-all duration-300 hover:shadow-[inset_-2px_-2px_5px_rgba(255,255,255,0.7),inset_2px_2px_5px_rgba(0,0,0,0.15)]">
          <p className="mb-1 text-xs font-medium text-muted-foreground">
            Period Length -
          </p>
          <p className="font-heading text-lg font-bold text-foreground md:text-xl">
            {secondsToTime(Number(settings?.periodLength))}
          </p>
        </div>
        <div className="cursor-pointer rounded-xl bg-card p-3 shadow-[-2px_-2px_5px_rgba(255,255,255,0.7),2px_2px_5px_rgba(0,0,0,0.15)] transition-all duration-300 hover:shadow-[inset_-2px_-2px_5px_rgba(255,255,255,0.7),inset_2px_2px_5px_rgba(0,0,0,0.15)]">
          <p className="mb-1 text-xs font-medium text-muted-foreground">
            Distribution
          </p>
          <p className="font-heading text-lg font-bold text-foreground md:text-xl">
            {superLoop ? "∞" : Number(settings?.percentPerPeriod)}{" "}
            <span>%</span>
          </p>
        </div>
      </div>

      <div className="border2 mb-6 rounded-xl bg-gradient-to-br from-card/50 to-muted/30 p-4 shadow-[inset_-2px_-2px_5px_rgba(255,255,255,0.7),inset_2px_2px_5px_rgba(0,0,0,0.15)] md:mb-8">
        <p className="mb-2 text-sm font-medium text-muted-foreground">
          Next Distribution in:
        </p>

        <div className="flex items-center justify-between">
          {nextPeriodStart !== undefined && nextPeriodStart > 0n && (
            <Countdown nextPeriodStart={nextPeriodStart} />
          )}

          <button
            onClick={() => setIsAddressesModalOpen(true)}
            className="tamagotchi-button-secondary"
          >
            Loopers
          </button>
        </div>
      </div>
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

  const { hours, minutes, seconds } = formatTime2(remaining)

  return (
    <div className="flex justify-center gap-2 sm:gap-4">
      <TimeBlock label="Hours" value={hours} />
      <TimeBlock label="Minutes" value={minutes} />
      <TimeBlock label="Seconds" value={seconds} />
    </div>
  )
}

// Utility to format seconds into { days, hours, minutes, seconds }
const formatTime2 = (totalSeconds: number) => {
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return { days, hours, minutes, seconds }
}

type AnimatedNumberProps = {
  value: number
}

const AnimatedNumber = ({ value }: AnimatedNumberProps) => {
  const spring = useSpring(value, {
    mass: 0.5,
    stiffness: 50,
    damping: 10,
  })

  const display = useTransform(spring, (current) =>
    Number(current).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
  )

  useEffect(() => {
    spring.set(value)
  }, [value, spring])

  return (
    <motion.span className="text-5xl font-bold text-[#0065BD] sm:text-6xl md:text-7xl">
      {display}
    </motion.span>
  )
}

const TimeBlock = ({ label, value }: { label: string; value: number }) => {
  const display = value != null ? value.toString().padStart(2, "0") : "--"
  return (
    <div className="w-16 rounded-lg  p-2 text-white sm:w-20 sm:p-3">
      <div className="text-xl font-bold sm:text-2xl">{display}</div>
      <div className="text-xs text-gray-300">{label}</div>
    </div>
  )
}
