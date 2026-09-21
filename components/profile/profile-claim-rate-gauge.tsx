"use client"

import { useId } from "react"
import { Pie, PieChart } from "recharts"

import { ProfileDetails } from "@/components/profile/profile-details"

export function ProfileClaimRateGauge({
  data,
}: {
  data: { rate: number | null; claims: number; registrations: number } | null
}) {
  const gradientId = `claim-rate-${useId().replace(/:/g, "")}`
  const value = data?.rate ?? 0
  const needleAngle =
    (Math.PI * (180 - Math.min(100, Math.max(0, value)) * 1.8)) / 180
  const rateLabel =
    data?.rate == null
      ? "—"
      : `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(
          data.rate
        )}%`
  const description = !data
    ? "Unavailable"
    : data.registrations === 0
    ? "No completed periods yet"
    : `${data.claims} claims out of ${data.registrations} registrations`

  return (
    <ProfileDetails
      label={`Claim rate: ${rateLabel}. ${description}`}
      className="w-auto max-w-[calc(100vw-2rem)] rounded-xl border-border/70 bg-card !p-3 text-left text-xs leading-5 text-card-foreground"
      trigger={
        <button
          type="button"
          className="flex h-full w-full min-h-16 flex-col items-center justify-center rounded-2xl border border-border/70 bg-background/60 px-2.5 py-2 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <div
            className="relative h-9 w-[72px]"
            role="img"
            aria-label={`Claim rate: ${rateLabel}. ${description}`}
          >
            <div aria-hidden="true">
              <PieChart
                width={72}
                height={36}
                margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                accessibilityLayer={false}
              >
                <Pie
                  data={[{ value: 1 }]}
                  dataKey="value"
                  cx={36}
                  cy={33}
                  innerRadius={24}
                  outerRadius={30}
                  startAngle={180}
                  endAngle={0}
                  stroke="none"
                  fill={
                    data?.rate != null
                      ? `url(#${gradientId})`
                      : "hsl(var(--muted))"
                  }
                  isAnimationActive={false}
                />
                <defs>
                  <linearGradient
                    id={gradientId}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop
                      offset="0%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="100%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={1}
                    />
                  </linearGradient>
                </defs>
              </PieChart>
              {data?.rate != null && (
                <svg
                  className="pointer-events-none absolute inset-0 text-muted-foreground"
                  width={72}
                  height={36}
                  viewBox="0 0 72 36"
                >
                  <line
                    x1={36}
                    y1={33}
                    x2={36 + 17 * Math.cos(needleAngle)}
                    y2={33 - 17 * Math.sin(needleAngle)}
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                  />
                  <circle cx={36} cy={33} r={2.5} fill="currentColor" />
                </svg>
              )}
            </div>
          </div>
          <span
            aria-hidden="true"
            className="mt-0.5 text-xs font-bold leading-4 text-foreground tabular-nums"
          >
            {rateLabel}
          </span>
          <div className="text-[10px] font-medium text-muted-foreground">
            <span>claim rate</span>
          </div>
        </button>
      }
    >
      <p>{description}</p>
    </ProfileDetails>
  )
}
