import { describe, expect, it, vi } from "vitest"

import { getLoopRegistrationSource } from "./registration-sources"

vi.mock("server-only", () => ({}))
vi.mock("@/env.mjs", () => ({
  env: {
    BASE_RPC_URL: "https://base-rpc.example",
    GNOSIS_RPC_URL: "https://gnosis-rpc.example",
    GYRALIS_BASE_SUBGRAPH_URL: "https://base-subgraph.example",
    GYRALIS_SUBGRAPH_URL: "https://gnosis-subgraph.example",
  },
}))

describe("getLoopRegistrationSource", () => {
  it("routes the indexed Markee loop to the Base subgraph", () => {
    const source = getLoopRegistrationSource(
      8453,
      "0x213310e1dbD6991cD488AB247c81faD82CD88E7A"
    )

    expect(source).toMatchObject({
      chainId: 8453,
      rpcUrl: "https://base-rpc.example",
      subgraphId: "0x213310e1dbd6991cd488ab247c81fad82cd88e7a",
      subgraphUrl: "https://base-subgraph.example",
    })
  })

  it("keeps Gnosis loops on the Gnosis subgraph", () => {
    const source = getLoopRegistrationSource(
      100,
      "0x8995641fb3E452bC1359E79A738a6DE556015696"
    )

    expect(source).toMatchObject({
      chainId: 100,
      rpcUrl: "https://gnosis-rpc.example",
      subgraphId: "3",
      subgraphUrl: "https://gnosis-subgraph.example",
    })
  })

  it("does not claim subgraph coverage for an unindexed Base loop", () => {
    expect(
      getLoopRegistrationSource(
        8453,
        "0xb7902fAE80EB57aBac621dc68eb30FFff42F76F0"
      )
    ).toBeUndefined()
  })
})
