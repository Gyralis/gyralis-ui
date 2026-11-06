import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { getLatestActivity } from "./get-latest-activity"

const { multicall } = vi.hoisted(() => ({ multicall: vi.fn() }))
vi.mock("server-only", () => ({}))
vi.mock("next/cache", () => ({ unstable_cache: (fn: unknown) => fn }))
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
    blockNumber: "100",
  }
}
let events: ReturnType<typeof event>[]
let registrations: Omit<ReturnType<typeof event>, "payout">[]
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
  registrations = []
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
          registrationWindows: {
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
        variables.windows.every((window) => window.periodNumber_in.length <= 3)
      ).toBe(true)
      return Response.json({
        data: {
          _meta: {
            block: { number: 100 },
            hasIndexingErrors: indexingErrors.includes(chain),
          },
          claimEvents: events.filter((item) =>
            variables.windows.some(
              (window) =>
                window.loop === item.loop.id &&
                window.periodNumber_in.includes(item.periodNumber)
            )
          ),
          registerEvents: registrations.filter((item) =>
            variables.registrationWindows.some(
              (window) =>
                window.account === wallet &&
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
  it("shows current and next registrations beside claims without counting them as rewards", async () => {
    events = [event("3", 11, "1000000000000000000", 100)]
    registrations = [11, 12, 10].map((period) => {
      const { payout: _payout, ...item } = event(
        "3",
        period,
        "0",
        period === 12 ? 102 : 99
      )
      return { ...item, id: `registration-${period}` }
    })
    const result = await getLatestActivity(wallet)
    expect(
      result.items.map((item) => [
        item.kind ?? "claim",
        item.period,
        item.periodKind,
      ])
    ).toEqual([
      ["registration", "12", "next"],
      ["claim", "11", "current"],
      ["registration", "11", "current"],
    ])
    expect(
      result.items
        .filter((item) => item.kind === "registration")
        .every((item) => item.amount == null)
    ).toBe(true)
    expect(result.totals).toEqual([
      { chainId: 100, tokenSymbol: "HNY", amount: "1" },
    ])
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it("can acknowledge a receipt in a new period while the shared schedule is still cached", async () => {
    events = [event("3", 12, "1000000000000000000", 200)]
    const result = await getLatestActivity(wallet, [
      {
        chainId: 100,
        loopAddress: "0x8995641fb3e452bc1359e79a738a6de556015696",
        period: "12",
      },
    ])
    expect(result.items).toHaveLength(1)
    expect(result.items[0]).toMatchObject({
      period: "12",
      periodKind: "current",
    })
    expect(fetch).toHaveBeenCalledTimes(1)
  })
  it("queries only the affected chain and Loop for scoped reconciliation", async () => {
    const result = await getLatestActivity(wallet, [
      { chainId: 8453, loopAddress: rwagmi },
    ])
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledWith(
      "https://example.com/base",
      expect.any(Object)
    )
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string)
    expect(body.variables.windows).toEqual([
      { account: wallet, loop: rwagmi, periodNumber_in: ["21", "20"] },
    ])
    expect(result.items).toHaveLength(1)
    expect(result.coverage).toEqual([
      {
        chainId: 8453,
        loopAddress: rwagmi,
        currentPeriod: "21",
        indexedBlock: 100,
      },
    ])
    // One public schedule batch; no second-chain reads.
    expect(multicall).toHaveBeenCalledTimes(1)
  })

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
