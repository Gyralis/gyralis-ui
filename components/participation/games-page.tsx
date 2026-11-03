"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  LuArrowRight,
  LuCalendarCheck,
  LuCheck,
  LuInfo,
  LuTrophy,
  LuX,
} from "react-icons/lu"

import {
  seasonGameProgress,
  seasonGames,
} from "@/lib/participation/season-games"
import { canEnter, canScore } from "@/lib/participation/season-preview"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import MagicBento from "@/components/ui/magic-bento"

import { useParticipationSearch } from "./participation-shell"
import { EmptyState, FilterTabs, ProgressBar } from "./participation-ui"
import { useSeason } from "./season-context"
import { SeasonControls, SeasonHeader, SeasonRules } from "./season-panels"

function GamesContent() {
  const router = useRouter()
  const params = useSearchParams()
  const { state, dispatch, score } = useSeason()
  const tab =
    !params.get("game") && params.get("view") === "prizes"
      ? "Prizes & Rules"
      : "Season Games"
  const search = useParticipationSearch().trim().toLowerCase()
  const selected = seasonGames.find((game) => game.id === params.get("game"))
  function changeTab(value: string) {
    const view =
      value === "Prizes & Rules"
        ? "?view=prizes"
        : value === "Season Games"
        ? "?view=bonus"
        : ""
    router.replace(`/games${view}`, { scroll: false })
  }
  function openGame(id: string | null) {
    router.push(id ? `/games?view=bonus&game=${id}` : "/games?view=bonus", {
      scroll: false,
    })
  }
  const readyCount = canScore(state.phase)
    ? state.loops.filter((loop) => !loop.claimedToday).length
    : 0
  const games = seasonGames.filter((game) =>
    `${game.title} ${game.type} ${game.description}`
      .toLowerCase()
      .includes(search)
  )
  return (
    <>
      <SeasonHeader home pageHeader />
      <SeasonControls />
      <FilterTabs
        items={["Season Games", "Prizes & Rules"]}
        value={tab}
        onChange={changeTab}
        label="Season sections"
      />
      {state.message && (
        <div className="s-status" role="status">
          <LuCheck />
          <span>{state.message}</span>
          <button
            aria-label="Dismiss update"
            onClick={() => dispatch({ type: "message", message: "" })}
          >
            <LuX />
          </button>
        </div>
      )}
      {tab === "Season Games" && (
        <>
          <MagicBento className="p-games-grid">
            {(!search || "day game timed challenge".includes(search)) && (
              <DayGame catalog />
            )}
            {games.map((game) => {
              const current = Math.min(
                game.target,
                seasonGameProgress(game.id, state)
              )
              return (
                <article
                  key={game.id}
                  className="p-game-card p-surface"
                  data-magic-bento-card=""
                >
                  <div className="p-game-content">
                    <h2>{game.title}</h2>
                    <p>{game.description}</p>
                    <div className="p-game-progress">
                      <span>
                        {current} / {game.target} {game.unit}
                      </span>
                      <ProgressBar
                        value={(current / game.target) * 100}
                        label={`${game.title} progress`}
                      />
                    </div>
                    <p className="p-caption">
                      Reward pending ·{" "}
                      {current >= game.target
                        ? "Goal reached in preview · reward not yet published"
                        : game.id === "race"
                        ? "First 50 qualify · provisional during late entry"
                        : "Runs December 1–30 · UTC"}
                    </p>
                    <button
                      className="p-button secondary"
                      onClick={() => openGame(game.id)}
                    >
                      View challenge <LuArrowRight />
                    </button>
                  </div>
                </article>
              )
            })}
          </MagicBento>
          {!games.length &&
            search &&
            !"day game timed challenge".includes(search) && (
              <EmptyState
                title="No matching challenges"
                description="Try another search to see the Season Games."
              />
            )}
          {!state.registered && (
            <div className="s-callout">
              <LuInfo />
              <p>
                <strong>
                  {canEnter(state.phase)
                    ? state.phase === "late"
                      ? `${score.total} potential SP are waiting.`
                      : "Your daily routine starts December 1."
                    : "You're viewing this Season as a visitor."}
                </strong>
                <br />
                {canEnter(state.phase)
                  ? "Enter for 1 USDC. Eligible activity since December 1 counts when you register; games progress automatically."
                  : "Registration is closed. You can still explore live Loops and earn their available rewards."}
              </p>
            </div>
          )}
          {(state.phase === "review" || state.phase === "prizes") && (
            <div className="s-callout">
              <LuTrophy />
              <p>
                <strong>
                  {state.phase === "review"
                    ? "The Season is complete. Results are under review."
                    : "Explore the prize-claim experience."}
                </strong>
                <br />
                No new SP are earned. Loop rewards continue independently.{" "}
                <button
                  className="p-text-link"
                  onClick={() => changeTab("Prizes & Rules")}
                >
                  Prizes & Rules <LuArrowRight />
                </button>
              </p>
            </div>
          )}
          <Link
            className="s-streaks-shortcut p-surface"
            href="/loops?view=streaks"
          >
            <LuCalendarCheck />
            <span>
              <strong>
                {readyCount > 0
                  ? `${readyCount} Loop ${
                      readyCount === 1 ? "claim" : "claims"
                    } ready in preview`
                  : "Your Loop streaks"}
              </strong>
              <small>
                Claim availability, per-Loop streaks and next bonuses
              </small>
            </span>
            <span>
              Season streaks <LuArrowRight />
            </span>
          </Link>
          <div className="s-callout">
            <LuInfo />
            <p>
              Challenge objectives are for UX review. Rewards and final rules
              for consistency, race and exploration challenges are awaiting
              approval. The timed Day Game challenge already has a defined
              reward: 1 claim SP + 3 bonus SP.
            </p>
          </div>
        </>
      )}
      {tab === "Prizes & Rules" && <SeasonRules />}
      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) openGame(null)
        }}
      >
        <DialogContent className="participation-theme participation-dialog dark">
          <DialogHeader>
            <p className="p-eyebrow">{selected?.type} · automatic progress</p>
            <DialogTitle>{selected?.title}</DialogTitle>
            <DialogDescription>{selected?.description}</DialogDescription>
          </DialogHeader>
          {selected && (
            <>
              <div className="s-entry-price">
                <span>
                  Bonus reward<small>SP only</small>
                </span>
                <strong>To be announced</strong>
              </div>
              <p className="p-muted">
                Objective example for UX review. The final reward and
                qualification rules must be approved before this game launches.
              </p>
              <ProgressBar
                value={
                  (seasonGameProgress(selected.id, state) / selected.target) *
                  100
                }
                label={`${selected.title} progress`}
              />
              <p>
                {Math.min(
                  selected.target,
                  seasonGameProgress(selected.id, state)
                )}{" "}
                / {selected.target} {selected.unit}
              </p>
              <p className="p-caption">
                Qualifying activity from December 1 is included when you enter.
                A claim can progress multiple games; each approved completion
                reward is awarded once.
              </p>
              {selected.id === "race" && (
                <p className="p-caption">
                  Backdated late entries can change qualification. Tie rules
                  remain pending before launch.
                </p>
              )}
              <Link className="p-button" href="/loops?view=streaks">
                See Season streaks <LuArrowRight />
              </Link>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function DayGame({ catalog = false }: { catalog?: boolean }) {
  const { state, dispatch } = useSeason()
  const active = state.phase === "live"
  const ended = state.phase === "review" || state.phase === "prizes"
  return (
    <section
      className={`s-day-game p-surface ${active ? "is-active" : ""} ${
        catalog ? "s-catalog-challenge" : ""
      }`}
      aria-label="Day Game timed challenge"
      data-magic-bento-card=""
    >
      <div className="s-day-copy">
        <h2>Day Game: a bigger return.</h2>
        <p>December 12, 12:00 – December 13, 12:00 UTC</p>
        <small>
          Designated event Loop only. Zero SP outside this window. No streak
          bonuses.
        </small>
      </div>
      <div className="s-day-points">
        <strong>
          4<span>SP / claim</span>
        </strong>
        <small>1 claim + 3 game bonus</small>
        <span className={`s-pill ${active ? "is-green" : ""}`}>
          {state.dayClaimed
            ? "Claimed in preview"
            : active
            ? "Active now"
            : ended
            ? "Ended"
            : "Scheduled"}
        </span>
        {active && state.registered && (
          <button
            className="p-button small"
            disabled={state.dayClaimed}
            onClick={() => dispatch({ type: "day-claim" })}
          >
            {state.dayClaimed ? (
              <>
                <LuCheck /> Claimed
              </>
            ) : (
              "Preview Day Game claim"
            )}
          </button>
        )}
        {!state.registered && (
          <span className="p-caption">Season entry required</span>
        )}
      </div>
    </section>
  )
}

export function GamesPage() {
  return (
    <Suspense fallback={<p className="p-muted">Loading your Season…</p>}>
      <GamesContent />
    </Suspense>
  )
}
