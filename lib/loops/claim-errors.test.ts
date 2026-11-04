import { describe, expect, it } from "vitest"

import { isWalletRejection } from "./claim-errors"

describe("claim error feedback", () => {
  it("recognizes rejected wallet requests through a wrapped error", () => {
    expect(isWalletRejection({ cause: { code: 4001 } })).toBe(true)
    expect(isWalletRejection({ name: "UserRejectedRequestError" })).toBe(true)
  })

  it("does not label a network error as a wallet cancellation", () => {
    expect(isWalletRejection(new Error("RPC unavailable"))).toBe(false)
    const cyclic: { cause?: unknown } = {}
    cyclic.cause = cyclic
    expect(isWalletRejection(cyclic)).toBe(false)
  })
})
