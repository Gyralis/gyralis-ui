"use client"

import { useEffect, useSyncExternalStore } from "react"
import { useQueryClient } from "@tanstack/react-query"

import {
  emptyClaimProgress,
  getClaimProgress,
  outstandingClaims,
} from "@/lib/loops/claim-progress"

import { syncTotalClaims } from "./use-refresh-total-claims-after-claim"
import { useTotalClaims } from "./use-total-claims"

export function useRoadTo10k() {
  const queryClient = useQueryClient()
  const store = getClaimProgress(queryClient)
  const progress = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    () => emptyClaimProgress
  )
  const query = useTotalClaims()
  const pending = outstandingClaims(progress.pending, query.data)

  useEffect(() => {
    if (query.data) store.reconcile(query.data)
  }, [query.data, store])

  return {
    ...query,
    total: query.data ? query.data.totalClaims + pending.length : undefined,
    pendingCount: pending.length,
    syncing: progress.syncing || query.isFetching,
    sequence: progress.sequence,
    refresh: () => syncTotalClaims(queryClient),
  }
}
