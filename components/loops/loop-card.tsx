"use client"

import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import scoringConfig from "@/config/scoring.json"
import { LoopCardData } from "@/data/loops-data"
import type { IconType } from "react-icons"
import { BsFire } from "react-icons/bs"
import { HiMiniFire } from "react-icons/hi2"
import { ImFire } from "react-icons/im"
import { LuExternalLink, LuRepeat2, LuShield, LuZap } from "react-icons/lu"
import { RiFireLine } from "react-icons/ri"
import { useAccount } from "wagmi"

import { useClaimedUsers } from "@/lib/hooks/app/use-claimed-users"
import { usePeriodLogBlockRange } from "@/lib/hooks/app/use-period-log-block-range"
import { useRegisteredUsers } from "@/lib/hooks/app/use-registered-users"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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
const STREAK_MILESTONES = scoringConfig.streakBonuses
  .map((bonus) => bonus.streak)
  .sort((a, b) => a - b)
const STREAK_BONUSES_BY_STREAK = new Map(
  scoringConfig.streakBonuses.map((bonus) => [bonus.streak, bonus.points])
)
const PLACEHOLDER_CURRENT_STREAK = 1

const LoopCard: React.FC<LoopCardProps> = ({ loop, onBalanceUpdate }) => {
  void onBalanceUpdate
  const [isSponsorModalOpen, setIsSponsorModalOpen] = useState(false)
  const { isConnected } = useAccount()
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
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
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
                <div className="flex items-center gap-1.5">
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
                compact
                value={settingsDetails.distributionLabel}
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
              <p className="mt-0.5 line-clamp-2 text-sm font-semibold leading-5 text-primary">
                {eligibilityLabel}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <PassportScoreBadge
                value={shieldThreshold ? `+${shieldThreshold}` : loop.shieldScore}
              />
            </div>
          </div>

          <LoopClaim
            address={loop.address ?? "0x"}
            chainId={loop.chainId}
            contractType={loop.contractType}
            eligibilityProvider={loop.eligibilityProvider}
            onStatusChange={settingsDetails.handleClaimStatusChange}
            onSuccess={settingsDetails.handleClaimSuccess}
          />

          {isConnected ? <div className="h-px bg-border/80" /> : null}

          {isConnected ? (
            <LoopStreakBadge currentStreak={PLACEHOLDER_CURRENT_STREAK} />
          ) : null}
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

function PassportScoreBadge({ value }: { value: string }) {
  return (
    <div
      className="relative inline-flex size-10 shrink-0 items-center justify-center text-primary"
      aria-label={`Passport score ${value}`}
      title={`Passport score ${value}`}
    >
      <LuShield className="absolute inset-0 size-full fill-primary/10 stroke-[1.8]" />
      <span className="relative pt-0.5 font-mono text-[10px] font-black leading-none tabular-nums">
        {value}
      </span>
    </div>
  )
}

function LoopStreakBadge({ currentStreak }: { currentStreak: number }) {
  const nextMilestone =
    STREAK_MILESTONES.find((milestone) => currentStreak < milestone) ??
    STREAK_MILESTONES[STREAK_MILESTONES.length - 1] ??
    currentStreak
  const progressValue =
    nextMilestone > 0
      ? Math.min(100, Math.round((currentStreak / nextMilestone) * 100))
      : 100
  const nextMilestonePoints =
    STREAK_BONUSES_BY_STREAK.get(nextMilestone) ?? 0
  const tier = getStreakTier(currentStreak)
  const goalTier = getStreakTier(nextMilestone)
  const FlameIcon = tier.icon
  const GoalIcon = goalTier.icon

  return (
    <div className="rounded-2xl bg-primary/5 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="flex items-center gap-3">
        <div className="flex shrink-0 items-center gap-2">
          <FlameIcon
            className={cn(
              "size-5 text-primary transition-all duration-300",
              tier.glowClass
            )}
            aria-hidden="true"
          />
          <div className="leading-none">
            <span className="block font-mono text-2xl font-bold leading-none text-primary tabular-nums">
              {currentStreak}
            </span>
            <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.12em] text-primary">
              Current
              <span className="block">Streak</span>
            </span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="h-2.5 overflow-hidden rounded-full bg-primary/12">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,hsl(var(--primary)),#4ade80)] transition-[width] duration-500"
              style={{ width: `${progressValue}%` }}
            />
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-center text-center leading-none">
          <div className="flex items-center gap-1.5">
            <span className="block font-mono text-xl font-bold text-muted-foreground tabular-nums">
              {nextMilestone}
            </span>
            <GoalIcon
              className="size-5 text-muted-foreground/70 transition-all duration-300"
              aria-hidden="true"
            />
          </div>
          <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground/80">
            +{nextMilestonePoints} points
          </span>
        </div>
      </div>
    </div>
  )
}

function getStreakTier(streak: number): { icon: IconType; glowClass: string } {
  if (streak >= 30) {
    return {
      icon: ImFire,
      glowClass: "drop-shadow-[0_0_9px_rgba(251,146,60,0.75)]",
    }
  }

  if (streak >= 14) {
    return {
      icon: BsFire,
      glowClass: "scale-110 drop-shadow-[0_0_7px_rgba(122,223,58,0.58)]",
    }
  }

  if (streak >= 7) {
    return {
      icon: BsFire,
      glowClass: "drop-shadow-[0_0_5px_rgba(28,231,131,0.48)]",
    }
  }

  if (streak >= 3) {
    return {
      icon: HiMiniFire,
      glowClass: "drop-shadow-[0_0_4px_rgba(28,231,131,0.36)]",
    }
  }

  if (streak >= 2) {
    return {
      icon: RiFireLine,
      glowClass: "opacity-85 drop-shadow-[0_0_4px_rgba(28,231,131,0.3)]",
    }
  }

  if (streak >= 1) {
    return {
      icon: RiFireLine,
      glowClass: "opacity-65 drop-shadow-[0_0_3px_rgba(28,231,131,0.2)]",
    }
  }

  return {
    icon: RiFireLine,
    glowClass: "opacity-40",
  }
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
  const Icon = isSuper ? LuZap : LuRepeat2

  return (
    <span
      aria-label={label}
      className={[
        "inline-flex size-[22px] shrink-0 items-center justify-center rounded-full border",
        isSuper
          ? "border-primary/25 bg-primary/10 text-primary"
          : "border-border/80 bg-background/45 text-muted-foreground",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Icon className="size-3" />
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
      className="size-3 rounded-full"
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
  isOpen,
  loopTitle,
  onOpenChange,
}: {
  isOpen: boolean
  loopTitle: string
  onOpenChange: (open: boolean) => void
}) {
  const stats = [
    { label: "Unique", value: "184" },
    { label: "Claims", value: "326" },
    { label: "Distributed", value: "1,125 HNY" },
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
                  1Hive
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
              Total sponsored
            </p>
            <p className="mt-2 font-mono text-[2.35rem] font-bold leading-none text-primary">
              2,500 HNY
            </p>
          </div>

          <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-border/80 bg-background/35">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={[
                  "px-3 py-3",
                  index < stats.length - 1 ? "border-r border-border/70" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <p className="font-mono text-lg font-bold leading-none text-foreground">
                  {stat.value}
                </p>
                <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default LoopCard
