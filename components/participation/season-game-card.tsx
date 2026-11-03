"use client"

import Image from "next/image"
import Link from "next/link"
import { LuArrowRight, LuCheck, LuInfo } from "react-icons/lu"

import {
  gameView,
  seasonGames,
  weekendSchedule,
  weekendView,
  type SeasonGame,
} from "@/lib/participation/season-games"
import { canScore } from "@/lib/participation/season-preview"

import { ProgressBar } from "./participation-ui"
import { useSeason } from "./season-context"

export function SeasonGameCard({
  game,
  onOpen,
}: {
  game: SeasonGame
  onOpen: () => void
}) {
  const { state } = useSeason()
  const view = gameView(game, state)
  const held = game.id === "race"
  const earned = state.registered ? view.earned : 0
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
        <div className="s-game-card-top">
          <span className="p-eyebrow">{game.type}</span>
          <span
            className={`s-pill ${
              view.status === "Completed" || view.status === "Ready to claim"
                ? "is-green"
                : ""
            }`}
          >
            {view.status}
          </span>
        </div>
        <h2>{game.title}</h2>
        <p className="s-game-description">{game.description}</p>
        <div className="s-game-reward-row">
          <div className="s-game-reward">
            <strong>+{game.bonus}</strong>
            <span>
              {held
                ? "SP reserved"
                : game.id === "weekend"
                ? "bonus SP / claim"
                : "bonus SP once"}
            </span>
          </div>
          {!held && (
            <div className="s-game-earned">
              <strong>{earned} SP</strong>
              <span>Bonus earned</span>
            </div>
          )}
        </div>
        <div className="s-game-card-progress">
          {held ? (
            <p>Game format and qualification rules are on hold.</p>
          ) : view.target === 0 ? (
            <p>
              <LuInfo aria-hidden="true" /> Required Loop list published before
              the Season.
            </p>
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
                    : `${Math.max(0, view.target - view.progress)} remaining`}
                </span>
              </div>
              <ProgressBar
                value={(view.progress / view.target) * 100}
                label={`${game.title} progress`}
              />
            </>
          )}
          {game.id === "weekend" && (
            <small>Each Sunday claim: 1 claim SP + 3 bonus SP.</small>
          )}
        </div>
        <button className="p-button secondary" onClick={onOpen}>
          {held ? "See planning details" : "View game"}
          <LuArrowRight aria-hidden="true" />
        </button>
      </div>
    </article>
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
        existing app. Game bonuses affect Season points only.
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
      aria-label="Weekend Loop participation"
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
