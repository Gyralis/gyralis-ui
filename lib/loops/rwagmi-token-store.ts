import {
  rwagmiAddressSchema,
  rwagmiResultSchema,
  uncheckedRwagmiChecks,
  type RwagmiResult,
} from "./rwagmi-eligibility"

export interface RwagmiTokenState {
  token?: string
  checking: boolean
  result?: RwagmiResult
  storageError?: string
  retryAt: number
}
interface StoreOptions {
  storage: () => Pick<Storage, "getItem" | "setItem" | "removeItem">
  fetcher?: typeof fetch
  now?: () => number
  memory?: Map<string, string>
}
const sessionTokens = new Map<string, string>()
export const rwagmiStorageKey = (wallet: string) =>
  `gyralis:rwagmi-token:v1:8453:${wallet.toLowerCase()}`

export function getSavedRwagmiToken(wallet: string): string | undefined {
  const key = rwagmiStorageKey(wallet)
  let raw = sessionTokens.get(key)
  if (!sessionTokens.has(key)) {
    try {
      raw = window.localStorage.getItem(key) ?? undefined
    } catch {
      /* Session memory remains available. */
    }
  }
  const parsed = rwagmiAddressSchema.safeParse(raw)
  return parsed.success ? parsed.data : undefined
}

// A subscribable controller keeps async races and persistence testable without
// tying them to dialog visibility. Only addresses survive controller recreation.
export function createRwagmiTokenStore(
  wallet: string | undefined,
  options: StoreOptions
) {
  const key = wallet ? rwagmiStorageKey(wallet) : undefined
  const memory = options.memory ?? sessionTokens
  const fetcher = options.fetcher ?? fetch
  const now = options.now ?? Date.now
  let state: RwagmiTokenState = { checking: false, retryAt: 0 }
  const initialState = state
  let generation = 0
  let controller: AbortController | undefined
  const listeners = new Set<() => void>()
  const update = (patch: Partial<RwagmiTokenState>) => {
    state = { ...state, ...patch }
    listeners.forEach((listener) => listener())
  }
  const invalidate = () => {
    generation++
    controller?.abort()
    controller = undefined
  }
  const persist = (token?: string) => {
    if (!key) return
    if (token) memory.set(key, token)
    else memory.set(key, "")
    try {
      if (token) options.storage().setItem(key, token)
      else options.storage().removeItem(key)
      update({ storageError: undefined })
    } catch {
      update({
        storageError: token
          ? "Your token is available for this session, but could not be remembered on this browser."
          : "The token was removed for this session, but browser storage could not be updated.",
      })
    }
  }
  async function check(token = state.token) {
    if (!wallet || !token || state.checking || state.retryAt > now()) return
    invalidate()
    const requestGeneration = generation
    controller = new AbortController()
    update({ checking: true, result: undefined })
    try {
      const response = await fetcher("/api/rwagmi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userAddress: wallet, tokenAddress: token }),
        signal: controller.signal,
      })
      const result = rwagmiResultSchema.parse(await response.json())
      if (response.ok !== result.success)
        throw new Error("Inconsistent eligibility response")
      if (requestGeneration !== generation) return
      const seconds = Number(response.headers.get("Retry-After"))
      update({
        result,
        retryAt:
          !result.success && Number.isFinite(seconds) && seconds > 0
            ? now() + Math.min(3600, seconds) * 1000
            : 0,
      })
    } catch {
      if (requestGeneration !== generation) return
      update({
        result: {
          success: false,
          eligible: false,
          code: "VERIFICATION_UNAVAILABLE",
          error: "We couldn’t verify eligibility right now. Please try again.",
          checks: { ...uncheckedRwagmiChecks, passport: "unavailable" },
        },
      })
    } finally {
      if (requestGeneration === generation) update({ checking: false })
    }
  }
  return {
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    getSnapshot: () => state,
    getServerSnapshot: () => initialState,
    hydrate() {
      if (!key) return
      try {
        const stored = options.storage().getItem(key)
        const token = rwagmiAddressSchema.safeParse(
          memory.has(key) ? memory.get(key) : stored
        )
        update({ token: token.success ? token.data : undefined })
      } catch {
        const token = rwagmiAddressSchema.safeParse(memory.get(key))
        update({
          token: token.success ? token.data : undefined,
          storageError:
            "Browser storage is unavailable. Your token will be kept for this session.",
        })
      }
    },
    saveAndCheck(rawToken: string) {
      const parsed = rwagmiAddressSchema.safeParse(rawToken)
      if (!parsed.success)
        return "Enter a valid token address: 0x followed by 40 hexadecimal characters."
      if (!wallet || state.checking || state.retryAt > now()) return
      invalidate()
      update({ token: parsed.data, result: undefined })
      persist(parsed.data)
      void check(parsed.data)
    },
    check,
    remove() {
      invalidate()
      update({ token: undefined, result: undefined, checking: false })
      persist()
    },
    dispose() {
      invalidate()
    },
  }
}
