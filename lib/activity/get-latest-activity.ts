import "server-only"

import { loopDashboardMeta } from "@/data/loop-dashboard-meta"
import { LoopCardsData } from "@/data/loops-data"
import { env } from "@/env.mjs"
import { formatUnits, isAddress } from "viem"
import { base, gnosis } from "viem/chains"

import { activityTotals } from "./activity-data"
import { getActivityPeriods } from "./get-activity-periods"
import { activityScopeKey } from "./scope"
import type {
  ActivityLoopScope,
  ClaimActivityItem,
  LatestActivityData,
  RegistrationActivityItem,
} from "./types"

interface ClaimEvent {
  id: string
  periodNumber: string
  payout: string
  timestamp: string
  txHash: string
  blockNumber: string
  loop: { id: string }
}

/** One independent current/previous period window per active, indexed loop. */
export async function getLatestActivity(
  address: string,
  scope?: readonly ActivityLoopScope[]
): Promise<LatestActivityData> {
  if (!isAddress(address, { strict: false }))
    throw new Error("Invalid wallet address")
  const wallet = address.toLowerCase()
  const sources = [
    {
      chain: gnosis,
      endpoint: env.GYRALIS_SUBGRAPH_URL,
      rpc: env.GNOSIS_RPC_URL,
    },
    {
      chain: base,
      endpoint: env.GYRALIS_BASE_SUBGRAPH_URL,
      rpc: env.BASE_RPC_URL ?? env.NEXT_PUBLIC_BASE_RPC_URL,
    },
  ].filter(
    (source) =>
      !scope || scope.some((entry) => entry.chainId === source.chain.id)
  )
  const results = await Promise.allSettled(
    sources.map(async (source) => {
      const loops = LoopCardsData.filter(
        (loop) =>
          loop.enabled &&
          loop.chainId === source.chain.id &&
          loop.historyLoopKey &&
          loop.address &&
          (!scope ||
            scope.some(
              (entry) =>
                activityScopeKey(entry) ===
                activityScopeKey({
                  chainId: loop.chainId,
                  loopAddress: loop.address!,
                })
            ))
      )
      if (!loops.length) throw new Error("Unsupported activity scope")
      if (!source.endpoint) throw new Error("Activity source unavailable")
      const periods = await getActivityPeriods(source.chain.id, source.rpc)
      const windows = loops.map((loop) => {
        const period = periods.find(
          (entry) => entry.loopAddress === loop.address!.toLowerCase()
        )
        if (!period) throw new Error("Activity period unavailable")
        const current = BigInt(period.currentPeriod)
        const confirmedPeriods =
          scope
            ?.filter(
              (entry) =>
                entry.chainId === loop.chainId &&
                entry.loopAddress.toLowerCase() === loop.address!.toLowerCase()
            )
            .flatMap((entry) => (entry.period == null ? [] : [entry.period])) ??
          []
        const confirmedPeriod = confirmedPeriods.reduce<string | undefined>(
          (latest, period) =>
            latest == null || BigInt(period) > BigInt(latest) ? period : latest,
          undefined
        )
        return {
          loop,
          // Base subgraph IDs are contract addresses, independently of UI/scoring IDs.
          id:
            source.chain.id === gnosis.id
              ? String(loop.id)
              : loop.address!.toLowerCase(),
          current,
          confirmedPeriod,
          registrationPeriods: [
            ...new Set([
              current.toString(),
              (current + 1n).toString(),
              ...confirmedPeriods.filter((period) => BigInt(period) >= current),
            ]),
          ],
          periods: [
            ...new Set([
              ...(current > 0n
                ? [current.toString(), (current - 1n).toString()]
                : ["0"]),
              ...(confirmedPeriod == null ? [] : [confirmedPeriod]),
            ]),
          ],
        }
      })
      const response = await fetch(source.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
        body: JSON.stringify({
          query: `query LatestActivity($windows: [ClaimEvent_filter!]!, $registrationWindows: [RegisterEvent_filter!]!) {
          _meta { block { number } hasIndexingErrors }
          claimEvents(first: 1000, orderBy: timestamp, orderDirection: desc,
            where: { or: $windows }) {
            id periodNumber payout timestamp txHash blockNumber loop { id }
          }
          registerEvents(first: 1000, orderBy: timestamp, orderDirection: desc,
            where: { or: $registrationWindows }) {
            id periodNumber timestamp txHash blockNumber loop { id }
          }
        }`,
          variables: {
            registrationWindows: windows.map((window) => ({
              account: wallet,
              loop: window.id,
              periodNumber_in: window.registrationPeriods,
            })),
            windows: windows.map((window) => ({
              account: wallet,
              loop: window.id,
              periodNumber_in: window.periods,
            })),
          },
        }),
      })
      if (!response.ok) throw new Error("Activity request failed")
      const payload = (await response.json()) as {
        data?: {
          _meta: { block: { number: number }; hasIndexingErrors: boolean }
          claimEvents: ClaimEvent[]
          registerEvents?: Omit<ClaimEvent, "payout">[]
        }
        errors?: unknown[]
      }
      if (
        payload.errors?.length ||
        !payload.data ||
        payload.data._meta.hasIndexingErrors ||
        payload.data.claimEvents.length >= 1000 ||
        (payload.data.registerEvents?.length ?? 0) >= 1000 ||
        !Number.isSafeInteger(payload.data._meta.block?.number) ||
        payload.data._meta.block.number < 0
      ) {
        throw new Error("Activity snapshot unavailable")
      }
      const events = payload.data.claimEvents
      const claims = windows.flatMap((window) => {
        const loopEvents = events.filter(
          (event) => event.loop.id.toLowerCase() === window.id
        )
        const confirmedAhead =
          window.confirmedPeriod != null &&
          BigInt(window.confirmedPeriod) > window.current &&
          loopEvents.some(
            (event) => event.periodNumber === window.confirmedPeriod
          )
        const hasCurrent =
          confirmedAhead ||
          loopEvents.some(
            (event) => event.periodNumber === window.current.toString()
          )
        const selected = confirmedAhead
          ? BigInt(window.confirmedPeriod!)
          : hasCurrent
          ? window.current
          : window.current - 1n
        const meta = loopDashboardMeta[window.loop.historyLoopKey!]
        // The four indexed active loops emit payouts in 18-decimal token units,
        // including USDCx (not the 6-decimal underlying USDC).
        return loopEvents
          .filter((event) => event.periodNumber === selected.toString())
          .map((event) => ({
            item: {
              id: `${source.chain.id}:${event.id}`,
              chainId: source.chain.id,
              chainName: source.chain.name,
              loopName: meta.title,
              logoSrc: meta.logoSrc,
              period: event.periodNumber,
              periodKind: hasCurrent
                ? ("current" as const)
                : ("previous" as const),
              amount: formatUnits(BigInt(event.payout), 18),
              tokenSymbol: meta.tokenSymbol,
              timestamp: Number(event.timestamp),
              transactionUrl: `${source.chain.blockExplorers.default.url}/tx/${event.txHash}`,
              loopAddress: window.loop.address!.toLowerCase(),
              transactionHash: event.txHash.toLowerCase(),
              logIndex:
                event.id
                  .toLowerCase()
                  .startsWith(`${event.txHash.toLowerCase()}-`) &&
                /^\d+$/.test(event.id.split("-").at(-1) ?? "")
                  ? Number(event.id.split("-").at(-1))
                  : undefined,
              blockNumber: Number(event.blockNumber),
              tokenAddress: window.loop.token.toLowerCase(),
              tokenDecimals: 18,
              source: "indexed" as const,
            } satisfies ClaimActivityItem,
          }))
      })
      const registrations = windows.flatMap((window) => {
        const meta = loopDashboardMeta[window.loop.historyLoopKey!]
        return (payload.data!.registerEvents ?? [])
          .filter(
            (event) =>
              event.loop.id.toLowerCase() === window.id &&
              window.registrationPeriods.includes(event.periodNumber)
          )
          .map((event) => ({
            item: {
              kind: "registration",
              id: `${source.chain.id}:${event.id}`,
              chainId: source.chain.id,
              chainName: source.chain.name,
              loopName: meta.title,
              logoSrc: meta.logoSrc,
              period: event.periodNumber,
              periodKind:
                BigInt(event.periodNumber) > window.current
                  ? "next"
                  : "current",
              timestamp: Number(event.timestamp),
              transactionUrl: `${source.chain.blockExplorers.default.url}/tx/${event.txHash}`,
              loopAddress: window.loop.address!.toLowerCase(),
              transactionHash: event.txHash.toLowerCase(),
              logIndex:
                event.id
                  .toLowerCase()
                  .startsWith(`${event.txHash.toLowerCase()}-`) &&
                /^\d+$/.test(event.id.split("-").at(-1) ?? "")
                  ? Number(event.id.split("-").at(-1))
                  : undefined,
              blockNumber: Number(event.blockNumber),
              source: "indexed",
            } satisfies RegistrationActivityItem,
          }))
      })
      return {
        claims: [...claims, ...registrations],
        coverage: windows.map((window) => ({
          chainId: source.chain.id,
          loopAddress: window.loop.address!.toLowerCase(),
          currentPeriod: window.current.toString(),
          indexedBlock: payload.data!._meta.block.number,
        })),
      }
    })
  )
  if (results.every((result) => result.status === "rejected"))
    throw new Error("Activity unavailable")
  const claims = results.flatMap((result) =>
    result.status === "fulfilled" ? result.value.claims : []
  )
  const unique = [
    ...new Map(claims.map((claim) => [claim.item.id, claim])).values(),
  ]
  const items = unique.map((claim) => claim.item)
  return {
    address: wallet,
    items: items.sort(
      (a, b) => b.timestamp - a.timestamp || a.id.localeCompare(b.id)
    ),
    totals: activityTotals(items),
    unavailableChains: sources
      .filter((_, index) => results[index].status === "rejected")
      .map((source) => source.chain.name),
    fetchedAt: new Date().toISOString(),
    fullSnapshot: scope == null,
    coverage: results.flatMap((result) =>
      result.status === "fulfilled" ? result.value.coverage : []
    ),
  }
}
