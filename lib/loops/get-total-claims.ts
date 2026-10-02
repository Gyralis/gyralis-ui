import "server-only"

import { env } from "@/env.mjs"
import { z } from "zod"

import { gnosisLoopSources } from "./gnosis-loop-sources"
import type { TotalClaimsSnapshot } from "./total-claims"

const snapshotSchema = z.object({
  _meta: z.object({
    block: z.object({ number: z.number().int().nonnegative().safe() }),
    hasIndexingErrors: z.literal(false),
  }),
  loops: z.array(
    z.object({
      id: z.string(),
      claimsCount: z.string().regex(/^\d+$/),
    })
  ),
})

const query = `
  query TotalClaims($loopIds: [ID!]!, $first: Int!) {
    _meta { block { number } hasIndexingErrors }
    loops(first: $first, where: { id_in: $loopIds }) {
      id
      claimsCount
    }
  }
`

export async function getTotalClaims(): Promise<TotalClaimsSnapshot> {
  if (!env.GYRALIS_SUBGRAPH_URL || env.GYRALIS_SUBGRAPH_CHAIN_ID !== 100) {
    throw new Error("A Gnosis subgraph is required for total claims")
  }

  const loopIds = Object.values(gnosisLoopSources).map(
    (loop) => loop.subgraphId
  )
  const response = await fetch(env.GYRALIS_SUBGRAPH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      variables: { loopIds, first: loopIds.length },
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  })
  if (!response.ok) throw new Error("Total claims subgraph request failed")

  const payload = await response.json()
  if (payload.errors?.length)
    throw new Error("Total claims subgraph query failed")
  const data = snapshotSchema.parse(payload.data)
  const ids = new Set(data.loops.map((loop) => loop.id))
  if (
    data.loops.length !== loopIds.length ||
    ids.size !== loopIds.length ||
    loopIds.some((id) => !ids.has(id))
  ) {
    throw new Error("Total claims subgraph scope is incomplete")
  }

  const total = data.loops.reduce(
    (sum, loop) => sum + BigInt(loop.claimsCount),
    0n
  )
  if (total > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error("Total claims exceeds the supported range")
  }

  return {
    totalClaims: Number(total),
    checkedAt: new Date().toISOString(),
    indexedBlock: data._meta.block.number,
  }
}
