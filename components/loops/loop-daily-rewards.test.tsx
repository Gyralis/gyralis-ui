import React from "react"
import { LoopCardsData } from "@/data/loops-data"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useStandardLoopCardController } from "./standard-loop/use-standard-loop-card-controller"
import { useSuperLoopCardController } from "./super-loop/use-super-loop-card-controller"

const mocks = vi.hoisted(() => ({
  wallet: undefined as string | undefined,
  participationUnavailable: false,
  count: 5,
  flow: 500n as bigint | undefined,
}))

vi.mock("wagmi", () => ({ useAccount: () => ({ address: mocks.wallet }) }))
vi.mock("@/lib/hooks/app/use-refresh-total-claims-after-claim", () => ({
  useRefreshTotalClaimsAfterClaim: () => vi.fn(),
}))
vi.mock("@/lib/hooks/app/use-sync-profile-after-claim", () => ({
  useSyncProfileAfterClaim: () => vi.fn(),
}))
vi.mock("@/lib/hooks/app/use-refresh-latest-activity-after-claim", () => ({
  useRefreshLatestActivityAfterClaim: () => vi.fn(),
}))

function settings() {
  return {
    data: {
      currentPeriod: 10n,
      firstPeriodStart: 0n,
      periodLength: 43_200n,
      percentPerPeriod: 1n,
      token: "0x1111111111111111111111111111111111111111",
    },
    isFetching: false,
    refetch: vi.fn(),
  }
}
function balance() {
  return {
    data: {
      value: 1_000_000_000n,
      decimals: 6,
      symbol: "TKN",
      payoutSymbol: "TKN",
      flowRatePerSecond: mocks.flow,
      flowRateError: false,
    },
    isFetching: false,
    refetch: vi.fn(),
  }
}
function participation() {
  return {
    data: mocks.participationUnavailable
      ? undefined
      : {
          registeredCount: mocks.count,
          periodIndividualPayout: 1_000_000n,
          totalPeriodPayout: 1_000_000n * BigInt(mocks.count),
        },
    error: mocks.participationUnavailable ? new Error("Unavailable") : null,
    isFetching: false,
    refetch: vi.fn(),
  }
}
function claim() {
  return {
    status: "claimable",
    claimableAmount: 1_000_000n,
    isPending: false,
    pendingAction: "claim",
    execute: vi.fn(),
    refetch: vi.fn(),
  }
}

vi.mock("@/lib/hooks/loops/standard/use-standard-loop-settings", () => ({
  useStandardLoopSettings: () => settings(),
}))
vi.mock("@/lib/hooks/loops/super/use-super-loop-settings", () => ({
  useSuperLoopSettings: () => settings(),
}))
vi.mock("@/lib/hooks/loops/standard/use-standard-loop-balance", () => ({
  useStandardLoopBalance: () => balance(),
}))
vi.mock("@/lib/hooks/app/use-loop-token-balance", () => ({
  useLoopTokenBalance: () => balance(),
}))
vi.mock("@/lib/hooks/loops/standard/use-standard-loop-participation", () => ({
  useStandardLoopParticipation: () => participation(),
}))
vi.mock("@/lib/hooks/loops/super/use-super-loop-participation", () => ({
  useSuperLoopParticipation: () => participation(),
}))
vi.mock("@/lib/hooks/loops/standard/use-standard-loop-claim", () => ({
  useStandardLoopClaim: () => claim(),
}))
vi.mock("@/lib/hooks/loops/super/use-super-loop-claim", () => ({
  useSuperLoopClaim: () => claim(),
}))
vi.mock("@/lib/hooks/loops/super/use-super-loop-status", () => ({
  useSuperLoopStatus: () => ({
    data: { currentPeriod: 10n, owed: { total: 0n } },
    errors: {},
    isFetching: false,
    refetch: vi.fn(),
  }),
}))

const standard = LoopCardsData.find((loop) => loop.contractType === "loop")!
const streaming = LoopCardsData.find(
  (loop) => loop.contractType === "superLoop"
)!

function StandardProbe() {
  const controller = useStandardLoopCardController(standard)
  return (
    <output>
      {JSON.stringify({
        daily: controller.dailyRewards,
        claim: controller.action.label,
      })}
    </output>
  )
}
function StreamProbe() {
  const controller = useSuperLoopCardController(streaming)
  return <output>{JSON.stringify(controller.dailyRewards)}</output>
}

beforeEach(() => {
  vi.stubGlobal("React", React)
  mocks.wallet = undefined
  mocks.participationUnavailable = false
  mocks.count = 5
  mocks.flow = 500n
})
afterEach(() => vi.unstubAllGlobals())

describe("Loop total daily rewards", () => {
  it("uses the total standard period payout while keeping the claim amount individual", () => {
    const html = renderToStaticMarkup(<StandardProbe />)
    // Five participants x 1 TKN per half-day = 10 TKN per day.
    expect(html).toContain("10.00")
    expect(html).toContain("Claim 1.000 TKN")
    expect(html).not.toContain("2.00")
  })

  it.each([0, 5, 100])(
    "does not divide the streaming pool by %i participants",
    (count) => {
      mocks.count = count
      expect(renderToStaticMarkup(<StreamProbe />)).toContain("43.20")
    }
  )

  it("can show streaming totals even when participant data is unavailable", () => {
    mocks.participationUnavailable = true
    const html = renderToStaticMarkup(<StreamProbe />)
    expect(html).toContain("43.20")
    expect(html).toContain("ready")
  })

  it("shows the same public streaming total after wallet connection", () => {
    const disconnected = renderToStaticMarkup(<StreamProbe />)
    mocks.wallet = "0x1111111111111111111111111111111111111111"
    expect(renderToStaticMarkup(<StreamProbe />)).toBe(disconnected)
  })

  it("distinguishes a stopped stream from an unknown stream", () => {
    mocks.flow = 0n
    expect(renderToStaticMarkup(<StreamProbe />)).toContain("0.00")
    mocks.flow = undefined
    const html = renderToStaticMarkup(<StreamProbe />)
    expect(html).toContain("loading")
    expect(html).not.toContain("0.00")
  })
})
