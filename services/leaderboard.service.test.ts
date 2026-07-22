import { afterEach, describe, expect, it, vi } from "vitest"

import { ApiRequestError } from "./api.service"
import { getGlobalLeaderboard, getLoopLeaderboard } from "./leaderboard.service"

function mockFetch(payload: unknown, ok = true, status = ok ? 200 : 500) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    status,
    json: vi.fn().mockResolvedValue(payload),
  })
  vi.stubGlobal("fetch", fetchMock)
  return fetchMock
}

describe("leaderboard service", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("fetches the global leaderboard with sort and filter parameters", async () => {
    const payload = { success: true, entries: [] }
    const fetchMock = mockFetch(payload)

    await expect(
      getGlobalLeaderboard({
        limit: 25,
        offset: 50,
        sortBy: "totalClaims",
        sortOrder: "asc",
        minTotalPoints: 10,
      })
    ).resolves.toBe(payload)

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/leaderboards/global?limit=25&offset=50&sortBy=totalClaims&sortOrder=asc&minTotalPoints=10",
      undefined
    )
  })

  it("fetches a loop leaderboard endpoint", async () => {
    const payload = { success: true, entries: [] }
    const fetchMock = mockFetch(payload)

    await getLoopLeaderboard(100, 42, {
      sortBy: "longestStreak",
      userAddress: "0x123",
    })

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/leaderboards/loops/100/42?sortBy=longestStreak&userAddress=0x123",
      undefined
    )
  })

  it("throws a typed error when the API fails", async () => {
    const payload = { success: false, error: "Database unavailable" }
    mockFetch(payload, false, 503)

    await expect(getGlobalLeaderboard()).rejects.toMatchObject({
      name: "ApiRequestError",
      status: 503,
      payload,
    })
  })
})
