import { describe, expect, it } from "vitest"

import {
  getClaimedTokenTitle,
  getConfirmationDelayedToast,
  getRevertedTransactionToast,
} from "./transaction-toast-messages"

describe("transaction toast messages", () => {
  it("includes the formatted amount and dynamic token symbol after a claim", () => {
    expect(
      getClaimedTokenTitle({
        amount: 12_345_678_000_000_000n,
        decimals: 18,
        symbol: "HNY",
      })
    ).toBe("Claimed 0.0123 HNY")
  })

  it("uses a safe claim title until token metadata is available", () => {
    expect(getClaimedTokenTitle({ amount: 1n })).toBe("Rewards claimed")
  })

  it.each([
    ["claim", "Claim failed", "No rewards were claimed."],
    ["enter", "Entry failed", "Your entry was not confirmed."],
    ["remain", "Registration failed", "Your registration was not renewed."],
  ] as const)(
    "describes a reverted %s transaction without reporting success",
    (action, title, description) => {
      const notification = getRevertedTransactionToast(action)

      expect(notification).toMatchObject({ title, type: "error" })
      expect(notification.description).toContain("The transaction reverted.")
      expect(notification.description).toContain(description)
    }
  )

  it("keeps an RPC confirmation error distinct from an onchain failure", () => {
    expect(getConfirmationDelayedToast()).toEqual({
      title: "Confirmation delayed",
      description:
        "We couldn’t confirm this transaction yet. Check Blockscout for its latest status.",
      type: "warning",
    })
  })
})
