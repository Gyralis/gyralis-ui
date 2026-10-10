import { gnosis } from "viem/chains"
import { afterEach, describe, expect, it, vi } from "vitest"

import {
  estimateRegistrationPeriodBlockRange,
  getRegistrationStatus,
  queryRegistrationSubgraph,
  splitInclusiveBlockRange,
  type RegistrationStatusInput,
} from "./get-registration-status"
import type { LoopRegistrationSource } from "./registration-sources"

vi.mock("server-only", () => ({}))
vi.mock("@/env.mjs", () => ({
  env: {
    GNOSIS_RPC_URL: "https://rpc.example",
    GYRALIS_BASE_SUBGRAPH_URL: "https://base-subgraph.example",
    GYRALIS_SUBGRAPH_URL: "https://subgraph.example",
  },
}))

const input: RegistrationStatusInput = {
  chainId: 100,
  loopAddress: "0x8995641fb3E452bC1359E79A738a6DE556015696",
  periodNumber: 158,
  userAddress: "0x8a0c098e896fa309828a35ce714403d23cbbcf3a",
}

const source: LoopRegistrationSource = {
  address: input.loopAddress,
  chain: gnosis,
  chainId: 100,
  contractType: "loop",
  registerEventTypes: ["legacy", "token"],
  rpcUrl: "https://rpc.example",
  subgraphId: "3",
  subgraphUrl: "https://subgraph.example",
}

const now = new Date("2026-10-10T04:00:00.000Z")

afterEach(() => {
  vi.restoreAllMocks()
})

describe("getRegistrationStatus", () => {
  it("reuses an immutable positive cache entry", async () => {
    const querySubgraph = vi.fn()
    const queryRpc = vi.fn()

    const result = await getRegistrationStatus(input, {
      getCache: vi.fn().mockResolvedValue({
        checkedAt: new Date("2026-01-01T00:00:00.000Z"),
        indexedBlock: 48_679_218,
        registered: true,
        source: "subgraph",
      }),
      getSource: () => source,
      now: () => now,
      queryRpc,
      querySubgraph,
      upsertCache: vi.fn(),
    })

    expect(result).toMatchObject({
      cached: true,
      originSource: "subgraph",
      registered: true,
      source: "cache",
    })
    expect(querySubgraph).not.toHaveBeenCalled()
    expect(queryRpc).not.toHaveBeenCalled()
  })

  it("refreshes a negative entry through the subgraph", async () => {
    const upsertCache = vi.fn()

    const result = await getRegistrationStatus(input, {
      getCache: vi.fn().mockResolvedValue({
        checkedAt: new Date(now.getTime() - 1_000),
        indexedBlock: 48_679_000,
        registered: false,
        source: "subgraph",
      }),
      getSource: () => source,
      now: () => now,
      queryRpc: vi.fn(),
      querySubgraph: vi.fn().mockResolvedValue({
        indexedBlock: 48_679_537,
        registerEventId: "event-1",
        registered: true,
        source: "subgraph",
      }),
      upsertCache,
    })

    expect(result).toMatchObject({
      cached: false,
      registered: true,
      source: "subgraph",
    })
    expect(upsertCache).toHaveBeenCalledWith(
      expect.objectContaining({
        registerEventId: "event-1",
        registered: true,
        source: "subgraph",
      })
    )
  })

  it("falls back to RPC without persisting a mutable negative result", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined)
    const queryRpc = vi.fn().mockResolvedValue({
      indexedBlock: 48_679_600,
      registered: false,
      source: "rpc",
    })
    const upsertCache = vi.fn()

    const result = await getRegistrationStatus(input, {
      getCache: vi.fn().mockResolvedValue(null),
      getSource: () => source,
      now: () => now,
      queryRpc,
      querySubgraph: vi.fn().mockRejectedValue(new Error("offline")),
      upsertCache,
    })

    expect(queryRpc).toHaveBeenCalledWith(source, input)
    expect(result).toMatchObject({
      cached: false,
      originSource: "rpc",
      registered: false,
      source: "rpc",
    })
    expect(upsertCache).not.toHaveBeenCalled()
  })
})

describe("queryRegistrationSubgraph", () => {
  it("queries by exact loop, wallet, and period", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            _meta: {
              block: { number: 48_679_537 },
              hasIndexingErrors: false,
            },
            registerEvents: [{ id: "event-1", blockNumber: "48679218" }],
          },
        }),
        { status: 200 }
      )
    )

    const result = await queryRegistrationSubgraph(source, input)

    expect(result).toEqual({
      indexedBlock: 48_679_537,
      registerEventId: "event-1",
      registered: true,
      source: "subgraph",
    })
    const request = fetchMock.mock.calls[0]?.[1]
    const body = JSON.parse(String(request?.body))
    expect(body.variables).toEqual({
      loopId: "3",
      periodNumber: "158",
      userAddress: input.userAddress,
    })
  })
})

describe("estimateRegistrationPeriodBlockRange", () => {
  it("targets the preceding Base period with a bounded padded range", () => {
    expect(
      estimateRegistrationPeriodBlockRange({
        averageBlockTimeSeconds: 2n,
        firstPeriodStart: 1_785_884_191n,
        latestBlockNumber: 52_409_202n,
        latestBlockTimestamp: 1_791_607_751n,
        periodLength: 43_200n,
        periodNumber: 76,
      })
    ).toEqual({
      fromBlock: 51_167_122n,
      toBlock: 51_189_322n,
    })
  })
})

describe("splitInclusiveBlockRange", () => {
  it("keeps Base log requests within a 10,000-block provider window", () => {
    expect(splitInclusiveBlockRange(100n, 22_300n, 9_999n)).toEqual([
      { fromBlock: 100n, toBlock: 10_099n },
      { fromBlock: 10_100n, toBlock: 20_099n },
      { fromBlock: 20_100n, toBlock: 22_300n },
    ])
  })
})
