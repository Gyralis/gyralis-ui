"use client"

import { useState, type ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import type { LoopCardData } from "@/data/loops-data"
import {
  LuExternalLink,
  // LuFlame,
  LuShield,
  LuShieldCheck,
} from "react-icons/lu"
import { useAccount } from "wagmi"

import type { LoopContractType } from "@/lib/contracts/loop-contracts"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useGetScore } from "@/integrations/gitcoin-passport/hooks/use-get-score"

import { LoopIdentityMark } from "./loop-identity-mark"
import { LoopDistributionStat, LoopPeriodStat } from "./loop-settings"
import { LoopTypeBadge } from "./loop-type-badge"
import { LoopersModal } from "./loopers-modal"
import { LoopSectionError } from "./sections/loop-section-status"
import type {
  LoopDistributionViewData,
  LoopPeriodViewData,
  SectionState,
} from "./sections/loop-section-types"
import {
  LoopersSection,
  type LoopersViewData,
} from "./sections/loopers-section"

interface LoopCardShellProps {
  action: ReactNode
  distribution: SectionState<LoopDistributionViewData>
  eligibilityLinkDisabled?: boolean
  isSuper: boolean
  loop: LoopCardData
  loopers: SectionState<LoopersViewData>
  loopersModalEnabled?: boolean
  modal: {
    currentPeriod?: bigint
    firstPeriodStart?: bigint
    loopContractType: LoopContractType
    loopToken?: `0x${string}`
    periodLength?: bigint
    refreshKey: number
  }
  period: SectionState<LoopPeriodViewData>
}

const CHAIN_ICON_SRC: Record<string, string> = {
  Base: "/icons/NetworkBaseTest.svg",
  Gnosis: "/icons/NetworkGnosis.svg",
  Soneium: "/icons/NetworkSoneium.webp",
}

export function LoopCardShell({
  action,
  distribution,
  eligibilityLinkDisabled = false,
  isSuper,
  loop,
  loopers,
  loopersModalEnabled = true,
  modal,
  period,
}: LoopCardShellProps) {
  const [isLoopersModalOpen, setIsLoopersModalOpen] = useState(false)
  const { isConnected } = useAccount()
  const passportScoreQuery = useGetScore({ enabled: isConnected })
  const shieldThreshold = loop.shieldScore
    .match(/\+?\d+(\.\d+)?/)?.[0]
    ?.replace(/^\+/, "")
  const shieldThresholdValue =
    shieldThreshold == null ? Number.NaN : Number.parseFloat(shieldThreshold)
  const passportScoreValue =
    passportScoreQuery.data?.score == null
      ? Number.NaN
      : Number.parseFloat(String(passportScoreQuery.data.score))
  const hasPassedShield =
    Number.isFinite(shieldThresholdValue) &&
    Number.isFinite(passportScoreValue) &&
    passportScoreValue >= shieldThresholdValue
  const eligibilityLabel = loop.eligibility.replace(/\s+required$/i, "")
  const distributionData = getSectionData(distribution)
  const periodData = getSectionData(period)
  const sponsor =
    loop.sponsorName && loop.sponsorLogoUrl
      ? {
          logoUrl: loop.sponsorLogoUrl,
          name: loop.sponsorName,
        }
      : undefined

  return (
    <TooltipProvider>
      <div
        className={[
          "tamagotchi-card loop-card-shell font-body relative w-[560px] max-w-full rounded-[32px] p-[22px]",
          isSuper ? "tamagotchi-card-superloop" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="relative z-10 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-1.5">
              <LoopIdentityMark loop={loop} />
              <div className="min-w-0 flex-1  flex flex-col gap-0.5">
                <h2 className="line-clamp-2 min-w-0 text-[1.35rem] leading-[1.05] text-foreground">
                  {loop.title}
                </h2>
                <div className=" flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  <HeaderIconBadges
                    chainName={loop.chainName}
                    isSuper={isSuper}
                  />
                </div>
              </div>
            </div>

            {sponsor ? (
              <div
                aria-label={`Sponsored by ${sponsor.name}`}
                className="flex min-h-[42px] shrink-0 items-center gap-1 rounded-full border border-border/80 bg-background px-2.5 py-1.5 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_8px_20px_-18px_rgba(15,23,42,0.16)] dark:border-white/8 dark:bg-background dark:text-white/90 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_20px_-18px_rgba(0,0,0,0.72)]"
              >
                <SponsorBadgeMark
                  logoUrl={sponsor.logoUrl}
                  sponsorName={sponsor.name}
                />
                <div className="shrink-0">
                  <p className="text-[8px] font-semibold uppercase leading-none tracking-widest text-muted-foreground">
                    Sponsored by
                  </p>
                  <p className="mt-1 whitespace-nowrap text-[11px] font-semibold leading-none text-foreground">
                    {sponsor.name}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="h-px bg-border/80" />

          <div className="grid overflow-hidden rounded-2xl border border-border/80 bg-muted/20 md:grid-cols-[minmax(0,1fr)_minmax(118px,0.72fr)_minmax(0,1fr)]">
            <div className="min-w-0 max-w-full min-h-[94px] border-b border-border/80 bg-primary/5 px-3.5 py-3 md:border-b-0 md:border-r">
              {distribution.status === "error" ? (
                <LoopSectionError
                  label="Daily rewards"
                  message={distribution.message}
                  onRetry={distribution.retry}
                />
              ) : (
                <LoopDistributionStat
                  animation={distributionData?.animation}
                  balanceDetail={distributionData?.balanceDetail}
                  balanceDetailLabel={distributionData?.balanceDetailLabel}
                  compact
                  isLoading={
                    distribution.status === "loading" ||
                    distributionData?.isLoading
                  }
                  labelDetail={distributionData?.labelDetail}
                  value={getDistributionValue(distribution)}
                  valueMuted={distributionData?.valueMuted}
                  valueUnit={distributionData?.valueUnit}
                  detail={distributionData?.detail}
                  tooltip={distributionData?.tooltip ?? "Loading Loop rewards."}
                />
              )}
            </div>

            <div className="min-h-[94px] border-b border-border/80 px-3.5 py-3 md:border-b-0 md:border-r">
              <LoopersSection
                onClick={
                  loopersModalEnabled
                    ? () => setIsLoopersModalOpen(true)
                    : undefined
                }
                state={loopers}
              />
            </div>

            <div className="min-w-0 max-w-full min-h-[94px] px-3.5 py-3">
              {period.status === "error" ? (
                <LoopSectionError
                  label="Period"
                  message={period.message}
                  onRetry={period.retry}
                />
              ) : (
                <LoopPeriodStat
                  compact
                  className="h-full"
                  isLoading={period.status === "loading"}
                  nextPeriodStart={periodData?.nextPeriodStart}
                  onCountdownComplete={periodData?.onCountdownComplete}
                  timerTitle={periodData?.timerTitle ?? "Entry closes in"}
                  onViewLoopers={() => setIsLoopersModalOpen(true)}
                  showLoopersTrigger={false}
                />
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-[10px] bg-muted/20 px-3.5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-baseline gap-2">
              <p className="shrink-0 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Eligibility:
              </p>
              {loop.eligibilityUrl && !eligibilityLinkDisabled ? (
                <Link
                  href={loop.eligibilityUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex min-w-0 max-w-full items-center gap-1.5 text-sm font-semibold leading-5 text-foreground transition-colors hover:text-primary focus:outline-none focus-visible:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <span className="line-clamp-2 min-w-0">
                    {eligibilityLabel}
                  </span>
                  <span className="grid w-0 shrink-0 overflow-hidden opacity-0 transition-all duration-200 group-hover:w-3.5 group-hover:opacity-100 group-focus-visible:w-3.5 group-focus-visible:opacity-100">
                    <LuExternalLink aria-hidden="true" className="size-3.5" />
                  </span>
                </Link>
              ) : (
                <p
                  aria-disabled={eligibilityLinkDisabled || undefined}
                  className={`min-w-0 line-clamp-2 text-sm font-semibold leading-5 ${
                    eligibilityLinkDisabled
                      ? "text-muted-foreground"
                      : "text-foreground"
                  }`}
                >
                  {eligibilityLabel}
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <PassportScoreBadge
                hasPassed={hasPassedShield}
                thresholdLabel={
                  shieldThreshold ? `+${shieldThreshold}` : loop.shieldScore
                }
                value={
                  shieldThreshold ? `+${shieldThreshold}` : loop.shieldScore
                }
              />
            </div>
          </div>

          {action}

          {/* Temporarily hidden until Loop Streaks is ready.
          {isConnected ? <LoopStreakSection /> : null} */}
        </div>

        {loopersModalEnabled ? (
          <LoopersModal
            chainId={loop.chainId}
            currentPeriod={modal.currentPeriod}
            eligibilityLogoUrl={loop.eligibilityLogoUrl}
            isOpen={isLoopersModalOpen}
            loopAddress={loop.address ?? "0x"}
            loopContractType={modal.loopContractType}
            loopIsSuper={isSuper}
            loopToken={modal.loopToken}
            loopTitle={loop.title}
            onOpenChange={setIsLoopersModalOpen}
            firstPeriodStart={modal.firstPeriodStart}
            periodLength={modal.periodLength}
            refreshKey={modal.refreshKey}
          />
        ) : null}
      </div>
    </TooltipProvider>
  )
}

function getSectionData<T>(state: SectionState<T>) {
  return state.status === "ready" || state.status === "refreshing"
    ? state.data
    : undefined
}

function getDistributionValue(state: SectionState<LoopDistributionViewData>) {
  if (state.status === "loading") return "Loading..."
  if (state.status === "error") return "--"
  return state.data.value
}

function PassportScoreBadge({
  hasPassed,
  thresholdLabel,
  value,
}: {
  hasPassed: boolean
  thresholdLabel: string
  value: string
}) {
  const ShieldIcon = hasPassed ? LuShieldCheck : LuShield
  const label = hasPassed
    ? "Shield Passed"
    : `This loop requires a Human Passport score of ${thresholdLabel}.`

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={[
            "relative inline-flex size-8 shrink-0 cursor-help items-center justify-center rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            hasPassed
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground",
          ].join(" ")}
          aria-label={label}
          role="button"
          tabIndex={0}
        >
          <ShieldIcon className="absolute inset-0 size-full fill-none stroke-[1.5]" />
          {hasPassed ? null : (
            <span className="relative font-mono text-[8px] font-bold leading-none tabular-nums">
              {value}
            </span>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

/* function LoopStreakSection() {
  return (
    <div className="flex min-h-11 items-center rounded-2xl bg-primary/5 px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="flex items-center gap-2">
        <LuFlame className="size-4 text-muted-foreground" aria-hidden="true" />
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          Loop Streaks
        </span>
        <span className="rounded-full border border-border/80 bg-background/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Soon
        </span>
      </div>
    </div>
  )
} */

function HeaderIconBadges({
  chainName,
  isSuper,
}: {
  chainName: string
  isSuper: boolean
}) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <div className="flex items-center gap-1 md:hidden">
        <LoopTypeBadge isSuper={isSuper} />
        <ChainIconBadge chainName={chainName} />
      </div>
      <div className="hidden items-center gap-1 md:flex">
        <LoopTypeBadge isSuper={isSuper} />
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <ChainIconBadge chainName={chainName} />
            </span>
          </TooltipTrigger>
          <TooltipContent>{chainName}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}

function ChainIconBadge({ chainName }: { chainName: string }) {
  return (
    <span
      aria-label={`${chainName} chain`}
      className="inline-flex size-[22px] shrink-0 items-center justify-center rounded-full border border-border/80 bg-background/45"
    >
      {CHAIN_ICON_SRC[chainName] ? (
        <Image
          src={CHAIN_ICON_SRC[chainName]}
          alt=""
          width={12}
          height={12}
          className="size-4 rounded-full"
        />
      ) : (
        <span className="size-2 rounded-full bg-primary/70" />
      )}
    </span>
  )
}

function SponsorBadgeMark({
  logoUrl,
  sponsorName,
}: {
  logoUrl: string
  sponsorName: string
}) {
  return (
    <div className="flex h-8 w-9 shrink-0 items-center justify-center rounded-xl bg-background/70 p-1">
      <Image
        src={logoUrl}
        alt={`${sponsorName} logo`}
        width={22}
        height={22}
        className="size-[22px] object-contain"
      />
    </div>
  )
}
