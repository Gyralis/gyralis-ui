"use client"

import { Suspense, useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { LuArrowRight, LuInfo, LuTrophy } from "react-icons/lu"

import { FilterTabs, PageIntro } from "./participation-ui"
import { useSeason } from "./season-context"
import { SeasonScore } from "./season-panels"

export function LeaderboardSections({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<p className="p-muted">Loading standings…</p>}>
      <LeaderboardContent>{children}</LeaderboardContent>
    </Suspense>
  )
}

function LeaderboardContent({ children }: { children: ReactNode }) {
  const router = useRouter()
  const params = useSearchParams()
  const [tab, setTab] = useState("All-Time")
  useEffect(() => {
    const view = params.get("view")
    setTab(
      view === "season" ? "Season" : view === "loops" ? "Loops" : "All-Time"
    )
  }, [params])
  return (
    <>
      <PageIntro
        title="Leaderboard"
        description={
          tab === "Season"
            ? "One Season. Every claim, streak and game bonus counts."
            : "All-time Gyralis participation rankings. Every return counts."
        }
      />
      <FilterTabs
        items={["All-Time", "Season", "Loops"]}
        value={tab}
        onChange={(value) => {
          setTab(value)
          router.replace(
            value === "Season"
              ? "/leaderboard?view=season"
              : value === "Loops"
              ? "/leaderboard?view=loops"
              : "/leaderboard",
            { scroll: false }
          )
        }}
        label="Leaderboard context"
      />
      {tab === "All-Time" && (
        <div className="p-legacy-view p-live-leaderboard">{children}</div>
      )}
      {tab === "Season" && <SeasonStandings />}
      {tab === "Loops" && (
        <section className="p-surface p-directory-intro">
          <div>
            <h2>Discover the communities behind the claims.</h2>
            <p>
              Open a live Loop to explore its participation and eligibility.
            </p>
          </div>
          <Link className="p-button" href="/loops">
            Explore Loops <LuArrowRight />
          </Link>
        </section>
      )}
    </>
  )
}

function SeasonStandings() {
  const { state, entries, standings, rank, score } = useSeason()
  const [all, setAll] = useState(false)
  const cutoff = Math.ceil(entries * 0.15)
  const rows = all
    ? standings
    : standings.filter(
        (row, i) => i < 3 || Math.abs(i + 1 - cutoff) < 3 || row.current
      )
  const cutoffScore = standings[cutoff - 1]?.total ?? 0
  return (
    <>
      <SeasonScore />
      <div className="s-leaderboard-summary">
        <span>
          <LuTrophy />
          <strong>{cutoff}</strong>{" "}
          {state.phase === "registration" || state.phase === "late"
            ? "provisional paid places"
            : "paid places"}
        </span>
        <span>${Math.max(250, entries)} pool · $250 guaranteed</span>
        <Link className="p-text-link" href="/games?view=prizes">
          Prizes & Rules <LuArrowRight />
        </Link>
      </div>
      <div className="s-callout">
        <LuInfo />
        <p>
          {state.phase === "review"
            ? "Results are under review. Standings are provisional and prize claims are unavailable."
            : state.phase === "prizes"
            ? "Payout setup and tie rules are pending. These sample standings do not establish final prize eligibility."
            : state.phase === "late"
            ? "Late entrants receive backdated activity. Standings and limited-place qualification can change until entry closes."
            : "Current standings are provisional. The payout table and tie-breaking rules must be approved before launch."}
        </p>
      </div>
      {state.phase === "registration" ? (
        <div className="p-empty">
          <LuTrophy />
          <h2>The starting line is December 1.</h2>
          <p>
            Everyone begins with fresh Season streaks. Your all-time score stays
            separate.
          </p>
          <Link href="/games" className="p-button">
            See the Season <LuArrowRight />
          </Link>
        </div>
      ) : (
        <>
          {state.registered && (
            <p className="s-standing-status">
              {rank && rank <= cutoff
                ? "Currently in a paid position · subject to final standings and tie rules"
                : `${Math.max(
                    0,
                    cutoffScore - score.total + 1
                  )} more points to move above the current payout-cutoff score`}
            </p>
          )}
          <div className="p-table-wrap p-surface">
            <table className="p-table s-standings">
              <caption className="sr-only">
                Season 01 sample standings, with component points and a
                provisional payout cutoff
              </caption>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Looper</th>
                  <th>Season points</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.name}
                    className={row.current ? "is-current" : ""}
                  >
                    <td>
                      #{row.rank}
                      {row.rank === cutoff && (
                        <small className="s-cutoff-label">Paid cutoff</small>
                      )}
                    </td>
                    <td>
                      {row.name}
                      {row.current && (
                        <span className="s-pill">
                          You{state.earlyBird ? " · Early Bird" : ""}
                        </span>
                      )}
                    </td>
                    <td>
                      <strong>{row.total}</strong>
                      <details>
                        <summary>Point breakdown</summary>
                        <p>
                          {row.claims} claims + {row.streaks} streak +{" "}
                          {row.games} games
                        </p>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="p-button secondary" onClick={() => setAll(!all)}>
            {all ? "Show highlights" : `Show all ${standings.length} players`}
          </button>
          <p className="p-caption">
            Sample standings for UX review. Equal scores share a provisional
            rank; the prize-deciding tie policy is not yet approved.
          </p>
        </>
      )}
    </>
  )
}
