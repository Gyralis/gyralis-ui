import { QueryClient } from "@tanstack/react-query"
import { describe, expect, it } from "vitest"

import { getClaimProgress, outstandingClaims } from "./claim-progress"

const claim = {
  action: "claim" as const,
  chainId: 100,
  transactionHash: "0xabc" as const,
  blockNumber: 101n,
}
const snapshot = {
  totalClaims: 9353,
  indexedBlock: 100,
  checkedAt: "2026-09-24T02:00:00Z",
}

describe("optimistic community claims", () => {
  it("deduplicates receipts and reconciles each claim at its own block", () => {
    const store = getClaimProgress(new QueryClient())
    expect(store.add(claim)).toBe(true)
    expect(store.add(claim)).toBe(false)
    store.add({ ...claim, transactionHash: "0xdef", blockNumber: 103n })
    expect(store.getSnapshot().sequence).toBe(2)
    expect(
      outstandingClaims(store.getSnapshot().pending, snapshot)
    ).toHaveLength(2)
    store.reconcile({ ...snapshot, indexedBlock: 101 })
    expect(
      store.getSnapshot().pending.map((item) => item.transactionHash)
    ).toEqual(["0xdef"])
    store.reconcile({ ...snapshot, indexedBlock: 103 })
    expect(store.getSnapshot().pending).toEqual([])
    expect(store.add(claim)).toBe(false)
  })

  it("does not mistake another user's increase for an indexed local claim", () => {
    expect(
      outstandingClaims([claim], { ...snapshot, totalClaims: 9999 })
    ).toEqual([claim])
  })
})
