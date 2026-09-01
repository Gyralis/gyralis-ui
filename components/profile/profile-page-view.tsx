import Link from "next/link"
import { FaBolt, FaCheck, FaFire, FaLock, FaTrophy } from "react-icons/fa"
import type { IconType } from "react-icons"

import { scoringConfig } from "@/lib/scoring/config"
import {
  ProfileLoopStats,
  ProfilePageData,
} from "@/lib/profile/get-profile-page-data"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ProfileWalletAddressSync } from "@/components/profile/profile-wallet-address-sync"

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
    loop.earnedStreakBonuses.some((bonus) => bonus.streak === streak)
  )
}

function getBestOverallStreak(loops: ProfileLoopStats[]) {
  return loops.reduce(
    (best, loop) => Math.max(best, loop.longestStreak),
    0
  )
}

function getLooperLevelProgress(totalPoints: number) {
  if (totalPoints >= 250) {
    return {
      badgeLabel: "LooperX",
      copy: "LooperX achieved",
      fromLabel: "True Looper",
      toLabel: "LooperX",
      progress: 100,
    }
  }

  if (totalPoints >= 50) {
    return {
      badgeLabel: "True Looper",
      copy: "Your progress to LooperX",
      fromLabel: "True Looper",
      toLabel: "LooperX",
      progress: ((totalPoints - 50) / 200) * 100,
    }
  }

  return {
    badgeLabel: "Next: True Looper",
    copy: "Your progress to True Looper",
    fromLabel: "0 GP",
    toLabel: "True Looper",
    progress: (totalPoints / 50) * 100,
  }
}

export function ProfilePageView({ data }: { data: ProfilePageData }) {
  return (
    <div className="px-4 py-8 sm:py-12">
      <ProfileWalletAddressSync />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <ProfileHeader data={data} />

        {!data.hasActivity ? (
          <section className="rounded-[2rem] border border-dashed border-border bg-card/80 p-8 text-center">
            <h2 className="font-heading text-2xl font-bold">
              No loop activity yet
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              This wallet has a profile record, but no scored claims yet. Once
              it claims in a loop, streaks and points will appear here.
            </p>
            <Link
              href="/loops"
              className="tamagotchi-button mt-6 inline-flex min-h-12 items-center px-6 text-sm"
            >
              Explore loops
            </Link>
          </section>
        ) : (
          <div className="grid gap-6">
            <Card className="rounded-[2rem] border-border/70 bg-card text-card-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.10),inset_0_-1px_0_rgba(0,0,0,0.05),0_8px_32px_rgba(28,231,131,0.06),0_4px_16px_rgba(140,75,255,0.04),0_2px_8px_rgba(0,0,0,0.08)]">
              <CardContent className="p-5 sm:p-6">
                <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="font-heading text-3xl font-bold text-foreground">
                      Your GP per Loop
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                      Claims, streak bonuses and total Gyra Points for every
                      loop.
                    </p>
                  </div>
                  <div className="flex w-fit items-baseline gap-3 sm:justify-end">
                    <p className="font-mono text-4xl font-bold leading-none tracking-tight text-foreground">
                      {formatNumber(data.globalStats?.totalPoints ?? 0)}
                    </p>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                      Total GP
                    </p>
                  </div>
                </div>

                <LoopActivityTable loops={data.loopStats} />
              </CardContent>
            </Card>

            <AchievementsSection data={data} />
          </div>
        )}
      </div>
    </div>
  )
}

function AchievementsSection({ data }: { data: ProfilePageData }) {
  const bestOverallStreak = getBestOverallStreak(data.loopStats)
  const unlockedCount = scoringConfig.streakBonuses.filter(
    (milestone) =>
      getEarnedLoopsForMilestone(data.loopStats, milestone.streak).length > 0
  ).length
  const unlockedLabel = `${unlockedCount} of ${scoringConfig.streakBonuses.length} bonuses unlocked`

  return (
    <Card className="rounded-[2rem] border-border/70 bg-card text-card-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.10),inset_0_-1px_0_rgba(0,0,0,0.05),0_8px_32px_rgba(28,231,131,0.06),0_4px_16px_rgba(140,75,255,0.04),0_2px_8px_rgba(0,0,0,0.08)]">
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-heading text-3xl font-bold text-foreground">
              Your achievements
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Explore completed streak bonuses and points earned across loops.
            </p>
          </div>

          <Badge
            variant="outline"
            className="w-fit rounded-full border-primary/25 bg-primary/10 px-3 py-1 text-xs font-bold text-primary"
          >
            {unlockedLabel}
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {scoringConfig.streakBonuses.map((milestone) => {
            const earnedLoops = getEarnedLoopsForMilestone(
              data.loopStats,
              milestone.streak
            )
            const globalBonus = data.globalStats?.earnedStreakBonuses.find(
              (bonus) => bonus.streak === milestone.streak
            )

            return (
              <AchievementBonusCard
                key={milestone.streak}
                streak={milestone.streak}
                rewardPoints={milestone.points}
                creditedPoints={
                  globalBonus?.points ?? earnedLoops.length * milestone.points
                }
                bestOverallStreak={bestOverallStreak}
                earnedLoops={earnedLoops}
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
  bestOverallStreak,
  earnedLoops,
}: {
  streak: number
  rewardPoints: number
  creditedPoints: number
  bestOverallStreak: number
  earnedLoops: ProfileLoopStats[]
}) {
  const earned = earnedLoops.length > 0
  const progress = Math.min(100, (bestOverallStreak / streak) * 100)
  const StatusIcon = earned ? FaFire : FaLock

  return (
    <Card
      className={cn(
        "overflow-hidden rounded-3xl border bg-card/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_34px_-28px_hsl(var(--foreground)/0.32)] transition-all duration-200 hover:border-border hover:bg-card",
        earned
          ? "border-border/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_12px_34px_-28px_hsl(var(--foreground)/0.32)]"
          : "border-border/70 opacity-75"
      )}
    >
      <div
        className={cn(
          "flex h-[118px] items-center justify-center",
          earned
            ? "bg-[linear-gradient(135deg,hsl(var(--primary)/0.14)_0%,hsl(var(--secondary)/0.10)_48%,hsl(var(--muted)/0.42)_100%)]"
            : "bg-[linear-gradient(135deg,hsl(var(--muted)/0.58)_0%,hsl(var(--muted)/0.28)_100%)]"
        )}
      >
        <div
          className={cn(
            "flex size-14 items-center justify-center rounded-2xl border shadow-[inset_0_1px_0_rgba(255,255,255,0.20)]",
            earned
              ? "border-primary/25 bg-primary/10 text-primary"
              : "border-border bg-background/50 text-muted-foreground"
          )}
        >
          <StatusIcon className="size-6" aria-hidden="true" />
        </div>
      </div>

      <CardContent className="flex min-h-[188px] flex-col gap-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-heading text-base font-bold leading-tight text-foreground">
              {streak}-claim streak
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              +{rewardPoints} points per loop
            </p>
          </div>

          <Badge
            variant="outline"
            className={cn(
              "shrink-0 rounded-lg px-2 py-1 text-[10px] font-bold",
              earned
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-border bg-muted text-muted-foreground"
            )}
          >
            {earned ? "Streaked" : "Locked"}
          </Badge>
        </div>

        <p className="text-xs leading-5 text-muted-foreground">
          {earned
            ? `Earned in ${earnedLoops.length} ${
                earnedLoops.length === 1 ? "loop" : "loops"
              }. Bonus already credited.`
            : `Reach a ${streak}-claim streak in any loop to unlock this bonus.`}
        </p>

        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-semibold text-muted-foreground">
              Best streak {formatNumber(bestOverallStreak)} / {streak}
            </span>
            <span
              className={cn(
                "font-mono text-xs font-bold",
                earned ? "text-primary" : "text-muted-foreground"
              )}
            >
              {earned ? `+${formatNumber(creditedPoints)}` : "locked"}
            </span>
          </div>
          <Progress
            value={progress}
            className={cn(
              "h-1.5 bg-muted/70",
              earned ? "[&>div]:bg-primary" : "[&>div]:bg-secondary"
            )}
          />

          {earned ? (
            <div className="flex items-center gap-1.5">
              {earnedLoops.slice(0, 4).map((loop) => (
                <span
                  key={`${streak}-${loop.id}`}
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full bg-gradient-to-br font-heading text-[10px] font-extrabold text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.24)]",
                    getLoopAvatarClassName(loop)
                  )}
                  title={loop.metadata.title}
                >
                  {getLoopInitial(loop)}
                </span>
              ))}
              {earnedLoops.length > 4 ? (
                <span className="flex size-6 items-center justify-center rounded-full bg-muted font-mono text-[10px] font-bold text-muted-foreground">
                  +{earnedLoops.length - 4}
                </span>
              ) : null}
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-muted-foreground">
              <FaTrophy className="size-3" aria-hidden="true" />
              Next bonus target
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ProfileHeader({ data }: { data: ProfilePageData }) {
  const totalPoints = data.globalStats?.totalPoints ?? 0
  const level = getLooperLevelProgress(totalPoints)
  const progressPercent = Math.round(level.progress)
  const progressMarkerPosition = Math.min(96, Math.max(4, level.progress))
  const rankLabel =
    data.globalRank == null ? "—" : `#${formatNumber(data.globalRank)}`

  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
      <Card className="min-h-[220px] rounded-[2rem] border-border/70 bg-card p-4 text-card-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.10),inset_0_-1px_0_rgba(0,0,0,0.05),0_8px_32px_rgba(28,231,131,0.06),0_4px_16px_rgba(140,75,255,0.04),0_2px_8px_rgba(0,0,0,0.08)]">
        <CardContent className="relative z-10 flex min-h-[188px] flex-col gap-3 p-0">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Looper Profile
                </h1>
                <Badge
                  variant="outline"
                  className="rounded-full border-primary/30 bg-primary/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-primary"
                >
                  {level.badgeLabel}
                </Badge>
              </div>
              <p className="mt-1.5 break-all font-mono text-[11px] text-muted-foreground">
                {data.address}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:max-w-[220px] xl:min-w-[220px]">
              <ProfileHeaderStat
                icon={FaBolt}
                value={`${formatNumber(data.globalStats?.totalClaims ?? 0)}`}
                label="total claims"
              />
              <ProfileHeaderStat
                icon={FaFire}
                value={`${formatNumber(data.globalStats?.longestStreak ?? 0)}`}
                label="best streak"
              />
            </div>
          </div>

          <div className="mt-auto space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-baseline gap-2">
                <span className="font-heading text-4xl font-bold leading-none tracking-tight text-foreground sm:text-5xl">
                  {formatNumber(totalPoints)}
                </span>
                <GyraPointsLabel />
              </div>
              <p className="text-xs font-semibold text-muted-foreground sm:text-right">
                {level.copy}
              </p>
            </div>

            <div className="space-y-2">
              <div className="relative pt-4">
                <span
                  className="absolute top-0 -translate-x-1/2 p-px font-mono text-[11px] font-bold text-primary"
                  style={{ left: `${progressMarkerPosition}%` }}
                >
                  {progressPercent}%
                </span>
                <Progress
                  value={level.progress}
                  className="h-2.5 bg-background/80 ring-1 ring-border/70 [&>div]:bg-primary"
                />
              </div>
              <div className="flex items-center justify-between gap-4 text-[11px] font-medium text-muted-foreground">
                <span>{level.fromLabel}</span>
                <span>{level.toLabel}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="size-full max-w-[220px] justify-self-stretch max-lg:max-w-none">
        <div className="relative h-full rounded-[1.75rem] border border-border/70 p-2 md:rounded-[1.85rem]">
          <div className="relative flex h-full min-h-[204px] flex-col overflow-hidden rounded-[1.2rem] border border-white/[0.06] bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_100%)] text-card-foreground shadow-[0_18px_50px_-30px_rgba(0,0,0,0.35)] backdrop-blur-sm dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.015)_100%)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--secondary)/0.28)_0%,transparent_58%)]" />
            <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-5 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                All time rank
              </p>
              <p className="mt-3 font-heading text-5xl font-bold leading-none tracking-[-0.04em] text-foreground">
                {rankLabel}
              </p>
            </div>

            <Link
              href="/leaderboard"
              className="relative flex min-h-12 items-center justify-center border-t border-border/60 bg-secondary/10 px-4 font-heading text-sm font-bold text-foreground transition-colors hover:bg-secondary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/70"
            >
              View leaderboard
            </Link>
          </div>
        </div>
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
            className="cursor-help text-base font-bold uppercase tracking-[0.06em] text-muted-foreground outline-none transition-colors hover:text-primary focus-visible:text-primary sm:text-lg"
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
      <p className="text-base font-bold leading-none text-foreground">
        {value}
      </p>
      <p className="mt-1 text-[11px] font-medium text-muted-foreground">
        {label}
      </p>
    </div>
  )
}

function LoopActivityTable({ loops }: { loops: ProfileLoopStats[] }) {
  const totals = loops.reduce(
    (acc, loop) => ({
      claims: acc.claims + loop.totalClaims,
      streakPoints: acc.streakPoints + loop.streakBonusPoints,
      totalPoints: acc.totalPoints + loop.totalPoints,
    }),
    { claims: 0, streakPoints: 0, totalPoints: 0 }
  )

  return (
    <TooltipProvider>
      <div className="overflow-x-auto">
        <div className="w-full min-w-[720px]">
          <div className="grid grid-cols-[minmax(0,1fr)_90px_90px_170px_96px] items-center gap-4 border-b border-border/70 px-3 pb-3 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            <span>Loop</span>
            <span className="text-right">Claims</span>
            <span className="text-right">Current streak</span>
            <span className="text-right">Streak points</span>
            <span className="text-right">Total</span>
          </div>

          <div>
            {loops.map((loop) => (
              <LoopActivityRow key={loop.id} loop={loop} />
            ))}
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_90px_90px_170px_96px] items-center gap-4 px-3 py-3.5">
            <div>
              <p className="font-heading text-sm font-bold text-muted-foreground">
                All loops
              </p>
            </div>
            <TableValue value={formatNumber(totals.claims)} align="right" />
            <span className="text-right text-sm font-semibold text-muted-foreground">
              —
            </span>
            <StreakBonusValue
              value={totals.streakPoints}
              align="right"
            />
            <TableValue
              value={formatNumber(totals.totalPoints)}
              highlight
              align="right"
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

function LoopActivityRow({ loop }: { loop: ProfileLoopStats }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_90px_90px_170px_96px] items-center gap-4 border-b border-border/70 px-3 py-3.5 transition-colors hover:bg-muted/45">
      <div className="flex min-w-0 items-center gap-3 whitespace-nowrap">
        <div
          className={cn(
            "flex size-[34px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-heading text-[13px] font-extrabold leading-none text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-1px_0_rgba(0,0,0,0.16)]",
            getLoopAvatarClassName(loop)
          )}
        >
          {getLoopInitial(loop)}
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
            by {loop.metadata.by}
          </p>
        </div>
      </div>

      <TableValue value={formatNumber(loop.totalClaims)} align="right" />
      <StreakValue value={loop.currentStreak} />
      <StreakBonusCell loop={loop} />
      <TableValue
        value={formatNumber(loop.totalPoints)}
        highlight
        align="right"
      />
    </div>
  )
}

function StreakValue({ value }: { value: number }) {
  const hasStreak = value > 0

  return (
    <div
      className={cn(
        "inline-flex items-center justify-end gap-2 text-right text-sm font-normal tabular-nums",
        hasStreak
          ? "text-foreground"
          : "text-muted-foreground"
      )}
    >
      <FaFire
        className={cn(
          "size-[13px]",
          hasStreak &&
            "text-primary drop-shadow-[0_0_10px_hsl(var(--primary)/0.45)]"
        )}
        aria-hidden="true"
      />
      <span>{hasStreak ? formatNumber(value) : "—"}</span>
    </div>
  )
}

function StreakBonusCell({ loop }: { loop: ProfileLoopStats }) {
  const earnedCount = loop.earnedStreakBonuses.length

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="group flex w-full flex-col items-end gap-1.5 rounded-xl text-right outline-none transition focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label={`Streak points ${formatNumber(loop.streakBonusPoints)}. ${earnedCount} of ${scoringConfig.streakBonuses.length} streaks earned.`}
        >
          <StreakBonusValue value={loop.streakBonusPoints} align="right" />
          <div className="flex items-center justify-end gap-2">
            <MilestoneDots loop={loop} />
            <span className="text-[10px] font-semibold text-muted-foreground">
              {earnedCount} of {scoringConfig.streakBonuses.length} streaks
            </span>
          </div>
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        align="end"
        sideOffset={8}
        className="w-[208px] rounded-lg border-border bg-card p-0 text-left text-card-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_24px_70px_-34px_hsl(var(--foreground)/0.35)]"
      >
        <StreakBonusDetailCard loop={loop} />
      </TooltipContent>
    </Tooltip>
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
      className={cn(
        "font-normal tabular-nums",
        "text-sm",
        hasBonus ? "text-foreground" : "text-muted-foreground",
        align === "center" && "text-center",
        align === "right" && "text-right"
      )}
    >
      {hasBonus ? `+${formatNumber(value)}` : "–"}
    </p>
  )
}

function MilestoneDots({ loop }: { loop: ProfileLoopStats }) {
  return (
    <div className="flex items-center gap-1.5">
      {scoringConfig.streakBonuses.map((milestone) => {
        const earned = loop.earnedStreakBonuses.some(
          (bonus) => bonus.streak === milestone.streak
        )

        return (
          <span
            key={milestone.streak}
            className={cn(
              "size-[7px] rounded-full border",
              earned ? "border-primary bg-primary" : "border-border bg-muted"
            )}
            aria-hidden="true"
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
          const StatusIcon = earned ? FaCheck : FaLock

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
                className={cn(
                  "text-[11px] font-semibold",
                  earned ? "text-primary" : "text-muted-foreground"
                )}
              >
                {earned ? `+${milestone.points} GP` : "locked"}
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
          className={cn(
            "text-xs font-bold",
            loop.streakBonusPoints > 0
              ? "text-primary"
              : "text-muted-foreground"
          )}
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
  highlight,
  align = "left",
}: {
  value: string
  suffix?: string
  highlight?: boolean
  align?: "left" | "center" | "right"
}) {
  return (
    <p
      className={cn(
        "leading-5 tabular-nums text-foreground",
        highlight ? "text-base font-extrabold" : "text-sm font-normal",
        align === "center" && "text-center",
        align === "right" && "text-right"
      )}
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
