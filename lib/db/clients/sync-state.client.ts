import { prisma } from "@/lib/db/client"

export const SCORING_SYNC_STATE_ID = "scoring-sync"

export function scoringSyncStateId(chainId: number) {
  // Replay Base incrementally once after removing the old allowlist. Existing
  // projections are recomputed/upserted, never cleared or incremented twice.
  if (chainId === 8453)
    return `${SCORING_SYNC_STATE_ID}-${chainId}-all-loops-v1`
  return chainId === 100
    ? SCORING_SYNC_STATE_ID
    : `${SCORING_SYNC_STATE_ID}-${chainId}`
}

export async function getScoringSyncState(chainId: number) {
  const id = scoringSyncStateId(chainId)
  return prisma.scoringSyncState.upsert({
    where: { id },
    create: { id },
    update: {},
  })
}

export async function updateScoringSyncState(input: {
  chainId: number
  lastBlockNumber: number
  lastEventId?: string
}) {
  const id = scoringSyncStateId(input.chainId)
  return prisma.scoringSyncState.upsert({
    where: { id },
    create: {
      id,
      lastBlockNumber: input.lastBlockNumber,
      lastEventId: input.lastEventId,
      lastSyncedAt: new Date(),
    },
    update: {
      lastBlockNumber: input.lastBlockNumber,
      lastEventId: input.lastEventId,
      lastSyncedAt: new Date(),
    },
  })
}

export async function resetScoringSyncState() {
  await prisma.scoringSyncState.deleteMany()
}
