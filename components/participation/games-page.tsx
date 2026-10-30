"use client"

import { Suspense, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  LuArrowRight,
  LuCalendarCheck,
  LuCheck,
  LuInfo,
  LuLock,
  LuSparkles,
  LuTrophy,
  LuX,
  LuZap,
} from "react-icons/lu"

import {
  seasonGameProgress,
  seasonGames,
} from "@/lib/participation/season-games"
import {
  canEnter,
  canScore,
  seasonMilestones,
} from "@/lib/participation/season-preview"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import MagicBento from "@/components/ui/magic-bento"

import { useParticipationSearch } from "./participation-shell"
import {
  EmptyState,
  FilterTabs,
  PageIntro,
  ProgressBar,
  SectionTitle,
} from "./participation-ui"
import { useSeason } from "./season-context"
import {
  SeasonControls,
  SeasonHeader,
  SeasonRules,
  SeasonScore,
  StreakMilestones,
} from "./season-panels"

function GamesContent() {
  const router = useRouter()
  const params = useSearchParams()
  const { state, dispatch, score } = useSeason()
  const [tab, setTab] = useState("Overview")
  const [requirements, setRequirements] = useState<number | null>(null)
  const search = useParticipationSearch().trim().toLowerCase()
  const selected = seasonGames.find((game) => game.id === params.get("game"))
  useEffect(() => {
    const view = params.get("view")
    if (params.get("game")) setTab("Season Games")
    else if (view === "prizes") setTab("Prizes & Rules")
    else if (view === "bonus") setTab("Season Games")
    else setTab("Overview")
  }, [params])
  function changeTab(value: string) {
    const view =
      value === "Prizes & Rules"
        ? "?view=prizes"
        : value === "Season Games"
        ? "?view=bonus"
        : ""
    setTab(value)
    router.replace(`/games${view}`, { scroll: false })
  }
  function openGame(id: string | null) {
    router.push(id ? `/games?view=bonus&game=${id}` : "/games?view=bonus", {
      scroll: false,
    })
  }
  const playing = canScore(state.phase)
  const visibleLoops = [...state.loops]
    .filter((loop) => loop.name.toLowerCase().includes(search))
    .sort((a, b) => Number(a.claimedToday) - Number(b.claimedToday))
  const games = seasonGames.filter((game) =>
    `${game.title} ${game.type} ${game.description}`
      .toLowerCase()
      .includes(search)
  )
  const nextLoop = state.loops.find(
    (loop) =>
      !loop.claimedToday &&
      seasonMilestones.some(
        (m) => m.streak === loop.streak + 1 && !loop.earned.includes(m.streak)
      )
  )
  return (
    <>
      <PageIntro
        title="Gyralis Games"
        description="One participation layer. Many ways to earn"
      />
      <SeasonControls />
      <SeasonHeader home />
      <FilterTabs
        items={["Overview", "Season Games", "Prizes & Rules"]}
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
      {tab === "Overview" && (
        <>
          <SeasonScore />
          {!state.registered && (
            <div className="s-callout">
              <LuInfo />
              <p>
                <strong>
                  {canEnter(state.phase)
                    ? state.phase === "late"
                      ? `${score.total} potential points are waiting.`
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
                No new Season points are earned. Loop rewards continue
                independently.{" "}
                <button
                  className="p-text-link"
                  onClick={() => changeTab("Prizes & Rules")}
                >
                  Prizes & Rules <LuArrowRight />
                </button>
              </p>
            </div>
          )}
          {nextLoop && state.registered && playing && (
            <div className="s-next-return">
              <span className="p-icon">
                <LuCalendarCheck />
              </span>
              <div>
                <p className="p-eyebrow">Your next return</p>
                <h2>{nextLoop.name}: one claim from a bonus.</h2>
                <p>
                  Claim today to reach {nextLoop.streak + 1} days. Your streak
                  belongs to this Loop.
                </p>
              </div>
              <a
                href={`#season-loop-${nextLoop.id}`}
                className="p-button secondary"
              >
                See your Loop <LuArrowRight />
              </a>
            </div>
          )}
          <section id="season-daily-loops">
            <SectionTitle
              title={
                playing
                  ? "Today's Loops"
                  : state.phase === "registration"
                  ? "Get to know your Loops"
                  : "Your Season Loops"
              }
              href="/loops"
              label="Live Loop directory"
            />
            <p className="s-section-caption">
              Regular Season Loops · +1 per eligible daily claim · independent 3
              / 7 / 14 / 28-day streaks
            </p>
            <div className="s-daily-loops p-surface">
              {visibleLoops.map((loop) => (
                <article
                  id={`season-loop-${loop.id}`}
                  className="s-daily-loop"
                  key={loop.id}
                >
                  <div className="s-loop-identity">
                    <Image src={loop.logo} width={44} height={44} alt="" />
                    <div>
                      <h3>{loop.name}</h3>
                      <p>Daily · Base roster preview</p>
                      <button
                        className="p-text-link"
                        onClick={() => setRequirements(loop.id)}
                      >
                        View requirements <LuArrowRight />
                      </button>
                    </div>
                  </div>
                  <StreakMilestones
                    streak={loop.streak}
                    earned={loop.earned}
                    name={loop.name}
                  />
                  <div className="s-loop-actions">
                    <span
                      className={`s-pill ${
                        loop.claimedToday ? "" : playing ? "is-green" : ""
                      }`}
                    >
                      {loop.claimedToday ? (
                        <>
                          <LuCheck /> Claimed · +{loop.lastAward} points
                        </>
                      ) : playing ? (
                        "Ready in preview"
                      ) : state.phase === "registration" ? (
                        "Starts Dec 1"
                      ) : (
                        "Season ended"
                      )}
                    </span>
                    {playing && state.registered && (
                      <button
                        className="p-button small"
                        disabled={loop.claimedToday}
                        onClick={() => dispatch({ type: "claim", id: loop.id })}
                      >
                        {loop.claimedToday
                          ? "Next daily period"
                          : "Preview claim · +1"}
                      </button>
                    )}
                    <Link
                      className="p-text-link"
                      href={`/loops?loop=${loop.id}`}
                    >
                      Open live Loop <LuArrowRight />
                    </Link>
                  </div>
                </article>
              ))}
              {!visibleLoops.length && (
                <EmptyState
                  title="No matching Loops"
                  description="Try a different name in the top search."
                />
              )}
            </div>
            <p className="s-section-caption">
              Planned daily Base roster. Live Loop links retain their current
              networks and eligibility; deployment is still to be confirmed.
            </p>
          </section>
          <DayGame />
          <section>
            <SectionTitle
              title="Make your next claim count for more."
              href="/games?view=bonus"
              label="All Season Games"
            />
            <div className="s-bonus-teasers">
              {seasonGames.slice(0, 2).map((game) => (
                <button
                  className="p-surface s-bonus-teaser"
                  key={game.id}
                  onClick={() => openGame(game.id)}
                >
                  <LuSparkles />
                  <span>
                    <strong>{game.title}</strong>
                    <small>
                      {Math.min(
                        game.target,
                        seasonGameProgress(game.id, state)
                      )}{" "}
                      / {game.target} {game.unit} · reward to be announced
                    </small>
                  </span>
                  <LuArrowRight />
                </button>
              ))}
            </div>
          </section>
        </>
      )}
      {tab === "Season Games" && (
        <>
          <div className="s-section-intro">
            <div>
              <p className="p-eyebrow">Your claims go further</p>
              <h2>Small challenges. More ways to earn.</h2>
              <p>
                Complete challenges through your Loop participation, including
                timed Day Game challenges. Progress is automatic, with no extra
                entry fee or separate joining.
              </p>
            </div>
            <span className="s-pill">
              <LuSparkles /> Season points only
            </span>
          </div>
          <div className="s-callout">
            <LuInfo />
            <p>
              Challenge objectives are for UX review. Rewards and final rules
              for consistency, race and exploration challenges are awaiting
              approval. The timed Day Game challenge already has a defined
              reward: 1 claim point + 3 bonus points.
            </p>
          </div>
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
                  <button
                    className="p-game-art"
                    type="button"
                    aria-label={`View ${game.title}`}
                    onClick={() => openGame(game.id)}
                  >
                    <Image
                      src={game.art}
                      fill
                      alt=""
                      sizes="(max-width: 640px) 90vw, 440px"
                    />
                    <span className="p-status">{game.type}</span>
                  </button>
                  <div className="p-game-content">
                    <div className="s-game-reward">
                      <p className="p-eyebrow">Season Games</p>
                      <span>
                        <LuLock /> Reward pending
                      </span>
                    </div>
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
                  Bonus reward<small>Season points only</small>
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
              <button
                className="p-button"
                onClick={() => changeTab("Overview")}
              >
                See your daily Loops <LuArrowRight />
              </button>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={requirements !== null}
        onOpenChange={(open) => {
          if (!open) setRequirements(null)
        }}
      >
        <DialogContent className="participation-theme participation-dialog dark">
          <DialogHeader>
            <DialogTitle>
              {state.loops.find((loop) => loop.id === requirements)?.name}:
              requirements
            </DialogTitle>
            <DialogDescription>
              Season entry and Loop eligibility are separate. This preview does
              not verify your wallet.
            </DialogDescription>
          </DialogHeader>
          <p className="p-muted">
            The planned Season roster uses daily Loops on Base. Open the
            existing live Loop to check its current network, membership
            requirements and claim state.
          </p>
          <Link
            className="p-button"
            href={`/loops?loop=${requirements ?? ""}`}
            onClick={() => setRequirements(null)}
          >
            Check live requirements <LuArrowRight />
          </Link>
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
      <span className="s-day-icon">
        <LuZap />
      </span>
      <div>
        <div className="s-header-eyebrow">
          <p className="p-eyebrow">Season Games · Timed challenge</p>
          <span className={`s-pill ${active ? "is-green" : ""}`}>
            {state.dayClaimed
              ? "Claimed in preview"
              : active
              ? "Active now"
              : ended
              ? "Ended"
              : "Scheduled"}
          </span>
        </div>
        <h2>Day Game: a bigger return.</h2>
        <p>December 12, 12:00 – December 13, 12:00 UTC</p>
        <small>
          Designated event Loop only. Zero Season points outside this window. No
          streak bonuses.
        </small>
      </div>
      <div className="s-day-points">
        <strong>
          4<span>points / claim</span>
        </strong>
        <small>1 claim + 3 game bonus</small>
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
