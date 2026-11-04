"use client"

import Link from "next/link"
import {
  LuArrowRight,
  LuCheckCircle2,
  LuFlame,
  LuSparkles,
  LuWallet,
} from "react-icons/lu"
import { MdOutlineGames } from "react-icons/md"
import { useAccount } from "wagmi"

import { canEnter, seasonPhases } from "@/lib/participation/season-preview"

import { useSeason } from "./season-context"
import { SeasonEntryButton } from "./season-panels"

function PublicSeasonInformation() {
  const { state, entries } = useSeason()
  return (
    <div className="p-sp-public-season">
      <div className="p-sp-header">
        <h3>Season 01</h3>
        <span
          className="p-sp-preview"
          title="Season information uses the selected preview stage."
        >
          Preview
        </span>
      </div>
      <p>{seasonPhases[state.phase].label}</p>
      <p>Dec 1–30, 2026 · UTC</p>
      <dl>
        <div>
          <dt>Guaranteed prize pool</dt>
          <dd>$250</dd>
        </div>
        <div>
          <dt>Entries in preview</dt>
          <dd>{entries.toLocaleString("en-US")}</dd>
        </div>
      </dl>
      <Link className="p-text-link" href="/leaderboard?view=season">
        Season leaderboard <LuArrowRight aria-hidden="true" />
      </Link>
    </div>
  )
}

export function SeasonPoints({ compact = false }: { compact?: boolean }) {
  const { state, score, rank, entries } = useSeason()
  const { isConnected } = useAccount()
  if (!isConnected || !state.registered) {
    return (
      <section
        className={`p-season-points p-surface${compact ? " is-compact" : ""}`}
        aria-label={
          isConnected
            ? "Your Season and public information"
            : "Connect to your Season"
        }
      >
        <div className="p-sp-welcome">
          {isConnected && <LuWallet aria-hidden="true" />}
          <h2>{isConnected ? "Join the Season" : "Your Season stats here"}</h2>
          <p>
            {isConnected
              ? canEnter(state.phase)
                ? "Enter Season 01 to compete for a place on the leaderboard."
                : "You haven’t entered Season 01. Registration is closed; follow the standings below."
              : "Connect your wallet to see how your claims and streaks add up this Season."}
          </p>
          {isConnected && canEnter(state.phase) && (
            <>
              <SeasonEntryButton />
              <small>
                {state.phase === "late"
                  ? "Entry closes Dec 4, 00:00 UTC. Eligible activity since Dec 1 is included."
                  : "Season starts Dec 1. Entry-fee refunds are available before the start."}
              </small>
            </>
          )}
        </div>
        {isConnected && <PublicSeasonInformation />}
      </section>
    )
  }
  const hasRank =
    state.registered && state.phase !== "registration" && rank != null
  const rankDescription =
    state.phase === "registration" ? "Starts Dec 1" : "Not ranked yet"
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
      Icon: MdOutlineGames,
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
        <p className="p-eyebrow p-sp-season-label">Season 1</p>
        <span className="p-sp-rank-label">Rank</span>
        <div className="p-sp-total">
          <strong>
            {score.total.toLocaleString("en-US")} <span>SP</span>
          </strong>
        </div>
        <Link className="p-sp-rank" href="/leaderboard?view=season">
          <div className="p-sp-rank-value">
            <strong>{hasRank ? rank.toLocaleString("en-US") : "—"}</strong>
            {hasRank && <small>/{entries.toLocaleString("en-US")}</small>}
          </div>
          {!hasRank && <small>{rankDescription}</small>}
        </Link>
      </div>

      {hasRank && rank <= Math.ceil(entries * 0.15) && (
        <p className="p-sp-placement">
          Currently in a paid position · Provisional
        </p>
      )}

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
        <Link href="/leaderboard?view=season">
          Season leaderboard <LuArrowRight aria-hidden="true" />
        </Link>
      </footer>
    </section>
  )
}
