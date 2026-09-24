"use client"

import { useCallback } from "react"
import { useQueryClient, type QueryClient } from "@tanstack/react-query"

import type { LoopActionConfirmation } from "@/lib/loops/loop-action-confirmation"

import { totalClaimsQueryOptions } from "./use-total-claims"

export async function refreshTotalClaimsAfterClaim(
  queryClient: QueryClient,
  confirmation: LoopActionConfirmation
) {
  if (confirmation.action !== "claim" || confirmation.chainId !== 100) return

  try {
    // Discard any read started before confirmation, then fetch even without UI mounted.
    await queryClient.cancelQueries({
      queryKey: totalClaimsQueryOptions.queryKey,
      exact: true,
    })
    await queryClient.fetchQuery(totalClaimsQueryOptions)
  } catch {
    // Query state exposes the refresh error and retains the previous snapshot.
    // A stats refresh failure must not turn a confirmed claim into a failed action.
  }
}

export function useRefreshTotalClaimsAfterClaim() {
  const queryClient = useQueryClient()
  return useCallback(
    (confirmation: LoopActionConfirmation) =>
      refreshTotalClaimsAfterClaim(queryClient, confirmation),
    [queryClient]
  )
}
