import { prisma } from "@/lib/db/client"
import { processedClaimEventId } from "@/lib/db/ids"
import { ClaimScoringEvent } from "@/lib/scoring/types"

function parseLogIndex(event: ClaimScoringEvent): number | undefined {
  if (event.logIndex != null) return event.logIndex

  const rawLogIndex = event.id.split("-").at(-1)
  if (rawLogIndex == null || !/^\d+$/.test(rawLogIndex)) return undefined

  return Number(rawLogIndex)
}

function processedClaimInput(event: ClaimScoringEvent) {
  const txHash = event.txHash?.toLowerCase()
  const logIndex = parseLogIndex(event)

  if (!txHash || logIndex == null || !Number.isSafeInteger(logIndex)) {
    return null
  }

  return {
    id: processedClaimEventId({ chainId: event.chainId, txHash, logIndex }),
    userAddress: event.userAddress.toLowerCase(),
    loopId: event.loopId,
    chainId: event.chainId,
    periodNumber: event.periodNumber,
    txHash,
    logIndex,
  }
}

export async function getProcessedClaimEvent(input: {
  chainId: number
  txHash: string
  logIndex: number
}) {
  return prisma.processedClaimEvent.findUnique({
    where: {
      id: processedClaimEventId({
        chainId: input.chainId,
        txHash: input.txHash.toLowerCase(),
        logIndex: input.logIndex,
      }),
    },
  })
}

export async function markProcessedClaimEvents(events: ClaimScoringEvent[]) {
  const inputs = events
    .map(processedClaimInput)
    .filter((input): input is NonNullable<typeof input> => input != null)

  if (inputs.length === 0) return { count: 0 }

  await Promise.all(
    inputs.map(({ id, ...input }) =>
      prisma.processedClaimEvent.upsert({
        where: { id },
        create: { id, ...input },
        update: input,
      })
    )
  )

  return { count: inputs.length }
}

export async function clearProcessedClaimEvents() {
  await prisma.processedClaimEvent.deleteMany()
}
