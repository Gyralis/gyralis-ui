import { afterEach, describe, expect, it, vi } from "vitest"

import { getSeasonStreaks } from "./get-season-streaks"

const wallet = "0xe9dc34b67006db0910a9761cb031d4bde67dce23"
const season = {
  id: "season-1",
  name: "Season 1",
  loops: [{ chainId: 8453, loopId: 6, multiplier: 1.25 }],
}

afterEach(() => vi.unstubAllGlobals())

describe("season-only streak data", () => {
  it("reads the active Season projection and accepts fractional SP bonuses", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ success: true, season }))
      .mockResolvedValueOnce(
        Response.json({
          success: true,
          season,
          loops: [
            {
              chainId: 8453,
              loopId: 6,
              totalClaims: 3,
              currentStreak: 3,
              longestStreak: 3,
              earnedStreakBonuses: [{ streak: 3, points: 2.5 }],
            },
          ],
        })
      )
    vi.stubGlobal("fetch", fetchMock)
    const result = await getSeasonStreaks(wallet)
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/seasons/current",
      expect.any(Object)
    )
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/seasons/season-1/users/${wallet}`,
      expect.any(Object)
    )
    expect(result.loopStats[0].earnedStreakBonuses[0].points).toBe(2.5)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("does not fetch all-time stats when there is no active Season", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(Response.json({ success: true, season: null }))
    vi.stubGlobal("fetch", fetchMock)
    expect(await getSeasonStreaks(wallet)).toEqual({
      season: null,
      loopStats: [],
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("keeps an unavailable Season distinct from an empty or inactive Season", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 503 }))
    )
    await expect(getSeasonStreaks(wallet)).rejects.toThrow(
      "Unable to load current Season"
    )
  })

  it("does not use all-time GP as a fallback when Season projections need rebuilding", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ success: true, season }))
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
    vi.stubGlobal("fetch", fetchMock)
    await expect(getSeasonStreaks(wallet)).rejects.toThrow(
      "Unable to load Season streaks"
    )
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("rejects a response for a different Season", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(Response.json({ success: true, season }))
        .mockResolvedValueOnce(
          Response.json({
            success: true,
            season: { ...season, id: "old-season" },
            loops: [],
          })
        )
    )
    await expect(getSeasonStreaks(wallet)).rejects.toThrow(
      "Season snapshot mismatch"
    )
  })
})
