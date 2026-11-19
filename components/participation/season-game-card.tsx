"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { LoopCardsData } from "@/data/loops-data"
import { LuArrowRight, LuCheck, LuMinus, LuTrophy, LuX } from "react-icons/lu"

import { loopLogo } from "@/lib/participation/loop-artwork"
import {
  claimRace,
  gameView,
  participatingPeriods,
  seasonDayCount,
  seasonGames,
  weekendSchedule,
  weekendTimeline,
  weekendView,
  type SeasonGame,
} from "@/lib/participation/season-games"
import { canScore } from "@/lib/participation/season-preview"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { ProgressBar } from "./participation-ui"
import { useSeason } from "./season-context"
import { SeasonGameDescription, SeasonGameTitle } from "./season-game-labels"
import { SeasonPointsValue } from "./season-points-value"

export function SeasonGameCard({
  game,
  onOpen,
}: {
  game: SeasonGame
  onOpen: (trigger: HTMLButtonElement) => void
}) {
  const isRace = game.id === "race"
  return (
    <article
      className={`s-game-card p-surface ${isRace ? "s-game-card-race" : ""}`}
      data-magic-bento-card=""
    >
      <div className="s-game-card-art" aria-hidden="true">
        <Image
          src={game.art}
          width={1254}
          height={1254}
          sizes="(max-width: 640px) 260px, 320px"
          alt=""
        />
      </div>
      <div className="s-game-card-content">
        <h2>
          <SeasonGameTitle game={game} />
        </h2>
        <p className="s-game-description">
          <SeasonGameDescription game={game} />
        </p>
        <div className="s-game-reward-row">
          <SeasonGameReward game={game} />
        </div>
        <SeasonGameProgress game={game} onOpen={onOpen} />
        <button
          className="s-game-open"
          type="button"
          onClick={(event) => onOpen(event.currentTarget)}
          aria-haspopup="dialog"
          aria-label={`How ${game.title} works`}
        >
          <span className="s-game-open-arrow" aria-hidden="true">
            <LuArrowRight />
          </span>
        </button>
      </div>
    </article>
  )
}

function SeasonGameReward({ game }: { game: SeasonGame }) {
  const rewardLabel = `+${game.bonus} ${
    game.id === "race"
      ? "Season Points · reserved"
      : game.id === "weekend"
      ? "extra Season Points per claim"
      : "Season Points"
  }`
  return (
    <div className="s-game-reward s-game-reward-prize" title={rewardLabel}>
      <span className="s-game-reward-icon" aria-hidden="true">
        <LuTrophy />
      </span>
      <SeasonPointsValue
        value={game.bonus}
        size="lg"
        showPlus
        aria-hidden="true"
      />
      <span className="sr-only">{rewardLabel}</span>
    </div>
  )
}

function SeasonGameProgress({
  game,
  onOpen,
}: {
  game: SeasonGame
  onOpen?: (trigger: HTMLButtonElement) => void
}) {
  const { state } = useSeason()
  const view = gameView(game, state)
  const isRace = game.id === "race"
  const isFullSeason = game.id === "marathon"
  const hasDayProgress = game.id === "sprint" || isFullSeason
  const countedDays = hasDayProgress ? participatingPeriods(state) : []
  const closedDays =
    state.phase === "review" || state.phase === "prizes"
      ? seasonDayCount
      : Math.max(0, state.period - 1)
  const missedDays = isFullSeason
    ? Array.from({ length: closedDays }, (_, i) => i + 1).filter(
        (day) => !countedDays.includes(day)
      )
    : []
  if (game.id === "explorer") return <RuleOfThreeLoopCards />
  if (view.target <= 0) return null
  return (
    <div className="s-game-card-progress">
      {game.id !== "weekend" && (
        <div className="s-game-progress-summary">
          <span>
            {isRace && `${claimRace.name} · `}
            {Math.min(view.progress, view.target)} / {view.target} {game.unit}
          </span>
          <span>
            {isRace
              ? view.status === "Qualification pending"
                ? "Target reached · results pending"
                : `${claimRace.winners} winners`
              : view.status === "Completed"
              ? "Bonus credited in preview"
              : isFullSeason && view.status === "No longer achievable"
              ? "Day missed · cannot complete"
              : `${Math.max(0, view.target - view.progress)} remaining`}
          </span>
        </div>
      )}
      {game.id === "weekend" ? (
        <WeekendTimeline onOpen={onOpen} />
      ) : hasDayProgress ? (
        <SeasonDayPills
          title={game.title}
          dayCount={seasonDayCount}
          countedDays={countedDays}
          missedDays={missedDays}
          closedDays={closedDays}
          currentDay={state.period}
          onOpen={onOpen}
        />
      ) : (
        <ProgressBar
          value={(view.progress / view.target) * 100}
          label={`${game.title} progress`}
        />
      )}
      {isFullSeason && view.status === "No longer achievable" && (
        <small>
          Every Season day is required. Your other points stay yours.
        </small>
      )}
    </div>
  )
}

function WeekendTimeline({
  onOpen,
}: {
  onOpen?: (trigger: HTMLButtonElement) => void
}) {
  const { state } = useSeason()
  const timeline = weekendTimeline(state)

  return (
    <div className="s-weekend-timeline">
      <span className="sr-only">
        The line tracks time through December. Checkmarks show claimed weekends.
      </span>
      <div className="s-weekend-timeline-track" aria-hidden="true">
        <span style={{ transform: `scaleX(${timeline.progress / 100})` }} />
      </div>
      <ol aria-label="December weekend claims">
        {timeline.stops.map((weekend) => {
          const date = new Date(weekend.claimAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            timeZone: "UTC",
          })
          const content = (
            <>
              <span className="s-weekend-timeline-node" aria-hidden="true">
                {weekend.status === "claimed" ? (
                  <LuCheck />
                ) : weekend.closed && weekend.status === "missed" ? (
                  <LuX />
                ) : (
                  <LuMinus />
                )}
              </span>
              <time dateTime={weekend.claimAt}>{date}</time>
            </>
          )
          const stopProps = {
            className: "s-weekend-stop",
            "data-status": weekend.status,
            "aria-current": weekend.current ? ("step" as const) : undefined,
            title: `${date} · ${weekend.label}`,
          }
          return (
            <li key={weekend.id} style={{ left: `${weekend.position}%` }}>
              {onOpen ? (
                <button
                  {...stopProps}
                  type="button"
                  aria-label={`${date}: ${weekend.label}. View Weekend Ritual`}
                  aria-haspopup="dialog"
                  onClick={(event) => onOpen(event.currentTarget)}
                >
                  {content}
                </button>
              ) : (
                <span {...stopProps}>
                  {content}
                  <span className="sr-only">{weekend.label}</span>
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function RuleOfThreeLoopCards() {
  const { state } = useSeason()
  // Layout examples only while the final required Season roster is unpublished.
  // These boxes never set the roster or authorize a completion reward.
  const loopIds = state.requiredLoopIds ?? [3, 4, 9]
  const loops = loopIds.flatMap((id) => {
    const loop = LoopCardsData.find((item) => item.id === id && item.enabled)
    return loop ? [loop] : []
  })

  return (
    <ul className="s-rule-loop-grid" aria-label="Loop claim progress">
      {loops.map((loop) => {
        const claims = Math.min(
          3,
          Math.max(
            0,
            state.loops.find((item) => item.id === loop.id)?.claims ?? 0
          )
        )
        return (
          <li key={loop.id}>
            <Link
              className="s-rule-loop"
              href={`/loops#loop-card-${loop.id}`}
              aria-label={`${loop.title}: ${claims} of 3 claims. View Loop`}
              title={loop.title}
            >
              <Image src={loopLogo(loop)} alt="" width={20} height={20} />
              <strong className="s-rule-loop-title">{loop.by}</strong>
              <span
                className="s-rule-loop-pills"
                role="progressbar"
                aria-label={`${loop.title} claims`}
                aria-valuemin={0}
                aria-valuemax={3}
                aria-valuenow={claims}
                aria-valuetext={`${claims} of 3 claims`}
              >
                {Array.from({ length: 3 }, (_, index) => (
                  <span
                    key={index}
                    className={index < claims ? "is-filled" : undefined}
                    aria-hidden="true"
                  />
                ))}
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

function SeasonDayPills({
  title,
  dayCount,
  countedDays,
  missedDays,
  closedDays,
  currentDay,
  onOpen,
}: {
  title: string
  dayCount: number
  countedDays: number[]
  missedDays: number[]
  closedDays: number
  currentDay: number
  onOpen?: (trigger: HTMLButtonElement) => void
}) {
  const [activeDay, setActiveDay] = useState(
    Math.max(1, Math.min(currentDay, dayCount))
  )
  const [tooltipDay, setTooltipDay] = useState<number | null>(null)
  const dayButtons = useRef<(HTMLButtonElement | null)[]>([])

  return (
    <TooltipProvider delayDuration={150}>
      <div
        className="s-game-day-pills"
        style={{
          gridTemplateColumns: `repeat(${dayCount}, minmax(0, 1fr))`,
          maxWidth: dayCount * 18 - 4,
        }}
        role="group"
        aria-label={`${title}: ${countedDays.length} Season days counted. Use left and right arrow keys to explore dates.`}
      >
        {Array.from({ length: dayCount }, (_, index) => {
          const day = index + 1
          const filled = countedDays.includes(day)
          const missed = missedDays.includes(day)
          const date = `Dec. ${day}`
          const status = filled
            ? "Claimed"
            : missed
            ? "Missed day"
            : day <= closedDays
            ? "No claim"
            : day === currentDay
            ? "Not claimed yet"
            : "Upcoming"
          return (
            <Tooltip
              key={day}
              open={tooltipDay === day}
              onOpenChange={(open) => setTooltipDay(open ? day : null)}
            >
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className={filled ? "is-filled" : missed ? "is-missed" : ""}
                  aria-label={`${date} · ${status}`}
                  aria-haspopup={onOpen ? "dialog" : undefined}
                  tabIndex={activeDay === day ? 0 : -1}
                  ref={(button) => {
                    dayButtons.current[index] = button
                  }}
                  onFocus={() => setActiveDay(day)}
                  onClick={(event) =>
                    onOpen ? onOpen(event.currentTarget) : setTooltipDay(day)
                  }
                  onKeyDown={(event) => {
                    if (event.altKey || event.ctrlKey || event.metaKey) return
                    const nextDay =
                      event.key === "ArrowRight"
                        ? Math.min(dayCount, day + 1)
                        : event.key === "ArrowLeft"
                        ? Math.max(1, day - 1)
                        : event.key === "Home"
                        ? 1
                        : event.key === "End"
                        ? dayCount
                        : null
                    if (nextDay == null) return
                    event.preventDefault()
                    dayButtons.current[nextDay - 1]?.focus()
                  }}
                />
              </TooltipTrigger>
              <TooltipContent
                side="top"
                sideOffset={8}
                className="s-game-day-tooltip"
              >
                <strong>{date}</strong>
                {filled && <LuCheck aria-hidden="true" />}
                <span className="sr-only">{status}</span>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </TooltipProvider>
  )
}

export function SeasonGameDetails({ game }: { game: SeasonGame }) {
  return (
    <div className="s-game-details">
      <section className="s-game-challenge" aria-label="Challenge">
        <div>
          <h3>Challenge</h3>
          <p>
            <SeasonGameDescription game={game} />
          </p>
        </div>
        <SeasonGameReward game={game} />
      </section>
      <div
        className="s-game-detail-progress"
        aria-label={`${game.title} progress`}
      >
        <SeasonGameProgress game={game} />
      </div>
      <section className="s-game-instructions" aria-label="How to">
        <h3>How to</h3>
        <ul className="s-game-rules">
          <li>{game.how}</li>
          {game.rules.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </section>
      {game.id === "weekend" && <WeekendParticipation />}
    </div>
  )
}

function utcDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
  })
}

function WeekendParticipation() {
  const { state, dispatch } = useSeason()
  const view = weekendView(state)
  const record =
    view.weekend && state.weekends.find((item) => item.id === view.weekend?.id)
  const available = state.registered && canScore(state.phase)
  return (
    <section
      className="s-weekend-participation"
      aria-label="Weekend Ritual participation"
    >
      <div className="s-weekend-next">
        <strong>
          {view.weekend
            ? `Weekend ${view.weekend.id} of 4`
            : "Season weekends ended"}
        </strong>
        <span className="s-pill">
          {gameView({ ...seasonGameForWeekend }, state).status}
        </span>
      </div>
      {view.weekend && (
        <div className="s-weekend-windows">
          <div>
            <span>Register Saturday</span>
            <strong>{utcDate(view.weekend.registerAt)} · 00:00 UTC</strong>
            <small>Closes {utcDate(view.weekend.claimAt)} · 00:00 UTC</small>
          </div>
          <div>
            <span>Claim Sunday</span>
            <strong>{utcDate(view.weekend.claimAt)} · 00:00 UTC</strong>
            <small>Closes {utcDate(view.weekend.closeAt)} · 00:00 UTC</small>
          </div>
        </div>
      )}
      {!state.registered ? (
        <p>
          Season entry is required. Weekend registration is a separate step for
          each Sunday.
        </p>
      ) : available && view.stage === "registration" && view.weekend ? (
        <button
          className="p-button"
          onClick={() =>
            dispatch({ type: "weekend-register", id: view.weekend.id })
          }
        >
          Preview registration for Sunday
          <LuArrowRight aria-hidden="true" />
        </button>
      ) : available && view.stage === "claim" && view.weekend ? (
        <button
          className="p-button"
          onClick={() =>
            dispatch({ type: "weekend-claim", id: view.weekend.id })
          }
        >
          Preview Sunday claim ·{" "}
          <SeasonPointsValue
            as="span"
            value={seasonGameForWeekend.bonus}
            size="sm"
            showPlus
          />{" "}
          extra
          <LuArrowRight aria-hidden="true" />
        </button>
      ) : (
        <p role="status">
          {record?.claimed ? (
            <>
              Claim confirmed in preview.{" "}
              <SeasonPointsValue
                as="span"
                value={seasonGameForWeekend.bonus}
                size="xs"
                showPlus
              />{" "}
              extra earned.
            </>
          ) : view.stage === "registered" ? (
            "Registered for this Sunday. Return when the claim period opens."
          ) : view.stage === "missed" ? (
            "Saturday registration was missed. You can register again next weekend."
          ) : view.stage === "ended" ? (
            "Your weekend claims are shown in the timeline above."
          ) : (
            "Return when Saturday registration opens."
          )}
        </p>
      )}
      <details className="s-weekend-clock">
        <summary>Preview weekend states</summary>
        <label>
          Reference window
          <select
            value={state.weekendTime}
            onChange={(event) =>
              dispatch({ type: "weekend-clock", time: event.target.value })
            }
          >
            <option value="2026-11-27T12:00:00Z">Before first weekend</option>
            {weekendSchedule.flatMap((weekend) => [
              <option
                key={`r${weekend.id}`}
                value={weekend.registerAt.replace("00:00:00Z", "12:00:00Z")}
              >
                Weekend {weekend.id} · Saturday registration
              </option>,
              <option
                key={`c${weekend.id}`}
                value={weekend.claimAt.replace("00:00:00Z", "12:00:00Z")}
              >
                Weekend {weekend.id} · Sunday claim
              </option>,
            ])}
            <option value="2026-12-31T12:00:00Z">After final weekend</option>
            {![
              "2026-11-27T12:00:00Z",
              "2026-12-31T12:00:00Z",
              ...weekendSchedule.flatMap((weekend) => [
                weekend.registerAt.replace("00:00:00Z", "12:00:00Z"),
                weekend.claimAt.replace("00:00:00Z", "12:00:00Z"),
              ]),
            ].includes(state.weekendTime) && (
              <option value={state.weekendTime}>Current reference time</option>
            )}
          </select>
        </label>
        <p>
          These dates are fixtures for checking the flow. The deployed Base
          Loop’s periods will drive live availability. Choose the live Season
          stage to try registration and claims.
        </p>
      </details>
    </section>
  )
}

const seasonGameForWeekend = seasonGames.find((game) => game.id === "weekend")!
