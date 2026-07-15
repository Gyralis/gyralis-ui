"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
import { LoopEligibilityProvider } from "@/data/loops-data"
import { LuInfo } from "react-icons/lu"
import { Address, formatUnits } from "viem"

import {
  DEFAULT_LOOP_CONTRACT_TYPE,
  type LoopContractType,
} from "@/lib/contracts/loop-contracts"
import { useLoopTokenBalance } from "@/lib/hooks/app/use-loop-token-balance"
import { useLoopSettings } from "@/lib/hooks/app/use-next-period-start"
import { trimFormattedBalance } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { LoopClaim, LoopClaimStatus } from "@/components/loops/loop-claim"
import { LoopersModal } from "@/components/loops/loopers-modal"

interface LoopSettingsComponentProps {
  address: Address
  chainId: number
  contractType?: LoopContractType
  eligibilityProvider: LoopEligibilityProvider
  eligibilityLogoUrl?: string
  isSuper?: boolean
  loopTitle?: string
  onClaimSuccess?: () => void
}

interface UseLoopSettingsDetailsParams {
  address: Address
  chainId: number
  contractType?: LoopContractType
  isSuper?: boolean
  onClaimSuccess?: () => void
}

export const LoopSettings: React.FC<LoopSettingsComponentProps> = ({
  address,
  chainId,
  contractType = DEFAULT_LOOP_CONTRACT_TYPE,
  eligibilityProvider,
  eligibilityLogoUrl,
  isSuper,
  loopTitle,
  onClaimSuccess,
}) => {
  const details = useLoopSettingsDetails({
    address,
    chainId,
    contractType,
    isSuper,
    onClaimSuccess,
  })

  return (
    <TooltipProvider>
      <div className="rounded-[1.65rem] border border-border/80 bg-background/35 p-6 md:p-7 lg:p-8">
        <div className="flex items-center justify-center">
          <LoopDistributionStat
            value={details.distributionLabel}
            detail={details.distributionDetail}
            balanceDetail={details.balanceDetail}
            tooltip={details.distributionTooltip}
          />
        </div>

        <LoopPeriodStat
          className="mt-6"
          isLoading={details.isLoading}
          nextPeriodStart={details.nextPeriodStart}
          timerTitle={details.timerTitle}
          onViewLoopers={() => details.setIsLoopersModalOpen(true)}
        />

        <LoopSettingsClaimAction
          address={address}
          chainId={chainId}
          contractType={contractType}
          eligibilityProvider={eligibilityProvider}
          onStatusChange={details.handleClaimStatusChange}
          onSuccess={details.handleClaimSuccess}
        />

        <LoopSettingsLoopersModal
          address={address}
          chainId={chainId}
          contractType={contractType}
          currentPeriod={details.currentPeriod}
          eligibilityLogoUrl={eligibilityLogoUrl}
          firstPeriodStart={details.settings?.firstPeriodStart}
          isOpen={details.isLoopersModalOpen}
          isSuper={isSuper}
          loopTitle={loopTitle}
          loopToken={details.settings?.token}
          onOpenChange={details.setIsLoopersModalOpen}
          periodLength={details.settings?.periodLength}
          refreshKey={details.modalRefreshKey}
        />
      </div>
    </TooltipProvider>
  )
}

export function useLoopSettingsDetails({
  address,
  chainId,
  contractType = DEFAULT_LOOP_CONTRACT_TYPE,
  isSuper,
  onClaimSuccess,
}: UseLoopSettingsDetailsParams) {
  const { settings, currentPeriod, isLoading } = useLoopSettings(
    address,
    chainId,
    contractType
  )
  const [isLoopersModalOpen, setIsLoopersModalOpen] = useState(false)
  const [modalRefreshKey, setModalRefreshKey] = useState(0)
  const [claimStatus, setClaimStatus] = useState<LoopClaimStatus>("default")
  const { data: loopBalance, refetch: refetchLoopBalance } =
    useLoopTokenBalance({
      address,
      chainId,
      contractType,
      enabled: Boolean(address && settings?.token),
      token: settings?.token,
    })

  const nextPeriodStart =
    settings && currentPeriod != null
      ? BigInt(settings.firstPeriodStart) +
        BigInt(settings.periodLength) * (BigInt(currentPeriod) + BigInt(1))
      : undefined

  const distributionLabel = useMemo(() => {
    if (isLoading) return "Loading..."
    if (!settings) return "--"

    const percentPerPeriod = Number(settings.percentPerPeriod)
    return percentPerPeriod === 0 ? "Infinite" : `${percentPerPeriod}%`
  }, [isLoading, settings])

  const distributionAmountLabel = useMemo(() => {
    if (isLoading) return undefined
    if (!settings || !loopBalance || settings.percentPerPeriod === 0n) {
      return undefined
    }

    const distributedValue =
      (loopBalance.value * settings.percentPerPeriod) / 100n
    const distributedAmount = formatUnits(
      distributedValue,
      loopBalance.decimals
    )
    const symbol = loopBalance.symbol ? ` ${loopBalance.symbol}` : ""

    return `${trimFormattedBalance(distributedAmount, 4)}${symbol}`
  }, [isLoading, settings, loopBalance])

  const distributionDetail = distributionAmountLabel
  const balanceDetail = useMemo(() => {
    if (isLoading || !loopBalance) return undefined

    const balance = trimFormattedBalance(
      formatUnits(loopBalance.value, loopBalance.decimals),
      4
    )
    const symbol = loopBalance.symbol ? ` ${loopBalance.symbol}` : ""

    return `${balance}${symbol}`
  }, [isLoading, loopBalance])
  const distributionTooltip =
    settings && settings.percentPerPeriod > 0n
      ? `Each period releases ${distributionLabel} of the remaining balance, split evenly among registered users.`
      : "The loop balance is distributed evenly among registered users each period."

  const timerTitle = useMemo(() => {
    switch (claimStatus) {
      case "active":
        return isSuper ? "Claim opens in" : "Active period ends in"
      case "entered":
        return isSuper ? "Accumulation starts in" : "Claim opens in"
      case "claimable":
        return "Claim period ends in"
      case "claimed":
        return "Next claim opens in"
      default:
        return "Current period ends in"
    }
  }, [claimStatus, isSuper])

  const handleClaimSuccess = () => {
    void refetchLoopBalance()
    setModalRefreshKey((key) => key + 1)
    onClaimSuccess?.()
  }

  const handleClaimStatusChange = useCallback((status: LoopClaimStatus) => {
    setClaimStatus(status)
  }, [])

  return {
    currentPeriod,
    balanceDetail,
    distributionDetail,
    distributionLabel,
    distributionTooltip,
    handleClaimStatusChange,
    handleClaimSuccess,
    isLoading,
    isLoopersModalOpen,
    modalRefreshKey,
    nextPeriodStart,
    setIsLoopersModalOpen,
    settings,
    timerTitle,
  }
}

export const LoopDistributionStat = ({
  balanceDetail,
  compact = false,
  value,
  detail,
  tooltip,
}: {
  balanceDetail?: string
  compact?: boolean
  value: string
  detail?: string
  tooltip: string
}) => {
  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="group flex h-full cursor-help flex-col text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            role="button"
            tabIndex={0}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Distribution
            </p>
            <div className="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-foreground">
              <p className="text-[1.6rem] font-bold leading-none text-foreground">
                {value}
              </p>
              {detail ? (
                <p className="text-[11px] font-semibold leading-4 text-foreground">
                  {detail}
                </p>
              ) : null}
            </div>
            {balanceDetail ? (
              <div className="mt-2 border-t border-border/80 pt-1.5">
                <p className="text-[10px] font-semibold leading-none text-muted-foreground">
                  Balance:{" "}
                  <span className="text-foreground">{balanceDetail}</span>
                </p>
              </div>
            ) : null}
          </div>
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <SettingStatCard
      label="Distribution"
      value={value}
      detail={detail}
      tooltip={tooltip}
    />
  )
}

export const LoopPeriodStat = ({
  className,
  compact = false,
  isLoading,
  nextPeriodStart,
  timerTitle,
  onViewLoopers,
  showLoopersTrigger = true,
}: {
  className?: string
  compact?: boolean
  isLoading: boolean
  nextPeriodStart?: bigint
  timerTitle: string
  onViewLoopers: () => void
  showLoopersTrigger?: boolean
}) => {
  if (compact) {
    return (
      <div className={`relative flex flex-col text-left ${className ?? ""}`}>
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          Period
        </p>
        <p className="mt-3 text-sm font-semibold leading-4 text-foreground">
          {timerTitle}
        </p>
        {nextPeriodStart !== undefined && nextPeriodStart > 0n ? (
          <CountdownInline nextPeriodStart={nextPeriodStart} />
        ) : (
          <p className="mt-2 text-xs font-medium text-muted-foreground">
            {isLoading ? "Loading..." : "Timer unavailable."}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className={`relative ${className ?? ""}`}>
      <div className="text-center">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
          {timerTitle}
        </p>
      </div>

      {nextPeriodStart !== undefined && nextPeriodStart > 0n ? (
        <Countdown nextPeriodStart={nextPeriodStart} />
      ) : (
        <p className="pt-2.5 text-center text-sm text-muted-foreground">
          {isLoading ? "Loading timer..." : "Timer unavailable."}
        </p>
      )}

      {showLoopersTrigger ? (
        <LoopersTrigger className="mt-4" onClick={onViewLoopers} />
      ) : null}
    </div>
  )
}

export const LoopersTrigger = ({
  className,
  onClick,
}: {
  className?: string
  onClick: () => void
}) => {
  return (
    <div className={`text-center ${className ?? ""}`}>
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center justify-center rounded-full border border-border/70 bg-background/70 px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        View loopers
      </button>
    </div>
  )
}

const LoopSettingsClaimAction = ({
  address,
  chainId,
  contractType,
  eligibilityProvider,
  onStatusChange,
  onSuccess,
}: {
  address: Address
  chainId: number
  contractType: LoopContractType
  eligibilityProvider: LoopEligibilityProvider
  onStatusChange: (status: LoopClaimStatus) => void
  onSuccess: () => void
}) => {
  return (
    <div className="mt-5">
      <LoopClaim
        address={address}
        chainId={chainId}
        contractType={contractType}
        eligibilityProvider={eligibilityProvider}
        onStatusChange={onStatusChange}
        onSuccess={onSuccess}
      />
    </div>
  )
}

const LoopSettingsLoopersModal = ({
  address,
  chainId,
  contractType,
  currentPeriod,
  eligibilityLogoUrl,
  firstPeriodStart,
  isOpen,
  isSuper,
  loopTitle,
  loopToken,
  onOpenChange,
  periodLength,
  refreshKey,
}: {
  address: Address
  chainId: number
  contractType: LoopContractType
  currentPeriod?: bigint
  eligibilityLogoUrl?: string
  firstPeriodStart?: bigint
  isOpen: boolean
  isSuper?: boolean
  loopTitle?: string
  loopToken?: Address
  onOpenChange: (open: boolean) => void
  periodLength?: bigint
  refreshKey: number
}) => {
  return (
    <LoopersModal
      chainId={chainId}
      currentPeriod={currentPeriod}
      eligibilityLogoUrl={eligibilityLogoUrl}
      isOpen={isOpen}
      loopAddress={address}
      loopContractType={contractType}
      loopIsSuper={isSuper}
      loopToken={loopToken}
      loopTitle={loopTitle}
      onOpenChange={onOpenChange}
      firstPeriodStart={firstPeriodStart}
      periodLength={periodLength}
      refreshKey={refreshKey}
    />
  )
}

const SettingStatCard = ({
  label,
  value,
  detail,
  tooltip,
}: {
  label: string
  value: string
  detail?: string
  tooltip: string
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="group inline-flex w-full cursor-help flex-wrap items-center justify-center gap-x-[5px] gap-y-0.5 rounded-xl px-2 py-1 text-center transition-colors hover:bg-background/40 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          role="button"
          tabIndex={0}
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors group-hover:text-foreground">
            {label}
          </span>
          <span className="text-[1rem]  tracking-[0.12em] text-foreground">
            {value}
          </span>
          {detail ? (
            <>
              <span className="size-1 rounded-full bg-primary" />
              <span className="text-[11px] font-medium leading-4 text-primary">
                {detail}
              </span>
            </>
          ) : null}
          <LuInfo className="size-3.5 shrink-0 text-primary" />
        </div>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
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
      <div className="flex items-baseline justify-center gap-4 whitespace-nowrap ">
        <TimeValue value={totalHours} />
        <TimeValue value={minutes} />
        <TimeValue value={seconds} highlight />
      </div>
      <div className="flex items-baseline justify-center gap-8 whitespace-nowrap  mt-1">
        <TimeLabel label="Hours" />
        <TimeLabel label="Min" />
        <TimeLabel label="Sec" />
      </div>
    </div>
  )
}

const CountdownInline = ({ nextPeriodStart }: { nextPeriodStart: bigint }) => {
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
    <p className="mt-2.5 font-bold leading-none text-muted-foreground">
      <span className="text-[1.6rem]">
        {totalHours}h {minutes}m
      </span>
      <span className="ml-1.5 text-[15px]">{seconds}s</span>
    </p>
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
