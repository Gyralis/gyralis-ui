"use client"

import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"

import { refreshLatestActivityAfterClaim } from "@/lib/activity/latest-activity-query"
import type { LoopActionConfirmation } from "@/lib/loops/loop-action-confirmation"

export function useRefreshLatestActivityAfterClaim(decimals?: number) {
  const client = useQueryClient()
  return useCallback(
    (confirmation: LoopActionConfirmation) =>
      refreshLatestActivityAfterClaim(client, confirmation, decimals),
    [client, decimals]
  )
}
