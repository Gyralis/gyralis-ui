import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { FaBolt, FaCheck, FaInfoCircle, FaTimes } from "react-icons/fa"
import { FaFire } from "react-icons/fa6"
import type { IconType } from "react-icons"

import { scoringConfig } from "@/lib/scoring/config"
import {
  ProfileLoopStats,
  ProfilePageData,
} from "@/lib/profile/get-profile-page-data"
import { cn } from "@/lib/utils"
import {
  getAchievementLoopStatuses,
  getNextStreakMilestone,
  type AchievementLoopStatus,
} from "@/lib/profile/profile-opportunities"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { StreakMilestoneIcon } from "@/components/loops/streak-milestone-icon"
import { ProfileWalletAddressSync } from "@/components/profile/profile-wallet-address-sync"
import { AchievementNextBonus } from "@/components/profile/achievement-next-bonus"
import { ProfileExploreLoops } from "@/components/profile/profile-explore-loops"
import { StreakPointsInfo } from "@/components/profile/streak-points-info"
import { ProfileDetails } from "@/components/profile/profile-details"
import { ProfileLevelsInfo } from "@/components/profile/profile-levels-info"
import { ProfileUpdatedTime } from "@/components/profile/profile-updated-time"
import { ProfileLevelProgress } from "@/components/profile/profile-level-progress"
import { ProfileClaimRate, ProfileClaimRateSkeleton } from "@/components/profile/profile-claim-rate"
import { getProfileLevel } from "@/lib/profile/profile-level"

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value)
}

function getLoopInitial(loop: ProfileLoopStats) {
  return loop.metadata.title.trim().charAt(0).toUpperCase() || "#"
}

function getLoopAvatarClassName(loop: ProfileLoopStats) {
  const title = loop.metadata.title.toLowerCase()

  if (title.includes("blockscout")) return "from-[#7c4dff] to-[#4f6bff]"
  if (title.includes("1hive")) return "from-[#29e080] to-[#22d46f]"
  if (title.includes("markee")) return "from-[#ff8a4c] to-[#ec5f90]"
  if (title.includes("true")) return "from-[#24d7a0] to-[#705cff]"

  return "from-primary to-secondary"
}

function getEarnedLoopsForMilestone(
  loops: ProfileLoopStats[],
  streak: number
) {
  return loops.filter((loop) =>
    hasEarnedStreakBonus(loop, streak)
  )
}

function hasEarnedStreakBonus(loop: ProfileLoopStats, streak: number) {
  return loop.earnedStreakBonuses.some((bonus) => bonus.streak === streak)
}

function getLoopTotals(loops: ProfileLoopStats[]) {
  return loops.reduce(
    (acc, loop) => ({
      claims: acc.claims + loop.totalClaims,
      claimPoints: acc.claimPoints + loop.claimPoints,
      streakPoints: acc.streakPoints + loop.streakBonusPoints,
      totalPoints: acc.totalPoints + loop.totalPoints,
      longestStreak: Math.max(acc.longestStreak, loop.longestStreak),
    }),
    {
      claims: 0,
      claimPoints: 0,
      streakPoints: 0,
      totalPoints: 0,
      longestStreak: 0,
    }
  )
}

function getLooperLevelProgress(totalPoints: number) {
  return getProfileLevel(totalPoints)
}

export function ProfilePageView({ data }: { data: ProfilePageData }) {
  const totals = getLoopTotals(data.loopStats)

  return (
    <div className="px-4 py-8 sm:py-12">
      <ProfileWalletAddressSync />
      <div className="mx-auto flex min-w-0 w-full max-w-6xl flex-col gap-6">
        <ProfileHeader data={data} />

        {!data.hasActivity ? (
          <section className="rounded-3xl border border-dashed border-border bg-card/80 p-8 text-center">
            <h2 className="font-heading text-2xl font-bold">
              No loop activity yet
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-xs text-muted-foreground sm:text-sm">
              No scored claims for this wallet yet. Start claiming in a loop
              to earn points and unlock streak bonuses.
            </p>
            <Link
              href="/loops"
              className="tamagotchi-button mt-6 inline-flex min-h-12 items-center px-6 text-sm"
            >
              Explore loops
            </Link>
          </section>
        ) : (
          <div className="grid min-w-0 grid-cols-1 gap-6">
            <Card className="rounded-3xl border-border/70 bg-card text-card-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.10),inset_0_-1px_0_rgba(0,0,0,0.05),0_8px_32px_rgba(28,231,131,0.06),0_4px_16px_rgba(140,75,255,0.04),0_2px_8px_rgba(0,0,0,0.08)] min-w-0 max-w-full">
              <CardContent className="p-5 sm:p-8">
                <div className="mb-5 sm:mb-7">
                  <div className="flex items-baseline justify-between gap-3 sm:items-end sm:gap-4">
                    <h2 className="min-w-0 font-heading text-xl font-bold leading-tight text-foreground sm:text-3xl">
                      Your GP per Loop
                    </h2>
                    <div className="flex w-fit shrink-0 items-baseline gap-1.5 sm:items-end sm:gap-3 sm:justify-end">
                      <p className="text-2xl font-bold leading-none tracking-tight text-foreground tabular-nums sm:text-4xl">
                        {formatNumber(totals.totalPoints)}
                      </p>
                      <span className="text-xs font-medium text-muted-foreground sm:hidden">GP</span>
                      <p className="hidden flex-col gap-1 pb-0.5 text-left text-[10px] font-bold uppercase leading-none tracking-[0.16em] text-muted-foreground sm:flex">
                        <span>Gyra</span>
                        <span>Points</span>
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 max-w-2xl text-[10px] leading-relaxed text-muted-foreground sm:text-sm">
                    Claim points, streak bonuses, and total GP per loop.
                  </p>
                </div>

                <LoopActivityTable loops={data.loopStats} />
              </CardContent>
            </Card>
          </div>
        )}
        <AchievementsSection data={data} />
        <ProfileExploreLoops loops={data.loopStats} />
      </div>
    </div>
  )
}

function AchievementsSection({ data }: { data: ProfilePageData }) {
  const milestones = scoringConfig.streakBonuses.map((milestone) => ({
    ...milestone,
    loopStatuses: getAchievementLoopStatuses(data.loopStats, milestone.streak),
  }))
  const activeBonuses = milestones.flatMap((milestone) =>
    milestone.loopStatuses.filter((loop) => loop.active)
  )
  const earnedCount = activeBonuses.filter((loop) => loop.earned).length
  const earnedLabel =
    activeBonuses.length > 0
      ? `${earnedCount} of ${activeBonuses.length} bonuses earned`
      : "No loops available"

  return (
    <Card className="rounded-3xl border-border/70 bg-card text-card-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.10),inset_0_-1px_0_rgba(0,0,0,0.05),0_8px_32px_rgba(28,231,131,0.06),0_4px_16px_rgba(140,75,255,0.04),0_2px_8px_rgba(0,0,0,0.08)]">
      <CardContent className="p-8">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-0.5 sm:grid-cols-[auto_auto_minmax(0,1fr)] sm:items-center sm:gap-x-2">
          <h2 className="col-start-1 row-start-1 min-w-0 font-heading text-lg font-bold text-foreground sm:text-3xl">
            Your achievements
          </h2>
          <span className="col-start-2 row-start-1 inline-flex">
            <StreakPointsInfo />
          </span>

          <Badge
            variant="outline"
            className="w-fit col-start-1 row-start-2 rounded-full border-primary/25 bg-primary/10 px-2 py-1 !text-[10px] font-bold text-primary sm:col-start-3 sm:row-start-1 sm:justify-self-end sm:px-3 sm:!text-xs"
          >
            {earnedLabel}
          </Badge>
        </div>
        <p className="mt-2 max-w-2xl text-xs text-muted-foreground sm:text-sm">
          Explore completed streak bonuses and points earned across loops.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {milestones.map((milestone) => {
            const earnedLoops = getEarnedLoopsForMilestone(
              data.loopStats,
              milestone.streak
            )
            return (
              <AchievementBonusCard
                key={milestone.streak}
                streak={milestone.streak}
                rewardPoints={milestone.points}
                creditedPoints={earnedLoops.length * milestone.points}
                loops={data.loopStats}
                loopStatuses={milestone.loopStatuses}
              />
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function AchievementBonusCard({
  streak,
  rewardPoints,
  creditedPoints,
  loops,
  loopStatuses,
}: {
  streak: number
  rewardPoints: number
  creditedPoints: number
  loops: ProfileLoopStats[]
  loopStatuses: AchievementLoopStatus[]
}) {
  const earned = loopStatuses.some((loop) => loop.earned)
  const activeLoops = loopStatuses.filter((loop) => loop.active)
  const earnedActiveCount = activeLoops.filter((loop) => loop.earned).length
  const progress = activeLoops.length > 0
    ? (earnedActiveCount / activeLoops.length) * 100
    : 0
  const nextBonusLoops = loops.filter(
    (loop) =>
      activeLoops.some(
        (active) => active.key === `${loop.chainId}-${loop.loopId}`
      ) &&
      getNextStreakMilestone(loop)?.streak === streak
  )

  const card = (
    <Card
      tabIndex={0}
      role="group"
      aria-label={`View loop streak status for the ${streak}-claim streak bonus`}
      className={cn(
        "flex cursor-pointer flex-col overflow-hidden rounded-3xl border bg-card/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_34px_-28px_hsl(var(--foreground)/0.32)] outline-none transition-all duration-200 hover:border-border hover:bg-card focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
        earned
          ? "border-border/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_12px_34px_-28px_hsl(var(--foreground)/0.32)]"
          : "border-border/70 opacity-75"
      )}
    >
      <div
        className={cn(
          "flex h-[92px] shrink-0 items-center justify-center",
          earned
            ? "bg-[linear-gradient(135deg,hsl(var(--primary)/0.14)_0%,hsl(var(--secondary)/0.10)_48%,hsl(var(--muted)/0.42)_100%)]"
            : "bg-[linear-gradient(135deg,hsl(var(--muted)/0.58)_0%,hsl(var(--muted)/0.28)_100%)]"
        )}
      >
        <div
          className={cn(
            "flex size-12 items-center justify-center rounded-2xl border shadow-[inset_0_1px_0_rgba(255,255,255,0.20)]",
            earned
              ? "border-primary/25 bg-primary/10 text-primary"
              : "border-border bg-background/50 text-muted-foreground"
          )}
        >
          <StreakMilestoneIcon
            streak={streak}
            glowing={earned}
            disabled={!earned}
            className="size-5"
          />
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col gap-5 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-heading text-base font-bold leading-tight text-foreground">
              {streak}-claim streak
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              +{rewardPoints} GP per loop
            </p>
          </div>
          <span className="shrink-0 pt-0.5 text-[11px] font-medium text-muted-foreground">
            {activeLoops.length > 0
              ? `${earnedActiveCount}/${activeLoops.length} loops`
              : "No loops available"}
          </span>
        </div>

        {earned && nextBonusLoops.length > 0 ? (
          <Suspense fallback={<Skeleton className="h-10 w-full rounded-lg" />}>
            <AchievementNextBonus loops={nextBonusLoops} />
          </Suspense>
        ) : null}

        <div className="mt-auto space-y-4">
          <div className="flex items-center justify-between gap-3">
            <AchievementLoopLogos
              loopStatuses={loopStatuses}
              streak={streak}
            />
            <span
              className={cn(
                "whitespace-nowrap text-sm font-semibold tabular-nums",
                earned ? "text-primary" : "text-muted-foreground"
              )}
              title="All-time bonus earnings, including inactive loops"
            >
              +{formatNumber(creditedPoints)}{" "}
              <span className="text-xs font-normal">
                GP
              </span>
            </span>
          </div>
          <Progress
            value={progress}
            className={cn(
              "h-1.5 bg-muted/70",
              earned ? "[&>div]:bg-primary" : "[&>div]:bg-secondary"
            )}
          />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <ProfileDetails
      trigger={card}
      label={`Loop status for the ${streak}-claim streak bonus`}
      className="w-64 max-w-[calc(100vw-2rem)] rounded-2xl border-border/70 bg-card !p-3 text-card-foreground shadow-[0_18px_50px_-28px_hsl(var(--foreground)/0.45)]"
    >
          <AchievementLoopBonusList
            loops={loopStatuses}
            streak={streak}
            rewardPoints={rewardPoints}
          />
    </ProfileDetails>
  )
}

function AchievementLoopLogos({
  loopStatuses,
  streak,
}: {
  loopStatuses: AchievementLoopStatus[]
  streak: number
}) {
  const activeLoops = loopStatuses.filter((loop) => loop.active)

  return (
    <span className="flex min-h-7 min-w-0 flex-wrap items-center gap-1">
      {activeLoops.length > 0 ? (
        activeLoops.map((loop) => (
          <LoopLogoMark key={`${streak}-${loop.key}`} loop={loop} />
        ))
      ) : (
        <span className="flex size-7 items-center justify-center rounded-full border-2 border-card bg-muted">
          <StreakMilestoneIcon streak={streak} disabled className="size-3.5" />
        </span>
      )}
    </span>
  )
}

function LoopLogoMark({ loop }: { loop: AchievementLoopStatus }) {
  const { logoUrl, earned } = loop

  return (
    <span
      className="relative flex size-6 shrink-0 font-heading text-[9px] font-extrabold leading-none"
      title={`${loop.title}: ${earned ? "Earned" : "Not yet earned"}`}
    >
      <span
        className={cn(
          "relative flex size-full items-center justify-center overflow-hidden rounded-full",
          earned
            ? "bg-background/70 text-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt=""
            fill
            sizes="24px"
            className={cn("object-contain p-1", !earned && "opacity-40 grayscale")}
          />
        ) : (
          loop.title.trim().charAt(0).toUpperCase() || "#"
        )}
      </span>
      {earned ? (
        <span className="absolute -bottom-0.5 -right-0.5 flex size-3 items-center justify-center rounded-full bg-card text-primary ring-1 ring-border">
          <FaCheck className="size-[7px]" aria-hidden="true" />
        </span>
      ) : null}
    </span>
  )
}

function AchievementLoopBonusList({
  loops,
  streak,
  rewardPoints,
}: {
  loops: AchievementLoopStatus[]
  streak: number
  rewardPoints: number
}) {
  if (loops.length === 0) {
    return (
      <p className="text-xs leading-5 text-muted-foreground">
        No loops or earned bonuses to show yet.
      </p>
    )
  }

  return (
    <div className="space-y-1.5">
      {loops.map((loop) => {
        const earned = loop.earned

        return (
          <div
            key={`${streak}-${loop.key}`}
            className="flex items-center justify-between gap-3 rounded-2xl bg-muted/35 px-2.5 py-2"
          >
            <div className="flex min-w-0 items-center gap-2">
              <StreakMilestoneIcon
                streak={streak}
                glowing={earned}
                disabled={!earned}
                className="size-3.5 shrink-0"
              />
              <span
                className={cn(
                  "truncate text-[11px] font-semibold",
                  earned ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {loop.title}
                {!loop.active ? " · Inactive" : ""}
              </span>
            </div>
            <span
              className={cn(
                "shrink-0 text-[11px] font-semibold tabular-nums",
                earned ? "text-primary" : "text-muted-foreground"
              )}
            >
              +{rewardPoints} GP
            </span>
          </div>
        )
      })}
    </div>
  )
}

function ProfileHeader({ data }: { data: ProfilePageData }) {
  const totals = getLoopTotals(data.loopStats)
  const totalPoints = totals.totalPoints
  const level = getLooperLevelProgress(totalPoints)
  const isLooperX = totalPoints >= 250
  const progressPercent = Math.round(level.progress)
  const progressMarkerPosition = Math.min(96, Math.max(4, level.progress))
  const rankLabel =
    data.globalRank == null ? "—" : `#${formatNumber(data.globalRank)}`

  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
      <Card className="min-h-[220px] rounded-3xl border-border/70 bg-card text-card-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.10),inset_0_-1px_0_rgba(0,0,0,0.05),0_8px_32px_rgba(28,231,131,0.06),0_4px_16px_rgba(140,75,255,0.04),0_2px_8px_rgba(0,0,0,0.08)]">
        <CardContent className="relative z-10 flex min-h-[220px] flex-col gap-3 p-8">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Looper <span className="text-primary">Profile</span>
                </h1>
                <ProfileLevelsInfo />
              </div>
              <p
                className="mt-1 text-xs text-muted-foreground"
                title={data.address}
              >
                {data.address.slice(0, 6)}…{data.address.slice(-4)}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {totalPoints === 0 ? (
                  "Welcome, Looper! Make your first claim to start earning GP."
                ) : isLooperX ? (
                  "You’ve reached the highest beta level. Every claim still earns GP."
                ) : (
                  <>
                    You’re{" "}
                    {formatNumber((totalPoints < 50 ? 50 : 250) - totalPoints)}{" "}
                    GP away from{" "}
                    <span className="text-foreground">
                      {totalPoints < 50 ? "True Looper" : "LooperX"}
                    </span>
                    .
                  </>
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 xl:min-w-[380px] xl:grid-cols-3">
              <ProfileHeaderStat
                icon={FaFire}
                value={`${formatNumber(totals.longestStreak)}`}
                label="best streak"
              />
              <ProfileHeaderStat
                icon={FaBolt}
                value={`${formatNumber(totals.claims)}`}
                label="total claims"
              />
              <div className="col-span-2 xl:col-span-1 xl:col-start-3 xl:row-start-1">
                <Suspense fallback={<ProfileClaimRateSkeleton />}>
                  <ProfileClaimRate address={data.address} />
                </Suspense>
              </div>
            </div>
          </div>

          <div className="mt-auto space-y-3">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold leading-none tracking-tight text-foreground tabular-nums sm:text-5xl">
                  {formatNumber(totalPoints)}
                </span>
                <GyraPointsLabel />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative pt-5">
                {!isLooperX && (
                  <span
                    className="absolute top-0 -translate-x-1/2 px-1 py-0.5 text-[11px] font-medium text-primary tabular-nums"
                    style={{ left: `${progressMarkerPosition}%` }}
                  >
                    {progressPercent}%<span className="hidden sm:inline"> completed</span>
                  </span>
                )}
                <ProfileLevelProgress
                  value={level.progress}
                  label={
                    isLooperX
                      ? "LooperX achieved: highest beta level completed"
                      : `Level progress: ${level.toLabel}`
                  }
                />
              </div>
              {isLooperX ? (
                <div className="flex items-center justify-end gap-1.5 text-[11px] font-medium text-primary">
                  <FaCheck className="size-3" aria-hidden="true" />
                  <span>LooperX</span>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4 text-[11px] font-medium text-muted-foreground">
                  <span>{level.fromLabel}</span>
                  <span>{level.toLabel}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="size-full max-w-[220px] justify-self-stretch max-lg:max-w-none">
        <Card className="relative flex h-full min-h-[220px] flex-col overflow-hidden rounded-3xl border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_100%)] text-card-foreground shadow-[0_18px_50px_-30px_rgba(0,0,0,0.35)] backdrop-blur-sm dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.015)_100%)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--secondary)/0.28)_0%,transparent_58%)]" />
          <div className="relative flex flex-1 flex-col items-center justify-center p-8 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              All time rank
            </p>
            <p className="mt-3 text-5xl font-bold leading-none tracking-[-0.04em] text-foreground tabular-nums">
              {rankLabel}
            </p>
            <p className="mt-3 text-[10px] leading-3 text-muted-foreground">
              Updated:{" "}
              <ProfileUpdatedTime updatedAt={data.lastStatsUpdatedAt} />
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      aria-label="Profile update schedule"
                      className="ml-1 inline-flex size-4 items-center justify-center rounded-full align-middle text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <FaInfoCircle className="size-3" aria-hidden="true" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Profile stats are updated once per day.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </p>
          </div>

          <Link
            href="/leaderboard"
            className="relative flex min-h-12 items-center justify-center border-t border-border/60 bg-secondary/10 px-6 font-heading text-sm font-bold text-foreground transition-colors hover:bg-secondary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/70"
          >
            View leaderboard
          </Link>
        </Card>
      </div>
    </section>
  )
}

function GyraPointsLabel() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            tabIndex={0}
            className="cursor-help align-baseline text-base font-bold uppercase leading-none tracking-[0.06em] text-muted-foreground outline-none transition-colors hover:text-primary focus-visible:text-primary sm:text-lg"
          >
            GP
          </span>
        </TooltipTrigger>
        <TooltipContent>GyraPoints</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function ProfileHeaderStat({
  icon: Icon,
  value,
  label,
}: {
  icon: IconType
  value: string
  label: string
}) {
  return (
    <div className="flex min-h-16 flex-col items-center justify-center rounded-2xl border border-border/70 bg-background/60 px-2.5 py-2 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
      <Icon className="mb-1.5 size-4 text-primary" aria-hidden="true" />
      <p className="text-sm font-bold leading-none text-foreground">
        {value}
      </p>
      <p className="mt-1 text-[10px] font-medium text-muted-foreground">
        {label}
      </p>
    </div>
  )
}

function LoopActivityTable({ loops }: { loops: ProfileLoopStats[] }) {
  const totals = getLoopTotals(loops)

  return (
    <TooltipProvider>
      <div
        role="region"
        aria-label="Points per loop — scroll horizontally for all columns"
        tabIndex={0}
        className="min-w-0 w-full max-w-full overflow-x-auto overscroll-x-contain rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <div className="w-full min-w-[770px]">
          <div className="grid grid-cols-[minmax(0,1fr)_90px_90px_220px_96px] items-end gap-4 border-b border-border/70 px-3 py-2 text-[9px] font-semibold uppercase leading-none tracking-[0.06em] text-muted-foreground">
            <span>Loop</span>
            <span className="text-right">Current streak</span>
            <span className="text-right">Claims</span>
            <span className="text-right">Streak points</span>
            <span className="text-right">Total</span>
          </div>

          <div>
            {loops.map((loop) => (
              <LoopActivityRow key={loop.id} loop={loop} />
            ))}
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_90px_90px_220px_96px] items-center gap-4 px-3 py-3.5">
            <div>
              <p className="text-[9px] font-semibold uppercase leading-none tracking-[0.06em] text-muted-foreground">
                All loops
              </p>
            </div>
            <span className="text-right text-sm font-semibold text-muted-foreground">
              —
            </span>
            <TableValue
              value={formatNumber(totals.claims)}
              suffix="GP"
              align="right"
            />
            <TableValue
              value={formatNumber(totals.streakPoints)}
              suffix="GP"
              align="right"
            />
            <TableValue
              value={formatNumber(totals.totalPoints)}
              suffix="GP"
              total
              align="right"
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

function LoopActivityRow({ loop }: { loop: ProfileLoopStats }) {
  const logoUrl = loop.metadata.logoUrl

  return (
    <ProfileDetails
      label={`${loop.metadata.title} streak details`}
      align="end"
      className="w-[208px] max-w-[calc(100vw-2rem)] rounded-lg border-border bg-card !p-0 text-left text-card-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_24px_70px_-34px_hsl(var(--foreground)/0.35)]"
      trigger={
        <div
          tabIndex={0}
          role="group"
          aria-label={`${loop.metadata.title} streak details`}
          className="grid cursor-pointer grid-cols-[minmax(0,1fr)_90px_90px_220px_96px] items-center gap-4 border-b border-border/70 px-3 py-3.5 outline-none transition-colors hover:bg-muted/45 focus-visible:bg-muted/45 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
        >
          <div className="flex min-w-0 items-center gap-3 whitespace-nowrap">
            <div
              className={cn(
                "relative flex size-[34px] shrink-0 items-center justify-center overflow-hidden rounded-xl font-heading text-[13px] font-extrabold leading-none text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-1px_0_rgba(0,0,0,0.16)]",
                logoUrl
                  ? "border border-border/70 bg-background/70"
                  : cn("bg-gradient-to-br", getLoopAvatarClassName(loop))
              )}
            >
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt=""
                  fill
                  sizes="34px"
                  className="object-contain p-1"
                />
              ) : (
                getLoopInitial(loop)
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-sm font-bold text-foreground">
                  {loop.metadata.title}
                </h3>
                {loop.metadata.archived ? (
                  <Badge
                    variant="outline"
                    className="rounded-full border-border bg-muted px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground"
                  >
                    Archived
                  </Badge>
                ) : null}
              </div>
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                Sponsored by {loop.metadata.sponsorName}
              </p>
            </div>
          </div>

          <StreakValue value={loop.currentStreak} />
          <TableValue
            value={`+${formatNumber(loop.totalClaims)}`}
            suffix="GP"
            align="right"
          />
          <StreakBonusCell loop={loop} />
          <TableValue
            value={formatNumber(loop.totalPoints)}
            suffix="GP"
            total
            align="right"
          />
        </div>
      }
    >
        <StreakBonusDetailCard loop={loop} />
    </ProfileDetails>
  )
}

function StreakValue({ value }: { value: number }) {
  const hasStreak = value > 0

  return (
    <div
      className={cn(
        "flex w-full items-baseline justify-end gap-1.5 text-right text-sm font-bold leading-5 tabular-nums",
        hasStreak ? "text-primary" : "text-muted-foreground"
      )}
    >
      <FaFire
        className={cn(
          "size-[13px] self-center",
          hasStreak &&
            "text-primary drop-shadow-[0_0_10px_hsl(var(--primary)/0.45)]"
        )}
        aria-hidden="true"
      />
      <span>{formatNumber(value)}</span>
    </div>
  )
}

function StreakBonusCell({ loop }: { loop: ProfileLoopStats }) {
  return (
    <div className="flex w-full items-center justify-end gap-3 whitespace-nowrap text-right">
      <MilestoneIcons loop={loop} />
      <StreakBonusValue value={loop.streakBonusPoints} align="right" />
    </div>
  )
}

function StreakBonusValue({
  value,
  align = "center",
}: {
  value: number
  align?: "center" | "right"
}) {
  const hasBonus = value > 0

  return (
    <p
      className={`text-sm font-bold tabular-nums ${hasBonus ? "text-foreground" : "text-muted-foreground"} ${align === "center" ? "text-center" : "text-right"}`}
    >
      +{formatNumber(value)}
      <span className="ml-1 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
        GP
      </span>
    </p>
  )
}

function MilestoneIcons({ loop }: { loop: ProfileLoopStats }) {
  return (
    <div className="flex items-center gap-1.5">
      {scoringConfig.streakBonuses.map((milestone) => {
        const earned = hasEarnedStreakBonus(loop, milestone.streak)

        return (
          <StreakMilestoneIcon
            key={milestone.streak}
            streak={milestone.streak}
            disabled={!earned}
            className="size-3.5 shrink-0"
          />
        )
      })}
    </div>
  )
}

function StreakBonusDetailCard({ loop }: { loop: ProfileLoopStats }) {
  return (
    <div className="p-3">
      <div className="space-y-2">
        {scoringConfig.streakBonuses.map((milestone) => {
          const earned = loop.earnedStreakBonuses.some(
            (bonus) => bonus.streak === milestone.streak
          )
          const StatusIcon = earned ? FaCheck : FaTimes

          return (
            <div
              key={milestone.streak}
              className="grid grid-cols-[18px_minmax(0,1fr)_auto] items-center gap-2"
            >
              <StatusIcon
                className={cn(
                  "size-3",
                  earned ? "text-primary" : "text-muted-foreground"
                )}
                aria-hidden="true"
              />
              <span className="truncate text-xs font-semibold text-foreground">
                {milestone.streak}-claim streak
              </span>
              <span
                className={`text-sm font-semibold ${earned ? "text-primary" : "text-muted-foreground"}`}
              >
                {`+${milestone.points} GP`}
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border/70 pt-3">
        <span className="text-[11px] font-semibold text-muted-foreground">
          Streak points
        </span>
        <span
          className={`text-sm font-bold ${loop.streakBonusPoints > 0 ? "text-primary" : "text-muted-foreground"}`}
        >
          {loop.streakBonusPoints > 0
            ? `+${formatNumber(loop.streakBonusPoints)}`
            : "–"}
        </span>
      </div>
    </div>
  )
}

function TableValue({
  value,
  suffix,
  total,
  align = "left",
}: {
  value: string
  suffix?: string
  total?: boolean
  align?: "left" | "center" | "right"
}) {
  return (
    <p
      className={`leading-5 tabular-nums text-foreground ${total ? "text-base font-extrabold" : "text-sm font-bold"} ${align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left"}`}
    >
      {value}
      {suffix ? (
        <span className="ml-1 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
          {suffix}
        </span>
      ) : null}
    </p>
  )
}
