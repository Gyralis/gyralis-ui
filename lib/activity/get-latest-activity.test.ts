import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { getLatestActivity } from "./get-latest-activity"

const { multicall } = vi.hoisted(() => ({ multicall: vi.fn() }))
vi.mock("server-only", () => ({}))
vi.mock("@/env.mjs", () => ({
  env: {
    GYRALIS_SUBGRAPH_URL: "https://example.com/gnosis",
    GYRALIS_BASE_SUBGRAPH_URL: "https://example.com/base",
  },
}))
vi.mock("viem", async (importOriginal) => ({
  ...(await importOriginal<typeof import("viem")>()),
  createPublicClient: () => ({ multicall }),
}))

const wallet = "0xe9dc34b67006db0910a9761cb031d4bde67dce23"
const trueLoop = "0xb7902fae80eb57abac621dc68eb30ffff42f76f0"
const rwagmi = "0xe714bc7f58726490a15d2197bcded598223f5319"
function event(
  loop: string,
  period: number,
  amount: string,
  timestamp: number
) {
  return {
    id: `${loop}-${period}`,
    loop: { id: loop },
    periodNumber: String(period),
    payout: amount,
    timestamp: String(timestamp),
    txHash: `0x${"a".repeat(64)}`,
  }
}
let events: ReturnType<typeof event>[]
let failedChains: string[]
let indexingErrors: string[]

beforeEach(() => {
  events = [
    event("3", 11, "1000000000000000000", 100),
    event("3", 10, "2000000000000000000", 99),
    event("4", 10, "3000000000000000000", 90),
    event(trueLoop, 65, "500000000000000000", 110),
    event(trueLoop, 64, "20000000000000000000", 109),
    event(rwagmi, 20, "601034632179558007466", 105),
  ]
  failedChains = []
  indexingErrors = []
  multicall.mockImplementation(
    ({ contracts }: { contracts: { address: string }[] }) =>
      Promise.resolve(
        contracts.map(({ address }) =>
          address.toLowerCase() === trueLoop
            ? 65n
            : address.toLowerCase() === rwagmi
            ? 21n
            : 11n
        )
      )
  )
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string, options: { body: string }) => {
      const chain = url.endsWith("base") ? "base" : "gnosis"
      if (failedChains.includes(chain))
        return Promise.reject(new Error("Offline"))
      const { variables } = JSON.parse(options.body) as {
        variables: {
          windows: {
            account: string
            loop: string
            periodNumber_in: string[]
          }[]
        }
      }
      expect(
        variables.windows.every((window) => window.account === wallet)
      ).toBe(true)
      expect(
        variables.windows.every((window) => window.periodNumber_in.length <= 2)
      ).toBe(true)
      return Response.json({
        data: {
          _meta: { hasIndexingErrors: indexingErrors.includes(chain) },
          claimEvents: events.filter((item) =>
            variables.windows.some(
              (window) =>
                window.loop === item.loop.id &&
                window.periodNumber_in.includes(item.periodNumber)
            )
          ),
        },
      })
    })
  )
})

afterEach(() => {
  vi.clearAllMocks()
  vi.unstubAllGlobals()
})

describe("latest activity periods", () => {
  it("selects current claims per loop, otherwise previous, and sums only the selected payouts", async () => {
    const result = await getLatestActivity(
      wallet.toUpperCase().replace("0X", "0x")
    )
    expect(
      result.items.map((item) => [item.loopName, item.period, item.periodKind])
    ).toEqual([
      ["True Loopers", "65", "current"],
      ["RWAGMI Token Launcher", "20", "previous"],
      ["1Hive Gardens", "11", "current"],
      ["Blockscout Merits", "10", "previous"],
    ])
    expect(result.totals).toEqual(
      expect.arrayContaining([
        { chainId: 100, tokenSymbol: "HNY", amount: "4" },
        { chainId: 8453, tokenSymbol: "USDCx", amount: "0.5" },
        {
          chainId: 8453,
          tokenSymbol: "RWAGMI",
          amount: "601.034632179558007466",
        },
      ])
    )
    expect(result.items[0].transactionUrl).toBe(
      `https://basescan.org/tx/0x${"a".repeat(64)}`
    )
    expect(result.unavailableChains).toEqual([])
  })

  it("never falls back to older periods when both allowed periods have no claims", async () => {
    events = [event("4", 9, "1000000000000000000", 90)]
    const result = await getLatestActivity(wallet)
    expect(result.items).toEqual([])
    expect(result.totals).toEqual([])
    expect(result.unavailableChains).toEqual([])
  })

  it("does not double count repeated events", async () => {
    events.push(events[0])
    const result = await getLatestActivity(wallet)
    expect(result.items).toHaveLength(4)
    expect(
      result.totals.find((total) => total.tokenSymbol === "HNY")?.amount
    ).toBe("4")
  })

  it("reports partial results when one chain is unavailable", async () => {
    failedChains = ["base"]
    const result = await getLatestActivity(wallet)
    expect(result.unavailableChains).toEqual(["Base"])
    expect(result.items).toHaveLength(2)
    expect(result.items.every((item) => item.chainId === 100)).toBe(true)
  })

  it("reports indexing errors as an unavailable chain rather than an empty history", async () => {
    indexingErrors = ["gnosis"]
    const result = await getLatestActivity(wallet)
    expect(result.unavailableChains).toEqual(["Gnosis"])
    expect(result.items.every((item) => item.chainId === 8453)).toBe(true)
  })

  it("fails when both sources are unavailable", async () => {
    failedChains = ["base", "gnosis"]
    await expect(getLatestActivity(wallet)).rejects.toThrow(
      "Activity unavailable"
    )
  })

  it("rejects invalid wallets before making requests", async () => {
    await expect(getLatestActivity("not-an-address")).rejects.toThrow(
      "Invalid wallet address"
    )
    expect(fetch).not.toHaveBeenCalled()
  })
})
