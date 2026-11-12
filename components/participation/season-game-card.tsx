"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { LuArrowRight, LuCheck, LuGift } from "react-icons/lu"

import {
  gameView,
  participatingPeriods,
  seasonDayCount,
  seasonGames,
  weekendSchedule,
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

export function SeasonGameCard({
  game,
  onOpen,
}: {
  game: SeasonGame
  onOpen: (trigger: HTMLButtonElement) => void
}) {
  const { state } = useSeason()
  const view = gameView(game, state)
  const held = game.id === "race"
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
  return (
    <article
      className={`s-game-card p-surface ${held ? "is-held" : ""}`}
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
        <h2>{game.title}</h2>
        <p className="s-game-description">{game.description}</p>
        <div className="s-game-reward-row">
          <div className="s-game-reward s-game-reward-prize">
            <span className="s-game-reward-icon" aria-hidden="true">
              <LuGift />
            </span>
            <strong>+{game.bonus}</strong>
            <span>
              {held
                ? "Season Points · reserved"
                : game.id === "weekend"
                ? "Season Points per claim"
                : "Season Points"}
            </span>
          </div>
        </div>
        {(held || view.target > 0) && (
          <div className="s-game-card-progress">
            {held ? (
              <p>Game format and qualification rules are on hold.</p>
            ) : (
              <>
                <div>
                  <span>
                    {Math.min(view.progress, view.target)} / {view.target}{" "}
                    {game.unit}
                  </span>
                  <span>
                    {game.id === "weekend"
                      ? "Up to 16 total SP"
                      : view.status === "Completed"
                      ? "Bonus credited in preview"
                      : isFullSeason && view.status === "No longer achievable"
                      ? "Day missed · cannot complete"
                      : `${Math.max(0, view.target - view.progress)} remaining`}
                  </span>
                </div>
                {hasDayProgress ? (
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
              </>
            )}
            {game.id === "weekend" && (
              <small>Each Sunday claim: 1 claim SP + 3 bonus SP.</small>
            )}
            {isFullSeason && view.status === "No longer achievable" && (
              <small>
                Every Season day is required. Your other points stay yours.
              </small>
            )}
          </div>
        )}
        <button
          className="s-game-open"
          type="button"
          onClick={(event) => onOpen(event.currentTarget)}
          aria-haspopup="dialog"
          aria-label={
            held
              ? `View ${game.title} planning details`
              : `How ${game.title} works`
          }
        >
          <span className="s-game-open-label">How it works</span>
          <span className="s-game-open-arrow" aria-hidden="true">
            <LuArrowRight />
          </span>
        </button>
      </div>
    </article>
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
  onOpen: (trigger: HTMLButtonElement) => void
}) {
  const [activeDay, setActiveDay] = useState(
    Math.max(1, Math.min(currentDay, dayCount))
  )
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
            <Tooltip key={day}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className={filled ? "is-filled" : missed ? "is-missed" : ""}
                  aria-label={`${date} · ${status}`}
                  aria-haspopup="dialog"
                  tabIndex={activeDay === day ? 0 : -1}
                  ref={(button) => {
                    dayButtons.current[index] = button
                  }}
                  onFocus={() => setActiveDay(day)}
                  onClick={(event) => onOpen(event.currentTarget)}
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
  const { state } = useSeason()
  const view = gameView(game, state)
  return (
    <div className="s-game-details">
      <div className="s-game-detail-reward">
        <span>
          {game.id === "race"
            ? "Reserved reward · on hold"
            : game.id === "weekend"
            ? "Extra points per eligible Sunday claim"
            : "Extra points after confirmed completion"}
        </span>
        <strong>
          +{game.bonus} <small>bonus SP</small>
        </strong>
      </div>
      <dl className="s-game-definition">
        <div>
          <dt>Goal</dt>
          <dd>{game.win}</dd>
        </div>
        <div>
          <dt>How to achieve it</dt>
          <dd>{game.how}</dd>
        </div>
      </dl>
      {game.id === "weekend" ? (
        <WeekendParticipation />
      ) : (
        game.id !== "race" && (
          <div className="s-game-detail-progress">
            <strong>
              {view.target === 0
                ? "Required Loop list pending"
                : `${Math.min(view.progress, view.target)} / ${view.target} ${
                    game.unit
                  }`}
            </strong>
            {view.target > 0 && (
              <ProgressBar
                value={(view.progress / view.target) * 100}
                label={`${game.title} progress`}
              />
            )}
            {game.id === "explorer" &&
              state.requiredLoopIds?.map((id) => {
                const loop = state.loops.find((item) => item.id === id)
                return (
                  <div className="s-game-loop-progress" key={id}>
                    <span>{loop?.name ?? "Required Loop"}</span>
                    <strong>{Math.min(3, loop?.claims ?? 0)} / 3 claims</strong>
                  </div>
                )
              })}
            <p>
              {view.status === "No longer achievable"
                ? "This objective can no longer be completed this Season. Points already earned stay yours."
                : view.target === 0
                ? "The required Loop list is fixed before the Season. No completion or award is assumed until that list is available."
                : `${
                    state.registered ? view.earned : 0
                  } bonus SP earned in this preview. Progress updates from qualifying claims automatically.`}
            </p>
          </div>
        )
      )}
      <ul className="s-game-rules">
        {game.rules.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>
      {game.id !== "weekend" && game.id !== "race" && (
        <Link
          className="p-button"
          href={game.id === "explorer" ? "/loops" : "/loops?view=streaks"}
        >
          {game.id === "explorer"
            ? "Explore Loops"
            : "View your Loop participation"}
          <LuArrowRight aria-hidden="true" />
        </Link>
      )}
      <p className="p-caption">
        Progress and interactions use sample data. Live Loop links open the
        existing app. Bonuses from Season Games affect Season points only.
      </p>
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
          Preview Sunday claim · +4 SP
          <LuArrowRight aria-hidden="true" />
        </button>
      ) : (
        <p role="status">
          {record?.claimed
            ? "Claim confirmed in preview. +1 claim SP +3 bonus SP = +4 total SP."
            : view.stage === "registered"
            ? "Registered for this Sunday. Return when the claim period opens."
            : view.stage === "missed"
            ? "Saturday registration was missed. You can register again next weekend."
            : view.stage === "ended"
            ? "See your confirmed weekend history below."
            : "Return when Saturday registration opens."}
        </p>
      )}
      <div className="s-weekend-history">
        {weekendSchedule.map((weekend) => {
          const activity = state.weekends.find((item) => item.id === weekend.id)
          return (
            <div key={weekend.id}>
              <span>
                Weekend {weekend.id}
                <small>{utcDate(weekend.claimAt)}</small>
              </span>
              <strong>
                {activity?.claimed ? (
                  <>
                    <LuCheck aria-hidden="true" /> +4 SP
                  </>
                ) : activity?.registered ? (
                  "Registered"
                ) : (
                  "—"
                )}
              </strong>
            </div>
          )
        })}
      </div>
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
