import type { IconType } from "react-icons"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

type HighlightStatTone = "primary" | "secondary"

type HighlightStatCardProps = {
  title: string
  value: string
  icon?: IconType
  tone?: HighlightStatTone
  size?: "default" | "compact"
  bordered?: boolean
  suffix?: string | null
  substats?: {
    label: string
    value: string
    tone?: "positive" | "muted"
  }[]
  progress?: {
    label: string
    value: string
    percent: number
  }
  helperText?: string
  className?: string
}

const toneClasses: Record<
  HighlightStatTone,
  {
    glow: string
    icon: string
    value: string
    progress: string
  }
> = {
  primary: {
    glow: "bg-[radial-gradient(circle_at_18%_18%,rgba(28,231,131,0.1),transparent_42%)]",
    icon: "text-primary",
    value: "text-card-foreground",
    progress: "bg-[linear-gradient(135deg,#1ce783_0%,#4ade80_100%)]",
  },
  secondary: {
    glow: "bg-[radial-gradient(circle_at_18%_18%,rgba(140,75,255,0.12),transparent_42%)]",
    icon: "text-secondary",
    value: "text-card-foreground",
    progress: "bg-[linear-gradient(135deg,#8c4bff_0%,#a855f7_100%)]",
  },
}

export function HighlightStatCard({
  title,
  value,
  icon: Icon,
  tone = "primary",
  size = "default",
  bordered,
  suffix,
  substats = [],
  progress,
  helperText,
  className,
}: HighlightStatCardProps) {
  const classes = toneClasses[tone]
  const showBorder = bordered ?? size !== "compact"

  if (size === "compact") {
    return (
      <Card
        className={cn(
          "relative flex h-full overflow-hidden rounded-[1.35rem] bg-background p-0 backdrop-blur-2xl",
          showBorder
            ? "border border-border shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_16px_42px_-28px_rgba(15,23,42,0.24)]"
            : "border-transparent shadow-none",
          className
        )}
      >
        <CardContent className="relative z-10 flex size-full min-h-[72px] flex-col items-center justify-center px-8 py-1.5 text-center md:min-h-[76px]">
          <p className="font-baloo text-[9px] font-semibold uppercase tracking-[0.15em] text-foreground">
            {title}
          </p>
          <div className="mt-0.5 flex items-baseline justify-center gap-1">
            <span
              className={cn(
                "font-sans text-xl font-medium leading-none tabular-nums text-muted-foreground sm:text-2xl"
              )}
            >
              {value}
            </span>
            {suffix ? (
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {suffix}
              </span>
            ) : null}
          </div>
          {helperText ? (
            <p className="mt-1 text-[10px] font-medium text-muted-foreground">
              {helperText}
            </p>
          ) : null}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("tamagotchi-card h-full p-0", className)}>
      <div
        className={cn("pointer-events-none absolute inset-0", classes.glow)}
      />
      {Icon ? (
        <Icon
          className={cn(
            "pointer-events-none absolute right-6 top-6 size-20 opacity-10",
            classes.icon
          )}
        />
      ) : null}
      <CardContent className="relative z-10 flex h-full flex-col gap-3 p-0">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {title}
          </p>
          <div
            className={cn(
              "flex flex-wrap items-baseline gap-x-2 text-5xl font-semibold tracking-tight sm:text-6xl",
              classes.value
            )}
          >
            <span>{value}</span>
            {suffix ? (
              <span className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground sm:text-base">
                {suffix}
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
                className={cn(
                  "mt-1 text-lg font-semibold tracking-tight",
                  stat.tone === "positive"
                    ? classes.value
                    : stat.tone === "muted"
                    ? "text-muted-foreground"
                    : "text-card-foreground"
                )}
              >
                {stat.value}
              </p>
            </div>
          ))}
          {progress ? (
            <div className="space-y-3 pt-1">
              <div className="flex items-end justify-between gap-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {progress.label}
                </p>
                <p className="text-lg font-semibold tracking-tight text-card-foreground">
                  {progress.value}
                </p>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full", classes.progress)}
                  style={{
                    width: `${Math.max(0, Math.min(progress.percent, 100))}%`,
                  }}
                />
              </div>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
