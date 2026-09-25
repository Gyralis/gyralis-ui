"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

export function ProfileLevelProgress({
  value,
  label,
}: {
  value: number
  label: string
}) {
  const progress = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
      aria-valuetext={`${Math.round(progress)}% completed`}
      className="h-2.5 w-full min-w-0 overflow-hidden rounded-full bg-muted ring-1 ring-border/70"
    >
      <div aria-hidden="true" className="size-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart
            layout="vertical"
            data={[{ name: "Level progress", progress }]}
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            accessibilityLayer={false}
            barCategoryGap={0}
          >
            <XAxis type="number" domain={[0, 100]} hide allowDataOverflow />
            <YAxis type="category" dataKey="name" hide />
            <Bar
              dataKey="progress"
              fill="hsl(var(--primary))"
              barSize={10}
              radius={5}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
