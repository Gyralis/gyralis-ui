import { afterEach, describe, expect, it, vi } from "vitest"

import { GET } from "@/app/api/loops/claims-total/route"

import { getTotalClaims } from "./get-total-claims"

vi.mock("server-only", () => ({}))
vi.mock("@/env.mjs", () => ({
  env: {
    GYRALIS_SUBGRAPH_URL: "https://subgraph.example",
    GYRALIS_SUBGRAPH_CHAIN_ID: 100,
  },
}))

function payload() {
  return {
    data: {
      _meta: { block: { number: 12345 }, hasIndexingErrors: false },
      loops: [
        { id: "3", claimsCount: "6420" },
        { id: "4", claimsCount: "101" },
      ],
    },
  }
}

function mockResponse(body: unknown, status = 200) {
  const fetchMock = vi
    .fn()
    .mockResolvedValue(new Response(JSON.stringify(body), { status }))
  vi.stubGlobal("fetch", fetchMock)
  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe("Gnosis total claims", () => {
  it("sums dashboard loop aggregates and records the successful read time", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-09-23T12:00:00Z"))
    const fetchMock = mockResponse(payload())
    expect(await getTotalClaims()).toEqual({
      totalClaims: 6521,
      indexedBlock: 12345,
      checkedAt: "2026-09-23T12:00:00.000Z",
    })
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe("https://subgraph.example")
    expect(init.cache).toBe("no-store")
    expect(JSON.parse(init.body).variables).toEqual({
      loopIds: ["3", "4"],
      first: 2,
    })
  })

  it("accepts zero counts and totals beyond the milestone", async () => {
    const body = payload()
    body.data.loops[0].claimsCount = "0"
    body.data.loops[1].claimsCount = "12000"
    mockResponse(body)
    expect((await getTotalClaims()).totalClaims).toBe(12000)
  })

  it.each(["-1", "1.5", "", "NaN", "9007199254740992"])(
    "rejects invalid or unsafe counts: %s",
    async (count) => {
      const body = payload()
      body.data.loops[0].claimsCount = count
      mockResponse(body)
      await expect(getTotalClaims()).rejects.toThrow()
    }
  )

  it.each(["missing", "duplicate", "unexpected", "indexing"])(
    "rejects %s scope/data",
    async (scenario) => {
      const body = payload()
      if (scenario === "missing") body.data.loops.pop()
      if (scenario === "duplicate") body.data.loops[1].id = "3"
      if (scenario === "unexpected") body.data.loops[1].id = "99"
      if (scenario === "indexing") body.data._meta.hasIndexingErrors = true
      mockResponse(body)
      await expect(getTotalClaims()).rejects.toThrow()
    }
  )

  it.each([
    { body: {}, status: 200 },
    {
      body: { ...payload(), errors: [{ message: "upstream private details" }] },
      status: 200,
    },
    { body: {}, status: 429 },
  ])(
    "returns an uncached 503 without leaking upstream details",
    async ({ body, status }) => {
      mockResponse(body, status)
      const response = await GET()
      expect(response.status).toBe(503)
      expect(response.headers.get("Cache-Control")).toBe("no-store")
      expect(await response.json()).toEqual({
        error: "Claim totals are temporarily unavailable",
      })
    }
  )

  it("returns an uncached snapshot from the endpoint", async () => {
    mockResponse(payload())
    const response = await GET()
    expect(response.status).toBe(200)
    expect(response.headers.get("Cache-Control")).toBe("no-store")
    expect(await response.json()).toMatchObject({
      totalClaims: 6521,
      indexedBlock: 12345,
    })
  })

  it("handles network failures", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("connection failed"))
    )
    expect((await GET()).status).toBe(503)
  })
})
