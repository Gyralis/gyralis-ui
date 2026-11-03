"use client"

import Link from "next/link"
import {
  LuArrowRight,
  LuCheckCircle2,
  LuFlame,
  LuGamepad2,
  LuSparkles,
  LuTrophy,
} from "react-icons/lu"

import { canEnter } from "@/lib/participation/season-preview"

import { useSeason } from "./season-context"

export function SeasonPoints({ compact = false }: { compact?: boolean }) {
  const { state, score, rank, entries } = useSeason()
  const hasRank =
    state.registered && state.phase !== "registration" && rank != null
  const rankDescription = hasRank
    ? `of ${entries.toLocaleString("en-US")} entries`
    : state.registered
    ? state.phase === "registration"
      ? "Starts Dec 1"
      : "Not ranked yet"
    : canEnter(state.phase)
    ? "Enter to rank"
    : "Not entered"
  const sources = [
    {
      label: "Claims",
      value: score.claims,
      description: "Eligible claims this Season",
      href: "/loops",
      Icon: LuCheckCircle2,
    },
    {
      label: "Streaks",
      value: score.streaks,
      description: "Bonuses from your Loop streaks",
      href: "/loops?view=streaks",
      Icon: LuFlame,
    },
    {
      label: "Games",
      value: score.games,
      description: "Season challenge bonuses",
      href: "/games?view=bonus",
      Icon: LuGamepad2,
    },
  ]

  return (
    <section
      className={`p-season-points p-surface${compact ? " is-compact" : ""}`}
      aria-label="Season Points (SP) breakdown"
    >
      <header className="p-sp-header">
        <div className="p-sp-heading">
          <LuSparkles aria-hidden="true" />
          <h2>
            {state.registered ? "Season Points" : "Potential Season Points"}
          </h2>
        </div>
        <span
          className="p-sp-preview"
          title="Design preview. These sample scores are not your live wallet scores."
        >
          Preview
        </span>
      </header>

      <div className="p-sp-overview">
        <div className="p-sp-total">
          <p>Season 1</p>
          <strong>
            {score.total.toLocaleString("en-US")} <span>SP</span>
          </strong>
          <small>
            {state.registered
              ? "Earned this Season"
              : canEnter(state.phase)
              ? "Not added until you enter"
              : "Not entered in this Season"}
          </small>
        </div>
        <Link className="p-sp-rank" href="/leaderboard?view=season">
          <span>
            <LuTrophy aria-hidden="true" /> Season rank
          </span>
          <strong>{hasRank ? `#${rank.toLocaleString("en-US")}` : "—"}</strong>
          <small>{rankDescription}</small>
        </Link>
      </div>

      <nav className="p-sp-sources" aria-label="Ways to earn Season Points">
        {sources.map(({ label, value, description, href, Icon }) => (
          <Link
            href={href}
            key={label}
            className="p-sp-source"
            title={description}
          >
            <span className="p-sp-source-label">
              <Icon aria-hidden="true" />
              {label}
              <LuArrowRight className="p-sp-source-arrow" aria-hidden="true" />
            </span>
            <strong>
              {value.toLocaleString("en-US")} <span>SP</span>
            </strong>
            {!compact && <small>{description}</small>}
          </Link>
        ))}
      </nav>

      <footer className="p-sp-footer">
        <p>
          Season only. SP resets each Season and stays separate from all-time
          GP.
        </p>
        <Link href="/leaderboard?view=season">
          Season leaderboard <LuArrowRight aria-hidden="true" />
        </Link>
      </footer>
    </section>
  )
}
