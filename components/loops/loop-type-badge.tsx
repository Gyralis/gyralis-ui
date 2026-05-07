"use client"

interface LoopTypeBadgeProps {
  isSuper?: boolean
  className?: string
}

export function LoopTypeBadge({ isSuper, className }: LoopTypeBadgeProps) {
  const variantClassName = isSuper
    ? " bg-accent/20 text-accent-foreground"
    : " bg-secondary text-violet-100"
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
