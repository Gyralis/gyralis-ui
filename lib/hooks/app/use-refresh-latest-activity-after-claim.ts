"use client"

import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"

import { refreshLatestActivityAfterAction } from "@/lib/activity/latest-activity-query"
import type { LoopActionConfirmation } from "@/lib/loops/loop-action-confirmation"

export function useRefreshLatestActivityAfterAction(decimals?: number) {
  const client = useQueryClient()
  return useCallback(
    (confirmation: LoopActionConfirmation) =>
      refreshLatestActivityAfterAction(client, confirmation, decimals),
    [client, decimals]
  )
}

export const useRefreshLatestActivityAfterClaim =
  useRefreshLatestActivityAfterAction
