import { env } from "@/env.mjs"

import { ClaimScoringEvent } from "./types"

interface ClaimEventNode {
  id: string
  periodNumber: string
  payout: string
  blockNumber: string
  timestamp: string
  txHash: string
  loop: { id: string }
  account: { id: string }
}

interface ClaimEventsResponse {
  data?: {
    claimEvents?: ClaimEventNode[]
  }
  errors?: Array<{ message: string }>
}

interface ClaimEventsQueryFilters {
  fromBlock?: boolean
  blockNumber?: boolean
  afterEventId?: boolean
  loopId?: boolean
  userAddress?: boolean
}

export interface ScoringSubgraphSource {
  chainId: number
  url: string
  loopIdsBySubgraphId?: Readonly<Record<string, number>>
}

export const BASE_SCORING_CHAIN_ID = 8453
export const BASE_MARKEE_SCORING_LOOP_ID = 1
export const BASE_MARKEE_SUBGRAPH_LOOP_ID =
  "0x213310e1dbd6991cd488ab247c81fad82cd88e7a"

export function getScoringSubgraphSources(): ScoringSubgraphSource[] {
  if (!env.GYRALIS_SUBGRAPH_URL) {
    throw new Error("GYRALIS_SUBGRAPH_URL is required for scoring sync")
  }

  const sources: ScoringSubgraphSource[] = [
    {
      chainId: env.GYRALIS_SUBGRAPH_CHAIN_ID,
      url: env.GYRALIS_SUBGRAPH_URL,
    },
  ]

  if (env.GYRALIS_BASE_SUBGRAPH_URL) {
    sources.push({
      chainId: BASE_SCORING_CHAIN_ID,
      url: env.GYRALIS_BASE_SUBGRAPH_URL,
      loopIdsBySubgraphId: {
        [BASE_MARKEE_SUBGRAPH_LOOP_ID]: BASE_MARKEE_SCORING_LOOP_ID,
      },
    })
  }

  return sources
}

export function getScoringSubgraphSource(
  chainId: number
): ScoringSubgraphSource {
  const source = getScoringSubgraphSources().find(
    (candidate) => candidate.chainId === chainId
  )
  if (!source) {
    throw new Error(`No scoring subgraph is configured for chain ${chainId}`)
  }
  return source
}

export function buildClaimEventsQuery(
  filters: ClaimEventsQueryFilters
): string {
  const variables = ["$first: Int!"]
  const where = []

  if (filters.fromBlock) {
    variables.push("$fromBlock: BigInt!")
    where.push("blockNumber_gte: $fromBlock")
  }
  if (filters.blockNumber) {
    variables.push("$blockNumber: BigInt!")
    where.push("blockNumber: $blockNumber")
  }
  if (filters.afterEventId) {
    variables.push("$afterEventId: ID!")
    where.push("id_gt: $afterEventId")
  }
  if (filters.loopId) {
    variables.push("$loopId: ID!")
    where.push("loop: $loopId")
  }
  if (filters.userAddress) {
    variables.push("$userAddress: ID!")
    where.push("account: $userAddress")
  }

  const whereClause = where.length ? `where: { ${where.join(", ")} }` : ""

  return `
  query ClaimEvents(${variables.join(", ")}) {
    claimEvents(
      first: $first
      orderBy: id
      orderDirection: asc
      ${whereClause}
    ) {
      id
      periodNumber
      payout
      blockNumber
      timestamp
      txHash
      loop { id }
      account { id }
    }
  }
`
}

export async function fetchClaimEventsFromSubgraph(input: {
  source: ScoringSubgraphSource
  fromBlock?: number
  blockNumber?: number
  afterEventId?: string
  first: number
  loopId?: number
}): Promise<ClaimScoringEvent[]> {
  if (input.fromBlock != null && input.blockNumber != null) {
    throw new Error("Use either fromBlock or blockNumber, not both")
  }

  return fetchClaimEventPage({
    query: buildClaimEventsQuery({
      fromBlock: input.fromBlock != null,
      blockNumber: input.blockNumber != null,
      afterEventId: input.afterEventId != null,
      loopId: input.loopId != null,
    }),
    variables: {
      first: input.first,
      fromBlock: input.fromBlock,
      blockNumber: input.blockNumber,
      afterEventId: input.afterEventId,
      loopId:
        input.loopId == null
          ? undefined
          : subgraphLoopIdForScoringLoop(input.source, input.loopId),
    },
    source: input.source,
  })
}

export async function fetchAllClaimEventsForUserLoop(input: {
  source: ScoringSubgraphSource
  userAddress: string
  loopId: number
  batchSize: number
}): Promise<ClaimScoringEvent[]> {
  const events: ClaimScoringEvent[] = []
  let afterEventId: string | undefined

  while (true) {
    const batch = await fetchClaimEventPage({
      query: buildClaimEventsQuery({
        afterEventId: afterEventId != null,
        loopId: true,
        userAddress: true,
      }),
      variables: {
        first: input.batchSize,
        afterEventId,
        loopId: subgraphLoopIdForScoringLoop(input.source, input.loopId),
        userAddress: input.userAddress.toLowerCase(),
      },
      source: input.source,
    })
    events.push(...batch)
    if (batch.length < input.batchSize) break
    afterEventId = batch[batch.length - 1]?.id
  }

  return events
}

function parseSubgraphLogIndex(id: string): number | undefined {
  const raw = id.split("-").at(-1)
  if (raw == null || Number.isNaN(Number(raw))) return undefined
  return Number(raw)
}

export function parseSubgraphLoopId(
  source: ScoringSubgraphSource,
  id: string
): number {
  const mappedLoopId = source.loopIdsBySubgraphId?.[id.toLowerCase()]
  if (mappedLoopId != null) return mappedLoopId

  const loopId = Number(id)
  if (!Number.isSafeInteger(loopId) || loopId < 0) {
    throw new Error(`Invalid numeric loop id from subgraph: ${id}`)
  }
  return loopId
}

function subgraphLoopIdForScoringLoop(
  source: ScoringSubgraphSource,
  loopId: number
): string {
  const mappedEntry = Object.entries(source.loopIdsBySubgraphId ?? {}).find(
    ([, mappedLoopId]) => mappedLoopId === loopId
  )
  return mappedEntry?.[0] ?? loopId.toString()
}

async function fetchClaimEventPage(input: {
  query: string
  variables: Record<string, unknown>
  source: ScoringSubgraphSource
}): Promise<ClaimScoringEvent[]> {
  const response = await fetch(input.source.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    throw new Error(`Subgraph request failed with status ${response.status}`)
  }

  const payload = (await response.json()) as ClaimEventsResponse
  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join("; "))
  }

  return (payload.data?.claimEvents ?? []).map((event) => ({
    id: event.id,
    userAddress: event.account.id.toLowerCase(),
    loopId: parseSubgraphLoopId(input.source, event.loop.id),
    chainId: input.source.chainId,
    periodNumber: Number(event.periodNumber),
    payout: event.payout,
    blockNumber: Number(event.blockNumber),
    timestamp: new Date(Number(event.timestamp) * 1000),
    txHash: event.txHash,
    logIndex: parseSubgraphLogIndex(event.id),
  }))
}
