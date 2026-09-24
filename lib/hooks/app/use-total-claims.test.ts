import { QueryClient, QueryObserver } from "@tanstack/react-query"
import { afterEach, describe, expect, it, vi } from "vitest"

import { refreshTotalClaimsAfterClaim } from "./use-refresh-total-claims-after-claim"
import { totalClaimsQueryOptions } from "./use-total-claims"

const snapshot = {
  totalClaims: 6521,
  checkedAt: "2026-09-23T12:00:00Z",
  indexedBlock: 12345,
}
const clients: QueryClient[] = []
function client() {
  const result = new QueryClient()
  clients.push(result)
  return result
}

afterEach(() => {
  clients.forEach((queryClient) => queryClient.clear())
  clients.length = 0
  vi.unstubAllGlobals()
})

describe("total claims query", () => {
  it("deduplicates concurrent reads", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(() => Promise.resolve(Response.json(snapshot)))
    vi.stubGlobal("fetch", fetchMock)
    const queryClient = client()
    const results = await Promise.all([
      queryClient.fetchQuery(totalClaimsQueryOptions),
      queryClient.fetchQuery(totalClaimsQueryOptions),
    ])
    expect(results).toEqual([snapshot, snapshot])
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("keeps the last successful snapshot after a refresh failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 503 }))
    )
    const queryClient = client()
    queryClient.setQueryData(totalClaimsQueryOptions.queryKey, snapshot)
    await expect(
      queryClient.fetchQuery({ ...totalClaimsQueryOptions, retry: false })
    ).rejects.toThrow()
    expect(queryClient.getQueryData(totalClaimsQueryOptions.queryKey)).toEqual(
      snapshot
    )
  })

  it("refetches when a consumer returns, even with cached data", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(() =>
        Promise.resolve(Response.json({ ...snapshot, totalClaims: 6522 }))
      )
    vi.stubGlobal("fetch", fetchMock)
    const queryClient = client()
    queryClient.setQueryData(totalClaimsQueryOptions.queryKey, snapshot)
    const observer = new QueryObserver(queryClient, totalClaimsQueryOptions)
    const unsubscribe = observer.subscribe(() => {})
    await vi.waitFor(() =>
      expect(observer.getCurrentResult().data?.totalClaims).toBe(6522)
    )
    expect(fetchMock).toHaveBeenCalledTimes(1)
    unsubscribe()
    const unsubscribeAgain = observer.subscribe(() => {})
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    unsubscribeAgain()
  })
})

describe("refresh total claims after confirmation", () => {
  const confirmation = {
    action: "claim" as const,
    chainId: 100,
    transactionHash: "0x123" as const,
  }

  it("fetches without a mounted UI and replaces the existing snapshot", async () => {
    const next = { ...snapshot, totalClaims: 6522 }
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(next)))
    const queryClient = client()
    queryClient.setQueryData(totalClaimsQueryOptions.queryKey, snapshot)
    await refreshTotalClaimsAfterClaim(queryClient, confirmation)
    expect(queryClient.getQueryData(totalClaimsQueryOptions.queryKey)).toEqual(
      next
    )
  })

  it("does not invent an increment while the subgraph is catching up", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(snapshot)))
    const queryClient = client()
    queryClient.setQueryData(totalClaimsQueryOptions.queryKey, snapshot)
    await refreshTotalClaimsAfterClaim(queryClient, confirmation)
    expect(queryClient.getQueryData(totalClaimsQueryOptions.queryKey)).toEqual(
      snapshot
    )
  })

  it("ignores entries and claims on other chains", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    const queryClient = client()
    await refreshTotalClaimsAfterClaim(queryClient, {
      ...confirmation,
      action: "enter",
    })
    await refreshTotalClaimsAfterClaim(queryClient, {
      ...confirmation,
      chainId: 8453,
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("does not reject the success callback if refreshing fails", async () => {
    const queryClient = client()
    queryClient.setQueryData(totalClaimsQueryOptions.queryKey, snapshot)
    vi.spyOn(queryClient, "fetchQuery").mockRejectedValue(
      new Error("Unavailable")
    )
    await expect(
      refreshTotalClaimsAfterClaim(queryClient, confirmation)
    ).resolves.toBeUndefined()
    expect(queryClient.getQueryData(totalClaimsQueryOptions.queryKey)).toEqual(
      snapshot
    )
  })
})
