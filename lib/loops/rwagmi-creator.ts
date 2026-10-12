import { z } from "zod"

const addressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/)
const launchResponseSchema = z.object({
  item: z
    .object({ tokenAddress: addressSchema, creator: addressSchema })
    .nullable(),
  state: z.object({
    configured: z.boolean(),
    lastRunCompletedAt: z.string().datetime({ offset: true }).nullable(),
    lastError: z.string().nullable(),
  }),
})

export class RwagmiVerificationError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly retryAfter?: number
  ) {
    super(message)
    this.name = "RwagmiVerificationError"
  }
}

type Launch = z.infer<typeof launchResponseSchema>["item"]
const CACHE_LIMIT = 256
const MAX_INDEXER_AGE_MS = 5 * 60_000

// Cache launch data only. Wallet eligibility is always computed for the current
// request. Each server instance has its own cache.
export function createRwagmiLaunchLookup() {
  const cache = new Map<string, { launch: Launch; expiresAt: number }>()
  const pending = new Map<string, Promise<Launch>>()

  async function fetchLaunch(token: string): Promise<Launch> {
    try {
      const response = await fetch(
        `https://rwagmi.com/api/launches?chainId=8453&token=${token}`,
        {
          cache: "no-store",
          signal: AbortSignal.timeout(8_000),
          headers: {
            Accept: "application/json",
            "User-Agent":
              "Gyralis/RWAGMI-Creator-Eligibility (https://gyralis.xyz)",
          },
        }
      )
      if (response.status === 429) {
        const rawRetryAfter = response.headers.get("Retry-After")
        const seconds =
          rawRetryAfter && /^\d+$/.test(rawRetryAfter)
            ? Number(rawRetryAfter)
            : rawRetryAfter
            ? Math.ceil((Date.parse(rawRetryAfter) - Date.now()) / 1000)
            : NaN
        throw new RwagmiVerificationError(
          "RWAGMI_RATE_LIMITED",
          "RWAGMI is busy. Please try again shortly.",
          Number.isFinite(seconds) ? Math.min(3600, Math.max(1, seconds)) : 60
        )
      }
      if (!response.ok) throw new Error(`RWAGMI HTTP ${response.status}`)
      const result = launchResponseSchema.safeParse(await response.json())
      if (!result.success) throw new Error("Invalid RWAGMI response")
      const { item, state } = result.data
      const completedAt = state.lastRunCompletedAt
        ? Date.parse(state.lastRunCompletedAt)
        : NaN
      if (
        !state.configured ||
        state.lastError !== null ||
        !Number.isFinite(completedAt) ||
        completedAt > Date.now() + 60_000 ||
        Date.now() - completedAt >= MAX_INDEXER_AGE_MS
      ) {
        throw new RwagmiVerificationError(
          "RWAGMI_DATA_STALE",
          "RWAGMI launch data is updating. Please try again shortly."
        )
      }
      if (item && item.tokenAddress.toLowerCase() !== token) {
        throw new Error("RWAGMI returned a different token")
      }
      // Never retain data beyond its indexer freshness window.
      const expiresAt = Math.min(
        Date.now() + (item ? 60_000 : 30_000),
        completedAt + MAX_INDEXER_AGE_MS
      )
      if (cache.size >= CACHE_LIMIT) cache.delete(cache.keys().next().value!)
      cache.set(token, { launch: item, expiresAt })
      return item
    } catch (error) {
      if (error instanceof RwagmiVerificationError) throw error
      throw new RwagmiVerificationError(
        "RWAGMI_UNAVAILABLE",
        "Unable to verify your RWAGMI launch right now. Please try again shortly."
      )
    }
  }

  return async (tokenAddress: string): Promise<Launch> => {
    const token = addressSchema.parse(tokenAddress).toLowerCase()
    const cached = cache.get(token)
    if (cached && cached.expiresAt > Date.now()) return cached.launch
    cache.delete(token)
    const existing = pending.get(token)
    if (existing) return existing
    if (pending.size >= CACHE_LIMIT) {
      throw new RwagmiVerificationError(
        "RWAGMI_UNAVAILABLE",
        "Launch verification is busy. Please try again shortly.",
        60
      )
    }
    const request = fetchLaunch(token)
    pending.set(token, request)
    try {
      return await request
    } finally {
      pending.delete(token)
    }
  }
}

export const lookupRwagmiLaunch = createRwagmiLaunchLookup()
