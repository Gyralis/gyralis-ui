import { afterEach, describe, expect, it, vi } from "vitest"

import {
  getCurrentUser,
  getUserInfo,
  getUserProfile,
  getUserScoring,
} from "./user.service"

function mockFetch(payloads: unknown[]) {
  const fetchMock = vi.fn()
  for (const payload of payloads) {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(payload),
    })
  }
  vi.stubGlobal("fetch", fetchMock)
  return fetchMock
}

describe("user service", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("fetches the current app user", async () => {
    const payload = { isLoggedIn: false }
    const fetchMock = mockFetch([payload])

    await expect(getCurrentUser()).resolves.toBe(payload)
    expect(fetchMock).toHaveBeenCalledWith("/api/app/user", undefined)
  })

  it("fetches a user's profile", async () => {
    const payload = { success: true, profile: null, globalStats: null }
    const fetchMock = mockFetch([payload])

    await expect(getUserProfile("0xabc")).resolves.toBe(payload)
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/users/0xabc/profile",
      undefined
    )
  })

  it("fetches a user's scoring data", async () => {
    const payload = { success: true, globalStats: null, loopStats: [] }
    const fetchMock = mockFetch([payload])

    await expect(getUserScoring("0xabc")).resolves.toBe(payload)
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/users/0xabc/scoring",
      undefined
    )
  })

  it("fetches combined user information", async () => {
    const profile = { success: true, profile: null, globalStats: null }
    const scoring = { success: true, globalStats: null, loopStats: [] }
    const fetchMock = mockFetch([profile, scoring])

    await expect(getUserInfo("0xabc")).resolves.toEqual({ profile, scoring })
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/users/0xabc/profile",
      undefined
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/users/0xabc/scoring",
      undefined
    )
  })
})
