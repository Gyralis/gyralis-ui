import {
  LoopCardData,
  LoopCardsData,
  LoopEligibilityProvider,
} from "@/data/loops-data"
import { z } from "zod"

export const eligibilityRequestSchema = z.object({
  userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  loopAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  chainId: z.coerce.number().int().positive(),
})

export interface AllowlistedLoop {
  address: `0x${string}`
  chainId: number
  passportMinScore: number
}

const normalizeAddress = (address: string) => address.toLowerCase()

export function findAllowlistedLoop(
  provider: LoopEligibilityProvider,
  loopAddress: string,
  chainId: number
): AllowlistedLoop | undefined {
  const targetAddress = normalizeAddress(loopAddress)

  const loop = LoopCardsData.find(
    (item: LoopCardData) =>
      item.enabled &&
      item.eligibilityProvider === provider &&
      !!item.address &&
      normalizeAddress(item.address) === targetAddress &&
      item.chainId === chainId
  )

  if (!loop?.address) return undefined

  return {
    address: loop.address,
    chainId: loop.chainId,
    passportMinScore: loop.passportMinScore,
  }
}
