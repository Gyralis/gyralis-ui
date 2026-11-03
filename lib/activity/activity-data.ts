import { formatUnits, parseUnits } from "viem"
import { z } from "zod"

import { activityScopeKey } from "./scope"
import type { ClaimActivityItem, LatestActivityData } from "./types"

const itemSchema = z.object({
  id: z.string(),
  chainId: z.number().int(),
  chainName: z.string(),
  loopName: z.string(),
  logoSrc: z.string(),
  period: z.string().regex(/^\d+$/),
  periodKind: z.enum(["current", "previous"]),
  amount: z.string().regex(/^\d+(\.\d+)?$/),
  tokenSymbol: z.string(),
  timestamp: z.number().nonnegative(),
  transactionUrl: z.string(),
  loopAddress: z.string().optional(),
  transactionHash: z.string().optional(),
  logIndex: z.number().int().nonnegative().optional(),
  blockNumber: z.number().int().nonnegative().safe().optional(),
  tokenAddress: z.string().optional(),
  tokenDecimals: z.number().int().min(0).max(255).optional(),
  source: z.enum(["receipt", "indexed"]).optional(),
})

export const latestActivitySchema = z.object({
  address: z.string(),
  items: z.array(itemSchema),
  totals: z.array(
    z.object({
      chainId: z.number().int(),
      tokenSymbol: z.string(),
      amount: z.string(),
    })
  ),
  unavailableChains: z.array(z.string()),
  fetchedAt: z.string(),
  fullSnapshot: z.boolean().default(true),
  coverage: z
    .array(
      z.object({
        chainId: z.number().int(),
        loopAddress: z.string(),
        currentPeriod: z.string().regex(/^\d+$/),
        indexedBlock: z.number().int().nonnegative().safe(),
      })
    )
    .optional(),
})

export function activityEventKey(item: ClaimActivityItem) {
  return item.transactionHash && item.logIndex != null
    ? `${item.chainId}:${item.transactionHash.toLowerCase()}-${item.logIndex}`
    : item.id.toLowerCase()
}

function itemScope(item: ClaimActivityItem) {
  return item.loopAddress
    ? activityScopeKey({ chainId: item.chainId, loopAddress: item.loopAddress })
    : undefined
}

export function activityTotals(items: ClaimActivityItem[]) {
  const groups = new Map<
    string,
    { chainId: number; tokenSymbol: string; decimals: number; raw: bigint }
  >()
  for (const item of items) {
    const decimals = item.tokenDecimals ?? 18
    const key = `${item.chainId}:${
      item.tokenAddress ?? item.tokenSymbol
    }:${decimals}`
    const group = groups.get(key) ?? {
      chainId: item.chainId,
      tokenSymbol: item.tokenSymbol,
      decimals,
      raw: 0n,
    }
    group.raw += parseUnits(item.amount, decimals)
    groups.set(key, group)
  }
  return [...groups.values()].map(
    ({ chainId, tokenSymbol, decimals, raw }) => ({
      chainId,
      tokenSymbol,
      amount: formatUnits(raw, decimals),
    })
  )
}

/** Merge scoped snapshots without losing unaffected rows or unindexed receipts. */
export function mergeActivitySnapshot(
  previous: LatestActivityData | undefined,
  incoming: LatestActivityData
): LatestActivityData {
  if (!previous || previous.address !== incoming.address) previous = undefined
  const oldCoverage = new Map(
    (previous?.coverage ?? []).map((entry) => [activityScopeKey(entry), entry])
  )
  // A late response must not replace a newer indexed snapshot.
  const coverage = (incoming.coverage ?? []).filter(
    (entry) =>
      entry.indexedBlock >=
      (oldCoverage.get(activityScopeKey(entry))?.indexedBlock ?? -1)
  )
  const replaced = new Set(coverage.map(activityScopeKey))
  const rejected = new Set(
    (incoming.coverage ?? [])
      .filter((entry) => !replaced.has(activityScopeKey(entry)))
      .map(activityScopeKey)
  )
  const retained = (previous?.items ?? []).filter((item) => {
    const key = itemScope(item)
    if (item.source !== "receipt") return !key || !replaced.has(key)
    const snapshot = coverage.find((entry) => activityScopeKey(entry) === key)
    // Expire a receipt only once it is beyond the displayed period window.
    return (
      !snapshot ||
      item.blockNumber == null ||
      snapshot.indexedBlock < item.blockNumber ||
      BigInt(snapshot.currentPeriod) <= BigInt(item.period) + 1n
    )
  })
  const byEvent = new Map(
    retained.map((item) => [activityEventKey(item), item])
  )
  for (const item of incoming.items) {
    if (itemScope(item) && rejected.has(itemScope(item)!)) continue
    const key = activityEventKey(item)
    const existing = byEvent.get(key)
    if (
      existing?.source === "receipt" &&
      item.source !== "receipt" &&
      existing.blockNumber != null
    ) {
      const indexedBlock =
        coverage.find((entry) => activityScopeKey(entry) === itemScope(item))
          ?.indexedBlock ?? -1
      if (indexedBlock < existing.blockNumber) continue
    }
    // Indexed data replaces its receipt overlay; duplicate receipt notifications do not reverse it.
    if (item.source === "receipt" && byEvent.has(key)) continue
    byEvent.set(key, item)
  }
  const latestPeriod = new Map<string, bigint>()
  for (const item of byEvent.values()) {
    const key = itemScope(item)
    if (key)
      latestPeriod.set(
        key,
        BigInt(item.period) > (latestPeriod.get(key) ?? -1n)
          ? BigInt(item.period)
          : latestPeriod.get(key)!
      )
  }
  const items = [...byEvent.values()]
    .filter(
      (item) =>
        !itemScope(item) ||
        BigInt(item.period) === latestPeriod.get(itemScope(item)!)
    )
    .sort((a, b) => b.timestamp - a.timestamp || a.id.localeCompare(b.id))
  for (const entry of coverage) oldCoverage.set(activityScopeKey(entry), entry)
  const queriedChains = new Set<string>(
    coverage.map((entry) => (entry.chainId === 100 ? "Gnosis" : "Base"))
  )
  const unavailableChains = [
    ...new Set([
      ...(previous?.unavailableChains ?? []).filter(
        (chain) => !queriedChains.has(chain)
      ),
      ...incoming.unavailableChains,
    ]),
  ]
  return {
    ...incoming,
    fullSnapshot:
      incoming.fullSnapshot === true || previous?.fullSnapshot === true,
    fullFetchedAt:
      incoming.fullFetchedAt ??
      (incoming.fullSnapshot === true
        ? incoming.fetchedAt
        : previous?.fullFetchedAt),
    items,
    totals: activityTotals(items),
    unavailableChains,
    coverage: [...oldCoverage.values()],
    indexingStatus: items.some((item) => item.source === "receipt")
      ? incoming.indexingStatus ?? previous?.indexingStatus
      : undefined,
  }
}
