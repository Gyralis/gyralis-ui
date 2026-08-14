import { env } from "@/env.mjs"
import {
  Chain,
  createPublicClient,
  decodeEventLog,
  http,
  parseAbiItem,
} from "viem"
import * as chains from "viem/chains"

import {
  getUserGlobalStats,
  upsertUserGlobalStats,
} from "@/lib/db/clients/global-stats.client"
import {
  upsertGlobalLeaderboardEntry,
  upsertLoopLeaderboardEntry,
} from "@/lib/db/clients/leaderboard.client"
import {
  getUserLoopStatsForUser,
  upsertUserLoopStats,
} from "@/lib/db/clients/loop-stats.client"
import {
  getProcessedClaimEvent,
  markProcessedClaimEvents,
} from "@/lib/db/clients/processed-claim-events.client"
import { ensureUserProfile } from "@/lib/db/clients/user-profile.client"

import { computeGlobalStatsFromLoops } from "./aggregate"
import { scoringConfig } from "./config"
import { parseEarnedStreakBonuses } from "./responses"
import { computeLoopStatsFromClaims, normalizeAddress } from "./rules"
import { fetchAllClaimEventsForUserLoop } from "./subgraph-client"
import { ClaimScoringEvent, UserLoopScoringStats } from "./types"

const canonicalClaimEvent = parseAbiItem(
  "event Claim(address indexed claimer,uint256 periodNumber,uint256 payout)"
)
const upgradedClaimEvent = parseAbiItem(
  "event Claim(address indexed claimer,address indexed token,uint256 indexed periodNumber,uint256 payout)"
)
const loopIdClaimEvent = parseAbiItem(
  "event Claim(uint256 indexed loopId,address indexed claimer,uint256 indexed periodNumber,uint256 payout)"
)

interface SyncClaimInput {
  userAddress: string
  loopId: number
  chainId: number
  txHash: `0x${string}`
  periodNumber?: number
  contractAddress: string
}

interface ReceiptLogLike {
  address: string
  data: `0x${string}`
  topics: readonly unknown[]
  logIndex?: number
}

function getViemChain(chainId: number): Chain {
  for (const chain of Object.values(chains)) {
    if (typeof chain === "object" && chain != null && "id" in chain) {
      if ((chain as Chain).id === chainId) return chain as Chain
    }
  }
  throw new Error(`Chain with id ${chainId} not found`)
}

function claimEventId(txHash: string, logIndex: number) {
  return `${txHash.toLowerCase()}-${logIndex}`
}

function stringifyUint(value: unknown): string | undefined {
  if (typeof value === "bigint") return value.toString()
  if (typeof value === "number") return String(value)
  if (typeof value === "string") return value
  return undefined
}

function numberFromUint(value: unknown): number | undefined {
  const raw = stringifyUint(value)
  if (raw == null) return undefined

  const parsed = Number(raw)
  return Number.isSafeInteger(parsed) ? parsed : undefined
}

function decodeClaimLog(log: ReceiptLogLike) {
  for (const abiItem of [
    loopIdClaimEvent,
    upgradedClaimEvent,
    canonicalClaimEvent,
  ]) {
    try {
      const decoded = decodeEventLog({
        abi: [abiItem],
        data: log.data,
        topics: log.topics as [] | [`0x${string}`, ...`0x${string}`[]],
      }) as { args: Record<string, unknown> }

      return decoded.args
    } catch {
      // Try the next supported claim event shape.
    }
  }

  return null
}

export function extractClaimEventsFromReceiptLogs(input: {
  logs: ReceiptLogLike[]
  txHash: `0x${string}`
  blockNumber: number
  timestamp?: Date
  userAddress: string
  loopId: number
  chainId: number
  contractAddress: string
  periodNumber?: number
}): ClaimScoringEvent[] {
  const expectedUser = normalizeAddress(input.userAddress)
  const expectedContract = normalizeAddress(input.contractAddress)
  const expectedLoopId = input.loopId.toString()

  const events: ClaimScoringEvent[] = []
  for (const log of input.logs) {
    if (normalizeAddress(log.address) !== expectedContract) continue

    const args = decodeClaimLog(log)
    if (args == null || log.logIndex == null) continue

    const claimer = args.claimer ?? args._user
    if (typeof claimer !== "string") continue
    if (normalizeAddress(claimer) !== expectedUser) continue

    const periodNumber = numberFromUint(args.periodNumber ?? args._id)
    if (periodNumber == null) continue
    if (input.periodNumber != null && periodNumber !== input.periodNumber) {
      continue
    }

    const loopId = stringifyUint(args.loopId)
    if (loopId !== expectedLoopId) continue

    events.push({
      id: claimEventId(input.txHash, log.logIndex),
      userAddress: expectedUser,
      loopId: input.loopId,
      chainId: input.chainId,
      periodNumber,
      blockNumber: input.blockNumber,
      timestamp: input.timestamp,
      txHash: input.txHash.toLowerCase(),
      logIndex: log.logIndex,
      payout: stringifyUint(args.payout ?? args._amount),
    })
  }

  return events
}

function mergeReceiptEvents(
  historicalEvents: ClaimScoringEvent[],
  receiptEvents: ClaimScoringEvent[]
) {
  const byId = new Map<string, ClaimScoringEvent>()
  for (const event of historicalEvents) byId.set(event.id, event)
  for (const event of receiptEvents) byId.set(event.id, event)
  return [...byId.values()]
}

function mapDbLoopStats(
  stats: Awaited<ReturnType<typeof getUserLoopStatsForUser>>[number]
): UserLoopScoringStats {
  return {
    userAddress: stats.userAddress,
    loopId: stats.loopId,
    chainId: stats.chainId,
    totalClaims: stats.totalClaims,
    claimPoints: stats.claimPoints,
    streakBonusPoints: stats.streakBonusPoints,
    totalPoints: stats.totalPoints,
    currentStreak: stats.currentStreak,
    longestStreak: stats.longestStreak,
    lastClaimedPeriod: stats.lastClaimedPeriod,
    earnedStreakBonuses: parseEarnedStreakBonuses(stats.earnedStreakBonuses),
  }
}

async function recomputeUserLoopAndGlobalStats(input: {
  userAddress: string
  loopId: number
  chainId: number
  claimEvents: ClaimScoringEvent[]
}) {
  await ensureUserProfile(input.userAddress)

  const loopStats = computeLoopStatsFromClaims(
    input.claimEvents,
    scoringConfig,
    input
  )
  await upsertUserLoopStats(loopStats)
  await upsertLoopLeaderboardEntry(loopStats)

  const allLoopStats = (await getUserLoopStatsForUser(input.userAddress)).map(
    mapDbLoopStats
  )
  const globalStats = computeGlobalStatsFromLoops(
    input.userAddress,
    allLoopStats
  )
  await upsertUserGlobalStats(globalStats)
  await upsertGlobalLeaderboardEntry(globalStats)

  return { loopStats, globalStats }
}

export async function syncUserClaimFromReceipt(input: SyncClaimInput) {
  if (input.chainId !== env.GYRALIS_SUBGRAPH_CHAIN_ID) {
    throw new Error(
      "Requested chainId does not match GYRALIS_SUBGRAPH_CHAIN_ID"
    )
  }

  const client = createPublicClient({
    chain: getViemChain(input.chainId),
    transport: http(),
  })
  const receipt = await client.getTransactionReceipt({ hash: input.txHash })

  if (receipt.status !== "success") {
    throw new Error("Claim transaction was not successful")
  }

  const block = await client.getBlock({ blockNumber: receipt.blockNumber })
  const receiptEvents = extractClaimEventsFromReceiptLogs({
    logs: receipt.logs.map((log) => ({
      address: log.address,
      data: log.data,
      topics: log.topics,
      logIndex: log.logIndex,
    })),
    txHash: input.txHash,
    blockNumber: Number(receipt.blockNumber),
    timestamp: new Date(Number(block.timestamp) * 1000),
    userAddress: input.userAddress,
    loopId: input.loopId,
    chainId: input.chainId,
    contractAddress: input.contractAddress,
    periodNumber: input.periodNumber,
  })

  if (receiptEvents.length === 0) {
    return { claimed: false, alreadySynced: false }
  }

  const processedEvents = await Promise.all(
    receiptEvents.map((event) =>
      getProcessedClaimEvent({
        chainId: event.chainId,
        txHash: event.txHash!,
        logIndex: event.logIndex!,
      })
    )
  )
  const alreadySynced = processedEvents.every(Boolean)
  const historicalEvents = await fetchAllClaimEventsForUserLoop({
    userAddress: input.userAddress,
    loopId: input.loopId,
    batchSize: env.SCORING_SYNC_BATCH_SIZE,
  })
  const claimEvents = mergeReceiptEvents(historicalEvents, receiptEvents)
  const { loopStats, globalStats } = await recomputeUserLoopAndGlobalStats({
    userAddress: input.userAddress,
    loopId: input.loopId,
    chainId: input.chainId,
    claimEvents,
  })

  await markProcessedClaimEvents(receiptEvents)

  return {
    claimed: true,
    alreadySynced,
    processedEvents: receiptEvents.length,
    loopStats,
    globalStats: globalStats ?? (await getUserGlobalStats(input.userAddress)),
  }
}
