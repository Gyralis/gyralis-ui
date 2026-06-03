import { readFile } from "node:fs/promises"
import { resolve } from "node:path"

import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card"

type LeaderboardEntry = {
  address: string
  claims: number
  lastClaimedPeriodDate: string | null
}

function formatPeriodLabel(dateValue: string | null) {
  if (!dateValue) return "Unknown"
  const timestamp = Date.parse(dateValue)
  if (!Number.isFinite(timestamp)) return dateValue
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(timestamp))
}

function truncateAddress(address: string) {
  return address.length > 14
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : address
}

export default async function LeaderboardPage() {
  const leaderboardPath = resolve(
    process.cwd(),
    "data/true-loopers-leaderboard.json"
  )

  let leaderboard: LeaderboardEntry[] = []
  try {
    const raw = await readFile(leaderboardPath, "utf8")
    leaderboard = JSON.parse(raw) as LeaderboardEntry[]
  } catch {
    leaderboard = []
  }

  // Compute metrics
  const totalClaimers = leaderboard.length
  const totalClaims = leaderboard.reduce((sum, entry) => sum + entry.claims, 0)
  const usersWithHighClaims = leaderboard.filter(
    (entry) => entry.claims >= 20
  ).length
  const usersWithMediumClaims = leaderboard.filter(
    (entry) => entry.claims >= 10 && entry.claims < 20
  ).length
  const avgClaimsPerUser =
    totalClaimers > 0 ? Math.round(totalClaims / totalClaimers) : 0
  const maxClaims = leaderboard.length > 0 ? leaderboard[0]?.claims ?? 0 : 0

  return (
    <section className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
            Leaderboard
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            True Loopers
          </h1>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Ranked by total claims across loop activity. This leaderboard shows
          claimers sorted by total claims and last claimed period.
        </p>
      </div>

      {leaderboard.length === 0 ? (
        <div className="rounded-3xl border border-border bg-secondary/40 p-8 text-center text-sm text-muted-foreground">
          No leaderboard data is available yet.
        </div>
      ) : (
        <>
          {/* Metrics Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DashboardStatCard
              label="Total Active Claimers"
              value={String(totalClaimers)}
              hint="addresses that claimed at least once"
            />
            <DashboardStatCard
              label="Total Claims"
              value={String(totalClaims)}
              hint="across all loops and periods"
            />
            <DashboardStatCard
              label="Avg Claims per User"
              value={String(avgClaimsPerUser)}
              hint="mean claims across all claimers"
            />
            <DashboardStatCard
              label="Top Performer"
              value={String(maxClaims)}
              hint="highest claims by a single address"
            />
            <DashboardStatCard
              label="Power Users (20+)"
              value={String(usersWithHighClaims)}
              hint={`${Math.round(
                (usersWithHighClaims / totalClaimers) * 100
              )}% of all claimers`}
            />
            <DashboardStatCard
              label="Active Users (10-19)"
              value={String(usersWithMediumClaims)}
              hint={`${Math.round(
                (usersWithMediumClaims / totalClaimers) * 100
              )}% of all claimers`}
            />
          </div>

          {/* Leaderboard Table */}
          <div className="overflow-hidden rounded-3xl border border-border bg-background shadow-sm">
            <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
              <thead className="bg-muted/10 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Wallet</th>
                  <th className="px-4 py-3">Total Claims</th>
                  <th className="px-4 py-3">Last claimed period</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((row, index) => (
                  <tr
                    key={row.address}
                    className={index % 2 === 0 ? "bg-background" : "bg-muted/5"}
                  >
                    <td className="whitespace-nowrap p-4 font-medium text-foreground">
                      {index + 1}
                    </td>
                    <td
                      className="whitespace-nowrap p-4 text-foreground"
                      title={row.address}
                    >
                      {truncateAddress(row.address)}
                    </td>
                    <td className="whitespace-nowrap p-4 text-foreground">
                      {row.claims}
                    </td>
                    <td className="whitespace-nowrap p-4 text-foreground">
                      {formatPeriodLabel(row.lastClaimedPeriodDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}
