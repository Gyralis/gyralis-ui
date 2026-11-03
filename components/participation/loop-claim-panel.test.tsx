import React from "react"
import { LoopCardsData } from "@/data/loops-data"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { LoopActionViewModel } from "@/components/loops/sections/loop-section-types"

import { ClaimPanelView, LoopClaimPanel } from "./loop-claim-panel"

const mocks = vi.hoisted(() => ({
  isConnected: true,
  openConnectModal: vi.fn(),
  standard: vi.fn(),
  streaming: vi.fn(),
}))
vi.mock("wagmi", () => ({
  useAccount: () => ({ isConnected: mocks.isConnected }),
}))
vi.mock("@rainbow-me/rainbowkit", () => ({
  useConnectModal: () => ({ openConnectModal: mocks.openConnectModal }),
}))
vi.mock(
  "@/components/loops/standard-loop/use-standard-loop-card-controller",
  () => ({ useStandardLoopCardController: mocks.standard })
)
vi.mock("@/components/loops/super-loop/use-super-loop-card-controller", () => ({
  useSuperLoopCardController: mocks.streaming,
}))
vi.mock("@/components/loops/rwagmi-token-eligibility", () => ({
  RwagmiTokenEligibility: () => <button>Add token</button>,
}))
vi.mock("@/components/loops/sections/loop-claim-action", () => ({
  LoopClaimAction: ({ model }: { model: LoopActionViewModel }) => (
    <button disabled={model.disabled} aria-busy={model.isPending}>
      {model.label}
    </button>
  ),
}))

const action: LoopActionViewModel = {
  status: "claimable",
  label: "Claim 0.01 HNY",
  disabled: false,
  isPending: false,
  execute: vi.fn(),
}
const controller = {
  action,
  dailyRewards: {
    status: "ready" as const,
    data: { value: "0.03", symbol: "HNY" },
  },
  loopers: { status: "ready" as const, data: { registeredCount: 75 } },
  period: { status: "loading" as const },
  refresh: vi.fn(),
}
const standardLoop = LoopCardsData.find(
  (loop) => !loop.super && loop.contractType !== "superLoop"
)!
const streamingLoop = LoopCardsData.find(
  (loop) => loop.super || loop.contractType === "superLoop"
)!

beforeEach(() => {
  vi.stubGlobal("React", React)
  mocks.isConnected = true
  mocks.standard.mockReturnValue(controller)
  mocks.streaming.mockReturnValue(controller)
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe("live Loop claim panel", () => {
  it("identifies the daily estimate as the Loop total and the claim as individual", () => {
    const html = renderToStaticMarkup(
      <ClaimPanelView loop={standardLoop} {...controller} />
    )
    expect(html).toContain("0.03")
    expect(html).toContain("Claim 0.01 HNY")
    expect(html).toContain("Loopers")
    expect(html).toContain("75")
    expect(html).toContain(
      "Estimated total rewards for this Loop over 24 hours"
    )
    expect(html).toContain("your individual claimable payout")
    expect(html).not.toContain("example")
  })

  it("offers an enabled wallet connection action even when contract state is unavailable", () => {
    mocks.isConnected = false
    const html = renderToStaticMarkup(
      <ClaimPanelView
        loop={standardLoop}
        {...controller}
        action={{ ...action, status: "unavailable", disabled: true }}
      />
    )
    expect(html).toContain("Connect wallet")
    expect(html).not.toContain("disabled")
    expect(html).not.toContain("Claim 0.01 HNY")
  })

  it("does not show a fabricated zero when participation or rewards cannot be loaded", () => {
    const html = renderToStaticMarkup(
      <ClaimPanelView
        loop={standardLoop}
        {...controller}
        dailyRewards={{ status: "loading" }}
        loopers={{
          status: "error",
          message: "RPC unavailable",
          retry: vi.fn(),
        }}
      />
    )
    expect(html).toContain("Retry Loopers")
    expect(html).not.toContain("75")
    expect(html).not.toContain("0.03")
    expect(html).not.toContain(">0<")
  })

  it.each([
    ["enter", "Register", false, false],
    ["entered", "Registered", true, false],
    ["claiming", "Confirming claim...", true, true],
    ["claimed", "Claimed 0.01 HNY", true, false],
  ] as const)(
    "preserves %s action availability",
    (status, label, disabled, isPending) => {
      const html = renderToStaticMarkup(
        <ClaimPanelView
          loop={standardLoop}
          {...controller}
          action={{ ...action, status, label, disabled, isPending }}
        />
      )
      expect(html).toContain(label)
      expect(html.includes("disabled")).toBe(disabled)
      expect(html).toContain(`aria-busy="${String(isPending)}"`)
    }
  )

  it("uses the contract-specific controller for each card", () => {
    renderToStaticMarkup(<LoopClaimPanel loop={standardLoop} />)
    expect(mocks.standard).toHaveBeenCalledWith(standardLoop)
    expect(mocks.streaming).not.toHaveBeenCalled()
    vi.clearAllMocks()
    renderToStaticMarkup(<LoopClaimPanel loop={streamingLoop} />)
    expect(mocks.streaming).toHaveBeenCalledWith(streamingLoop)
    expect(mocks.standard).not.toHaveBeenCalled()
  })
})
