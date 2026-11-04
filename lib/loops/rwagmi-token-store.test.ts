import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  createRwagmiTokenStore,
  getRwagmiTokenStore,
  getSavedRwagmiToken,
  rwagmiStorageKey,
} from "./rwagmi-token-store"

const wallet = "0x1111111111111111111111111111111111111111"
const token = "0x2222222222222222222222222222222222222222"
const success = {
  success: true,
  eligible: true,
  checks: { passport: "passed", creator: "passed" },
}
let storage: Storage
beforeEach(() => {
  const values = new Map<string, string>()
  storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value)
    },
    removeItem: (key) => {
      values.delete(key)
    },
    clear: () => values.clear(),
    key: (index) => [...values.keys()][index] ?? null,
    get length() {
      return values.size
    },
  }
})
afterEach(() => vi.unstubAllGlobals())

describe("RWAGMI wallet setup state", () => {
  it("loads a saved token once without fetching eligibility on every mount", async () => {
    storage.setItem(rwagmiStorageKey(wallet), token)
    const fetcher = vi.fn().mockResolvedValue(Response.json(success))
    const store = createRwagmiTokenStore(wallet, {
      storage: () => storage,
      memory: new Map(),
      fetcher,
    })
    store.hydrate()
    expect(store.getSnapshot()).toMatchObject({ token, hydrated: true })
    expect(fetcher).not.toHaveBeenCalled()
    await store.check()
    const result = store.getSnapshot().result
    store.hydrate()
    expect(store.getSnapshot().result).toBe(result)
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it("deduplicates simultaneous checks and notifies both consumers", async () => {
    storage.setItem(rwagmiStorageKey(wallet), token)
    let respond!: (value: Response) => void
    const fetcher = vi.fn().mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          respond = resolve
        })
    )
    const store = createRwagmiTokenStore(wallet, {
      storage: () => storage,
      memory: new Map(),
      fetcher,
    })
    store.hydrate()
    const first = vi.fn()
    const second = vi.fn()
    const unsubscribe = store.subscribe(first)
    store.subscribe(second)
    const check = store.check()
    await store.check()
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(store.getSnapshot().checking).toBe(true)
    unsubscribe()
    respond(Response.json(success))
    await check
    expect(store.getSnapshot().result?.success).toBe(true)
    expect(second).toHaveBeenCalled()
  })

  it("shares card/dialog state by wallet without leaking another wallet's token", async () => {
    const sharedWallet = "0xabcdef1111111111111111111111111111111111"
    vi.stubGlobal("window", { localStorage: storage })
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() => Promise.resolve(Response.json(success)))
    )
    const card = getRwagmiTokenStore(sharedWallet)
    const dialog = getRwagmiTokenStore(sharedWallet.toUpperCase())
    const other = getRwagmiTokenStore(
      "0xabcdef2222222222222222222222222222222222"
    )
    expect(card).toBe(dialog)
    expect(other).not.toBe(card)
    card.hydrate()
    other.hydrate()
    card.saveAndCheck(token)
    expect(dialog.getSnapshot().checking).toBe(true)
    await vi.waitFor(() =>
      expect(dialog.getSnapshot().result?.success).toBe(true)
    )
    expect(getSavedRwagmiToken(sharedWallet)).toBe(token)
    expect(other.getSnapshot().token).toBeUndefined()
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it("does not interpret a failed verification as an eligible token", async () => {
    const failure = {
      success: false,
      eligible: false,
      code: "PROVIDER_ELIGIBILITY_REQUIRED",
      error: "Not the creator.",
      checks: { passport: "passed", creator: "failed" },
    }
    const store = createRwagmiTokenStore(wallet, {
      storage: () => storage,
      memory: new Map(),
      fetcher: vi.fn().mockResolvedValue(Response.json(failure)),
    })
    store.hydrate()
    store.saveAndCheck(token)
    await vi.waitFor(() => expect(store.getSnapshot().checking).toBe(false))
    expect(store.getSnapshot().result).toMatchObject({
      success: false,
      eligible: false,
    })
  })

  it("honors Retry-After and prevents invalid addresses from starting checks", async () => {
    let now = 1_000
    const fetcher = vi.fn().mockImplementation(() =>
      Promise.resolve(
        Response.json(
          {
            success: false,
            eligible: false,
            code: "VERIFICATION_UNAVAILABLE",
            error: "Try later.",
            checks: { passport: "unavailable", creator: "not_checked" },
          },
          { status: 503, headers: { "Retry-After": "30" } }
        )
      )
    )
    const store = createRwagmiTokenStore(wallet, {
      storage: () => storage,
      memory: new Map(),
      fetcher,
      now: () => now,
    })
    store.hydrate()
    expect(store.saveAndCheck("bad")).toContain("valid token address")
    expect(fetcher).not.toHaveBeenCalled()
    store.saveAndCheck(token)
    await vi.waitFor(() => expect(store.getSnapshot().checking).toBe(false))
    expect(store.getSnapshot().retryAt).toBe(31_000)
    await store.check()
    expect(fetcher).toHaveBeenCalledTimes(1)
    now = 32_000
    await store.check()
    expect(fetcher).toHaveBeenCalledTimes(2)
  })
})
