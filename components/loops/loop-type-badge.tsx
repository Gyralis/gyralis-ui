"use client"

interface LoopTypeBadgeProps {
  isSuper?: boolean
  className?: string
}

export function LoopTypeBadge({ isSuper, className }: LoopTypeBadgeProps) {
  const variantClassName = isSuper
    ? "super-loop-badge bg-card/75 text-foreground"
    : "standard-loop-badge bg-card/80 text-foreground"
  const badgeClassName = [
    "inline-flex shrink-0 items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]",
    variantClassName,
    className,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <span className={badgeClassName}>{isSuper ? "SUPER LOOP" : "LOOP"}</span>
  )
}
