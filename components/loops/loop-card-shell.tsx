"use client"

import { useState, type ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import type { LoopCardData } from "@/data/loops-data"
import { useQuery } from "@tanstack/react-query"
import {
  LuExternalLink,
  // LuFlame,
  LuInfo,
  LuShield,
  LuShieldCheck,
} from "react-icons/lu"
import { useAccount } from "wagmi"

import type { LoopContractType } from "@/lib/contracts/loop-contracts"
import { trimFormattedBalance } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { HighlightStatCard } from "@/components/stats/highlight-stat-card"
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
}

export function LoopCardShell({
  action,
  distribution,
  isSuper,
  loop,
  loopers,
  loopersModalEnabled = true,
  modal,
  period,
}: LoopCardShellProps) {
  const [isLoopersModalOpen, setIsLoopersModalOpen] = useState(false)
  const [isSponsorModalOpen, setIsSponsorModalOpen] = useState(false)
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
    loop.sponsorName && loop.sponsorLogoUrl && loop.sponsorUrl
      ? {
          logoUrl: loop.sponsorLogoUrl,
          name: loop.sponsorName,
          url: loop.sponsorUrl,
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
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between ">
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
              <button
                type="button"
                onClick={() => setIsSponsorModalOpen(true)}
                className="flex min-h-[42px] w-full max-w-full items-center justify-center gap-1 rounded-full border border-border/80 bg-background px-2.5 py-1.5 text-left text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_8px_20px_-18px_rgba(15,23,42,0.16)] transition-all duration-200 hover:-translate-y-px hover:bg-background hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.78),0_12px_24px_-18px_rgba(15,23,42,0.22)] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:border-white/8 dark:bg-background dark:text-white/90 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_20px_-18px_rgba(0,0,0,0.72)] dark:hover:bg-background dark:hover:text-white dark:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_12px_24px_-18px_rgba(0,0,0,0.8)] md:w-[165px] md:justify-start"
              >
                <SponsorBadgeMark
                  logoUrl={sponsor.logoUrl}
                  sponsorName={sponsor.name}
                />
                <div className="min-w-0">
                  <p className="text-[8px] font-semibold uppercase leading-none tracking-widest text-muted-foreground">
                    Sponsored by
                  </p>
                  <p className="mt-1 truncate text-[11px] font-semibold leading-none text-foreground">
                    {sponsor.name}
                  </p>
                </div>
              </button>
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
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Eligibility
              </p>
              {loop.eligibilityUrl ? (
                <Link
                  href={loop.eligibilityUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-0.5 inline-flex max-w-full items-center gap-1.5 text-sm font-semibold leading-5 text-foreground transition-colors hover:text-primary focus:outline-none focus-visible:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <span className="line-clamp-2 min-w-0">
                    {eligibilityLabel}
                  </span>
                  <span className="grid w-0 shrink-0 overflow-hidden opacity-0 transition-all duration-200 group-hover:w-3.5 group-hover:opacity-100 group-focus-visible:w-3.5 group-focus-visible:opacity-100">
                    <LuExternalLink aria-hidden="true" className="size-3.5" />
                  </span>
                </Link>
              ) : (
                <p className="mt-0.5 line-clamp-2 text-sm font-semibold leading-5 text-foreground">
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

        {sponsor ? (
          <SponsorModal
            hardcodeZeroStats={sponsor.name.toLowerCase().includes("markee")}
            isOpen={isSponsorModalOpen}
            historyLoopKey={loop.historyLoopKey}
            loopContractType={loop.contractType}
            loopTitle={loop.title}
            onOpenChange={setIsSponsorModalOpen}
            sponsorLogoUrl={sponsor.logoUrl}
            sponsorName={sponsor.name}
            sponsorUrl={sponsor.url}
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
  large = false,
  logoUrl,
  sponsorName,
}: {
  large?: boolean
  logoUrl: string
  sponsorName: string
}) {
  return (
    <div
      className={
        large
          ? "mx-auto flex size-16 items-center justify-center rounded-2xl bg-background/45 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
          : "flex h-8 w-9 shrink-0 items-center justify-center rounded-xl bg-background/70 p-1"
      }
    >
      <Image
        src={logoUrl}
        alt={`${sponsorName} logo`}
        width={large ? 42 : 22}
        height={large ? 42 : 22}
        className={
          large ? "size-11 object-contain" : "size-[22px] object-contain"
        }
      />
    </div>
  )
}

function SponsorModal({
  hardcodeZeroStats = false,
  historyLoopKey,
  isOpen,
  loopContractType,
  loopTitle,
  onOpenChange,
  sponsorLogoUrl,
  sponsorName,
  sponsorUrl,
}: {
  hardcodeZeroStats?: boolean
  historyLoopKey: LoopCardData["historyLoopKey"]
  isOpen: boolean
  loopContractType: LoopContractType
  loopTitle: string
  onOpenChange: (open: boolean) => void
  sponsorLogoUrl: string
  sponsorName: string
  sponsorUrl: string
}) {
  const { data, isLoading, isError } = useQuery<{
    success: boolean
    snapshotDate: string | null
    recordedAt: string | null
    stats: {
      loopName: string | null
      uniqueUsers: number
      claims: number
      registrations: number
      distributedAmount: string | null
      tokenSymbol: string | null
    }
  }>({
    queryKey: ["loop-history-sponsor-stats", historyLoopKey],
    queryFn: async () => {
      const response = await fetch(`/api/loops/history/${historyLoopKey}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch sponsor stats for ${historyLoopKey}`)
      }
      return response.json()
    },
    enabled: isOpen && !hardcodeZeroStats,
    staleTime: 5 * 60 * 1000,
  })
  const displayedStats = hardcodeZeroStats
    ? {
        claims: 0,
        distributedAmount: "0",
        registrations: 0,
        tokenSymbol: null,
        uniqueUsers: 0,
      }
    : data?.stats
  const modalIsLoading = !hardcodeZeroStats && isLoading
  const modalIsError = !hardcodeZeroStats && isError
  const stats = [
    {
      label: "Unique Users",
      value: formatIntegerStat(displayedStats?.uniqueUsers),
    },
    { label: "Claims", value: formatIntegerStat(displayedStats?.claims) },
    {
      label: "Claim Rate",
      value: formatClaimRateStat(
        displayedStats?.claims,
        displayedStats?.registrations
      ),
    },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px] rounded-[28px] border-border/80 bg-card p-6 text-card-foreground shadow-[0_28px_90px_-48px_rgba(0,0,0,0.55)]">
        <div className="space-y-5 text-center">
          <div className="space-y-3">
            <SponsorBadgeMark
              large
              logoUrl={sponsorLogoUrl}
              sponsorName={sponsorName}
            />
            <div>
              <DialogTitle className="text-center text-2xl leading-none text-foreground">
                <Link
                  href={sponsorUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <span>{sponsorName}</span>
                  <LuExternalLink className="size-4 text-muted-foreground" />
                </Link>
              </DialogTitle>
              <DialogDescription className="mt-2 text-center text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Sponsor of{" "}
                {formatSponsoredLoopTitle(loopTitle, loopContractType)}
              </DialogDescription>
            </div>
          </div>

          <div className="rounded-2xl border border-border/80 bg-background/45 px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Total Distributed
            </p>
            {modalIsLoading ? (
              <div className="mt-3 flex flex-col items-center gap-2">
                <Skeleton className="h-10 w-36 rounded-full bg-muted-foreground/15" />
              </div>
            ) : (
              <p className="mt-2 font-mono text-[2.35rem] font-bold leading-none text-primary">
                {formatDistributedStat(
                  displayedStats?.distributedAmount,
                  displayedStats?.tokenSymbol
                )}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {stats.map((stat) => (
              <HighlightStatCard
                key={stat.label}
                title={stat.label}
                value={modalIsLoading ? "..." : stat.value}
                size="compact"
                bordered
                className="min-h-[84px]"
              />
            ))}
          </div>

          {modalIsError ? (
            <p className="text-xs text-muted-foreground">
              We couldn&apos;t load the latest sponsor stats right now.
            </p>
          ) : hardcodeZeroStats ? null : (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <LuInfo className="size-3.5 shrink-0" aria-hidden="true" />
              <span>Latest history snapshot</span>
              <span>{formatSnapshotDate(data?.snapshotDate)}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function formatSponsoredLoopTitle(
  loopTitle: string,
  loopContractType: LoopContractType
) {
  const titleWithoutType = loopTitle.replace(/\s+(?:superloop|loop)$/i, "")
  const loopType = loopContractType === "superLoop" ? "SuperLoop" : "Loop"

  return `${titleWithoutType} ${loopType}`
}

function formatIntegerStat(value: number | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "0"
  return new Intl.NumberFormat("en-US").format(value)
}

function formatDistributedStat(
  amount: string | null | undefined,
  tokenSymbol: string | null | undefined
) {
  if (!amount) return tokenSymbol ? `0 ${tokenSymbol}` : "0"
  const trimmed = trimFormattedBalance(amount, 3)
  return tokenSymbol ? `${trimmed} ${tokenSymbol}` : trimmed
}

function formatClaimRateStat(
  claims: number | undefined,
  registrations: number | undefined
) {
  if (
    typeof claims !== "number" ||
    !Number.isFinite(claims) ||
    typeof registrations !== "number" ||
    !Number.isFinite(registrations) ||
    registrations <= 0
  ) {
    return "0%"
  }
  return `${((claims / registrations) * 100).toFixed(1)}%`
}

function formatSnapshotDate(snapshotDate: string | null | undefined) {
  if (!snapshotDate) return "No snapshot date"
  const parsed = new Date(`${snapshotDate}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime())) return snapshotDate

  return parsed.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })
}
