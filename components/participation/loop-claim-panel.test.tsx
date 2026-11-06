import React from "react"
import { LoopCardsData } from "@/data/loops-data"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { LoopActionViewModel } from "@/components/loops/sections/loop-section-types"

import {
  claimCountdown,
  ClaimedLoopAction,
  ClaimPanelView,
  LoopClaimPanel,
  LoopCountdownAction,
} from "./loop-claim-panel"

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
  RwagmiTokenEligibility: ({ children }: { children?: React.ReactNode }) => (
    <>{children}</>
  ),
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
    ["claiming", "Confirming claim...", true, true],
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

  it("replaces a confirmed claim action with a non-clickable status without repeating the amount", () => {
    const html = renderToStaticMarkup(
      <ClaimPanelView
        loop={standardLoop}
        {...controller}
        action={{ ...action, status: "claimed", label: "Claimed 0.01 HNY" }}
      />
    )
    expect(html).toContain("Claim confirmed.")
    expect(html).toContain(">Claimed<")
    expect(html).not.toContain("0.01 HNY")
    expect(html.split('class="p-loop-claim-action"')[1]).not.toContain(
      "<button"
    )
    expect(html).not.toContain("p-loop-claim-timing")
  })

  it("keeps claim-ready actions available instead of displaying a countdown", () => {
    const html = renderToStaticMarkup(
      <ClaimPanelView
        loop={standardLoop}
        {...controller}
        period={{
          status: "ready",
          data: {
            nextPeriodStart: 2000000000n,
            timerTitle: "Claim period ends in",
          },
        }}
      />
    )
    expect(html).toContain("Claim 0.01 HNY")
    expect(html).not.toContain("p-loop-claim-complete")
  })

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

describe("claimed Loop countdown", () => {
  it("embeds registered countdowns in the same action surface as claimed countdowns", () => {
    const html = renderToStaticMarkup(
      <LoopCountdownAction timing="06:24:18" label="Claim opens in" />
    )
    expect(html).toContain("p-loop-claim-waiting")
    expect(html).not.toContain("You’re in the Loop")
    expect(html).toContain("Claim in:")
    expect(html).not.toContain("Claim opens in")
    expect(html).toContain('role="timer" aria-live="off">06:24:18')
    expect(html).not.toContain("Claim confirmed")
    expect(html).not.toContain("<button")
  })

  it("keeps the registered state non-clickable even while timing loads", () => {
    const html = renderToStaticMarkup(
      <ClaimPanelView
        loop={standardLoop}
        {...controller}
        action={{
          ...action,
          status: "entered",
          label: "Registered",
          disabled: true,
        }}
      />
    )
    expect(html).toContain("Checking time…")
    expect(html).toContain("p-loop-claim-waiting")
    expect(html).not.toContain("p-loop-claim-timing")
    expect(html).not.toContain("<button")
  })

  it("briefly shows confirmation before the countdown", () => {
    const html = renderToStaticMarkup(
      <ClaimedLoopAction timing="06:24:18" justClaimed />
    )
    expect(html).toContain(">Claimed<")
    expect(html).not.toContain("06:24:18")
  })

  it("shows a quiet non-clickable timer in the action area", () => {
    const html = renderToStaticMarkup(
      <ClaimedLoopAction timing="06:24:18" justClaimed={false} />
    )
    expect(html).toContain("Next claim in:")
    expect(html).toContain('role="timer" aria-live="off">06:24:18')
    expect(html).not.toContain("<button")
  })

  it("does not call a streaming accumulation boundary a claim opening", () => {
    const html = renderToStaticMarkup(
      <ClaimedLoopAction timing="06:24:18" justClaimed={false} nextPeriod />
    )
    expect(html).toContain("Next period in:")
    expect(html).not.toContain("Next claim in")
  })

  it("waits for authoritative status refresh at the boundary", () => {
    const html = renderToStaticMarkup(
      <ClaimedLoopAction timing="00:00:00" justClaimed={false} />
    )
    expect(html).toContain("Updating Loop…")
    expect(html).not.toContain("Next claim in")
    expect(html).not.toContain("<button")
  })

  it("counts down to the actual configured boundary, including a non-midnight reset", () => {
    const now = Date.parse("2026-11-04T10:00:00Z")
    const boundary = BigInt(Date.parse("2026-11-04T16:24:18Z") / 1000)
    expect(claimCountdown(boundary, now)).toBe("06:24:18")
    expect(claimCountdown(boundary, now + 1000)).toBe("06:24:17")
    expect(claimCountdown(boundary, Number(boundary) * 1000)).toBe("00:00:00")
    expect(claimCountdown(boundary, Number(boundary) * 1000 + 1000)).toBe(
      "00:00:00"
    )
    expect(claimCountdown(undefined, now)).toBeUndefined()
    expect(claimCountdown(boundary, 0)).toBeUndefined()
  })
})
