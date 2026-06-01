import { unstable_noStore as noStore } from "next/cache"
import Image from "next/image"
import { FaChartLine, FaCoins, FaUsers } from "react-icons/fa"
import type { IconType } from "react-icons"

import { getDashboardPageData } from "@/lib/dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardCharts } from "@/components/dashboard/dashboard-charts"
import { DashboardSectionNav } from "@/components/dashboard/dashboard-section-nav"
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card"
import { LoopTypeBadge } from "@/components/loops/loop-type-badge"

type OverviewStatGroupProps = {
  title: string
  mainValue: string
  mainSuffix?: string | null
  tone: "primary" | "secondary"
  icon: IconType
  rate?: {
    label: string
    value: number | null
  }
  substats: {
    label: string
    value: string
    tone?: "positive" | "muted"
  }[]
}

type OverviewEngagementCardProps = {
  totalRegistrations: string
  totalClaims: string
  claimRate: number | null
}

export const dynamic = "force-dynamic"

const sectionItems = [
  { id: "overview", label: "Overview" },
  { id: "loops", label: "Loops" },
  { id: "trends", label: "Trends" },
  { id: "details", label: "Details" },
]

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value)
}

function formatPercent(value: number | null) {
  if (value == null) return "N/A"
  return `${value.toFixed(2)}%`
}

function formatTokenAmount(
  value: string | null,
  symbol?: string | null,
  maxDecimals = 4
) {
  if (!value) return "N/A"

  const [integerPart, decimalPart = ""] = value.split(".")
  const formattedInteger = new Intl.NumberFormat("en-US").format(
    Number.parseInt(integerPart, 10)
  )
  const trimmedDecimal = decimalPart.slice(0, maxDecimals).replace(/0+$/, "")
  const formattedValue = trimmedDecimal
    ? `${formattedInteger}.${trimmedDecimal}`
    : formattedInteger

  return symbol ? `${formattedValue} ${symbol}` : formattedValue
}

function formatTokenAmountParts(
  value: string | null,
  symbol?: string | null,
  maxDecimals = 4
) {
  if (!value) {
    return { value: "N/A", symbol: null }
  }

  const [integerPart, decimalPart = ""] = value.split(".")
  const formattedInteger = new Intl.NumberFormat("en-US").format(
    Number.parseInt(integerPart, 10)
  )
  const trimmedDecimal = decimalPart.slice(0, maxDecimals).replace(/0+$/, "")

  return {
    value: trimmedDecimal
      ? `${formattedInteger}.${trimmedDecimal}`
      : formattedInteger,
    symbol: symbol ?? null,
  }
}

function formatUpdatedAt(value: string | null) {
  if (!value) return "Unknown"

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value))
}

function formatSidebarUpdatedAt(value: string | null) {
  if (!value) return "Unknown"

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value))
}

function OverviewStatGroup({
  title,
  mainValue,
  mainSuffix,
  tone,
  icon: Icon,
  rate,
  substats,
}: OverviewStatGroupProps) {
  const isPrimary = tone === "primary"
  const rateValue = Math.max(0, Math.min(rate?.value ?? 0, 100))

  return (
    <Card className="tamagotchi-card h-full p-0">
      <div
        className={`pointer-events-none absolute inset-0 ${
          isPrimary
            ? "bg-[radial-gradient(circle_at_18%_18%,rgba(28,231,131,0.1),transparent_42%)]"
            : "bg-[radial-gradient(circle_at_18%_18%,rgba(140,75,255,0.12),transparent_42%)]"
        }`}
      />
      <Icon
        className={`pointer-events-none absolute right-6 top-6 size-20 opacity-10 ${
          isPrimary ? "text-primary" : "text-secondary"
        }`}
      />
      <CardContent className="relative z-10 flex h-full flex-col gap-3 p-0">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {title}
          </p>
          <div
            className={`flex flex-wrap items-baseline gap-x-2 text-5xl font-semibold tracking-tight sm:text-6xl ${
              isPrimary ? "text-primary" : "text-secondary"
            }`}
          >
            <span>{mainValue}</span>
            {mainSuffix ? (
              <span className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground sm:text-base">
                {mainSuffix}
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-auto grid gap-2.5">
          {substats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border/60 bg-muted/20 p-3"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {stat.label}
              </p>
              <p
                className={`mt-1 text-lg font-semibold tracking-tight ${
                  stat.tone === "positive"
                    ? isPrimary
                      ? "text-primary"
                      : "text-secondary"
                    : stat.tone === "muted"
                      ? "text-muted-foreground"
                      : "text-card-foreground"
                }`}
              >
                {stat.value}
              </p>
            </div>
          ))}
          {rate ? (
            <div className="space-y-3 pt-1">
              <div className="flex items-end justify-between gap-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {rate.label}
                </p>
                <p className="text-lg font-semibold tracking-tight text-card-foreground">
                  {formatPercent(rate.value)}
                </p>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${
                    isPrimary
                      ? "bg-[linear-gradient(135deg,#1ce783_0%,#4ade80_100%)]"
                      : "bg-[linear-gradient(135deg,#8c4bff_0%,#a855f7_100%)]"
                  }`}
                  style={{ width: `${rateValue}%` }}
                />
              </div>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

function OverviewEngagementCard({
  totalRegistrations,
  totalClaims,
  claimRate,
}: OverviewEngagementCardProps) {
  const rateValue = Math.max(0, Math.min(claimRate ?? 0, 100))

  return (
    <Card className="tamagotchi-card h-full p-0">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(28,231,131,0.08),transparent_38%),radial-gradient(circle_at_86%_20%,rgba(140,75,255,0.1),transparent_34%)]" />
      <FaChartLine className="pointer-events-none absolute right-6 top-6 size-20 text-primary opacity-10" />
      <CardContent className="relative z-10 flex h-full flex-col gap-6 p-0">
        <div className="space-y-4">
          <p className="text-2xl font-semibold tracking-tight text-card-foreground">
            Engagement Metrics
          </p>
          <div className="h-px bg-border/70" />
        </div>

        <div className="grid gap-3">
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Total Registrations
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-card-foreground">
              {totalRegistrations}
            </p>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Total Claims
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-card-foreground">
              {totalClaims}
            </p>
          </div>
        </div>

        <div className="mt-auto space-y-3">
          <div className="flex items-end justify-between gap-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Overall Claim Rate
            </p>
            <p className="text-3xl font-semibold tracking-tight text-card-foreground">
              {formatPercent(claimRate)}
            </p>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-[linear-gradient(135deg,#1ce783_0%,#4ade80_100%)]"
              style={{ width: `${rateValue}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default async function DashboardPage() {
  noStore()

  const data = await getDashboardPageData({ periodsBack: 7 })
  const tokenSummary = data.tokenSummaries[0]
  const totalDistributedOverview = formatTokenAmountParts(
    data.overview.totalDistributedAmount,
    tokenSummary?.tokenSymbol,
    2
  )
  const firstVisiblePeriod = data.tables.periodSummary[0]
  const lastVisiblePeriod =
    data.tables.periodSummary[data.tables.periodSummary.length - 1]

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.14),transparent_28%),radial-gradient(circle_at_top_right,hsl(var(--secondary)/0.16),transparent_26%),linear-gradient(180deg,hsl(var(--background)/0.98),hsl(var(--background)))]" />
        <div className="absolute inset-y-0 left-0 w-40 bg-[linear-gradient(90deg,hsl(var(--muted)/0.65),transparent)] lg:w-64" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-screen-2xl flex-col gap-8 px-4 pb-16 pt-6 sm:px-6 lg:pl-32 lg:pr-8 lg:pt-8 xl:pl-36 xl:pr-10">
        <div className="lg:fixed lg:left-6 lg:top-24 lg:z-30">
          <DashboardSectionNav
            items={sectionItems}
            brand={{
              logoSrc: "/gyralis-logo.svg",
              title: "Gyralis",
              version: "v2.1.0",
            }}
            footerNote="Local cache snapshot from the shared JSON dataset."
            footerTimestamp={formatSidebarUpdatedAt(data.generatedAt)}
          />
        </div>

        <header className="group relative min-h-[340px] overflow-hidden rounded-[2rem] border border-border/70 bg-transparent sm:min-h-[380px] dark:bg-slate-950">
          <Image
            src="/dashboard-header.png"
            alt=""
            fill
            priority
            sizes="(min-width: 1536px) 1360px, (min-width: 1024px) calc(100vw - 11rem), calc(100vw - 2rem)"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.36)_0%,rgba(2,6,23,0.23)_38%,rgba(2,6,23,0.07)_100%),linear-gradient(180deg,rgba(2,6,23,0.04)_0%,rgba(2,6,23,0.26)_100%)] dark:bg-[linear-gradient(90deg,rgba(2,6,23,0.72)_0%,rgba(2,6,23,0.46)_38%,rgba(2,6,23,0.14)_100%),linear-gradient(180deg,rgba(2,6,23,0.08)_0%,rgba(2,6,23,0.52)_100%)]" />
          <div className="relative z-10 flex min-h-[340px] flex-col justify-end gap-5 p-6 sm:min-h-[380px] sm:p-8 xl:p-10">
            <div className="space-y-3">
              <h1 className="max-w-5xl text-5xl font-semibold tracking-tight text-slate-100 sm:text-6xl xl:text-7xl">
                Gyralis{" "}
                <span className="bg-[linear-gradient(135deg,#1ce783_0%,#4ade80_100%)] bg-clip-text text-transparent">
                  Dashboard
                </span>
              </h1>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <p className="max-w-3xl text-base leading-7 text-slate-300 sm:text-xl sm:leading-8">
                  Live loops analytics for tracking participation, claims, and
                  token distribution across the Gyralis ecosystem.
                </p>
                <div className="inline-flex w-fit shrink-0 rounded-full bg-black/45 px-4 py-2 text-sm font-medium text-slate-200 ring-1 ring-white/10 backdrop-blur">
                  Last updated {formatUpdatedAt(data.generatedAt)}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="space-y-12">
          <section id="overview" className="scroll-mt-24 space-y-5">
            <div className="space-y-2">
              <h2>Overview</h2>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <OverviewStatGroup
                title="Unique Registered Users"
                tone="primary"
                icon={FaUsers}
                mainValue={formatNumber(
                  data.overview.globalUniqueRegisteredUsers
                )}
                rate={{
                  label: "Registered Users Claimed",
                  value: data.overview.claimParticipationRatePercent,
                }}
                substats={[
                  {
                    label: "Unique Claim Users",
                    value: formatNumber(data.overview.globalUniqueClaimUsers),
                    tone: "positive",
                  },
                  {
                    label: "Registered But Never Claimed",
                    value: formatNumber(
                      data.overview.globalRegisteredButNeverClaimedUsers
                    ),
                    tone: "muted",
                  },
                ]}
              />
              <OverviewStatGroup
                title="Total Distributed"
                tone="secondary"
                icon={FaCoins}
                mainValue={totalDistributedOverview.value}
                mainSuffix={totalDistributedOverview.symbol}
                rate={{
                  label: "Distributed Tokens Claimed",
                  value: data.overview.claimedAmountRatePercent,
                }}
                substats={[
                  {
                    label: "Total Claimed",
                    value: formatTokenAmount(
                      data.overview.totalClaimedAmount,
                      tokenSummary?.tokenSymbol,
                      2
                    ),
                    tone: "positive",
                  },
                  {
                    label: "Total Unclaimed",
                    value: formatTokenAmount(
                      data.overview.totalUnclaimedAmount,
                      tokenSummary?.tokenSymbol,
                      2
                    ),
                    tone: "muted",
                  },
                ]}
              />
              <OverviewEngagementCard
                totalRegistrations={formatNumber(
                  data.overview.totalRegistrations
                )}
                totalClaims={formatNumber(data.overview.totalClaims)}
                claimRate={data.overview.claimParticipationRatePercent}
              />
            </div>
          </section>

          <section id="loops" className="scroll-mt-24 space-y-5">
            <div className="space-y-2">
              <h2>2. Loop Totals</h2>
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
              {data.loopSummaries.map((loop) => (
                <Card
                  key={loop.loopKey}
                  className="overflow-hidden rounded-[26px] border border-border/70 bg-card/80 shadow-[0_30px_80px_-56px_hsl(var(--foreground)/0.2)] backdrop-blur-xl"
                >
                  <CardHeader className="gap-5 border-b border-border/70 bg-muted/20 p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex size-14 items-center justify-center rounded-2xl border border-border/70 bg-muted/55">
                          <Image
                            src={loop.meta.logoSrc}
                            alt={`${loop.meta.title} logo`}
                            width={34}
                            height={34}
                            className="size-8 object-contain"
                          />
                        </div>
                        <div className="space-y-2">
                          <CardTitle className="text-2xl text-card-foreground">
                            {loop.meta.title}
                          </CardTitle>
                          <LoopTypeBadge
                            isSuper={loop.meta.contractType === "superLoop"}
                          />
                        </div>
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
                        value={formatNumber(
                          loop.registeredButNeverClaimedCount
                        )}
                        className="shadow-none"
                      />
                      <DashboardStatCard
                        label="Claim Participation"
                        value={formatPercent(
                          loop.claimParticipationRatePercent
                        )}
                        className="shadow-none"
                      />
                    </div>

                    <div className="grid gap-4 lg:grid-cols-[1.4fr,1fr]">
                      <div className="rounded-2xl border border-border/60 bg-muted/20 p-5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          Total Token Flow
                        </p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Distributed
                            </p>
                            <p className="mt-1 text-lg font-semibold text-card-foreground">
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
                            <p className="mt-1 text-lg font-semibold text-primary">
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
                            <p className="mt-1 text-lg font-semibold text-secondary">
                              {formatTokenAmount(
                                loop.totalUnclaimedAmount,
                                loop.meta.tokenSymbol
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-border/60 bg-muted/20 p-5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          Token Balance Snapshots
                        </p>
                        <div className="mt-4 space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Balance at Period 1
                              </p>
                              <p className="mt-1 text-lg font-semibold text-card-foreground">
                                {formatTokenAmount(
                                  loop.tokenSnapshots?.balanceAtPeriod1
                                    ?.formatted ?? null,
                                  loop.meta.tokenSymbol
                                )}
                              </p>
                            </div>
                            <span className="inline-flex items-center rounded-full border border-border/70 px-3 py-1 text-xs font-semibold text-muted-foreground">
                              Start
                            </span>
                          </div>
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Balance at Latest Ended Period
                              </p>
                              <p className="mt-1 text-lg font-semibold text-card-foreground">
                                {formatTokenAmount(
                                  loop.tokenSnapshots
                                    ?.balanceAtLastProcessedPeriod?.formatted ??
                                    null,
                                  loop.meta.tokenSymbol
                                )}
                              </p>
                            </div>
                            <span className="inline-flex items-center rounded-full border border-border/70 px-3 py-1 text-xs font-semibold text-muted-foreground">
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
              <h2>3. Trend Window</h2>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.1fr,0.9fr]">
              <Card className="rounded-[26px] border border-border/70 bg-card/80 shadow-[0_30px_80px_-56px_hsl(var(--foreground)/0.2)] backdrop-blur-xl">
                <CardHeader className="border-b border-border/70 bg-muted/20">
                  <CardTitle className="text-xl text-card-foreground">
                    Visible Date Window
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 p-6">
                  <div className="flex flex-wrap gap-2">
                    {data.charts.registrationsByPeriod.map((row) => (
                      <span
                        key={row.period}
                        className="inline-flex items-center rounded-full border border-border/70 bg-muted/50 px-3 py-1 text-xs font-semibold text-muted-foreground"
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
              <Card className="rounded-[26px] border border-border/70 bg-card/80 shadow-[0_30px_80px_-56px_hsl(var(--foreground)/0.2)] backdrop-blur-xl">
                <CardHeader className="border-b border-border/70 bg-muted/20">
                  <CardTitle className="text-xl text-card-foreground">
                    Window Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 p-6">
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Ended-Date Model
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Every chart is pinned to the day the period ended, not the
                      internal period number, so the dashboard reads the way
                      users remember claiming activity.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Current Range
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      The charts below render the latest seven completed dates
                      from the cache and are ready for window navigation next.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Loop Coverage
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Comparing {data.loopSummaries.length} Gnosis loops with
                      shared token accounting and synchronized ended-date
                      labels.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <DashboardCharts
              loops={data.loopSummaries.map((loop, index) => ({
                loopKey: loop.loopKey,
                title: loop.meta.title,
                shortTitle: loop.meta.shortTitle,
                color:
                  index % 2 === 0
                    ? "hsl(var(--primary))"
                    : "hsl(var(--secondary))",
                softColor:
                  index % 2 === 0
                    ? "hsl(var(--primary) / 0.35)"
                    : "hsl(var(--secondary) / 0.35)",
              }))}
              tokenSymbol={tokenSummary?.tokenSymbol ?? null}
              registrationsByPeriod={data.charts.registrationsByPeriod}
              claimsByPeriod={data.charts.claimsByPeriod}
              claimRateByPeriod={data.charts.claimRateByPeriod}
              cumulativeUniqueUsersByPeriod={
                data.charts.cumulativeUniqueUsersByPeriod
              }
              distributionByPeriod={data.charts.distributionByPeriod}
            />
          </section>

          <section id="details" className="scroll-mt-24 space-y-5">
            <div className="space-y-2">
              <h2>Latest Periods Details</h2>
            </div>

            <Card className="overflow-hidden rounded-[26px] border border-border/70 bg-card/80 shadow-[0_30px_80px_-56px_hsl(var(--foreground)/0.2)] backdrop-blur-xl">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border/70 text-sm">
                    <thead className="bg-muted/20">
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
                    <tbody className="divide-y divide-border/60">
                      {data.tables.periodSummary.map((row) => (
                        <tr
                          key={`${row.loopKey}-${row.period}`}
                          className="bg-transparent"
                        >
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
  )
}
