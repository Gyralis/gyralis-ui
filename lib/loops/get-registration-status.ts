import "server-only"

import {
  createPublicClient,
  http,
  parseAbi,
  parseAbiItem,
  type Address,
} from "viem"
import { base } from "viem/chains"
import { z } from "zod"

import {
  getLoopRegistrationCache,
  upsertLoopRegistrationCache,
} from "@/lib/db/clients/loop-registration-cache.client"

import {
  getLoopRegistrationSource,
  type LoopRegistrationSource,
} from "./registration-sources"

const RPC_LOG_LOOKBACK_BLOCKS = 100_000n
const BASE_RPC_LOG_BLOCK_SPAN = 9_000n
const SUBGRAPH_TIMEOUT_MS = 8_000

const legacyRegisterEvent = parseAbiItem(
  "event Register(address indexed sender, uint256 indexed periodNumber)"
)
const tokenRegisterEvent = parseAbiItem(
  "event Register(address indexed sender, address indexed token, uint256 indexed periodNumber)"
)
const streamingLoopScheduleAbi = parseAbi([
  "function getStreamingLoopDetails() view returns (address token, uint256 periodLength, uint256 percentPerPeriod, uint256 firstPeriodStart)",
])

interface PeriodBlockRangeInput {
  averageBlockTimeSeconds: bigint
  firstPeriodStart: bigint
  latestBlockNumber: bigint
  latestBlockTimestamp: bigint
  paddingBlocks?: bigint
  periodLength: bigint
  periodNumber: number
}

export function estimateRegistrationPeriodBlockRange({
  averageBlockTimeSeconds,
  firstPeriodStart,
  latestBlockNumber,
  latestBlockTimestamp,
  paddingBlocks = 300n,
  periodLength,
  periodNumber,
}: PeriodBlockRangeInput) {
  const registrationPeriod = BigInt(Math.max(0, periodNumber - 1))
  const windowStart = firstPeriodStart + registrationPeriod * periodLength
  const windowEnd = windowStart + periodLength
  const estimateBlock = (timestamp: bigint) => {
    if (timestamp >= latestBlockTimestamp) return latestBlockNumber
    const secondsAgo = latestBlockTimestamp - timestamp
    const blocksAgo =
      (secondsAgo + averageBlockTimeSeconds - 1n) / averageBlockTimeSeconds
    return blocksAgo >= latestBlockNumber ? 0n : latestBlockNumber - blocksAgo
  }
  const estimatedStart = estimateBlock(windowStart)
  const estimatedEnd = estimateBlock(windowEnd)

  return {
    fromBlock:
      estimatedStart > paddingBlocks ? estimatedStart - paddingBlocks : 0n,
    toBlock:
      estimatedEnd + paddingBlocks < latestBlockNumber
        ? estimatedEnd + paddingBlocks
        : latestBlockNumber,
  }
}

export function splitInclusiveBlockRange(
  fromBlock: bigint,
  toBlock: bigint,
  maxSpan: bigint
) {
  const ranges: Array<{ fromBlock: bigint; toBlock: bigint }> = []
  for (let start = fromBlock; start <= toBlock; start += maxSpan + 1n) {
    const end = start + maxSpan < toBlock ? start + maxSpan : toBlock
    ranges.push({ fromBlock: start, toBlock: end })
  }
  return ranges
}

const subgraphResponseSchema = z.object({
  _meta: z.object({
    block: z.object({ number: z.number().int().nonnegative().safe() }),
    hasIndexingErrors: z.boolean(),
  }),
  registerEvents: z.array(
    z.object({
      id: z.string(),
      blockNumber: z.string().regex(/^\d+$/),
    })
  ),
})

const registrationStatusQuery = `
  query RegistrationStatus(
    $loopId: ID!
    $userAddress: ID!
    $periodNumber: BigInt!
  ) {
    _meta { block { number } hasIndexingErrors }
    registerEvents(
      first: 1
      where: {
        loop: $loopId
        account: $userAddress
        periodNumber: $periodNumber
      }
    ) {
      id
      blockNumber
    }
  }
`

export interface RegistrationStatusInput {
  chainId: number
  loopAddress: Address
  periodNumber: number
  userAddress: Address
}

export interface RegistrationStatusResult {
  cached: boolean
  checkedAt: string
  indexedBlock?: number
  originSource: "rpc" | "subgraph"
  registered: boolean
  source: "cache" | "rpc" | "subgraph"
}

interface SourceResult {
  indexedBlock: number
  registerEventId?: string
  registered: boolean
  source: "rpc" | "subgraph"
}

interface RegistrationCacheRecord {
  checkedAt: Date
  indexedBlock: number | null
  registered: boolean
  source: string
}

interface RegistrationStatusDependencies {
  getCache: (
    input: RegistrationStatusInput
  ) => Promise<RegistrationCacheRecord | null>
  getSource: typeof getLoopRegistrationSource
  now: () => Date
  queryRpc: typeof queryRegistrationRpc
  querySubgraph: typeof queryRegistrationSubgraph
  upsertCache: typeof upsertLoopRegistrationCache
}

class SubgraphUnavailableError extends Error {}

function isFreshCacheEntry(cached: RegistrationCacheRecord | null) {
  return cached?.registered === true
}

export async function queryRegistrationSubgraph(
  source: LoopRegistrationSource,
  input: RegistrationStatusInput
): Promise<SourceResult> {
  const response = await fetch(source.subgraphUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: registrationStatusQuery,
      variables: {
        loopId: source.subgraphId,
        userAddress: input.userAddress.toLowerCase(),
        periodNumber: input.periodNumber.toString(),
      },
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(SUBGRAPH_TIMEOUT_MS),
  })
  if (!response.ok) {
    throw new SubgraphUnavailableError(
      `Registration subgraph returned ${response.status}`
    )
  }

  const payload = (await response.json()) as {
    data?: unknown
    errors?: Array<{ message?: string }>
  }
  if (payload.errors?.length) {
    throw new SubgraphUnavailableError("Registration subgraph query failed")
  }

  const data = subgraphResponseSchema.parse(payload.data)
  if (data._meta.hasIndexingErrors) {
    throw new SubgraphUnavailableError(
      "Registration subgraph reports indexing errors"
    )
  }
  const event = data.registerEvents[0]
  return {
    indexedBlock: data._meta.block.number,
    registerEventId: event?.id,
    registered: Boolean(event),
    source: "subgraph",
  }
}

export async function queryRegistrationRpc(
  source: LoopRegistrationSource,
  input: RegistrationStatusInput
): Promise<SourceResult> {
  const client = createPublicClient({
    chain: source.chain,
    transport: http(source.rpcUrl, {
      retryCount: 1,
      retryDelay: 500,
      timeout: 8_000,
    }),
  })
  const latestBlock = await client.getBlockNumber()
  let fromBlock =
    latestBlock > RPC_LOG_LOOKBACK_BLOCKS
      ? latestBlock - RPC_LOG_LOOKBACK_BLOCKS
      : 0n
  let toBlock = latestBlock
  if (source.chainId === base.id && source.contractType === "superLoop") {
    const [latestBlockData, details] = await Promise.all([
      client.getBlock({ blockNumber: latestBlock }),
      client.readContract({
        address: source.address,
        abi: streamingLoopScheduleAbi,
        functionName: "getStreamingLoopDetails",
      }),
    ])
    const periodRange = estimateRegistrationPeriodBlockRange({
      averageBlockTimeSeconds: 2n,
      firstPeriodStart: details[3],
      latestBlockNumber: latestBlock,
      latestBlockTimestamp: latestBlockData.timestamp,
      periodLength: details[1],
      periodNumber: input.periodNumber,
    })
    fromBlock = periodRange.fromBlock
    toBlock = periodRange.toBlock
  }
  const args = {
    sender: input.userAddress,
    periodNumber: BigInt(input.periodNumber),
  }
  const ranges =
    source.chainId === base.id
      ? splitInclusiveBlockRange(fromBlock, toBlock, BASE_RPC_LOG_BLOCK_SPAN)
      : [{ fromBlock, toBlock }]
  let registered = false
  for (const range of ranges) {
    const requests = []
    if (source.registerEventTypes.includes("legacy")) {
      requests.push(
        client.getLogs({
          address: source.address,
          event: legacyRegisterEvent,
          args,
          ...range,
        })
      )
    }
    if (source.registerEventTypes.includes("token")) {
      requests.push(
        client.getLogs({
          address: source.address,
          event: tokenRegisterEvent,
          args,
          ...range,
        })
      )
    }
    const logs = await Promise.all(requests)
    if (logs.some((entries) => entries.length > 0)) {
      registered = true
      break
    }
  }

  return {
    indexedBlock: Number(latestBlock),
    registered,
    source: "rpc",
  }
}

export async function getRegistrationStatus(
  input: RegistrationStatusInput,
  dependencyOverrides: Partial<RegistrationStatusDependencies> = {}
): Promise<RegistrationStatusResult> {
  const dependencies: RegistrationStatusDependencies = {
    getCache: getLoopRegistrationCache,
    getSource: getLoopRegistrationSource,
    now: () => new Date(),
    queryRpc: queryRegistrationRpc,
    querySubgraph: queryRegistrationSubgraph,
    upsertCache: upsertLoopRegistrationCache,
    ...dependencyOverrides,
  }
  const source = dependencies.getSource(input.chainId, input.loopAddress)
  if (!source) throw new Error("Unsupported loop registration source")

  const now = dependencies.now()
  let cached: RegistrationCacheRecord | null = null
  try {
    cached = await dependencies.getCache(input)
  } catch (error) {
    console.error("[loop-registration] cache read failed", error)
  }

  if (isFreshCacheEntry(cached)) {
    const originSource = cached?.source === "rpc" ? "rpc" : "subgraph"
    return {
      cached: true,
      checkedAt: cached!.checkedAt.toISOString(),
      indexedBlock: cached!.indexedBlock ?? undefined,
      originSource,
      registered: cached!.registered,
      source: "cache",
    }
  }

  let result: SourceResult
  try {
    result = await dependencies.querySubgraph(source, input)
  } catch (error) {
    console.warn("[loop-registration] subgraph unavailable; using RPC", error)
    result = await dependencies.queryRpc(source, input)
  }

  const checkedAt = dependencies.now()
  if (result.registered) {
    try {
      await dependencies.upsertCache({
        ...input,
        checkedAt,
        indexedBlock: result.indexedBlock,
        registerEventId: result.registerEventId,
        registered: true,
        source: result.source,
        subgraphLoopId: source.subgraphId,
      })
    } catch (error) {
      console.error("[loop-registration] cache write failed", error)
    }
  }

  return {
    cached: false,
    checkedAt: checkedAt.toISOString(),
    indexedBlock: result.indexedBlock,
    originSource: result.source,
    registered: result.registered,
    source: result.source,
  }
}
