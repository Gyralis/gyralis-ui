import "server-only"

import { loopDashboardMeta } from "@/data/loop-dashboard-meta"
import { LoopCardsData } from "@/data/loops-data"
import { env } from "@/env.mjs"
import {
  createPublicClient,
  formatUnits,
  http,
  isAddress,
  parseAbi,
} from "viem"
import { base, gnosis } from "viem/chains"

import type { ClaimActivityItem, LatestActivityData } from "./types"

const currentPeriodAbi = parseAbi([
  "function getCurrentPeriod() view returns (uint256)",
  "function getStreamingCurrentPeriod() view returns (uint256)",
])

interface ClaimEvent {
  id: string
  periodNumber: string
  payout: string
  timestamp: string
  txHash: string
  loop: { id: string }
}

/** One independent current/previous period window per active, indexed loop. */
export async function getLatestActivity(
  address: string
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
  ]
  const results = await Promise.allSettled(
    sources.map(async (source) => {
      const loops = LoopCardsData.filter(
        (loop) =>
          loop.enabled &&
          loop.chainId === source.chain.id &&
          loop.historyLoopKey &&
          loop.address
      )
      if (!loops.length) return []
      if (!source.endpoint) throw new Error("Activity source unavailable")
      const client = createPublicClient({
        chain: source.chain,
        transport: http(source.rpc, { timeout: 5_000, retryCount: 0 }),
      })
      const periods = await client.multicall({
        contracts: loops.map((loop) => ({
          address: loop.address!,
          abi: currentPeriodAbi,
          functionName:
            loop.contractType === "superLoop"
              ? ("getStreamingCurrentPeriod" as const)
              : ("getCurrentPeriod" as const),
        })),
        allowFailure: false,
      })
      const windows = loops.map((loop, index) => {
        const current = periods[index]
        return {
          loop,
          // Base subgraph IDs are contract addresses, independently of UI/scoring IDs.
          id:
            source.chain.id === gnosis.id
              ? String(loop.id)
              : loop.address!.toLowerCase(),
          current,
          periods:
            current > 0n
              ? [current.toString(), (current - 1n).toString()]
              : ["0"],
        }
      })
      const response = await fetch(source.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
        body: JSON.stringify({
          query: `query LatestActivity($windows: [ClaimEvent_filter!]!) {
          _meta { hasIndexingErrors }
          claimEvents(first: 1000, orderBy: timestamp, orderDirection: desc,
            where: { or: $windows }) {
            id periodNumber payout timestamp txHash loop { id }
          }
        }`,
          variables: {
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
          _meta: { hasIndexingErrors: boolean }
          claimEvents: ClaimEvent[]
        }
        errors?: unknown[]
      }
      if (
        payload.errors?.length ||
        !payload.data ||
        payload.data._meta.hasIndexingErrors ||
        payload.data.claimEvents.length >= 1000
      ) {
        throw new Error("Activity snapshot unavailable")
      }
      const events = payload.data.claimEvents
      return windows.flatMap((window) => {
        const loopEvents = events.filter(
          (event) => event.loop.id.toLowerCase() === window.id
        )
        const hasCurrent = loopEvents.some(
          (event) => event.periodNumber === window.current.toString()
        )
        const selected = hasCurrent ? window.current : window.current - 1n
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
            } satisfies ClaimActivityItem,
            raw: BigInt(event.payout),
            token: window.loop.token.toLowerCase(),
          }))
      })
    })
  )
  if (results.every((result) => result.status === "rejected"))
    throw new Error("Activity unavailable")
  const claims = results.flatMap((result) =>
    result.status === "fulfilled" ? result.value : []
  )
  const unique = [
    ...new Map(claims.map((claim) => [claim.item.id, claim])).values(),
  ]
  const totals = new Map<
    string,
    { chainId: number; tokenSymbol: string; raw: bigint }
  >()
  for (const claim of unique) {
    const key = `${claim.item.chainId}:${claim.token}`
    const total = totals.get(key) ?? {
      chainId: claim.item.chainId,
      tokenSymbol: claim.item.tokenSymbol,
      raw: 0n,
    }
    total.raw += claim.raw
    totals.set(key, total)
  }
  return {
    address: wallet,
    items: unique
      .map((claim) => claim.item)
      .sort((a, b) => b.timestamp - a.timestamp || a.id.localeCompare(b.id)),
    totals: [...totals.values()].map(({ raw, ...total }) => ({
      ...total,
      amount: formatUnits(raw, 18),
    })),
    unavailableChains: sources
      .filter((_, index) => results[index].status === "rejected")
      .map((source) => source.chain.name),
    fetchedAt: new Date().toISOString(),
  }
}
