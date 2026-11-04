import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { TooltipProvider } from "@/components/ui/tooltip"

import { LoopClaimAction } from "./loop-claim-action"
import type { LoopActionViewModel } from "./loop-section-types"

const mocks = vi.hoisted(() => ({ reducedMotion: false, mode: "subtle" }))
vi.mock("wagmi", () => ({
  useAccount: () => ({ isConnected: true }),
  useChainId: () => 8453,
  useChains: () => [{ id: 8453, name: "Base" }],
  useSwitchChain: () => ({ switchChain: vi.fn() }),
}))
vi.mock("@/components/participation/card-motion-preview", () => ({
  useCardMotion: () => mocks,
}))

const model: LoopActionViewModel = {
  status: "claiming",
  label: "Claim 0.123 USDC",
  disabled: true,
  isPending: true,
  execute: vi.fn(),
}
function render(override: Partial<LoopActionViewModel> = {}) {
  return renderToStaticMarkup(
    <TooltipProvider>
      <LoopClaimAction chainId={8453} model={{ ...model, ...override }} />
    </TooltipProvider>
  )
}
beforeEach(() => {
  vi.stubGlobal("React", React)
  mocks.reducedMotion = false
  mocks.mode = "subtle"
})
afterEach(() => vi.unstubAllGlobals())

describe("Loop transaction action", () => {
  it.each([
    ["checkingEligibility", "Checking eligibility…"],
    ["awaitingWallet", "Confirm in wallet"],
    ["confirming", "Confirming onchain…"],
  ] as const)(
    "labels the real %s step and prevents a second submission",
    (stage, label) => {
      const html = render({ progress: { stage } })
      expect(html).toContain(label)
      expect(html).toContain('aria-busy="true"')
      expect(html).toContain('disabled=""')
      expect(html).toContain("loop-loading-icon")
      expect(html).not.toContain("loading-spinner")
    }
  )

  it("keeps confirmation feedback inside the button without extra text", () => {
    const html = render({
      progress: {
        stage: "confirming",
        transactionUrl: "https://basescan.org/tx/0x123",
      },
    })
    expect(html).toContain("Confirming onchain…")
    expect(html).not.toContain("View transaction")
    expect(html).not.toContain("Your claim is on its way")
    expect(html).not.toContain("Claimed")
  })

  it("keeps an available claim's amount and removes pending UI", () => {
    const html = render({
      status: "claimable",
      disabled: false,
      isPending: false,
    })
    expect(html).toContain("Claim 0.123 USDC")
    expect(html).not.toContain('disabled=""')
    expect(html).not.toContain("loop-claim-progress")
  })

  it("uses registration language for a pending entry", () => {
    const html = render({
      status: "entering",
      progress: { stage: "confirming" },
    })
    expect(html).toContain("Confirming registration…")
    expect(html).not.toContain("Your claim is on its way")
  })

  it.each(["reduced", "off"])(
    "keeps status readable with %s motion",
    (mode) => {
      mocks.reducedMotion = mode === "reduced"
      mocks.mode = mode === "off" ? "off" : "subtle"
      const html = render({ progress: { stage: "awaitingWallet" } })
      expect(html).toContain("Confirm in wallet")
      expect(html).not.toContain("data-animated")
    }
  )
})
