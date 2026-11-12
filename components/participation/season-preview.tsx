"use client"

import { SeasonHeader } from "./season-panels"

export function SeasonPreview({
  compact = false,
  pageHeader = false,
  title,
  seasonLabel,
  variant,
}: {
  compact?: boolean
  pageHeader?: boolean
  title?: string
  seasonLabel?: string
  variant?: "default" | "explore"
}) {
  return (
    <SeasonHeader
      compact={compact}
      pageHeader={pageHeader}
      title={title}
      seasonLabel={seasonLabel}
      variant={variant}
    />
  )
}
