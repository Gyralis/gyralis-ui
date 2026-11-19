import type { HTMLAttributes } from "react"

const formatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
})

export function formatSeasonPoints(value: number, showPlus = false) {
  if (!Number.isFinite(value)) return "—"
  const normalized = Object.is(value, -0) ? 0 : value
  return `${showPlus && normalized >= 0 ? "+" : ""}${formatter.format(
    normalized
  )}`
}

type SeasonPointsValueProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  value: number
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "hero"
  showPlus?: boolean
  /** Use span only within prose or controls that require phrasing content. */
  as?: "p" | "span"
}

export function SeasonPointsValue({
  value,
  size = "md",
  showPlus = false,
  as: Tag = "p",
  className,
  ...props
}: SeasonPointsValueProps) {
  return (
    <Tag
      {...props}
      className={["p-sp-value", className].filter(Boolean).join(" ")}
      data-size={size}
    >
      {formatSeasonPoints(value, showPlus)}{" "}
      <span className="p-sp-unit">SP</span>
    </Tag>
  )
}
