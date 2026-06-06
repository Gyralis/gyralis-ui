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

const CLAIM_EVENTS_QUERY = `
  query ClaimEvents($first: Int!, $skip: Int!, $fromBlock: BigInt!) {
    claimEvents(
      first: $first
      skip: $skip
      orderBy: blockNumber
      orderDirection: asc
      where: { blockNumber_gte: $fromBlock }
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

const CLAIM_EVENTS_BY_LOOP_QUERY = `
  query ClaimEventsByLoop($first: Int!, $skip: Int!, $fromBlock: BigInt!, $loopAddress: ID!) {
    claimEvents(
      first: $first
      skip: $skip
      orderBy: blockNumber
      orderDirection: asc
      where: { blockNumber_gte: $fromBlock, loop: $loopAddress }
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

const CLAIM_EVENTS_BY_USER_LOOP_QUERY = `
  query ClaimEventsByUserLoop($first: Int!, $skip: Int!, $loopAddress: ID!, $userAddress: ID!) {
    claimEvents(
      first: $first
      skip: $skip
      orderBy: periodNumber
      orderDirection: asc
      where: { loop: $loopAddress, account: $userAddress }
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

export async function fetchClaimEventsFromSubgraph(input: {
  fromBlock: number
  first: number
  skip: number
  loopAddress?: string
}): Promise<ClaimScoringEvent[]> {
  return fetchClaimEventPage({
    query: input.loopAddress ? CLAIM_EVENTS_BY_LOOP_QUERY : CLAIM_EVENTS_QUERY,
    variables: {
      first: input.first,
      skip: input.skip,
      fromBlock: input.fromBlock,
      loopAddress: input.loopAddress?.toLowerCase(),
    },
  })
}

export async function fetchAllClaimEventsForUserLoop(input: {
  userAddress: string
  loopAddress: string
  batchSize: number
}): Promise<ClaimScoringEvent[]> {
  const events: ClaimScoringEvent[] = []
  let skip = 0

  while (true) {
    const batch = await fetchClaimEventPage({
      query: CLAIM_EVENTS_BY_USER_LOOP_QUERY,
      variables: {
        first: input.batchSize,
        skip,
        loopAddress: input.loopAddress.toLowerCase(),
        userAddress: input.userAddress.toLowerCase(),
      },
    })
    events.push(...batch)
    if (batch.length < input.batchSize) break
    skip += input.batchSize
  }

  return events
}

async function fetchClaimEventPage(input: {
  query: string
  variables: Record<string, unknown>
}): Promise<ClaimScoringEvent[]> {
  if (!env.GYRALIS_SUBGRAPH_URL) {
    throw new Error("GYRALIS_SUBGRAPH_URL is required for scoring sync")
  }

  const response = await fetch(env.GYRALIS_SUBGRAPH_URL, {
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
    loopAddress: event.loop.id.toLowerCase(),
    chainId: env.GYRALIS_SUBGRAPH_CHAIN_ID,
    periodNumber: Number(event.periodNumber),
    payout: event.payout,
    blockNumber: Number(event.blockNumber),
    timestamp: new Date(Number(event.timestamp) * 1000),
    txHash: event.txHash,
  }))
}
