import { prisma } from "@/lib/db/client"

export const SCORING_SYNC_STATE_ID = "scoring-sync"

export async function getScoringSyncState() {
  return prisma.scoringSyncState.upsert({
    where: { id: SCORING_SYNC_STATE_ID },
    create: { id: SCORING_SYNC_STATE_ID },
    update: {},
  })
}

export async function updateScoringSyncState(input: {
  lastBlockNumber: number
  lastEventId?: string
}) {
  return prisma.scoringSyncState.upsert({
    where: { id: SCORING_SYNC_STATE_ID },
    create: {
      id: SCORING_SYNC_STATE_ID,
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
