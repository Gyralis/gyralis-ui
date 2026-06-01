import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type DashboardStatCardProps = {
  label: string
  value: string
  hint?: string | null
  className?: string
}

export function DashboardStatCard({
  label,
  value,
  hint,
  className,
}: DashboardStatCardProps) {
  return (
    <Card
      className={cn(
        "rounded-2xl border-border/70 bg-card/80 shadow-[0_24px_70px_-52px_hsl(var(--foreground)/0.2)] backdrop-blur-xl",
        className
      )}
    >
      <CardContent className="space-y-3 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </p>
        <div className="space-y-1">
          <p className="text-2xl font-semibold tracking-tight text-card-foreground sm:text-3xl">
            {value}
          </p>
          {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
        </div>
      </CardContent>
    </Card>
  )
}
