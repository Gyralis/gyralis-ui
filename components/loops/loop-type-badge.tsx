"use client"

interface LoopTypeBadgeProps {
  isSuper?: boolean
  className?: string
}

export function LoopTypeBadge({ isSuper, className }: LoopTypeBadgeProps) {
  const variantClassName = isSuper
    ? "super-loop-badge text-primary"
    : "standard-loop-badge text-muted-foreground"
  const badgeClassName = [
    "inline-flex min-h-[22px] shrink-0 items-center rounded-full px-2.5 text-[10px] font-semibold uppercase leading-none tracking-widest",
    variantClassName,
    className,
  ]
    .filter(Boolean)
    .join(" ")

  return <span className={badgeClassName}>{isSuper ? "SUPER" : "LOOP"}</span>
}
