import { env } from "@/env.mjs"

export const userActivityLoopIds = [3, 4] as const

type EventEntity = "registerEvents" | "claimEvents"
interface ActivityEvent {
  id: string
  periodNumber: string
}

export async function queryActivity<T>(
  query: string,
  variables = {}
): Promise<T> {
  const response = await fetch(env.GYRALIS_SUBGRAPH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  })
  if (!response.ok) {
    throw new Error(`Subgraph request failed with status ${response.status}`)
  }
  const payload = (await response.json()) as {
    data?: T
    errors?: Array<{ message: string }>
  }
  if (payload.errors?.length || !payload.data) {
    throw new Error(
      payload.errors?.map((error) => error.message).join("; ") ||
        "Subgraph returned no activity data"
    )
  }
  return payload.data
}

export async function countUserLoopEvents(
  entity: EventEntity,
  input: {
    userAddress: string
    loopId: number
    blockNumber: number
    batchSize: number
  }
) {
  const query = `
    query UserLoopActivity(
      $userAddress: ID!, $loopId: ID!, $afterId: ID!,
      $first: Int!, $blockNumber: Int!, $allowedLoopIds: [ID!]!
    ) {
      events: ${entity}(
        first: $first
        orderBy: id
        orderDirection: asc
        block: { number: $blockNumber }
        where: {
          account: $userAddress, loop: $loopId,
          loop_in: $allowedLoopIds, id_gt: $afterId
        }
      ) {
        id
        periodNumber
      }
    }
  `
  let afterId = ""
  let eventCount = 0
  const periods = new Set<string>()

  for (;;) {
    const { events } = await queryActivity<{ events: ActivityEvent[] }>(query, {
      userAddress: input.userAddress,
      loopId: String(input.loopId),
      allowedLoopIds: userActivityLoopIds.map(String),
      afterId,
      first: input.batchSize,
      blockNumber: input.blockNumber,
    })
    if (!Array.isArray(events)) {
      throw new Error(`Subgraph returned no ${entity} list`)
    }
    for (const event of events) {
      if (
        typeof event.id !== "string" ||
        event.id <= afterId ||
        typeof event.periodNumber !== "string" ||
        !/^\d+$/.test(event.periodNumber)
      ) {
        throw new Error(`Invalid or non-advancing ${entity} page`)
      }
      afterId = event.id
      periods.add(BigInt(event.periodNumber).toString())
      eventCount++
    }
    if (events.length < input.batchSize) {
      return {
        events: eventCount,
        periods: periods.size,
        periodNumbers: [...periods].sort((a, b) =>
          BigInt(a) < BigInt(b) ? -1 : BigInt(a) > BigInt(b) ? 1 : 0
        ),
      }
    }
  }
}

export async function getUserActivitySnapshot() {
  const snapshot = await queryActivity<{
    _meta: { block: { number: number }; hasIndexingErrors: boolean } | null
  }>("{ _meta { block { number } hasIndexingErrors } }")
  const blockNumber = snapshot._meta?.block?.number
  if (
    typeof blockNumber !== "number" ||
    !Number.isSafeInteger(blockNumber) ||
    blockNumber < 0 ||
    snapshot._meta?.hasIndexingErrors !== false
  ) {
    throw new Error("Subgraph snapshot is unavailable or has indexing errors")
  }
  return blockNumber
}
