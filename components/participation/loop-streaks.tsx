"use client"

import { useState } from "react"
import Image from "next/image"
import { LoopCardsData, type LoopCardData } from "@/data/loops-data"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { useQuery } from "@tanstack/react-query"
import { LuCheck, LuLock, LuRefreshCw, LuWallet } from "react-icons/lu"
import { useAccount } from "wagmi"

import { getSeasonStreaks } from "@/lib/participation/get-season-streaks"
import {
  findProfileStreak,
  getStreakCardState,
  type ProfileStreakRecord,
} from "@/lib/profile/streak-card-state"
import { scoringConfig } from "@/lib/scoring/config"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { StreakMilestoneIcon } from "@/components/loops/streak-milestone-icon"
import { StreakPointsInfo } from "@/components/profile/streak-points-info"

import { useParticipationSearch } from "./participation-shell"
import { EmptyState } from "./participation-ui"

const activeLoops = LoopCardsData.filter((loop) => loop.enabled)
const sampleSeason = {
  season: {
    name: "Design preview",
    loops: activeLoops.map((loop) => ({
      chainId: loop.chainId,
      loopId: loop.id,
      multiplier: 1,
    })),
  },
  loopStats: activeLoops.map((loop, index): ProfileStreakRecord => {
    const streak = [6, 11, 2, 30][index % 4]
    return {
      chainId: loop.chainId,
      loopId: loop.id,
      currentStreak: streak,
      longestStreak: streak,
      totalClaims: streak,
      earnedStreakBonuses: scoringConfig.streakBonuses.filter(
        (milestone) => streak >= milestone.streak
      ),
    }
  }),
}

export function LoopStreaks({
  initialPreview = true,
}: { initialPreview?: boolean } = {}) {
  const [preview, setPreview] = useState(initialPreview)
  const { address } = useAccount()
  const { openConnectModal } = useConnectModal()
  const wallet = address?.toLowerCase()
  const search = useParticipationSearch().trim().toLowerCase()
  const profile = useQuery({
    queryKey: ["season-streaks", wallet],
    enabled: Boolean(wallet) && !preview,
    queryFn: async ({ signal }) => {
      if (!wallet) throw new Error("Connect a wallet to load Season streaks")
      return getSeasonStreaks(wallet, signal)
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: 1,
  })
  const display = preview ? sampleSeason : profile.data
  const loops = activeLoops
    .filter(
      (loop) => display?.season && findProfileStreak(loop, display.season.loops)
    )
    .filter((loop) => `${loop.title} ${loop.by}`.toLowerCase().includes(search))
    .map((loop) => ({
      loop,
      stats: findProfileStreak(loop, display?.loopStats ?? []),
    }))
    .sort(
      (a, b) => (b.stats?.currentStreak ?? 0) - (a.stats?.currentStreak ?? 0)
    )

  return (
    <section className="p-streaks" aria-labelledby="season-streaks-title">
      <header className="p-streaks-heading">
        <div>
          <p className="p-eyebrow">SP · Season Points</p>
          <h2 id="season-streaks-title">Season streaks</h2>
          <p>
            SP counts toward this Season only. It does not add to your all-time
            GP or leaderboard score.
          </p>
          {display?.season && (
            <p className="p-caption">
              {preview
                ? "Design preview · Sample SP only. No scores are saved."
                : display.season.name}
            </p>
          )}
        </div>
        <div className="p-streaks-tools">
          <StreakPointsInfo scope="season" />
          <button
            type="button"
            className="p-button secondary small"
            onClick={() => setPreview(!preview)}
          >
            {preview ? "Use live data" : "Design preview"}
          </button>
          {wallet && !preview && (
            <button
              type="button"
              className="p-icon-button"
              onClick={() => void profile.refetch()}
              disabled={profile.isFetching}
              aria-label="Refresh Season streaks"
              title="Refresh streaks"
            >
              <LuRefreshCw aria-hidden="true" />
            </button>
          )}
        </div>
      </header>
      {!preview && !wallet ? (
        <div className="p-streaks-message p-surface">
          <LuWallet aria-hidden="true" />
          <h3>Your next streak starts here.</h3>
          <p>
            Connect your wallet to see your Season streaks and completed SP
            milestones.
          </p>
          <button
            className="p-button secondary small"
            type="button"
            onClick={openConnectModal}
          >
            Connect wallet
          </button>
        </div>
      ) : !preview && profile.isPending ? (
        <div
          className="p-streak-grid"
          role="status"
          aria-label="Loading Season streaks"
        >
          {activeLoops.map((loop) => (
            <div className="p-streak-card" key={`${loop.chainId}-${loop.id}`}>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="my-6 h-14 w-36" />
              <Skeleton className="mb-5 h-7 w-full rounded-full" />
              <Skeleton className="h-9 w-full rounded-full" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {!preview && profile.isError && (
            <div className="p-streaks-message p-surface" role="status">
              <h3>
                {profile.data
                  ? "Showing your last saved Season streaks."
                  : "Your Season streaks couldn’t be loaded."}
              </h3>
              <p>Refresh to check this Season again.</p>
              <button
                type="button"
                className="p-button secondary small"
                onClick={() => void profile.refetch()}
              >
                Try again
              </button>
            </div>
          )}
          {display && (
            <TooltipProvider delayDuration={150}>
              {!display.season ? (
                <div className="p-streaks-message p-surface">
                  <h3>No active Season</h3>
                  <p>
                    Season streaks and SP start fresh when a Season begins. Your
                    all-time GP stays separate.
                  </p>
                </div>
              ) : loops.length ? (
                <div className="p-streak-grid">
                  {loops.map(({ loop, stats }) => (
                    <StreakCard
                      key={`${loop.chainId}-${loop.id}`}
                      loop={loop}
                      stats={stats}
                      multiplier={
                        findProfileStreak(loop, display.season.loops)
                          ?.multiplier ?? 1
                      }
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No matching streaks"
                  description="Try another Loop name in the search."
                />
              )}
            </TooltipProvider>
          )}
        </>
      )}
    </section>
  )
}

export function StreakCard({
  loop,
  stats,
  multiplier = 1,
}: {
  loop: LoopCardData
  stats?: ProfileStreakRecord
  multiplier?: number
}) {
  const { streak, completed, milestones, goal, next } =
    getStreakCardState(stats)
  const allCompleted = completed === milestones.length
  const progressText = allCompleted
    ? "All milestones completed"
    : next?.status === "uncredited"
    ? "Milestone reached · awaiting credit"
    : streak === 0
    ? "Start your streak"
    : "In progress"
  const logo =
    loop.communityLogoUrl ??
    loop.eligibilityLogoUrl ??
    loop.sponsorLogoUrl ??
    "/gyralis-logo.svg"
  const headingId = `streak-${loop.chainId}-${loop.id}`

  return (
    <article
      className={`p-streak-card ${allCompleted ? "is-complete" : ""}`}
      aria-labelledby={headingId}
    >
      <h3 id={headingId} className="sr-only">
        {loop.title} streak
      </h3>
      <div className="p-streak-card-top">
        <span className="p-streak-label">Current Season streak</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="p-streak-loop-logo"
              type="button"
              aria-label={loop.title}
              title={loop.title}
            >
              <Image src={logo} alt="" width={32} height={32} />
            </button>
          </TooltipTrigger>
          <TooltipContent>{loop.title}</TooltipContent>
        </Tooltip>
      </div>
      <div className="p-streak-value">
        <span className="p-streak-flame">
          <StreakMilestoneIcon
            streak={next?.streak ?? goal}
            disabled={streak === 0}
            glowing={streak > 0}
          />
        </span>
        <strong>{streak.toLocaleString()}</strong>
        <span>{streak === 1 ? "claim" : "claims"}</span>
      </div>
      <div className="p-streak-milestone-heading">
        <span>Milestones</span>
        <span>
          <strong>{completed}</strong> / {milestones.length} completed
        </span>
      </div>
      <div
        className="p-streak-pill-bar"
        role="meter"
        aria-label={`${loop.title} current streak progress`}
        aria-valuemin={0}
        aria-valuemax={goal}
        aria-valuenow={Math.min(streak, goal)}
        aria-valuetext={`${streak} consecutive claims, ${completed} of ${milestones.length} milestones completed`}
      >
        {Array.from({ length: goal }, (_, index) => (
          <span
            key={index}
            aria-hidden="true"
            className={`${index < streak ? "is-filled" : ""} ${
              index === streak && streak > 0 && !allCompleted ? "is-next" : ""
            } ${
              milestones.some((milestone) => milestone.streak === index + 1)
                ? "is-milestone"
                : ""
            }`}
          />
        ))}
      </div>
      <div
        className="p-streak-milestones"
        aria-label={`${loop.title} milestone status`}
      >
        {milestones.map((milestone) => {
          const reward = Math.round(milestone.points * multiplier * 100) / 100
          const label =
            milestone.status === "completed"
              ? "Completed"
              : milestone.status === "uncredited"
              ? "Reached, awaiting credit"
              : milestone.status === "in-progress"
              ? "In progress"
              : "Locked"
          return (
            <Tooltip key={milestone.streak}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className={`p-streak-milestone is-${milestone.status}`}
                  aria-label={`${milestone.streak}-claim milestone: ${label}, ${reward} SP`}
                >
                  <StreakMilestoneIcon
                    streak={milestone.streak}
                    disabled={milestone.status === "locked"}
                    glowing={milestone.status === "completed"}
                  />
                  <span>{milestone.streak}</span>
                  {milestone.status === "completed" ? (
                    <LuCheck
                      className="p-streak-milestone-state"
                      aria-hidden="true"
                    />
                  ) : milestone.status === "locked" ? (
                    <LuLock
                      className="p-streak-milestone-state"
                      aria-hidden="true"
                    />
                  ) : (
                    <span
                      className="p-streak-milestone-dot"
                      aria-hidden="true"
                    />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {milestone.streak}-claim streak · +{reward} SP
                <br />
                {label}
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
      <footer className="p-streak-card-footer">
        <span
          className={`p-streak-status ${
            allCompleted ? "is-complete" : streak === 0 ? "is-empty" : ""
          }`}
        >
          {allCompleted && <LuCheck aria-hidden="true" />}
          {progressText}
        </span>
        {!allCompleted && next && (
          <span className="p-streak-next-goal">
            <strong>{Math.min(streak, next.streak)}</strong> / {next.streak}{" "}
            claims
          </span>
        )}
      </footer>
    </article>
  )
}
