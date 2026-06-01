"use client"

import type { ReactNode } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type {
  DashboardDistributionByPeriodRow,
  DashboardLoopKey,
  DashboardMetricByPeriodRow,
} from "@/lib/dashboard/types"

type DashboardChartLoop = {
  loopKey: DashboardLoopKey
  title: string
  shortTitle: string
  color: string
  softColor: string
}

type DashboardChartsProps = {
  loops: DashboardChartLoop[]
  tokenSymbol: string | null
  registrationsByPeriod: DashboardMetricByPeriodRow[]
  claimsByPeriod: DashboardMetricByPeriodRow[]
  claimRateByPeriod: DashboardMetricByPeriodRow[]
  cumulativeUniqueUsersByPeriod: DashboardMetricByPeriodRow[]
  distributionByPeriod: DashboardDistributionByPeriodRow[]
}

type ChartDataRow = {
  label: string
  fullLabel: string
  [key: string]: number | string
}

type TooltipEntry = {
  color?: string
  dataKey?: string | number
  name?: string
  value?: number | string
  payload?: ChartDataRow
}

type TooltipProps = {
  active?: boolean
  payload?: TooltipEntry[]
  label?: string
}

const chartGridColor = "hsl(var(--border) / 0.55)"
const axisColor = "hsl(var(--muted-foreground))"
const tooltipStyle = {
  backgroundColor: "hsl(var(--popover) / 0.96)",
  border: "1px solid hsl(var(--border) / 0.8)",
  borderRadius: "18px",
  boxShadow: "0 18px 42px -24px hsl(var(--foreground) / 0.35)",
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value)
}

function formatPercent(value: number) {
  return `${value.toFixed(2)}%`
}

function formatToken(value: number, tokenSymbol?: string | null) {
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(value)

  return tokenSymbol ? `${formatted} ${tokenSymbol}` : formatted
}

function buildMetricRows(
  rows: DashboardMetricByPeriodRow[],
  loops: DashboardChartLoop[]
): ChartDataRow[] {
  return rows.map((row) => ({
    label: row.periodEndedShortLabel ?? `Period ${row.period}`,
    fullLabel: row.periodEndedLongLabel ?? `Period ${row.period}`,
    ...Object.fromEntries(
      loops.map((loop) => [loop.loopKey, Number(row.values[loop.loopKey] ?? 0)])
    ),
  }))
}

function buildDistributionRows(
  rows: DashboardDistributionByPeriodRow[],
  loops: DashboardChartLoop[]
): ChartDataRow[] {
  const grouped = new Map<number, ChartDataRow>()

  for (const row of rows) {
    const existing = grouped.get(row.period) ?? {
      label: row.periodEndedShortLabel ?? `Period ${row.period}`,
      fullLabel: row.periodEndedLongLabel ?? `Period ${row.period}`,
    }

    existing[`${row.loopKey}Claimed`] = Number.parseFloat(row.claimedAmount ?? "0")
    existing[`${row.loopKey}Unclaimed`] = Number.parseFloat(
      row.unclaimedAmount ?? "0"
    )

    grouped.set(row.period, existing)
  }

  return Array.from(grouped.values()).map((row) => ({
    ...row,
    ...Object.fromEntries(
      loops.flatMap((loop) => [
        [`${loop.loopKey}Claimed`, Number(row[`${loop.loopKey}Claimed`] ?? 0)],
        [`${loop.loopKey}Unclaimed`, Number(row[`${loop.loopKey}Unclaimed`] ?? 0)],
      ])
    ),
  }))
}

function ChartCard({
  title,
  description,
  children,
  className,
}: {
  title: string
  description: string
  children: ReactNode
  className?: string
}) {
  return (
    <Card
      className={cn(
        "rounded-[26px] border border-border/70 bg-card/80 shadow-[0_30px_80px_-56px_hsl(var(--foreground)/0.2)] backdrop-blur-xl",
        className
      )}
    >
      <CardHeader className="space-y-2 border-b border-border/70 bg-muted/20">
        <CardTitle className="text-xl text-card-foreground">{title}</CardTitle>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="p-6">{children}</CardContent>
    </Card>
  )
}

function CustomTooltip({
  active,
  payload,
  tokenSymbol,
  valueFormatter,
}: TooltipProps & {
  tokenSymbol?: string | null
  valueFormatter: (value: number, tokenSymbol?: string | null) => string
}) {
  if (!active || !payload?.length) return null

  const fullLabel = payload[0]?.payload?.fullLabel ?? payload[0]?.payload?.label

  return (
    <div style={tooltipStyle} className="min-w-[200px] p-3 text-sm">
      <p className="mb-2 font-medium text-popover-foreground">{fullLabel}</p>
      <div className="space-y-1.5">
        {payload.map((entry) => {
          const rawValue = Number(entry.value ?? 0)

          return (
            <div
              key={String(entry.dataKey ?? entry.name ?? "series")}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <span
                  className="size-2 rounded-full"
                  style={{
                    backgroundColor: entry.color ?? "hsl(var(--foreground))",
                  }}
                />
                <span>{entry.name}</span>
              </div>
              <span className="font-medium text-popover-foreground">
                {valueFormatter(rawValue, tokenSymbol)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function DashboardCharts({
  loops,
  tokenSymbol,
  registrationsByPeriod,
  claimsByPeriod,
  claimRateByPeriod,
  cumulativeUniqueUsersByPeriod,
  distributionByPeriod,
}: DashboardChartsProps) {
  const registrationsData = buildMetricRows(registrationsByPeriod, loops)
  const claimsData = buildMetricRows(claimsByPeriod, loops)
  const claimRateData = buildMetricRows(claimRateByPeriod, loops)
  const cumulativeData = buildMetricRows(cumulativeUniqueUsersByPeriod, loops)
  const distributionData = buildDistributionRows(distributionByPeriod, loops)

  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-2">
        <ChartCard
          title="Registrations by Ended Date"
          description="Grouped bars make it easy to compare participation volume across loops in the current seven-date window."
        >
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={registrationsData} barGap={10}>
                <CartesianGrid stroke={chartGridColor} vertical={false} />
                <XAxis dataKey="label" tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: axisColor, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => formatCompactNumber(Number(value))}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted) / 0.35)" }}
                  content={
                    <CustomTooltip
                      valueFormatter={(value) => formatNumber(value)}
                    />
                  }
                />
                <Legend wrapperStyle={{ color: "hsl(var(--muted-foreground))" }} />
                {loops.map((loop) => (
                  <Bar
                    key={loop.loopKey}
                    dataKey={loop.loopKey}
                    name={loop.shortTitle}
                    fill={loop.color}
                    radius={[10, 10, 0, 0]}
                    maxBarSize={28}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Claims by Ended Date"
          description="Claim activity over the same ended-date window, so the user can contrast registration interest with actual redemptions."
        >
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={claimsData}>
                <CartesianGrid stroke={chartGridColor} vertical={false} />
                <XAxis dataKey="label" tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: axisColor, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => formatCompactNumber(Number(value))}
                />
                <Tooltip
                  content={
                    <CustomTooltip
                      valueFormatter={(value) => formatNumber(value)}
                    />
                  }
                />
                <Legend wrapperStyle={{ color: "hsl(var(--muted-foreground))" }} />
                {loops.map((loop) => (
                  <Line
                    key={loop.loopKey}
                    type="monotone"
                    dataKey={loop.loopKey}
                    name={loop.shortTitle}
                    stroke={loop.color}
                    strokeWidth={3}
                    dot={{ r: 4, fill: loop.color, strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <ChartCard
          title="Claimed vs Unclaimed Amount"
          description="Each ended date shows one stack per loop, split into claimed and unclaimed HNY so token flow is legible at a glance."
        >
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} barGap={18}>
                <CartesianGrid stroke={chartGridColor} vertical={false} />
                <XAxis dataKey="label" tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: axisColor, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => formatCompactNumber(Number(value))}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted) / 0.35)" }}
                  content={
                    <CustomTooltip
                      tokenSymbol={tokenSymbol}
                      valueFormatter={(value, symbol) => formatToken(value, symbol)}
                    />
                  }
                />
                <Legend wrapperStyle={{ color: "hsl(var(--muted-foreground))" }} />
                {loops.map((loop) => (
                  <Bar
                    key={`${loop.loopKey}-claimed`}
                    dataKey={`${loop.loopKey}Claimed`}
                    name={`${loop.shortTitle} Claimed`}
                    stackId={`${loop.loopKey}-stack`}
                    fill={loop.color}
                    radius={[8, 8, 0, 0]}
                    maxBarSize={24}
                  />
                ))}
                {loops.map((loop) => (
                  <Bar
                    key={`${loop.loopKey}-unclaimed`}
                    dataKey={`${loop.loopKey}Unclaimed`}
                    name={`${loop.shortTitle} Unclaimed`}
                    stackId={`${loop.loopKey}-stack`}
                    fill={loop.softColor}
                    radius={[8, 8, 0, 0]}
                    maxBarSize={24}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Claim Rate by Ended Date"
          description="The percent of registrations that turned into claims in each ended period, compared side by side across loops."
        >
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={claimRateData}>
                <CartesianGrid stroke={chartGridColor} vertical={false} />
                <XAxis dataKey="label" tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: axisColor, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${Number(value)}%`}
                />
                <Tooltip
                  content={
                    <CustomTooltip
                      valueFormatter={(value) => formatPercent(value)}
                    />
                  }
                />
                <Legend wrapperStyle={{ color: "hsl(var(--muted-foreground))" }} />
                {loops.map((loop) => (
                  <Line
                    key={loop.loopKey}
                    type="monotone"
                    dataKey={loop.loopKey}
                    name={loop.shortTitle}
                    stroke={loop.color}
                    strokeWidth={3}
                    dot={{ r: 4, fill: loop.color, strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <ChartCard
        title="Cumulative Unique Users"
        description="This growth curve keeps the all-time participation story visible even while the dashboard only renders the latest seven ended dates."
      >
        <div className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cumulativeData}>
              <CartesianGrid stroke={chartGridColor} vertical={false} />
              <XAxis dataKey="label" tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: axisColor, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => formatCompactNumber(Number(value))}
              />
              <Tooltip
                content={
                  <CustomTooltip
                    valueFormatter={(value) => formatNumber(value)}
                  />
                }
              />
              <Legend wrapperStyle={{ color: "hsl(var(--muted-foreground))" }} />
              {loops.map((loop) => (
                <Line
                  key={loop.loopKey}
                  type="monotone"
                  dataKey={loop.loopKey}
                  name={loop.title}
                  stroke={loop.color}
                  strokeWidth={3}
                  dot={{ r: 4, fill: loop.color, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  )
}
