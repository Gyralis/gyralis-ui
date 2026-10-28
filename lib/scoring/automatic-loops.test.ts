import { afterEach, describe, expect, it, vi } from "vitest"

import { computeLoopStatsFromClaims } from "./rules"
import {
  BASE_RWAGMI_SUBGRAPH_LOOP_ID,
  FACTORY_SCORING_ID_OFFSET,
  fetchAllClaimEventsForUserLoop,
  fetchClaimEventsFromSubgraph,
  getScoringSubgraphSource,
  parseSubgraphLoopId,
  resolveContractScoringLoopId,
} from "./subgraph-client"

vi.mock("@/env.mjs", () => ({
  env: {
    GYRALIS_SUBGRAPH_CHAIN_ID: 100,
    GYRALIS_SUBGRAPH_URL: "https://example.com/gnosis",
    GYRALIS_BASE_SUBGRAPH_URL: "https://example.com/base",
  },
}))

const source = getScoringSubgraphSource(8453)
const address = "0x000000000000000000000000000000000000abcd"
const user = "0x000000000000000000000000000000000000000a"
function event(period: number, loop = address, factoryLoopId = "29") {
  return {
    id: `event-${period}`,
    periodNumber: String(period),
    payout: "1",
    blockNumber: String(period),
    timestamp: "1",
    txHash: "0x123",
    account: { id: user },
    loop: { id: loop, factoryLoopId },
  }
}
function response(claimEvents: ReturnType<typeof event>[]) {
  return new Response(JSON.stringify({ data: { claimEvents } }))
}
afterEach(() => vi.restoreAllMocks())

describe("automatic factory scoring", () => {
  it("imports a newly created loop without a catalog entry or allowlist change", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(response([event(1)]))
    const events = await fetchClaimEventsFromSubgraph({
      source,
      first: 100,
      fromBlock: 0,
    })
    expect(events[0].loopId).toBe(FACTORY_SCORING_ID_OFFSET + 29)
    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body))
    expect(body.query).not.toContain("loop_in")
  })

  it("keeps factory IDs distinct from legacy product IDs", () => {
    for (const id of [0, 1, 6, 7, 29]) {
      expect(parseSubgraphLoopId(source, address, String(id))).toBe(
        FACTORY_SCORING_ID_OFFSET + id
      )
    }
    expect(
      parseSubgraphLoopId(source, BASE_RWAGMI_SUBGRAPH_LOOP_ID, "27")
    ).toBe(7)
  })

  it("fails instead of skipping malformed factory identities", () => {
    for (const id of [null, undefined, "", "-1", "1.5", "999999999999999999"]) {
      expect(() => parseSubgraphLoopId(source, address, id)).toThrow()
    }
  })

  it("retrieves paginated history by factory identity for an uncatalogued loop", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(response([event(1), event(2)]))
      .mockResolvedValueOnce(response([event(3)]))
    const events = await fetchAllClaimEventsForUserLoop({
      source,
      userAddress: user,
      loopId: FACTORY_SCORING_ID_OFFSET + 29,
      batchSize: 2,
    })
    expect(events).toHaveLength(3)
    for (const call of fetchMock.mock.calls) {
      const body = JSON.parse(String(call[1]?.body))
      expect(body.variables.factoryLoopId).toBe("29")
      expect(body.query).toContain("loop_: { factoryLoopId: $factoryLoopId }")
      expect(body.query).not.toContain("loop: $loopId")
    }
    expect(
      JSON.parse(String(fetchMock.mock.calls[1][1]?.body)).variables
        .afterEventId
    ).toBe("event-2")
  })

  it("rebuilds the reported RWAGMI streak from every indexed period", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        response(
          Array.from({ length: 11 }, (_, i) =>
            event(i + 4, BASE_RWAGMI_SUBGRAPH_LOOP_ID, "27")
          )
        )
      )
    const events = await fetchAllClaimEventsForUserLoop({
      source,
      userAddress: user,
      loopId: 7,
      batchSize: 100,
    })
    expect(
      JSON.parse(String(fetchMock.mock.calls[0][1]?.body)).variables.loopId
    ).toBe(BASE_RWAGMI_SUBGRAPH_LOOP_ID)
    const stats = computeLoopStatsFromClaims(events, {
      claimPoints: 1,
      streakBonuses: [],
    })
    expect(stats).toMatchObject({
      loopId: 7,
      totalClaims: 11,
      currentStreak: 11,
      lastClaimedPeriod: 14,
    })
  })

  it("resolves a new receipt by its contract, regardless of a UI-assigned id", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: { loop: { id: address, factoryLoopId: "29" } },
        })
      )
    )
    expect(await resolveContractScoringLoopId(source, address, 8)).toBe(
      FACTORY_SCORING_ID_OFFSET + 29
    )
  })

  it("does not create a partial projection before a new loop is indexed", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ data: { loop: null } }))
    )
    await expect(
      resolveContractScoringLoopId(source, address, 8)
    ).rejects.toThrow("not indexed yet")
  })

  it("preserves numeric Gnosis queries without Base-only schema fields", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(response([event(1, "4")]))
    const events = await fetchClaimEventsFromSubgraph({
      source: getScoringSubgraphSource(100),
      first: 100,
    })
    expect(events[0].loopId).toBe(4)
    expect(
      JSON.parse(String(fetchMock.mock.calls[0][1]?.body)).query
    ).not.toContain("factoryLoopId")
  })
})
