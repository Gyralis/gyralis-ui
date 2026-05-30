import Image from "next/image"
import { unstable_noStore as noStore } from "next/cache"

import { DashboardSectionNav } from "@/components/dashboard/dashboard-section-nav"
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getDashboardPageData } from "@/lib/dashboard"

export const dynamic = "force-dynamic"

const sectionItems = [
  { id: "overview", label: "Overview" },
  { id: "loops", label: "Loop Totals" },
  { id: "trends", label: "Trend Window" },
  { id: "details", label: "Period Details" },
]

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value)
}

function formatPercent(value: number | null) {
  if (value == null) return "N/A"
  return `${value.toFixed(2)}%`
}

function formatTokenAmount(value: string | null, symbol?: string | null) {
  if (!value) return "N/A"

  const [integerPart, decimalPart = ""] = value.split(".")
  const formattedInteger = new Intl.NumberFormat("en-US").format(
    Number.parseInt(integerPart, 10)
  )
  const trimmedDecimal = decimalPart.slice(0, 4).replace(/0+$/, "")
  const formattedValue = trimmedDecimal
    ? `${formattedInteger}.${trimmedDecimal}`
    : formattedInteger

  return symbol ? `${formattedValue} ${symbol}` : formattedValue
}

function formatUpdatedAt(value: string | null) {
  if (!value) return "Unknown"

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(new Date(value))
}

export default async function DashboardPage() {
  noStore()

  const data = await getDashboardPageData({ periodsBack: 7 })
  const tokenSummary = data.tokenSummaries[0]
  const firstVisiblePeriod = data.tables.periodSummary[0]
  const lastVisiblePeriod =
    data.tables.periodSummary[data.tables.periodSummary.length - 1]

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-10 px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pt-12">
        <header className="rounded-[28px] border bg-[linear-gradient(135deg,rgba(20,32,54,0.98),rgba(31,55,78,0.92)_45%,rgba(245,248,252,0.94)_140%)] p-6 text-white shadow-[0_28px_90px_-50px_rgba(15,23,42,0.75)] sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                  SSR Dashboard
                </span>
                <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                  Ended-Date Reporting
                </span>
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                  Loop Activity Dashboard
                </h1>
                <p className="max-w-2xl text-base leading-7 text-white/78 sm:text-lg">
                  Registration, claims, and token distribution across loops,
                  anchored to the date each period ended.
                </p>
              </div>
            </div>

            <Card className="w-full max-w-md rounded-2xl border-white/10 bg-white/8 text-white shadow-none backdrop-blur">
              <CardContent className="grid gap-4 p-5 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">
                    Last Updated
                  </p>
                  <p className="text-sm text-white/90">
                    {formatUpdatedAt(data.generatedAt)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">
                    Visible Window
                  </p>
                  <p className="text-sm text-white/90">
                    {firstVisiblePeriod?.periodEndedShortLabel ?? "N/A"} to{" "}
                    {lastVisiblePeriod?.periodEndedShortLabel ?? "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">
                    Loops
                  </p>
                  <p className="text-sm text-white/90">
                    {data.filters.selectedLoopKeys.length} active in dashboard
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">
                    Token
                  </p>
                  <p className="text-sm text-white/90">
                    {tokenSummary?.tokenSymbol ?? "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[240px,minmax(0,1fr)] lg:items-start xl:grid-cols-[260px,minmax(0,1fr)]">
          <div className="lg:sticky lg:top-24">
            <DashboardSectionNav items={sectionItems} />
          </div>

          <div className="space-y-12">
            <section id="overview" className="scroll-mt-24 space-y-5">
              <div className="space-y-2">
                <p className="text-sm font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  1. Overview
                </p>
                <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                  System-wide totals
                </h2>
                <p className="max-w-3xl text-base leading-7 text-muted-foreground">
                  A top-level read on participation and claim behavior across
                  the loops currently included in the dashboard.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <DashboardStatCard
                  label="Unique Registered Users"
                  value={formatNumber(data.overview.globalUniqueRegisteredUsers)}
                />
                <DashboardStatCard
                  label="Unique Claim Users"
                  value={formatNumber(data.overview.globalUniqueClaimUsers)}
                />
                <DashboardStatCard
                  label="Registered But Never Claimed"
                  value={formatNumber(
                    data.overview.globalRegisteredButNeverClaimedUsers
                  )}
                />
                <DashboardStatCard
                  label="Total Registrations"
                  value={formatNumber(data.overview.totalRegistrations)}
                />
                <DashboardStatCard
                  label="Total Claims"
                  value={formatNumber(data.overview.totalClaims)}
                />
                <DashboardStatCard
                  label="Claim Participation Rate"
                  value={formatPercent(data.overview.claimParticipationRatePercent)}
                />
                <DashboardStatCard
                  label="Total Distributed"
                  value={formatTokenAmount(
                    data.overview.totalDistributedAmount,
                    tokenSummary?.tokenSymbol
                  )}
                />
                <DashboardStatCard
                  label="Total Claimed"
                  value={formatTokenAmount(
                    data.overview.totalClaimedAmount,
                    tokenSummary?.tokenSymbol
                  )}
                />
                <DashboardStatCard
                  label="Total Unclaimed"
                  value={formatTokenAmount(
                    data.overview.totalUnclaimedAmount,
                    tokenSummary?.tokenSymbol
                  )}
                />
                <DashboardStatCard
                  label="Claimed Amount Rate"
                  value={formatPercent(data.overview.claimedAmountRatePercent)}
                />
              </div>
            </section>

            <section id="loops" className="scroll-mt-24 space-y-5">
              <div className="space-y-2">
                <p className="text-sm font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  2. Loop Totals
                </p>
                <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                  All-time loop summaries
                </h2>
                <p className="max-w-3xl text-base leading-7 text-muted-foreground">
                  Each card focuses on total values, not just the most recent
                  ended period, so users keep the full picture while exploring
                  trends below.
                </p>
              </div>

              <div className="grid gap-5 xl:grid-cols-2">
                {data.loopSummaries.map((loop) => (
                  <Card
                    key={loop.loopKey}
                    className="overflow-hidden rounded-[26px] border shadow-sm"
                  >
                    <CardHeader className="gap-5 border-b bg-muted/25 p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex size-14 items-center justify-center rounded-2xl border bg-background">
                            <Image
                              src={loop.meta.logoSrc}
                              alt={`${loop.meta.title} logo`}
                              width={34}
                              height={34}
                              className="size-8 object-contain"
                            />
                          </div>
                          <div className="space-y-1">
                            <CardTitle className="text-2xl">
                              {loop.meta.title}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {loop.meta.chainName} • by {loop.meta.by}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-foreground">
                            Ended through{" "}
                            {loop.currentPeriodStats?.periodEndedLongLabel ?? "N/A"}
                          </span>
                          <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground">
                            {loop.meta.tokenSymbol}
                          </span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6 p-6">
                      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <DashboardStatCard
                          label="Unique Registered"
                          value={formatNumber(loop.uniqueUserCount)}
                          className="shadow-none"
                        />
                        <DashboardStatCard
                          label="Unique Claimed"
                          value={formatNumber(loop.uniqueClaimUserCount)}
                          className="shadow-none"
                        />
                        <DashboardStatCard
                          label="Never Claimed"
                          value={formatNumber(loop.registeredButNeverClaimedCount)}
                          className="shadow-none"
                        />
                        <DashboardStatCard
                          label="Claim Participation"
                          value={formatPercent(loop.claimParticipationRatePercent)}
                          className="shadow-none"
                        />
                      </div>

                      <div className="grid gap-4 lg:grid-cols-[1.4fr,1fr]">
                        <div className="rounded-2xl border bg-muted/20 p-5">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                            Total Token Flow
                          </p>
                          <div className="mt-4 grid gap-3 sm:grid-cols-3">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Distributed
                              </p>
                              <p className="mt-1 text-lg font-semibold text-foreground">
                                {formatTokenAmount(
                                  loop.totalDistributedAmount,
                                  loop.meta.tokenSymbol
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Claimed
                              </p>
                              <p className="mt-1 text-lg font-semibold text-foreground">
                                {formatTokenAmount(
                                  loop.totalClaimedAmount,
                                  loop.meta.tokenSymbol
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Unclaimed
                              </p>
                              <p className="mt-1 text-lg font-semibold text-foreground">
                                {formatTokenAmount(
                                  loop.totalUnclaimedAmount,
                                  loop.meta.tokenSymbol
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl border bg-muted/20 p-5">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                            Token Balance Snapshots
                          </p>
                          <div className="mt-4 space-y-4">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Balance at Period 1
                                </p>
                                <p className="mt-1 text-lg font-semibold text-foreground">
                                  {formatTokenAmount(
                                    loop.tokenSnapshots?.balanceAtPeriod1
                                      ?.formatted ?? null,
                                    loop.meta.tokenSymbol
                                  )}
                                </p>
                              </div>
                              <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground">
                                Start
                              </span>
                            </div>
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Balance at Latest Ended Period
                                </p>
                                <p className="mt-1 text-lg font-semibold text-foreground">
                                  {formatTokenAmount(
                                    loop.tokenSnapshots
                                      ?.balanceAtLastProcessedPeriod?.formatted ?? null,
                                    loop.meta.tokenSymbol
                                  )}
                                </p>
                              </div>
                              <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground">
                                Latest Ended
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section id="trends" className="scroll-mt-24 space-y-5">
              <div className="space-y-2">
                <p className="text-sm font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  3. Trend Window
                </p>
                <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                  Structured for the latest seven ended dates
                </h2>
                <p className="max-w-3xl text-base leading-7 text-muted-foreground">
                  The dashboard data is already constrained to a seven-period
                  reporting window for charts. This section sets the frame for
                  the chart layer without rendering it yet.
                </p>
              </div>

              <div className="grid gap-5 lg:grid-cols-[1.1fr,0.9fr]">
                <Card className="rounded-[26px] border shadow-sm">
                  <CardHeader className="border-b bg-muted/20">
                    <CardTitle className="text-xl">Visible Date Window</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5 p-6">
                    <div className="flex flex-wrap gap-2">
                      {data.charts.registrationsByPeriod.map((row) => (
                        <span
                          key={row.period}
                          className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground"
                        >
                          {row.periodEndedShortLabel ?? "Date unavailable"}
                        </span>
                      ))}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <DashboardStatCard
                        label="Window Start"
                        value={firstVisiblePeriod?.periodEndedLongLabel ?? "N/A"}
                        className="shadow-none"
                      />
                      <DashboardStatCard
                        label="Window End"
                        value={lastVisiblePeriod?.periodEndedLongLabel ?? "N/A"}
                        className="shadow-none"
                      />
                      <DashboardStatCard
                        label="Rows in Window"
                        value={formatNumber(data.tables.periodSummary.length)}
                        className="shadow-none"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-[26px] border shadow-sm">
                  <CardHeader className="border-b bg-muted/20">
                    <CardTitle className="text-xl">Chart Slots</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3 p-6">
                    {[
                      "Registrations by ended date",
                      "Claims by ended date",
                      "Claimed vs unclaimed amount",
                      "Claim rate by ended date",
                      "Cumulative unique users",
                    ].map((title) => (
                      <div
                        key={title}
                        className="rounded-2xl border border-dashed bg-muted/10 p-4"
                      >
                        <p className="font-medium text-foreground">{title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Recharts component will plug into the same seven-ended-date
                          window and use date-first labels.
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </section>

            <section id="details" className="scroll-mt-24 space-y-5">
              <div className="space-y-2">
                <p className="text-sm font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  4. Period Details
                </p>
                <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                  Latest ended-date breakdown
                </h2>
                <p className="max-w-3xl text-base leading-7 text-muted-foreground">
                  A detailed table for the current reporting window, using the
                  ended date as the main period label for users.
                </p>
              </div>

              <Card className="overflow-hidden rounded-[26px] border shadow-sm">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border text-sm">
                      <thead className="bg-muted/30">
                        <tr className="text-left">
                          {[
                            "Period Ended",
                            "Loop",
                            "Registrations",
                            "Claims",
                            "Claim Rate",
                            "Distributed",
                            "Claimed",
                            "Unclaimed",
                            "New Users",
                          ].map((label) => (
                            <th
                              key={label}
                              className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                            >
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/80">
                        {data.tables.periodSummary.map((row) => (
                          <tr key={`${row.loopKey}-${row.period}`} className="bg-card">
                            <td className="whitespace-nowrap px-4 py-3 font-medium text-foreground">
                              {row.periodEndedLongLabel ?? `Period ${row.period}`}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-foreground">
                              {row.loopName}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                              {formatNumber(row.registrations)}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                              {formatNumber(row.claims)}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                              {formatPercent(row.claimRatePercent)}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                              {formatTokenAmount(
                                row.distributedAmount,
                                tokenSummary?.tokenSymbol
                              )}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                              {formatTokenAmount(
                                row.claimedAmount,
                                tokenSummary?.tokenSymbol
                              )}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                              {formatTokenAmount(
                                row.unclaimedAmount,
                                tokenSummary?.tokenSymbol
                              )}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                              {formatNumber(row.newUsers)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
