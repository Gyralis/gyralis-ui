"use client"

import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { LoopCardData } from "@/data/loops-data"
import { useQuery } from "@tanstack/react-query"
import {
  LuExternalLink,
  LuFlame,
  LuInfo,
  LuShield,
  LuShieldCheck,
} from "react-icons/lu"
import {
  RiLoopLeftFill,
  RiLoopRightFill as RiLoopRightAiFill,
} from "react-icons/ri"
import { useAccount } from "wagmi"

import { useClaimedUsers } from "@/lib/hooks/app/use-claimed-users"
import { usePeriodLogBlockRange } from "@/lib/hooks/app/use-period-log-block-range"
import { useRegisteredUsers } from "@/lib/hooks/app/use-registered-users"
import { cn, trimFormattedBalance } from "@/lib/utils"
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

import { LoopClaim } from "./loop-claim"
import {
  LoopDistributionStat,
  LoopPeriodStat,
  useLoopSettingsDetails,
} from "./loop-settings"
import { LoopersModal } from "./loopers-modal"

interface LoopCardProps {
  loop: LoopCardData
  onBalanceUpdate: (
    cardId: number,
    newBalance: number,
    newBalanceString: string
  ) => void
}

const CHAIN_ICON_SRC: Record<string, string> = {
  Base: "/icons/NetworkBaseTest.svg",
  Gnosis: "/icons/NetworkGnosis.svg",
}

const LoopCard: React.FC<LoopCardProps> = ({ loop, onBalanceUpdate }) => {
  void onBalanceUpdate
  const [isSponsorModalOpen, setIsSponsorModalOpen] = useState(false)
  const { isConnected } = useAccount()
  const passportScoreQuery = useGetScore({ enabled: isConnected })
  const isSuperLoop = loop.contractType === "superLoop" || Boolean(loop.super)
  const settingsDetails = useLoopSettingsDetails({
    address: loop.address ?? "0x",
    chainId: loop.chainId,
    contractType: loop.contractType,
    isSuper: isSuperLoop,
  })
  const loopersOverview = useLoopersPeriodOverview({
    address: loop.address ?? "0x",
    chainId: loop.chainId,
    currentPeriod: settingsDetails.currentPeriod,
    firstPeriodStart: settingsDetails.settings?.firstPeriodStart,
    isSuperLoop,
    periodLength: settingsDetails.settings?.periodLength,
    refreshKey: settingsDetails.modalRefreshKey,
  })
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

  return (
    <TooltipProvider>
      <div
        className={[
          "tamagotchi-card loop-card-shell font-body relative w-[560px] max-w-full rounded-[32px] p-[22px]",
          isSuperLoop ? "tamagotchi-card-superloop" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="relative z-10 space-y-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-center gap-1.5">
              {(loop.eligibilityLogoUrl || isSuperLoop) && (
                <div className="relative flex size-14 shrink-0 items-center justify-center rounded-full border border-border bg-background/70 p-2.5">
                  {loop.eligibilityLogoUrl ? (
                    <Image
                      src={loop.eligibilityLogoUrl}
                      alt={`${loop.eligibility} logo`}
                      width={32}
                      height={32}
                      className="size-8 object-contain"
                    />
                  ) : (
                    <span className="size-3.5 rounded-full bg-primary" />
                  )}
                  {isSuperLoop ? (
                    <div className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full border border-border bg-card p-[3px] shadow-[0_8px_20px_rgba(0,0,0,0.12)]">
                      <Image
                        src="/superfluid-logo.png"
                        alt="Superfluid logo"
                        width={14}
                        height={14}
                        className="size-3.5 object-contain"
                      />
                    </div>
                  ) : null}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="line-clamp-2 min-w-0 text-[1.35rem] leading-[1.05] text-foreground">
                    {loop.title}
                  </h2>
                  <HeaderIconBadges
                    chainName={loop.chainName}
                    isSuper={isSuperLoop}
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSponsorModalOpen(true)}
              className="flex min-h-[42px] w-full max-w-full items-center justify-center gap-1.5 rounded-full border border-border/80 bg-background px-2.5 py-1.5 text-left text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_8px_20px_-18px_rgba(15,23,42,0.16)] transition-all duration-200 hover:-translate-y-px hover:bg-background hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.78),0_12px_24px_-18px_rgba(15,23,42,0.22)] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:border-white/8 dark:bg-background dark:text-white/90 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_20px_-18px_rgba(0,0,0,0.72)] dark:hover:bg-background dark:hover:text-white dark:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_12px_24px_-18px_rgba(0,0,0,0.8)] md:w-[165px] md:justify-start"
            >
              <SponsorBadgeMark />
              <div className="min-w-0">
                <p className="text-[8px] font-semibold uppercase leading-none tracking-widest text-muted-foreground">
                  Sponsored by
                </p>
                <p className="mt-1 truncate text-[11px] font-semibold leading-none text-foreground">
                  1Hive
                </p>
              </div>
            </button>
          </div>

          <div className="h-px bg-border/80" />

          <div className="grid overflow-hidden rounded-2xl border border-border/80 bg-muted/20 md:grid-cols-[1fr_minmax(118px,0.72fr)_1fr]">
            <div className="min-h-[94px] border-b border-border/80 bg-primary/5 px-3.5 py-3 md:border-b-0 md:border-r">
              <LoopDistributionStat
                balanceDetail={settingsDetails.balanceDetail}
                balanceDetailLabel={settingsDetails.balanceDetailLabel}
                compact
                value={settingsDetails.distributionLabel}
                valueUnit={settingsDetails.distributionUnit}
                detail={settingsDetails.distributionDetail}
                tooltip={settingsDetails.distributionTooltip}
              />
            </div>

            <div className="min-h-[94px] border-b border-border/80 px-3.5 py-3 md:border-b-0 md:border-r">
              <LoopersColumnStat
                claimedCount={loopersOverview.claimedCount}
                claimRate={loopersOverview.claimRate}
                isLoading={loopersOverview.isLoading}
                onClick={() => settingsDetails.setIsLoopersModalOpen(true)}
                registeredCount={loopersOverview.registeredCount}
              />
            </div>

            <div className="min-h-[94px] px-3.5 py-3">
              <LoopPeriodStat
                compact
                className="h-full"
                isLoading={settingsDetails.isLoading}
                nextPeriodStart={settingsDetails.nextPeriodStart}
                timerTitle={settingsDetails.timerTitle}
                onViewLoopers={() =>
                  settingsDetails.setIsLoopersModalOpen(true)
                }
                showLoopersTrigger={false}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-[10px] bg-muted/20 px-3.5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Eligibility
              </p>
              <p className="mt-0.5 line-clamp-2 text-sm font-semibold leading-5 text-foreground">
                {eligibilityLabel}
              </p>
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

          <LoopClaim
            address={loop.address ?? "0x"}
            chainId={loop.chainId}
            contractType={loop.contractType}
            currentPeriod={settingsDetails.currentPeriod}
            eligibilityProvider={loop.eligibilityProvider}
            onStatusChange={settingsDetails.handleClaimStatusChange}
            onSuccess={settingsDetails.handleClaimSuccess}
          />

          {isConnected ? <LoopStreakSection /> : null}
        </div>

        <LoopersModal
          chainId={loop.chainId}
          currentPeriod={settingsDetails.currentPeriod}
          eligibilityLogoUrl={loop.eligibilityLogoUrl}
          isOpen={settingsDetails.isLoopersModalOpen}
          loopAddress={loop.address ?? "0x"}
          loopContractType={loop.contractType}
          loopIsSuper={isSuperLoop}
          loopToken={settingsDetails.settings?.token}
          loopTitle={loop.title}
          onOpenChange={settingsDetails.setIsLoopersModalOpen}
          firstPeriodStart={settingsDetails.settings?.firstPeriodStart}
          periodLength={settingsDetails.settings?.periodLength}
          refreshKey={settingsDetails.modalRefreshKey}
        />

        <SponsorModal
          isOpen={isSponsorModalOpen}
          historyLoopKey={loop.historyLoopKey}
          loopTitle={loop.title}
          onOpenChange={setIsSponsorModalOpen}
        />
      </div>
    </TooltipProvider>
  )
}

function useLoopersPeriodOverview({
  address,
  chainId,
  currentPeriod,
  firstPeriodStart,
  isSuperLoop,
  periodLength,
  refreshKey,
}: {
  address: `0x${string}`
  chainId: number
  currentPeriod?: bigint
  firstPeriodStart?: bigint
  isSuperLoop: boolean
  periodLength?: bigint
  refreshKey: number
}) {
  const periodRangesReady =
    isSuperLoop &&
    currentPeriod != null &&
    firstPeriodStart != null &&
    periodLength != null
  const registerWindowPeriod =
    currentPeriod != null && currentPeriod > 0n ? currentPeriod - 1n : 0n
  const registrationRange = usePeriodLogBlockRange({
    chainId,
    enabled: periodRangesReady,
    firstPeriodStart,
    periodLength,
    windowPeriod: registerWindowPeriod,
  })
  const claimRange = usePeriodLogBlockRange({
    chainId,
    enabled: periodRangesReady,
    firstPeriodStart,
    periodLength,
    windowPeriod: currentPeriod,
  })
  const registrationBlockRange =
    periodRangesReady &&
    registrationRange.fromBlock != null &&
    registrationRange.toBlock != null
      ? {
          fromBlock: registrationRange.fromBlock,
          toBlock: registrationRange.toBlock,
        }
      : undefined
  const claimBlockRange =
    periodRangesReady &&
    claimRange.fromBlock != null &&
    claimRange.toBlock != null
      ? {
          fromBlock: claimRange.fromBlock,
          toBlock: claimRange.toBlock,
        }
      : undefined
  const usersEnabled = !isSuperLoop || registrationBlockRange != null
  const claimsEnabled = !isSuperLoop || claimBlockRange != null
  const { users: registeredUsers, loading: loadingRegisteredUsers } =
    useRegisteredUsers(
      address,
      chainId,
      currentPeriod,
      refreshKey,
      usersEnabled,
      registrationBlockRange
    )
  const { users: claimedUsers, loading: loadingClaimedUsers } = useClaimedUsers(
    address,
    chainId,
    currentPeriod,
    refreshKey,
    claimsEnabled,
    claimBlockRange
  )
  const claimedUsersSet = React.useMemo(
    () => new Set(claimedUsers.map((user) => user.toLowerCase())),
    [claimedUsers]
  )
  const claimedCount = React.useMemo(
    () =>
      registeredUsers.filter((address) =>
        claimedUsersSet.has(address.toLowerCase())
      ).length,
    [claimedUsersSet, registeredUsers]
  )
  const registeredCount = registeredUsers.length
  const claimRate =
    registeredCount > 0 ? Math.round((claimedCount / registeredCount) * 100) : 0

  return {
    claimedCount,
    claimRate: Math.max(0, Math.min(claimRate, 100)),
    isLoading:
      registrationRange.loading ||
      claimRange.loading ||
      loadingRegisteredUsers ||
      loadingClaimedUsers,
    registeredCount,
  }
}

function LoopersColumnStat({
  claimedCount,
  claimRate,
  isLoading,
  onClick,
  registeredCount,
}: {
  claimedCount: number
  claimRate: number
  isLoading: boolean
  onClick: () => void
  registeredCount: number
}) {
  const hasLoopers = registeredCount > 0
  const ringValue = isLoading ? 0 : claimRate
  const radius = 25
  const circumference = 2 * Math.PI * radius
  const strokeOffset = circumference - (ringValue / 100) * circumference

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex size-full flex-col rounded-xl p-0 text-center transition-colors hover:bg-background/45 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
    >
      <span className="sr-only">
        View loopers. {claimedCount} claimed of {registeredCount} registered.
      </span>
      <p className="w-full text-center text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground transition-colors group-hover:text-primary">
        Loopers
      </p>
      <div className="relative mx-auto mt-2 flex size-[62px] items-center justify-center">
        <svg
          className="absolute inset-0 size-full -rotate-90"
          viewBox="0 0 64 64"
          aria-hidden="true"
        >
          <circle
            cx="32"
            cy="32"
            fill="none"
            r={radius}
            stroke="hsl(var(--border))"
            strokeWidth="5"
          />
          <circle
            cx="32"
            cy="32"
            fill="none"
            r={radius}
            stroke="hsl(var(--primary))"
            strokeDasharray={circumference}
            strokeDashoffset={strokeOffset}
            strokeLinecap="round"
            strokeWidth="5"
            className="transition-[stroke-dashoffset] duration-500 ease-out"
          />
        </svg>
        <span
          className={cn(
            "relative flex flex-col items-center justify-center font-mono leading-none",
            hasLoopers ? "text-foreground" : "text-muted-foreground"
          )}
        >
          <span className="text-sm font-bold">
            {isLoading ? "--" : claimedCount}
          </span>
          <span className="mt-1 text-[10px] text-muted-foreground">
            /{isLoading ? "--" : registeredCount}
          </span>
        </span>
      </div>
    </button>
  )
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
          className="relative inline-flex size-10 shrink-0 cursor-help items-center justify-center rounded-full text-primary drop-shadow-[0_0_8px_rgba(28,231,131,0.48)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/10 hover:drop-shadow-[0_0_14px_rgba(28,231,131,0.64)] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label={label}
          role="button"
          tabIndex={0}
        >
          <ShieldIcon className="absolute inset-0 size-full fill-none stroke-[1.8]" />
          {hasPassed ? null : (
            <span className="relative translate-y-[-0.5px] font-mono text-[10px] font-black leading-none tabular-nums">
              {value}
            </span>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function LoopStreakSection() {
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
}

function HeaderIconBadges({
  chainName,
  isSuper,
}: {
  chainName: string
  isSuper: boolean
}) {
  const loopLabel = isSuper ? "SuperLoop" : "Loop"
  const plainBadges = (
    <>
      <LoopTypeIconBadge isSuper={isSuper} label={loopLabel} />
      <ChainIconBadge chainName={chainName} />
    </>
  )

  return (
    <div className="flex shrink-0 items-center gap-1">
      <div className="flex items-center gap-1 md:hidden">{plainBadges}</div>
      <div className="hidden items-center gap-1 md:flex">
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <LoopTypeIconBadge isSuper={isSuper} label={loopLabel} />
            </span>
          </TooltipTrigger>
          <TooltipContent>{loopLabel}</TooltipContent>
        </Tooltip>
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

function LoopTypeIconBadge({
  isSuper,
  label,
}: {
  isSuper: boolean
  label: string
}) {
  const Icon = isSuper ? RiLoopRightAiFill : RiLoopLeftFill

  return (
    <span
      aria-label={label}
      className={[
        "inline-flex size-[22px] shrink-0 items-center justify-center rounded-full",
        isSuper
          ? "text-primary"
          : "border border-border/80 bg-background/45 text-foreground",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Icon className="size-4" />
    </span>
  )
}

function ChainIconBadge({ chainName }: { chainName: string }) {
  return (
    <span
      aria-label={`${chainName} chain`}
      className="inline-flex size-[22px] shrink-0 items-center justify-center rounded-full border border-border/80 bg-background/45"
    >
      <ChainIcon chainName={chainName} />
    </span>
  )
}

function ChainIcon({ chainName }: { chainName: string }) {
  return CHAIN_ICON_SRC[chainName] ? (
    <Image
      src={CHAIN_ICON_SRC[chainName]}
      alt=""
      width={12}
      height={12}
      className="size-4 rounded-full"
    />
  ) : (
    <span className="size-2 rounded-full bg-primary/70" />
  )
}

function SponsorBadgeMark({ large = false }: { large?: boolean }) {
  return (
    <div
      className={
        large
          ? "mx-auto flex size-16 items-center justify-center rounded-2xl bg-background/45 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
          : "flex size-8 shrink-0 items-center justify-center rounded-full bg-background/70 p-1"
      }
    >
      <Image
        src="/1Hive-logo.png"
        alt="1Hive logo"
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
  historyLoopKey,
  isOpen,
  loopTitle,
  onOpenChange,
}: {
  historyLoopKey: LoopCardData["historyLoopKey"]
  isOpen: boolean
  loopTitle: string
  onOpenChange: (open: boolean) => void
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
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
  })

  const uniqueUsersLabel = formatIntegerStat(data?.stats.uniqueUsers)
  const claimsLabel = formatIntegerStat(data?.stats.claims)
  const distributedLabel = formatDistributedStat(
    data?.stats.distributedAmount,
    data?.stats.tokenSymbol
  )
  const claimRateLabel = formatClaimRateStat(
    data?.stats.claims,
    data?.stats.registrations
  )
  const snapshotDateLabel = formatSnapshotDate(data?.snapshotDate)
  const stats = [
    { label: "Unique Users", value: uniqueUsersLabel },
    { label: "Claims", value: claimsLabel },
    { label: "Claim Rate", value: claimRateLabel },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px] rounded-[28px] border-border/80 bg-card p-6 text-card-foreground shadow-[0_28px_90px_-48px_rgba(0,0,0,0.55)]">
        <div className="space-y-5 text-center">
          <div className="space-y-3">
            <SponsorBadgeMark large />
            <div>
              <DialogTitle className="text-center text-2xl leading-none text-foreground">
                <Link
                  href="https://1hive.org"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <span>1Hive</span>
                  <LuExternalLink className="size-4 text-muted-foreground" />
                </Link>
              </DialogTitle>
              <DialogDescription className="mt-2 text-center text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Sponsor of {loopTitle} Loop
              </DialogDescription>
            </div>
          </div>

          <div className="rounded-2xl border border-border/80 bg-background/45 px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Total Distributed
            </p>
            {isLoading ? (
              <div className="mt-3 flex flex-col items-center gap-2">
                <Skeleton className="h-10 w-36 rounded-full bg-muted-foreground/15" />
              </div>
            ) : (
              <p className="mt-2 font-mono text-[2.35rem] font-bold leading-none text-primary">
                {distributedLabel}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {stats.map((stat) => (
              <HighlightStatCard
                key={stat.label}
                title={stat.label}
                value={isLoading ? "..." : stat.value}
                size="compact"
                bordered
                className="min-h-[84px]"
              />
            ))}
          </div>

          {isError ? (
            <p className="text-xs text-muted-foreground">
              We couldn&apos;t load the latest sponsor stats right now.
            </p>
          ) : (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <LuInfo className="size-3.5 shrink-0" aria-hidden="true" />
              <span>Latest history snapshot</span>
              <span>{snapshotDateLabel}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
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

export default LoopCard
