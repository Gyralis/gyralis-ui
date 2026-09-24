"use client"

import { useCallback } from "react"
import { useQueryClient, type QueryClient } from "@tanstack/react-query"

import { getClaimProgress } from "@/lib/loops/claim-progress"
import type { LoopActionConfirmation } from "@/lib/loops/loop-action-confirmation"

import { totalClaimsQueryOptions } from "./use-total-claims"

const running = new WeakMap<QueryClient, Promise<void>>()
const retryDelays = [0, 2000, 4000, 8000, 12000]

/** One shared, bounded reconciliation run, including claims made during the run. */
export function syncTotalClaims(queryClient: QueryClient): Promise<void> {
  const current = running.get(queryClient)
  if (current) return current
  const store = getClaimProgress(queryClient)
  store.setSyncing(true)
  const work = (async () => {
    try {
      for (const delay of retryDelays) {
        if (delay) await new Promise((resolve) => setTimeout(resolve, delay))
        await queryClient.cancelQueries({
          queryKey: totalClaimsQueryOptions.queryKey,
          exact: true,
        })
        try {
          const snapshot = await queryClient.fetchQuery({
            ...totalClaimsQueryOptions,
            retry: false,
          })
          store.reconcile(snapshot)
          if (!store.getSnapshot().pending.length) break
        } catch {
          // Keep the previous snapshot and optimistic claims; expose Retry after the bounded run.
        }
      }
    } finally {
      store.setSyncing(false)
      running.delete(queryClient)
    }
  })()
  running.set(queryClient, work)
  return work
}

export async function refreshTotalClaimsAfterClaim(
  queryClient: QueryClient,
  confirmation: LoopActionConfirmation
) {
  if (confirmation.action !== "claim" || confirmation.chainId !== 100) return
  if (!getClaimProgress(queryClient).add(confirmation)) return
  await syncTotalClaims(queryClient)
}

export function useRefreshTotalClaimsAfterClaim() {
  const queryClient = useQueryClient()
  return useCallback(
    (confirmation: LoopActionConfirmation) =>
      refreshTotalClaimsAfterClaim(queryClient, confirmation),
    [queryClient]
  )
}
