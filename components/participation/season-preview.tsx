"use client"

import { SeasonHeader } from "./season-panels"

export function SeasonPreview({
  compact = false,
  pageHeader = false,
}: {
  compact?: boolean
  pageHeader?: boolean
}) {
  return <SeasonHeader compact={compact} pageHeader={pageHeader} />
}
