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
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type {
  DashboardHistoryMetricRow,
  DashboardLoopKey,
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
  claimParticipationRatePercent: number | null
  uniqueUsersBySnapshot: DashboardHistoryMetricRow[]
  uniqueClaimUsersBySnapshot: DashboardHistoryMetricRow[]
  registrationsBySnapshot: DashboardHistoryMetricRow[]
  claimsBySnapshot: DashboardHistoryMetricRow[]
  claimRateBySnapshot: DashboardHistoryMetricRow[]
  distributedAmountBySnapshot: DashboardHistoryMetricRow[]
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
  return `${(Math.ceil(value * 10) / 10).toFixed(1)}%`
}

function formatToken(value: number, tokenSymbol?: string | null) {
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(value)

  return tokenSymbol ? `${formatted} ${tokenSymbol}` : formatted
}

function buildHistoryRows(
  rows: DashboardHistoryMetricRow[],
  loops: DashboardChartLoop[]
): ChartDataRow[] {
  return rows.map((row) => ({
    label: row.snapshotShortLabel ?? row.snapshotDate,
    fullLabel: row.snapshotLongLabel ?? row.snapshotDate,
    ...Object.fromEntries(
      loops.map((loop) => [loop.loopKey, Number(row.values[loop.loopKey] ?? 0)])
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
  claimParticipationRatePercent,
  uniqueUsersBySnapshot,
  uniqueClaimUsersBySnapshot,
  registrationsBySnapshot,
  claimsBySnapshot,
  claimRateBySnapshot,
  distributedAmountBySnapshot,
}: DashboardChartsProps) {
  const snapshotUniqueUsersData = buildHistoryRows(uniqueUsersBySnapshot, loops)
  const snapshotUniqueClaimUsersData = buildHistoryRows(uniqueClaimUsersBySnapshot, loops)
  const snapshotRegistrationsData = buildHistoryRows(registrationsBySnapshot, loops)
  const snapshotClaimsData = buildHistoryRows(claimsBySnapshot, loops)
  const snapshotClaimRateData = buildHistoryRows(claimRateBySnapshot, loops)
  const snapshotDistributionData = buildHistoryRows(distributedAmountBySnapshot, loops)

  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-2">
        <ChartCard
          title="Unique Users by Snapshot Date"
          description="Each saved stats snapshot becomes one X-axis date, so cumulative user growth can be compared update to update."
        >
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={snapshotUniqueUsersData}>
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

        <ChartCard
          title="Unique Claim Users by Snapshot Date"
          description="This keeps claimer growth separate from raw registrations, which makes conversion trends easier to read."
        >
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={snapshotUniqueClaimUsersData}>
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
          title="Registrations by Snapshot Date"
          description="Cumulative registrations by saved update date show participation momentum between refreshes."
        >
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={snapshotRegistrationsData} barGap={10}>
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
          title="Claims by Snapshot Date"
          description="Cumulative claims by saved update date make it easier to compare how quickly redemptions keep pace across loops."
        >
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={snapshotClaimsData}>
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
          title="Claim Rate by Snapshot Date"
          description="Cumulative claim rate by saved update date shows how efficiently each loop converts registrations into claims over time."
        >
          <div className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={snapshotClaimRateData}>
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
                {claimParticipationRatePercent != null && (
                  <ReferenceLine
                    y={claimParticipationRatePercent}
                    stroke="hsl(var(--foreground) / 0.7)"
                    strokeDasharray="8 6"
                    strokeWidth={2}
                    label={{
                      value: `Avg claim rate: ${formatPercent(claimParticipationRatePercent)}`,
                      position: "insideTopRight",
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 12,
                    }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Distributed Amount by Snapshot Date"
          description="Snapshot-date HNY totals show the cumulative distribution story for each loop across the saved update history."
        >
          <div className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={snapshotDistributionData}>
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
                      tokenSymbol={tokenSymbol}
                      valueFormatter={(value, symbol) => formatToken(value, symbol)}
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
    </div>
  )
}
