"use client"

import { useState, type ReactNode } from "react"
import Link from "next/link"
import { LuArrowRight } from "react-icons/lu"

import { FilterTabs, PageIntro } from "./participation-ui"

export function LeaderboardSections({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState("All-Time")
  return (
    <>
      <PageIntro
        title="Leaderboard"
        description="All-time Gyralis participation rankings. Every return counts."
      />
      <FilterTabs
        items={["All-Time", "Season", "Loops"]}
        value={tab}
        onChange={setTab}
        label="Leaderboard context"
      />
      {tab === "All-Time" && (
        <div className="p-legacy-view p-live-leaderboard">{children}</div>
      )}
      {tab === "Season" && (
        <>
          <div className="p-table-wrap p-surface">
            <table className="p-table">
              <caption className="sr-only">Season 01 standings</caption>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Looper</th>
                  <th>Season GP</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { rank: 1, name: "orbit.eth", gp: 2840 },
                  { rank: 2, name: "garden.eth", gp: 2718 },
                  { rank: 3, name: "return.eth", gp: 2604 },
                  { rank: 38, name: "Mati0x", gp: 1840 },
                ].map((row) => (
                  <tr
                    className={row.rank === 38 ? "is-current" : ""}
                    key={row.rank}
                  >
                    <td>#{row.rank}</td>
                    <td>{row.name}</td>
                    <td>{row.gp.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
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
