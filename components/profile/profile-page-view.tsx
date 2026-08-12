import Image from "next/image"
import Link from "next/link"

import {
  getBlockExplorerAddressUrl,
  ProfileLoopStats,
  ProfilePageData,
} from "@/lib/profile/get-profile-page-data"
import { cn } from "@/lib/utils"

const streakMilestones = [3, 7, 14, 30]

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value)
}

function getLoopLogo(loop: ProfileLoopStats) {
  return (
    loop.metadata.communityLogoUrl ??
    loop.metadata.sponsorLogoUrl ??
    loop.metadata.eligibilityLogoUrl
  )
}

export function ProfilePageView({ data }: { data: ProfilePageData }) {
  const headerStats = [
    {
      label: "Total claims",
      value: formatNumber(data.globalStats?.totalClaims ?? 0),
    },
    {
      label: "Longest streak",
      value: formatNumber(data.globalStats?.longestStreak ?? 0),
    },
    {
      label: "All time points",
      value: formatNumber(data.globalStats?.totalPoints ?? 0),
    },
  ]

  return (
    <div className="px-4 py-8 sm:py-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="overflow-hidden rounded-[2.25rem] border border-border/70 bg-card/90 shadow-[0_28px_90px_rgba(15,23,42,0.09)]">
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="flex size-24 shrink-0 items-center justify-center rounded-[2rem] border border-primary/25 bg-primary/10 font-heading text-3xl font-bold text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
                {data.profile?.ensAvatar ? (
                  <Image
                    src={data.profile.ensAvatar}
                    alt=""
                    width={96}
                    height={96}
                    className="size-full rounded-[2rem] object-cover"
                  />
                ) : (
                  "LP"
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                    Participation identity
                  </p>
                  <h1 className="mt-2 break-words font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                    Looper Profile
                  </h1>
                  <p className="mt-3 break-all font-mono text-sm text-muted-foreground">
                    {data.address}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 rounded-[1.75rem] border border-border/70 bg-background/70 p-4">
              {headerStats.map((stat) => (
                <ProfileFact
                  key={stat.label}
                  label={stat.label}
                  value={stat.value}
                />
              ))}
            </div>
          </div>
        </section>

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
          <>
            <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <div className="rounded-[2rem] border border-border/70 bg-card/90 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.07)] sm:p-6">
                <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                      Loop activity
                    </p>
                    <h2 className="mt-2 font-heading text-3xl font-bold">
                      Per-loop proof
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {data.loopStats.length} scored loop
                    {data.loopStats.length === 1 ? "" : "s"}
                  </p>
                </div>

                <div className="grid gap-4">
                  {data.loopStats.map((loop) => (
                    <LoopActivityCard key={loop.id} loop={loop} />
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-border/70 bg-card/90 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.07)] sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Achievements
                </p>
                <h2 className="mt-2 font-heading text-3xl font-bold">
                  Streak bonuses
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Global bonuses are summed across loops. Each milestone can be
                  earned once per loop.
                </p>

                <div className="mt-5 grid gap-3">
                  {streakMilestones.map((milestone) => {
                    const bonus = data.globalStats?.earnedStreakBonuses.find(
                      (item) => item.streak === milestone
                    )
                    const earned = Boolean(bonus)

                    return (
                      <div
                        key={milestone}
                        className={cn(
                          "flex items-center justify-between gap-4 rounded-2xl border p-4",
                          earned
                            ? "border-primary/30 bg-primary/10"
                            : "border-border/70 bg-background/70"
                        )}
                      >
                        <div>
                          <p className="font-semibold text-foreground">
                            {milestone}-claim streak
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {earned ? "Earned across loops" : "Not reached yet"}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "rounded-full px-3 py-1 text-sm font-bold",
                            earned
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          +{bonus?.points ?? 0}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}

function ProfileFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-card/80 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="text-right text-sm font-semibold text-foreground">
        {value}
      </p>
    </div>
  )
}

function LoopActivityCard({ loop }: { loop: ProfileLoopStats }) {
  const logo = getLoopLogo(loop)
  const explorerUrl = loop.metadata.address
    ? getBlockExplorerAddressUrl(loop.chainId, loop.metadata.address)
    : null

  return (
    <article className="rounded-[1.6rem] border border-border/70 bg-background/75 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border/70 bg-card">
            {logo ? (
              <Image
                src={logo}
                alt=""
                width={36}
                height={36}
                className="size-9 object-contain"
              />
            ) : (
              <span className="font-heading text-lg font-bold text-primary">
                #{loop.loopId}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-heading text-xl font-bold">
                {loop.metadata.title}
              </h3>
              {loop.metadata.archived ? (
                <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Archived
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {loop.metadata.by} · {loop.metadata.chainName} · Loop #
              {loop.loopId}
            </p>
            <p className="mt-2 break-all font-mono text-xs text-muted-foreground">
              {loop.metadata.address ?? "Loop address unavailable"}
            </p>
          </div>
        </div>

        {explorerUrl ? (
          <Link
            href={explorerUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-full border border-border/80 bg-card px-3 text-xs font-semibold text-muted-foreground transition hover:border-primary/60 hover:text-primary"
          >
            Explorer
          </Link>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <LoopMetric label="Points" value={formatNumber(loop.totalPoints)} />
        <LoopMetric label="Claims" value={formatNumber(loop.totalClaims)} />
        <LoopMetric label="Current streak" value={String(loop.currentStreak)} />
        <LoopMetric label="Best streak" value={String(loop.longestStreak)} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {loop.earnedStreakBonuses.length > 0 ? (
          loop.earnedStreakBonuses.map((bonus) => (
            <span
              key={`${loop.id}-${bonus.streak}`}
              className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
            >
              {bonus.streak} streak · +{bonus.points}
            </span>
          ))
        ) : (
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
            No streak bonuses yet
          </span>
        )}
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
          Last claimed period {loop.lastClaimedPeriod ?? "—"}
        </span>
      </div>
    </article>
  )
}

function LoopMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-heading text-2xl font-bold text-foreground">
        {value}
      </p>
    </div>
  )
}
