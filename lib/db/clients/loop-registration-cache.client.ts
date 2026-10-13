import { env } from "@/env.mjs"

import { prisma } from "@/lib/db/client"

export interface LoopRegistrationCacheKey {
  chainId: number
  loopAddress: string
  periodNumber: number
  userAddress: string
}

export interface LoopRegistrationCacheValue extends LoopRegistrationCacheKey {
  checkedAt: Date
  indexedBlock?: number
  registerEventId?: string
  registered: boolean
  source: "rpc" | "subgraph"
  subgraphLoopId: string
}

export function loopRegistrationCacheId(input: LoopRegistrationCacheKey) {
  return [
    input.chainId,
    input.loopAddress.toLowerCase(),
    input.userAddress.toLowerCase(),
    input.periodNumber,
  ].join(":")
}

export async function getLoopRegistrationCache(
  input: LoopRegistrationCacheKey
) {
  if (!env.DATABASE_URL) return null

  return prisma.loopRegistrationCache.findUnique({
    where: { id: loopRegistrationCacheId(input) },
  })
}

export async function upsertLoopRegistrationCache(
  input: LoopRegistrationCacheValue
) {
  if (!env.DATABASE_URL) return undefined

  const id = loopRegistrationCacheId(input)
  const data = {
    checkedAt: input.checkedAt,
    chainId: input.chainId,
    loopAddress: input.loopAddress.toLowerCase(),
    subgraphLoopId: input.subgraphLoopId.toLowerCase(),
    userAddress: input.userAddress.toLowerCase(),
    periodNumber: input.periodNumber,
    registered: input.registered,
    source: input.source,
    indexedBlock: input.indexedBlock,
    registerEventId: input.registerEventId,
  }

  return prisma.loopRegistrationCache.upsert({
    where: { id },
    create: { id, ...data },
    update: data,
  })
}
