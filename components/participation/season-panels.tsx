"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  LuArrowRight,
  LuAward,
  LuCalendarDays,
  LuCheck,
  LuDollarSign,
  LuInfo,
  LuShieldCheck,
  LuTrophy,
  LuUser,
} from "react-icons/lu"

import {
  canEnter,
  seasonMilestones,
  seasonPhases,
  type SeasonPhase,
} from "@/lib/participation/season-preview"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { ProgressBar } from "./participation-ui"
import { useSeason } from "./season-context"

export function SeasonControls() {
  const { state, reset, failNext, setFailNext, pending, dispatch, rank } =
    useSeason()
  return (
    <details className="s-preview-controls">
      <summary>
        <LuInfo /> Preview controls <span>Try every Season stage</span>
      </summary>
      <div>
        <p>
          Sample activity for checking the UX. Entry payments, points and prize
          claims are simulated. Live Loop links open the existing app.
        </p>
        <label>
          Season stage
          <select
            value={state.phase}
            disabled={Boolean(pending)}
            onChange={(event) => reset(event.target.value as SeasonPhase)}
          >
            {(
              Object.entries(seasonPhases) as [
                SeasonPhase,
                (typeof seasonPhases)[SeasonPhase]
              ][]
            ).map(([key, phase]) => (
              <option key={key} value={key}>
                {phase.label}
              </option>
            ))}
          </select>
        </label>
        {state.phase === "prizes" && state.registered && (
          <label>
            Prize outcome
            <select
              disabled={Boolean(pending)}
              value={(rank ?? Infinity) <= 35 ? "winning" : "outside"}
              onChange={(event) =>
                dispatch({
                  type: "placement",
                  winning: event.target.value === "winning",
                })
              }
            >
              <option value="winning">In a paid position</option>
              <option value="outside">Outside paid positions</option>
            </select>
          </label>
        )}
        {!canEnter(state.phase) && (
          <label className="s-checkbox">
            <input
              type="checkbox"
              disabled={Boolean(pending)}
              checked={!state.registered}
              onChange={(event) =>
                dispatch({ type: "viewer", registered: !event.target.checked })
              }
            />{" "}
            View as an unregistered visitor
          </label>
        )}
        <label className="s-checkbox">
          <input
            type="checkbox"
            checked={failNext}
            disabled={Boolean(pending)}
            onChange={(event) => setFailNext(event.target.checked)}
          />{" "}
          Fail next entry, refund or prize action
        </label>
        <button
          className="p-text-link"
          disabled={Boolean(pending)}
          onClick={() => reset(state.phase)}
        >
          Reset this stage
        </button>
        <small>
          Viewing{" "}
          {new Date(seasonPhases[state.phase].date).toLocaleString("en-GB", {
            timeZone: "UTC",
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
          UTC
        </small>
      </div>
    </details>
  )
}

export function SeasonEntryButton() {
  const { state, transact, pending, entries } = useSeason()
  const [dialog, setDialog] = useState<"entry" | "refund" | null>(null)
  const [accepted, setAccepted] = useState(false)
  const [network, setNetwork] = useState(false)
  const [funded, setFunded] = useState(false)
  const [connected, setConnected] = useState(false)
  const isRefund = dialog === "refund"
  const canRefund = state.phase === "registration" && state.registered
  const success = dialog === "entry" ? state.registered : !state.registered
  return (
    <>
      {canRefund ? (
        <button
          className="p-button secondary"
          onClick={() => {
            setDialog("refund")
            setAccepted(false)
          }}
        >
          Manage entry <LuArrowRight />
        </button>
      ) : !state.registered && canEnter(state.phase) ? (
        <button
          className="p-button"
          onClick={() => {
            setDialog("entry")
            setAccepted(false)
          }}
        >
          Enter Season · 1 USDC <LuArrowRight />
        </button>
      ) : state.registered ? (
        <span className="s-entry-confirmed">
          <LuCheck /> Registered{" "}
          {state.earlyBird && (
            <span className="s-pill">
              <LuAward /> Early Bird
            </span>
          )}
        </span>
      ) : (
        <span className="s-muted">Season registration is closed</span>
      )}
      <Dialog
        open={Boolean(dialog)}
        onOpenChange={(open) => {
          if (!open && !pending) setDialog(null)
        }}
      >
        <DialogContent className="participation-theme participation-dialog dark">
          <DialogHeader>
            <p className="p-eyebrow">Season 01 · Base</p>
            <DialogTitle>
              {success
                ? isRefund
                  ? "Entry withdrawn"
                  : "You're in the Loop."
                : isRefund
                ? "Manage your Season entry"
                : "Enter Gyralis Games"}
            </DialogTitle>
            <DialogDescription>
              {success
                ? "This interaction is a preview. No funds moved."
                : "Interactive preview only. These steps do not connect a wallet or move funds."}
            </DialogDescription>
          </DialogHeader>
          {success ? (
            <div className="s-entry-success">
              <LuShieldCheck />
              <h3>
                {isRefund
                  ? "1 USDC refund preview complete"
                  : "Your Season entry is confirmed"}
              </h3>
              <p>
                {isRefund
                  ? "You can enter again before registration closes. Network fees are not refunded."
                  : state.phase === "late"
                  ? "Your eligible claims and streaks since December 1 are included. Bonus games progress automatically."
                  : "Your Early Bird badge is ready. Come back December 1 to start your daily routine."}
              </p>
              <button className="p-button" onClick={() => setDialog(null)}>
                Continue <LuArrowRight />
              </button>
            </div>
          ) : (
            <>
              <div className="s-entry-price">
                <span>
                  {isRefund ? "Entry fee to refund" : "Your entry"}
                  <small>Network fees are separate</small>
                </span>
                <strong>1 USDC</strong>
              </div>
              <ul className="s-entry-terms">
                <li>Season: December 1–30, 2026 · UTC</li>
                <li>Full entry-fee refund before December 1, 00:00 UTC</li>
                <li>No withdrawal or refund after the Season begins</li>
                <li>$250 guaranteed · top 15% paid, rounded up</li>
                <li>
                  Final payout table published after December 4, 00:00 UTC
                </li>
              </ul>
              <p className="p-caption">
                {entries} entries currently. Entry does not grant individual
                Loop eligibility.{" "}
                <Link
                  href="/loops"
                  onClick={() => setDialog(null)}
                  className="p-text-link"
                >
                  Check Loop requirements <LuArrowRight />
                </Link>
              </p>
              {!isRefund && (
                <div className="s-payment-steps">
                  <button
                    className="p-button secondary"
                    disabled={Boolean(pending) || connected}
                    onClick={() => setConnected(true)}
                  >
                    {connected ? (
                      <>
                        <LuCheck /> Wallet preview connected
                      </>
                    ) : (
                      "1. Preview wallet connection"
                    )}
                  </button>
                  <button
                    className="p-button secondary"
                    disabled={!connected || Boolean(pending) || network}
                    onClick={() => setNetwork(true)}
                  >
                    {network ? (
                      <>
                        <LuCheck /> Base selected
                      </>
                    ) : (
                      "2. Preview switch to Base"
                    )}
                  </button>
                  <button
                    className="p-button secondary"
                    disabled={!network || Boolean(pending) || funded}
                    onClick={() => setFunded(true)}
                  >
                    {funded ? (
                      <>
                        <LuCheck /> 1 USDC + network fee available
                      </>
                    ) : (
                      "3. Preview funded wallet"
                    )}
                  </button>
                </div>
              )}
              <label className="s-checkbox">
                <input
                  type="checkbox"
                  checked={accepted}
                  disabled={Boolean(pending)}
                  onChange={(event) => setAccepted(event.target.checked)}
                />
                {isRefund
                  ? "Withdraw my entry and remove my Early Bird eligibility."
                  : "I understand the entry fee, deadlines and individual Loop requirements."}
              </label>
              <button
                className="p-button"
                disabled={
                  !accepted ||
                  Boolean(pending) ||
                  (!isRefund && (!connected || !network || !funded))
                }
                onClick={() => transact(isRefund ? "refund" : "register")}
              >
                {pending
                  ? "Awaiting preview confirmation…"
                  : isRefund
                  ? "Preview withdrawal · 1 USDC refund"
                  : "Preview payment · 1 USDC"}
              </button>
            </>
          )}
          {state.message && (
            <p className="s-status" role="status">
              {state.message}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export function SeasonHeader({
  home = false,
  pageHeader = false,
  compact = false,
}: {
  home?: boolean
  pageHeader?: boolean
  compact?: boolean
}) {
  const { state, entries } = useSeason()
  const Heading = pageHeader ? "h1" : "h2"
  return (
    <header
      className={`s-season-header p-surface ${
        pageHeader || home ? "is-prominent" : ""
      } ${compact ? "is-compact" : ""}`}
    >
      <div className="s-season-header-copy">
        <div className="s-season-brand" aria-hidden="true">
          <Image src="/gyralis-logo.svg" width={38} height={38} alt="" />
        </div>
        <div className="s-header-eyebrow">
          <span className="p-eyebrow">Season 1</span>
          <span className="s-pill is-green">Season Announced</span>
        </div>
        <Heading>
          {pageHeader ? (
            "Gyralis Games"
          ) : state.phase === "registration" ? (
            <>
              Your next month.
              <br />
              <em>Inside the Loop.</em>
            </>
          ) : state.phase === "review" ? (
            <>
              You showed up.
              <br />
              <em>Now we count.</em>
            </>
          ) : state.phase === "prizes" ? (
            <>
              Every return
              <br />
              <em>made a difference.</em>
            </>
          ) : (
            <>
              Claim. Keep your streak.
              <br />
              <em>Climb together.</em>
            </>
          )}
        </Heading>
        <p>
          {pageHeader
            ? "One participation layer. Many ways to earn."
            : "December 1–30, 2026 · Daily claims. Real streaks. One Season."}
        </p>
        <div className="s-hero-metrics">
          <div className="s-hero-metric">
            <LuUser className="s-hero-metric-icon" aria-hidden="true" />
            <span>
              <strong>{entries}</strong>
              <small>Entries</small>
            </span>
          </div>
          <div
            className="s-hero-metric"
            aria-label="$250 guaranteed prize pool"
          >
            <LuDollarSign className="s-hero-metric-icon" aria-hidden="true" />
            <span>
              <strong>$250</strong>
              <small>GTD</small>
            </span>
          </div>
          <div className="s-hero-metric">
            <LuCalendarDays className="s-hero-metric-icon" aria-hidden="true" />
            <span>
              <strong>
                <time dateTime="2026-12-01T00:00:00Z">Dec 1, 2026</time>
              </strong>
              <small>Starts · UTC</small>
            </span>
          </div>
        </div>
        {home && (
          <div className="s-header-actions">
            <SeasonEntryButton />
          </div>
        )}
      </div>
      <div className="s-season-visual" aria-hidden="true">
        <Image
          className="s-season-art"
          src="/images/gyralis-games-header-v3.png"
          width={1254}
          height={1254}
          sizes="(max-width: 640px) 260px, (max-width: 1200px) 65vw, 760px"
          alt=""
          priority
        />
      </div>
    </header>
  )
}

export { SeasonPoints as SeasonScore } from "./season-points"

export function SeasonRules() {
  const { state, entries, pending, transact, rank } = useSeason()
  const [open, setOpen] = useState(false)
  const inPaidPosition =
    state.registered && (rank ?? Infinity) <= Math.ceil(entries * 0.15)
  const published = !["registration", "late"].includes(state.phase)
  return (
    <div className="s-rules-grid">
      <section className="p-surface s-panel">
        <p className="p-eyebrow">The prize pool</p>
        <h2>
          ${Math.max(250, entries)} <small>USD value</small>
        </h2>
        <p>
          $250 guaranteed. If entry fees exceed $250, the full entry-fee pool is
          distributed.
        </p>
        <div className="s-prize-facts">
          <span>
            <strong>{entries}</strong>{" "}
            {published ? "entries" : "current entries"}
          </span>
          <span>
            <strong>{Math.ceil(entries * 0.15)}</strong>{" "}
            {published ? "paid places" : "provisional paid places"}
          </span>
        </div>
        <div className="s-callout">
          <LuInfo />
          <p>
            <strong>Payout table pending</strong>
            <br />
            The full rank-to-prize table is published after late registration
            closes. Payout percentages and the prize asset are awaiting
            approval.
          </p>
        </div>
        <p className="p-caption">
          Points determine rank. They do not convert directly into a fixed cash
          value.
        </p>
      </section>
      <section className="p-surface s-panel">
        <p className="p-eyebrow">Three ways to earn</p>
        <h2>Every SP explained.</h2>
        <ol className="s-rule-list">
          <li>
            <strong>Claim daily · +1 SP</strong>
            <span>
              One eligible claim per daily period in each regular Season Loop.
            </span>
          </li>
          <li>
            <strong>Build a streak in each Loop</strong>
            <span>
              3 days +2 · 7 days +5 · 14 days +12 · 28 days +30. Each milestone
              once per Loop per Season.
            </span>
          </li>
          <li>
            <strong>Complete Season Games challenges</strong>
            <span>
              Sprint +15 SP, Long Game +30 SP and exploration +15 SP add to the
              same game-bonus total. Sprint and Long Game stack. The race is on
              hold and awards no points until its rules are finalized.
            </span>
          </li>
        </ol>
        <p className="p-caption">
          Weekend Loop: register each Saturday and claim Sunday for 4 total SP
          (1 claim +3 game bonus). Four opportunities, up to 16 SP. No regular
          streak bonus. Only this dedicated Loop counts for its weekend reward.
        </p>
      </section>
      <section className="p-surface s-panel">
        <p className="p-eyebrow">Season calendar · UTC</p>
        <h2>Know your windows.</h2>
        <div className="s-timeline">
          {[
            [
              "Nov 24 · 00:00",
              "Registration opens",
              "1 USDC entry. Full entry-fee refunds before the start.",
            ],
            [
              "Dec 1 · 00:00",
              "Season starts",
              "Entries lock. Late registration continues with backdated activity.",
            ],
            [
              "Dec 4 · 00:00",
              "Late entry closes",
              "Final entries, pool and payout structure can be published.",
            ],
            [
              "Dec 31 · 00:00",
              "Scoring ends",
              "Includes all of December 30. Results enter review.",
            ],
            [
              "After review",
              "Final results and prizes",
              "No fixed prize-opening date. Claiming opens after approval.",
            ],
          ].map(([date, title, copy]) => (
            <div key={title}>
              <small>{date}</small>
              <strong>{title}</strong>
              <p>{copy}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="p-surface s-panel">
        <p className="p-eyebrow">Fair play & rewards</p>
        <h2>Know what stays yours.</h2>
        <div className="s-callout">
          <LuAward />
          <p>
            <strong>Early Bird badge</strong>
            <br />
            Register before December 1 and retain your entry at the start. No
            extra SP.
          </p>
        </div>
        <p>
          Late entrants receive eligible activity from December 1. Limited-place
          game qualification remains provisional until late registration closes.
        </p>
        <p>
          Miss a daily period and that Loop’s current streak resets. Points
          already earned stay yours. All-time progression is separate.
        </p>
        <p>
          Loop claim rewards remain yours even if you finish outside paid
          positions. Tie-breaking rules must be approved before launch.
        </p>
        <Link className="p-text-link" href="/loops">
          Check individual Loop requirements <LuArrowRight />
        </Link>
      </section>
      {(state.phase === "review" || state.phase === "prizes") && (
        <section className="p-surface s-panel s-prize-state">
          <LuTrophy />
          <div>
            <h2>
              {state.phase === "review"
                ? "Results under review"
                : !inPaidPosition
                ? "Outside paid positions in this preview"
                : state.prizeClaimed
                ? "Prize claim preview complete"
                : "Prize claiming follows approved results"}
            </h2>
            <p>
              {state.phase === "review"
                ? "Scoring has ended. Standings are provisional, and prizes cannot be claimed yet."
                : !inPaidPosition
                ? "There is no Season placement prize in this scenario. Your rewards earned from Loop claims remain yours. Final results still require review and approved tie rules."
                : "Final allocations, the payout table and prize asset are pending. You can inspect the claim interaction without moving funds."}
            </p>
          </div>
          {state.phase === "prizes" && inPaidPosition && (
            <button
              className="p-button secondary"
              disabled={state.prizeClaimed}
              onClick={() => setOpen(true)}
            >
              {state.prizeClaimed ? "Preview completed" : "Preview prize claim"}
            </button>
          )}
        </section>
      )}
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!pending) setOpen(value)
        }}
      >
        <DialogContent className="participation-theme participation-dialog dark">
          <DialogHeader>
            <DialogTitle>
              {state.prizeClaimed
                ? "Claim preview complete"
                : "Preview your prize claim"}
            </DialogTitle>
            <DialogDescription>
              Interaction preview only. No funds move. Your final allocation and
              prize asset depend on the approved payout table and final results.
            </DialogDescription>
          </DialogHeader>
          <button
            className="p-button"
            disabled={Boolean(pending) || state.prizeClaimed}
            onClick={() => transact("prize")}
          >
            {pending
              ? "Awaiting preview confirmation…"
              : state.prizeClaimed
              ? "Preview complete"
              : "Preview confirmation"}
          </button>
          {state.message && (
            <p className="s-status" role="status">
              {state.message}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function StreakMilestones({
  streak,
  earned,
  name,
}: {
  streak: number
  earned: number[]
  name: string
}) {
  const next = seasonMilestones.find((m) => !earned.includes(m.streak))
  return (
    <div className="s-streak-progress">
      <div className="s-streak-label">
        <strong>{streak}-day streak</strong>
        <span>
          {next
            ? `${next.streak - streak} more to +${next.points} SP`
            : "All milestones earned"}
        </span>
      </div>
      <div className="s-streak-markers">
        {seasonMilestones.map((m) => (
          <span
            className={earned.includes(m.streak) ? "is-earned" : ""}
            key={m.streak}
            aria-label={`${name}: ${m.streak} days, ${m.points} bonus SP, ${
              earned.includes(m.streak) ? "earned" : "not earned"
            }`}
          >
            {earned.includes(m.streak) && <LuCheck />}
            {m.streak}
            <small>+{m.points} SP</small>
          </span>
        ))}
      </div>
      <ProgressBar
        value={next ? (streak / next.streak) * 100 : 100}
        label={`${name} next streak milestone`}
      />
    </div>
  )
}
