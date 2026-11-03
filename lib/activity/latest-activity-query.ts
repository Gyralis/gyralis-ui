import type { QueryClient } from "@tanstack/react-query"

import type { LoopActionConfirmation } from "@/lib/loops/loop-action-confirmation"

import { latestActivitySchema, mergeActivitySnapshot } from "./activity-data"
import { confirmedClaimActivity } from "./confirmed-claims"
import { activityScopeKey, normalizeActivityScope } from "./scope"
import type { ActivityLoopScope, LatestActivityData } from "./types"

export const latestActivityKey = (wallet?: string) =>
  ["latest-activity", wallet?.toLowerCase()] as const

export async function fetchLatestActivity(
  wallet: string,
  signal?: AbortSignal,
  scope?: ActivityLoopScope[]
): Promise<LatestActivityData> {
  const suffix = scope
    ? `?scope=${encodeURIComponent(
        normalizeActivityScope(scope)
          .map(
            (entry) =>
              `${activityScopeKey(entry)}${
                entry.period == null ? "" : `:${entry.period}`
              }`
          )
          .join(",")
      )}`
    : ""
  const response = await fetch(
    `/api/users/${wallet.toLowerCase()}/activity${suffix}`,
    { signal, cache: "no-store" }
  )
  if (!response.ok) throw new Error("Unable to load activity")
  const data = latestActivitySchema.parse(await response.json())
  if (data.address !== wallet.toLowerCase())
    throw new Error("Activity wallet mismatch")
  return data
}

export function latestActivityQueryOptions(wallet?: string) {
  return {
    queryKey: latestActivityKey(wallet),
    enabled: Boolean(wallet),
    queryFn: ({ signal }: { signal: AbortSignal }) => {
      if (!wallet) throw new Error("Connect a wallet to load activity")
      return fetchLatestActivity(wallet, signal)
    },
    staleTime: (query: {
      state: { data?: LatestActivityData; dataUpdatedAt: number }
    }) => {
      const data = query.state.data
      if (data?.fullSnapshot === false) return 0
      const fetchedAt = Date.parse(data?.fullFetchedAt ?? data?.fetchedAt ?? "")
      // A receipt/scoped refresh must not make the rest of the wallet history fresh.
      return Number.isFinite(fetchedAt)
        ? Math.max(0, fetchedAt + 30_000 - query.state.dataUpdatedAt)
        : 30_000
    },
    gcTime: 30 * 60_000,
    refetchInterval: false as const,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1,
    structuralSharing: (previous: unknown, incoming: unknown) =>
      mergeActivitySnapshot(
        previous as LatestActivityData | undefined,
        incoming as LatestActivityData
      ),
  }
}

const runs = new WeakMap<QueryClient, Map<string, Promise<void>>>()
const delays = [250, 2_000, 4_000, 8_000, 16_000]

/** One bounded job per wallet, combining all pending Loop/chain receipts. */
export function reconcileLatestActivity(
  client: QueryClient,
  rawWallet: string
): Promise<void> {
  const wallet = rawWallet.toLowerCase()
  if (
    !client
      .getQueryData<LatestActivityData>(latestActivityKey(wallet))
      ?.items.some((item) => item.source === "receipt")
  )
    return Promise.resolve()
  let running = runs.get(client)
  if (!running) {
    running = new Map()
    runs.set(client, running)
  }
  const existing = running.get(wallet)
  if (existing) return existing
  const key = latestActivityKey(wallet)
  const attempted = new Set<string>()
  const updateStatus = (status: LatestActivityData["indexingStatus"]) =>
    client.setQueryData<LatestActivityData>(
      key,
      (old) =>
        old && {
          ...old,
          indexingStatus: old.items.some((item) => item.source === "receipt")
            ? status
            : undefined,
        }
    )
  updateStatus("syncing")
  const work = (async () => {
    try {
      for (const delay of delays) {
        await new Promise((resolve) => setTimeout(resolve, delay))
        const pending =
          client
            .getQueryData<LatestActivityData>(key)
            ?.items.filter(
              (item) => item.source === "receipt" && item.loopAddress
            ) ?? []
        if (!pending.length) break
        const scope = normalizeActivityScope(
          pending.map((item) => ({
            chainId: item.chainId,
            loopAddress: item.loopAddress!,
            period: item.period,
          }))
        )
        pending.forEach((item) => attempted.add(item.id))
        try {
          if (client.isFetching({ queryKey: key, exact: true })) {
            // Reuse a mount/focus/manual refresh already fetching this wallet.
            await client.fetchQuery({
              ...latestActivityQueryOptions(wallet),
              staleTime: 0,
            })
          } else {
            const snapshot = await fetchLatestActivity(
              wallet,
              AbortSignal.timeout(17_000),
              scope
            )
            client.setQueryData<LatestActivityData>(key, (old) =>
              mergeActivitySnapshot(old, snapshot)
            )
          }
          if (
            !client
              .getQueryData<LatestActivityData>(key)
              ?.items.some((item) => item.source === "receipt")
          )
            break
        } catch {
          // Keep confirmed rows and existing history; retry only within this run.
        }
      }
    } finally {
      updateStatus("delayed")
      running.delete(wallet)
      // Receipts arriving during the final request still get a bounded first run.
      if (
        client
          .getQueryData<LatestActivityData>(key)
          ?.items.some(
            (item) => item.source === "receipt" && !attempted.has(item.id)
          )
      ) {
        void reconcileLatestActivity(client, wallet)
      }
    }
  })()
  running.set(wallet, work)
  return work
}

export function refreshLatestActivityAfterClaim(
  client: QueryClient,
  confirmation: LoopActionConfirmation,
  decimals?: number
) {
  const claims = confirmedClaimActivity(confirmation, decimals)
  const wallets = new Set<string>()
  for (const { wallet, item } of claims) {
    wallets.add(wallet)
    const key = latestActivityKey(wallet)
    const previous = client.getQueryData<LatestActivityData>(key)
    client.setQueryData<LatestActivityData>(
      key,
      (old) =>
        mergeActivitySnapshot(old, {
          address: wallet,
          items: [item],
          totals: [],
          unavailableChains: [],
          coverage: [],
          fetchedAt: old?.fetchedAt ?? new Date().toISOString(),
          indexingStatus: "syncing",
          fullSnapshot: false,
        }),
      previous ? undefined : { updatedAt: 0 }
    )
  }
  return Promise.all(
    [...wallets].map((wallet) => reconcileLatestActivity(client, wallet))
  )
}
