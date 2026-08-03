import { afterEach, describe, expect, it, vi } from "vitest"

import { checkGardensMembership } from "./gardens-membership"

const endpoint = "https://example.com/subgraph"
const communityAddress = "0xE2396fE2169cA026962971D3b2E373bA925B6257"
const userAddress = "0xE9dC34B67006Db0910a9761CB031D4bDE67dCE23"

function mockResponse(payload: unknown, status = 200) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(payload),
  })
  vi.stubGlobal("fetch", fetchMock)
  return fetchMock
}

describe("checkGardensMembership", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("returns true and sends normalized membership filters", async () => {
    const fetchMock = mockResponse({
      data: { memberCommunities: [{ memberAddress: userAddress }] },
    })

    await expect(
      checkGardensMembership({
        subgraphEndpoint: endpoint,
        communityAddress,
        userAddress,
      })
    ).resolves.toBe(true)

    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, request] = fetchMock.mock.calls[0]
    expect(url).toBe(endpoint)
    expect(request).toMatchObject({
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
    const body = JSON.parse(request.body)
    expect(body.variables).toEqual({
      communityAddress: communityAddress.toLowerCase(),
      userAddress: userAddress.toLowerCase(),
    })
    expect(body.query).toContain("registryCommunity: $communityAddress")
    expect(body.query).toContain("memberAddress: $userAddress")
  })

  it.each([{ data: { memberCommunities: [] } }, { data: {} }, {}])(
    "returns false when no membership is present",
    async (payload) => {
      mockResponse(payload)

      await expect(
        checkGardensMembership({
          subgraphEndpoint: endpoint,
          communityAddress,
          userAddress,
        })
      ).resolves.toBe(false)
    }
  )

  it("rejects a missing subgraph endpoint before calling fetch", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    await expect(
      checkGardensMembership({
        subgraphEndpoint: undefined,
        communityAddress,
        userAddress,
      })
    ).rejects.toThrow("Gardens subgraph endpoint missing")
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("rejects an unsuccessful HTTP response", async () => {
    mockResponse({}, 503)

    await expect(
      checkGardensMembership({
        subgraphEndpoint: endpoint,
        communityAddress,
        userAddress,
      })
    ).rejects.toThrow("Gardens subgraph request failed (503)")
  })

  it("rejects a GraphQL error even when HTTP succeeds", async () => {
    mockResponse({ errors: [{ message: "deployment unavailable" }] })

    await expect(
      checkGardensMembership({
        subgraphEndpoint: endpoint,
        communityAddress,
        userAddress,
      })
    ).rejects.toThrow("Gardens subgraph query failed: deployment unavailable")
  })

  it("uses a stable fallback for a GraphQL error without a message", async () => {
    mockResponse({ errors: [{}] })

    await expect(
      checkGardensMembership({
        subgraphEndpoint: endpoint,
        communityAddress,
        userAddress,
      })
    ).rejects.toThrow("Gardens subgraph query failed: Unknown error")
  })
})
