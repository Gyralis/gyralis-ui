import { LoopCardsData } from "@/data/loops-data"

import type { ActivityLoopScope } from "./types"

export function normalizeActivityScope(scope: readonly ActivityLoopScope[]) {
  return [
    ...new Map(
      scope.map((entry) => {
        const normalized = {
          chainId: entry.chainId,
          loopAddress: entry.loopAddress.toLowerCase(),
          ...(entry.period == null ? {} : { period: entry.period }),
        }
        return [
          `${normalized.chainId}:${normalized.loopAddress}`,
          normalized,
        ] as const
      })
    ).values(),
  ].sort(
    (a, b) =>
      a.chainId - b.chainId || a.loopAddress.localeCompare(b.loopAddress)
  )
}

export function activityScopeKey(scope: ActivityLoopScope) {
  return `${scope.chainId}:${scope.loopAddress.toLowerCase()}`
}

export function parseActivityScope(
  value: string | null
): ActivityLoopScope[] | undefined {
  if (value == null) return undefined
  const parts = value.split(",")
  if (!value || parts.length > LoopCardsData.length)
    throw new Error("Invalid activity scope")
  return normalizeActivityScope(
    parts.map((part) => {
      const [chain, address, period, extra] = part.split(":")
      const loop = LoopCardsData.find(
        (candidate) =>
          candidate.enabled &&
          candidate.historyLoopKey &&
          String(candidate.chainId) === chain &&
          candidate.address?.toLowerCase() === address?.toLowerCase()
      )
      if (
        !loop?.address ||
        extra != null ||
        (period != null &&
          (!/^\d{1,78}$/.test(period) || BigInt(period) >= 2n ** 256n))
      )
        throw new Error("Invalid activity scope")
      return {
        chainId: loop.chainId,
        loopAddress: loop.address,
        ...(period == null ? {} : { period }),
      }
    })
  )
}
