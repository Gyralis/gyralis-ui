"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { LoopCardsData, type LoopCardData } from "@/data/loops-data"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { useQuery } from "@tanstack/react-query"
import {
  LuChevronLeft,
  LuChevronRight,
  LuRefreshCw,
  LuWallet,
} from "react-icons/lu"
import { useAccount } from "wagmi"

import { getSeasonStreaks } from "@/lib/participation/get-season-streaks"
import {
  findProfileStreak,
  getStreakCardState,
  type ProfileStreakRecord,
} from "@/lib/profile/streak-card-state"
import { scoringConfig } from "@/lib/scoring/config"
import { Skeleton } from "@/components/ui/skeleton"
import { StreakMilestoneIcon } from "@/components/loops/streak-milestone-icon"
import { ProfileDetails } from "@/components/profile/profile-details"
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
  initialPreview = false,
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
    refetchInterval: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1,
  })
  const display = preview ? sampleSeason : profile.data
  const rebuildRequired =
    profile.error instanceof Error &&
    profile.error.message === "Season scoring rebuild required"
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
            Follow each Loop’s daily claim streak and the Season Points it
            earns. SP stays separate from all-time GP.
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
          className="p-season-streak-table-wrap is-loading"
          role="status"
          aria-label="Loading Season streaks"
        >
          <div className="p-season-streak-table" aria-hidden="true">
            <div className="p-season-streak-table-head">
              <span className="p-season-streak-loop-heading">Loop</span>
              <span className="p-season-streak-progress-column-heading">
                Daily claim streak
              </span>
              <span className="p-season-streak-points-heading">
                Streak points
              </span>
            </div>
            <div className="p-season-streak-rowgroup">
              {activeLoops.map((loop) => (
                <div
                  className="p-season-streak-row is-loading"
                  key={`${loop.chainId}-${loop.id}`}
                >
                  <div className="p-season-streak-loop">
                    <Skeleton className="size-9 rounded-xl" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <div className="p-season-streak-progress">
                    <Skeleton className="h-3 w-full rounded-full" />
                  </div>
                  <div className="p-season-streak-points">
                    <Skeleton className="h-7 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {!preview && profile.isError && (
            <div className="p-streaks-message p-surface" role="status">
              <h3>
                {rebuildRequired
                  ? "This Season needs a scoring rebuild."
                  : profile.data
                  ? "Showing your last saved Season streaks."
                  : "Your Season streaks couldn’t be loaded."}
              </h3>
              <p>
                {rebuildRequired
                  ? "The current Season isn’t ready yet. Saved records from earlier seasons are separate."
                  : "Refresh to check this Season again."}
              </p>
              {process.env.NODE_ENV === "development" && wallet && (
                <Link
                  className="p-button secondary small"
                  href={`/season-test?address=${wallet}&seasonId=test-2026-08-10-oct-10`}
                >
                  Test saved August–October streaks
                </Link>
              )}
              <button
                type="button"
                className="p-button secondary small"
                onClick={() => void profile.refetch()}
              >
                Try again
              </button>
            </div>
          )}
          {display &&
            (!display.season ? (
              <div className="p-streaks-message p-surface">
                <h3>No active Season</h3>
                <p>
                  Season streaks and SP start fresh when a Season begins. Your
                  all-time GP stays separate.
                </p>
              </div>
            ) : loops.length ? (
              <SeasonStreakTable
                rows={loops.map(({ loop, stats }) => ({
                  loop,
                  stats,
                  multiplier:
                    findProfileStreak(loop, display.season?.loops ?? [])
                      ?.multiplier ?? 1,
                }))}
              />
            ) : (
              <EmptyState
                title="No matching streaks"
                description="Try another Loop name in the search."
              />
            ))}
        </>
      )}
    </section>
  )
}

export type SeasonStreakTableRow = {
  loop: LoopCardData
  stats?: ProfileStreakRecord
  multiplier?: number
}

export function SeasonStreakTable({
  rows,
  ariaLabel = "Season streak progress",
}: {
  rows: SeasonStreakTableRow[]
  ariaLabel?: string
}) {
  const goal = scoringConfig.streakBonuses.at(-1)?.streak ?? 30

  return (
    <div
      className="p-season-streak-table-wrap"
      role="region"
      aria-label={`${ariaLabel} — scroll horizontally for all columns`}
      tabIndex={0}
    >
      <div
        className="p-season-streak-table"
        role="table"
        aria-label={ariaLabel}
      >
        <div className="p-season-streak-table-head" role="row">
          <span role="columnheader" className="p-season-streak-loop-heading">
            Loop
          </span>
          <span
            role="columnheader"
            className="p-season-streak-progress-column-heading"
          >
            <span>Daily claim streak</span>
            <span className="p-season-streak-table-head-note">
              {goal} periods
            </span>
          </span>
          <span role="columnheader" className="p-season-streak-points-heading">
            Streak points
          </span>
        </div>
        <div className="p-season-streak-rowgroup" role="rowgroup">
          {rows.map((row) => (
            <SeasonStreakTableRowView
              key={`${row.loop.chainId}-${row.loop.id}`}
              {...row}
              goal={goal}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function SeasonStreakTableRowView({
  loop,
  stats,
  multiplier = 1,
  goal: goalLimit,
}: SeasonStreakTableRow & { goal: number }) {
  const { streak, completed, milestones } = getStreakCardState(stats)
  const visibleCount = Math.min(20, goalLimit)
  const maxWindowStart = Math.max(0, goalLimit - visibleCount)
  const pageStep = Math.max(1, Math.floor(visibleCount / 2))
  const recommendedWindowStart = Math.max(
    0,
    Math.min(streak - visibleCount, maxWindowStart)
  )
  const [windowStart, setWindowStart] = useState(recommendedWindowStart)
  useEffect(() => {
    setWindowStart((start) => {
      if (streak <= start || streak > start + visibleCount) {
        return recommendedWindowStart
      }
      return start
    })
  }, [recommendedWindowStart, streak, visibleCount])
  const logo =
    loop.communityLogoUrl ??
    loop.eligibilityLogoUrl ??
    loop.sponsorLogoUrl ??
    "/gyralis-logo.svg"
  const earnedPoints =
    stats?.earnedStreakBonuses.reduce((sum, bonus) => sum + bonus.points, 0) ??
    0
  const streakLabel = `${streak} of ${goalLimit} consecutive claims`
  const pointMilestones = milestones.map((milestone) => {
    const reward =
      stats?.earnedStreakBonuses.find(
        (bonus) => bonus.streak === milestone.streak
      )?.points ?? Math.round(milestone.points * multiplier * 100) / 100
    const status = getMilestoneStatusLabel(milestone.status)
    const claimsToGo = Math.max(0, milestone.streak - streak)
    const progress =
      milestone.status === "completed"
        ? "Earned this Season"
        : milestone.status === "uncredited"
        ? "Awaiting credit"
        : `${claimsToGo} ${claimsToGo === 1 ? "claim" : "claims"} to go`

    return { milestone, reward, status, progress }
  })

  return (
    <div className="p-season-streak-row" role="row">
      <div className="p-season-streak-loop" role="cell">
        <span className="p-season-streak-logo">
          <Image src={logo} alt="" width={32} height={32} />
        </span>
        <span className="p-season-streak-loop-copy">
          <strong>{loop.title}</strong>
          <span>
            {loop.by} · {loop.chainName}
          </span>
        </span>
      </div>
      <div className="p-season-streak-progress" role="cell">
        <div className="p-season-streak-progress-heading">
          <strong>
            {streak.toLocaleString()}{" "}
            <span>{streak === 1 ? "claim" : "claims"}</span>
          </strong>
          <span>
            Periods {windowStart + 1}–{windowStart + visibleCount}
          </span>
        </div>
        <div className="p-season-streak-bar-frame">
          <button
            type="button"
            className="p-season-streak-window-control"
            aria-label="Show earlier streak periods"
            title="Show earlier periods"
            disabled={windowStart === 0}
            onClick={() =>
              setWindowStart((start) => Math.max(0, start - pageStep))
            }
          >
            <LuChevronLeft aria-hidden="true" />
          </button>
          <div
            className="p-season-streak-day-bar"
            role="meter"
            style={{
              gridTemplateColumns: `repeat(${visibleCount}, minmax(0, 1fr))`,
            }}
            aria-label={`${loop.title} current streak progress`}
            aria-valuemin={0}
            aria-valuemax={goalLimit}
            aria-valuenow={Math.min(streak, goalLimit)}
            aria-valuetext={`${streakLabel}; ${completed} of ${
              milestones.length
            } point milestones earned; showing periods ${windowStart + 1}–${
              windowStart + visibleCount
            }`}
          >
            {Array.from({ length: visibleCount }, (_, offset) => {
              const count = windowStart + offset + 1
              const milestone = milestones.find((item) => item.streak === count)
              return (
                <span
                  key={count}
                  aria-hidden="true"
                  className={[
                    count <= streak ? "is-filled" : "",
                    count === streak + 1 && streak < goalLimit ? "is-next" : "",
                    milestone ? "is-milestone" : "",
                    milestone?.status === "completed"
                      ? "is-earned-milestone"
                      : "",
                    milestone?.status === "uncredited"
                      ? "is-pending-milestone"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                />
              )
            })}
          </div>
          <button
            type="button"
            className="p-season-streak-window-control"
            aria-label="Show later streak periods"
            title="Show later periods"
            disabled={windowStart >= maxWindowStart}
            onClick={() =>
              setWindowStart((start) =>
                Math.min(maxWindowStart, start + pageStep)
              )
            }
          >
            <LuChevronRight aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="p-season-streak-points" role="cell">
        <ProfileDetails
          label={`${loop.title}: total earned ${formatStreakPoints(
            earnedPoints
          )} Season Points; show streak bonus details`}
          align="end"
          className="p-season-streak-popover"
          trigger={
            <button
              type="button"
              className="p-season-streak-earned-total"
              title="Show streak point details"
            >
              <strong>
                +{formatStreakPoints(earnedPoints)} <small>SP</small>
              </strong>
              <span>Total earned</span>
            </button>
          }
        >
          <div className="p-season-streak-popover-content">
            <div>
              <p className="p-eyebrow">{loop.title}</p>
              <strong>Streak point breakdown</strong>
            </div>
            <div
              className="p-season-streak-popover-milestones"
              role="list"
              aria-label="Streak point milestones"
            >
              {pointMilestones.map(
                ({ milestone, reward, status, progress }) => (
                  <div
                    className={`p-season-streak-popover-milestone is-${milestone.status}`}
                    key={milestone.streak}
                    role="listitem"
                  >
                    <span className="p-season-streak-popover-badge">
                      <StreakMilestoneIcon
                        streak={milestone.streak}
                        disabled={milestone.status === "locked"}
                        glowing={milestone.status === "completed"}
                      />
                      {milestone.streak}
                    </span>
                    <span className="p-season-streak-popover-milestone-copy">
                      <strong>{status}</strong>
                      <small>{progress}</small>
                    </span>
                    <span className="p-season-streak-popover-reward">
                      +{formatStreakPoints(reward)} SP
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </ProfileDetails>
      </div>
    </div>
  )
}

function getMilestoneStatusLabel(status: string) {
  switch (status) {
    case "completed":
      return "earned"
    case "uncredited":
      return "awaiting credit"
    case "in-progress":
      return "in progress"
    default:
      return "locked"
  }
}

function formatStreakPoints(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
    value
  )
}
