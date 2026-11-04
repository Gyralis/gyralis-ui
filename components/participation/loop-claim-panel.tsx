"use client"

import { useEffect, useRef, useState } from "react"
import type { LoopCardData } from "@/data/loops-data"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { LuCheck, LuClock3, LuWallet } from "react-icons/lu"
import { useAccount } from "wagmi"

import type { DailyRewardEstimate } from "@/lib/loops/daily-reward"
import { TooltipProvider } from "@/components/ui/tooltip"
import { RwagmiTokenEligibility } from "@/components/loops/rwagmi-token-eligibility"
import { LoopClaimAction } from "@/components/loops/sections/loop-claim-action"
import type {
  LoopActionViewModel,
  LoopPeriodViewData,
  SectionState,
} from "@/components/loops/sections/loop-section-types"
import type { LoopersViewData } from "@/components/loops/sections/loopers-section"
import { useStandardLoopCardController } from "@/components/loops/standard-loop/use-standard-loop-card-controller"
import { useSuperLoopCardController } from "@/components/loops/super-loop/use-super-loop-card-controller"

export function LoopClaimPanel({ loop }: { loop: LoopCardData }) {
  return loop.contractType === "superLoop" || loop.super ? (
    <StreamingClaimPanel loop={loop} />
  ) : (
    <StandardClaimPanel loop={loop} />
  )
}

function StandardClaimPanel({ loop }: { loop: LoopCardData }) {
  const controller = useStandardLoopCardController(loop)
  return <ClaimPanelView loop={loop} {...controller} />
}

function StreamingClaimPanel({ loop }: { loop: LoopCardData }) {
  const controller = useSuperLoopCardController(loop)
  return <ClaimPanelView loop={loop} {...controller} />
}

interface ClaimPanelViewProps {
  loop: LoopCardData
  action: LoopActionViewModel
  dailyRewards: SectionState<DailyRewardEstimate>
  loopers: SectionState<LoopersViewData>
  period: SectionState<LoopPeriodViewData>
  refresh: () => Promise<void>
}

export function ClaimPanelView({
  loop,
  action,
  dailyRewards,
  loopers,
  period,
  refresh,
}: ClaimPanelViewProps) {
  const { isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()
  const reward = sectionData(dailyRewards)
  const participation = sectionData(loopers)
  const periodData = sectionData(period)
  const timing = useClaimPeriod(periodData, refresh)
  const justClaimed = useClaimConfirmation(action.status)
  const model = {
    ...action,
    label:
      action.status === "enter"
        ? "Register"
        : action.status === "entered"
        ? "Registered"
        : action.label,
  }
  const showTiming =
    isConnected && ["entered", "active"].includes(action.status)

  return (
    <div className="p-loop-claim-panel">
      <dl className="p-loop-claim-metrics">
        <div title="Estimated total rewards for this Loop over 24 hours, shared across its participants. The claim button shows your individual claimable payout.">
          <dt>Daily rewards</dt>
          <dd aria-busy={dailyRewards.status === "loading"}>
            {reward ? (
              <>
                {reward.value !== "0" &&
                reward.value !== "0.00" &&
                reward.value !== "—"
                  ? "≈ "
                  : ""}
                {reward.value} <span>{reward.symbol}</span>
              </>
            ) : (
              "—"
            )}
          </dd>
          <MetricRetry state={dailyRewards} label="daily rewards" />
        </div>
        <div title="Registered Loopers in the current contract period.">
          <dt>Loopers</dt>
          <dd aria-busy={loopers.status === "loading"}>
            {participation?.registeredCount.toLocaleString("en-US") ?? "—"}
          </dd>
          <MetricRetry state={loopers} label="Loopers" />
        </div>
      </dl>
      {loop.eligibilityProvider === "rwagmi" && isConnected && (
        <div className="p-loop-claim-setup">
          <RwagmiTokenEligibility compact />
        </div>
      )}
      <div className="p-loop-claim-action">
        {!isConnected ? (
          <button
            type="button"
            className="p-button"
            onClick={openConnectModal}
            disabled={!openConnectModal}
          >
            <LuWallet aria-hidden="true" /> Connect wallet
          </button>
        ) : action.status === "claimed" ? (
          <ClaimedLoopAction
            timing={timing}
            justClaimed={justClaimed}
            nextPeriod={periodData?.timerTitle === "Accumulation starts in"}
          />
        ) : (
          <div aria-live="polite" aria-atomic="true">
            <TooltipProvider delayDuration={150}>
              <LoopClaimAction chainId={loop.chainId} model={model} />
            </TooltipProvider>
          </div>
        )}
      </div>
      {showTiming && timing && (
        <p className="p-loop-claim-timing">
          {periodData?.timerTitle} {timing}
        </p>
      )}
    </div>
  )
}

export function ClaimedLoopAction({
  timing,
  justClaimed,
  nextPeriod = false,
}: {
  timing?: string
  justClaimed: boolean
  nextPeriod?: boolean
}) {
  const showConfirmation = justClaimed || !timing
  const label = showConfirmation
    ? "Claimed"
    : timing === "00:00:00"
    ? "Updating Loop…"
    : nextPeriod
    ? "Next period in"
    : "Next claim in"

  return (
    <div className="p-loop-claim-complete">
      <span className="sr-only" role="status">
        Claim confirmed.
      </span>
      {showConfirmation ? (
        <LuCheck aria-hidden="true" />
      ) : (
        <LuClock3 aria-hidden="true" />
      )}
      <span>{label}</span>
      {!showConfirmation && timing !== "00:00:00" && (
        <span role="timer" aria-live="off">
          {timing}
        </span>
      )}
    </div>
  )
}

function useClaimConfirmation(status: LoopActionViewModel["status"]) {
  const previousStatus = useRef(status)
  const [justClaimed, setJustClaimed] = useState(false)

  useEffect(() => {
    const confirmedNow =
      status === "claimed" &&
      ["claimable", "claiming"].includes(previousStatus.current)
    previousStatus.current = status
    setJustClaimed(confirmedNow)
    if (!confirmedNow) return
    const timer = setTimeout(() => setJustClaimed(false), 2400)
    return () => clearTimeout(timer)
  }, [status])

  return justClaimed
}

function sectionData<T>(state: SectionState<T>): T | undefined {
  return state.status === "ready" || state.status === "refreshing"
    ? state.data
    : undefined
}

function MetricRetry<T>({
  state,
  label,
}: {
  state: SectionState<T>
  label: string
}) {
  if (state.status !== "error") return null
  return (
    <button
      type="button"
      className="p-loop-metric-retry"
      onClick={state.retry}
      title={state.message}
      aria-label={`Retry ${label}`}
      disabled={!state.retry}
    >
      Retry
    </button>
  )
}

function useClaimPeriod(
  period: LoopPeriodViewData | undefined,
  refresh: () => Promise<void>
) {
  const [now, setNow] = useState(0)
  const refreshedPeriod = useRef<bigint>()
  const nextPeriodStart = period?.nextPeriodStart
  const onBoundary = period?.onCountdownComplete ?? refresh
  useEffect(() => {
    if (nextPeriodStart == null) return
    const tick = () => {
      const time = Date.now()
      setNow(time)
      if (
        BigInt(Math.floor(time / 1000)) >= nextPeriodStart &&
        refreshedPeriod.current !== nextPeriodStart
      ) {
        refreshedPeriod.current = nextPeriodStart
        void onBoundary()
      }
    }
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [nextPeriodStart, onBoundary])

  return claimCountdown(nextPeriodStart, now)
}

export function claimCountdown(
  nextPeriodStart: bigint | undefined,
  now: number
) {
  if (!now || nextPeriodStart == null) return undefined
  const seconds = Math.max(0, Number(nextPeriodStart) - Math.floor(now / 1000))
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return [hours, minutes, seconds % 60]
    .map((value) => String(value).padStart(2, "0"))
    .join(":")
}
