"use client"

import { queryOptions, useQuery } from "@tanstack/react-query"

import {
  totalClaimsSnapshotSchema,
  type TotalClaimsSnapshot,
} from "@/lib/loops/total-claims"

export const totalClaimsQueryOptions = queryOptions({
  queryKey: ["loops", "total-claims", "gnosis"],
  queryFn: async ({ signal }): Promise<TotalClaimsSnapshot> => {
    const response = await fetch("/api/loops/claims-total", {
      cache: "no-store",
      signal,
    })
    if (!response.ok)
      throw new Error("Claim totals are temporarily unavailable")
    return totalClaimsSnapshotSchema.parse(await response.json())
  },
  staleTime: 0,
  refetchOnMount: "always",
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchInterval: false,
  retry: 2,
  structuralSharing: (previous: unknown, incoming: unknown) => {
    const next = totalClaimsSnapshotSchema.parse(incoming)
    const old = totalClaimsSnapshotSchema.safeParse(previous)
    return old.success && old.data.indexedBlock > next.indexedBlock
      ? old.data
      : next
  },
})

/**
 * Mount alongside the loops when the milestone UI is ready.
 *
 * isLoading: initial fetch with no snapshot; show a loading placeholder.
 * isRefetching: updating an existing query; keep data visible when available.
 * isError/error: the request failed; never substitute zero for missing data.
 * data.checkedAt stays unchanged until a new fetch succeeds.
 */
export function useTotalClaims() {
  return useQuery(totalClaimsQueryOptions)
}
