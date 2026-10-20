import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { getDashboardPageData } from "./get-dashboard-data"
import type { DashboardLoopKey } from "./types"

const { readContract } = vi.hoisted(() => ({ readContract: vi.fn() }))

vi.mock("server-only", () => ({}))
vi.mock("next/cache", () => ({ unstable_cache: (fn: unknown) => fn }))
vi.mock("@/env.mjs", () => ({
  env: { GYRALIS_BASE_SUBGRAPH_URL: "https://example.com/base" },
}))
vi.mock("viem", async (importOriginal) => ({
  ...(await importOriginal<typeof import("viem")>()),
  createPublicClient: () => ({ readContract }),
}))

const payout = "25804754440271919027"

describe.each([
  {
    loopKey: "true-loopers" as DashboardLoopKey,
    title: "True Loopers",
    loopId: "0xb7902fae80eb57abac621dc68eb30ffff42f76f0",
    token: "0xD04383398dD2426297da660F9CCA3d439AF9ce1b",
    symbol: "USDCx",
    currentPeriodFunction: "getStreamingCurrentPeriod",
    detailsFunction: "getStreamingLoopDetails",
  },
  {
    loopKey: "rwagmi" as DashboardLoopKey,
    title: "RWAGMI Token Launcher",
    loopId: "0xe714bc7f58726490a15d2197bcded598223f5319",
    token: "0xb200000000000000000000Bf0548AB2ebD00bA5e",
    symbol: "RWAGMI",
    currentPeriodFunction: "getCurrentPeriod",
    detailsFunction: "getLoopDetails",
  },
])(
  "$title dashboard data",
  ({
    loopKey,
    title,
    loopId,
    token,
    symbol,
    currentPeriodFunction,
    detailsFunction,
  }) => {
    beforeEach(() => {
      readContract.mockImplementation(
        ({ functionName }: { functionName: string }) => {
          switch (functionName) {
            case currentPeriodFunction:
              return Promise.resolve(2n)
            case detailsFunction:
              return Promise.resolve([token, 86400n, 0n, 1790000000n])
            case "symbol":
              return Promise.resolve(symbol)
            case "decimals":
              return Promise.resolve(18)
            default:
              throw new Error(`Unexpected function ${functionName}`)
          }
        }
      )
      vi.stubGlobal(
        "fetch",
        vi.fn((url: string, options: { body: string }) => {
          expect(url).toBe("https://example.com/base")
          const { query, variables } = JSON.parse(options.body) as {
            query: string
            variables: { loopIds?: string[]; loopId?: string }
          }
          if (query.includes("query Dashboard")) {
            expect(variables.loopIds).toEqual([loopId])
            return Response.json({
              data: {
                _meta: {
                  block: { number: 52569496 },
                  hasIndexingErrors: false,
                },
                loops: [
                  {
                    id: loopId,
                    token,
                    registersCount: "3",
                    claimsCount: "1",
                    totalPayout: payout,
                    periods: [
                      {
                        periodNumber: "2",
                        totalRegisteredUsers: "3",
                        totalClaims: "1",
                        totalPayout: payout,
                      },
                    ],
                  },
                ],
              },
            })
          }
          expect(variables.loopId).toBe(loopId)
          const entity = query.includes("registerEvents")
            ? "registerEvents"
            : "claimEvents"
          const accounts =
            entity === "registerEvents"
              ? ["0xaaa", "0xbbb", "0xaaa"]
              : ["0xaaa"]
          return Response.json({
            data: {
              [entity]: accounts.map((account, index) => ({
                id: `${index}`,
                periodNumber: "2",
                timestamp: "1790200000",
                account: { id: account },
              })),
            },
          })
        })
      )
    })

    afterEach(() => {
      vi.restoreAllMocks()
      vi.unstubAllGlobals()
      vi.clearAllMocks()
    })

    it.each([false, true])(
      "includes actual claims and formats 18-decimal payouts (metadata unavailable: %s)",
      async (metadataUnavailable) => {
        if (metadataUnavailable) {
          const implementation =
            readContract.getMockImplementation()! as (args: {
              functionName: string
            }) => Promise<unknown>
          readContract.mockImplementation((args: { functionName: string }) => {
            if (["symbol", "decimals"].includes(args.functionName)) {
              return Promise.reject(new Error("RPC metadata unavailable"))
            }
            return implementation(args)
          })
          vi.spyOn(console, "warn").mockImplementation(() => {})
        }

        const data = await getDashboardPageData({ loopKeys: [loopKey] })

        expect(data.loopSummaries[0]).toMatchObject({
          loopKey,
          meta: { title, tokenSymbol: symbol },
          totalRegistrationsCount: 3,
          totalClaimsCount: 1,
          uniqueUserCount: 2,
          uniqueClaimUserCount: 1,
          totalClaimedAmount: "25.804754440271919027",
        })
        expect(data.overview.totalClaims).toBe(1)
        expect(data.tokenSummaries[0]).toMatchObject({
          tokenAddress: token,
          tokenSymbol: symbol,
          tokenDecimals: 18,
          totalClaimedAmount: "25.804754440271919027",
        })
        expect(data.tables.periodSummary[0]).toMatchObject({
          loopKey,
          tokenSymbol: symbol,
          claims: 1,
        })
        expect(data.charts.distributionByPeriod).toEqual([])
        expect(readContract).toHaveBeenCalledWith(
          expect.objectContaining({ address: token, functionName: "decimals" })
        )
        expect(readContract).toHaveBeenCalledWith(
          expect.objectContaining({ functionName: currentPeriodFunction })
        )
        expect(readContract).toHaveBeenCalledWith(
          expect.objectContaining({ functionName: detailsFunction })
        )
      }
    )
  }
)
