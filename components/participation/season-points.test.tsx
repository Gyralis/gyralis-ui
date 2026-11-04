import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  createSeasonPreview,
  previewScore,
} from "@/lib/participation/season-preview"

import { SeasonPoints } from "./season-points"

const mocks = vi.hoisted(() => ({ useSeason: vi.fn(), isConnected: true }))
vi.mock("./season-context", () => ({ useSeason: mocks.useSeason }))
vi.mock("wagmi", () => ({
  useAccount: () => ({ isConnected: mocks.isConnected }),
}))
vi.mock("@rainbow-me/rainbowkit", () => ({
  useConnectModal: () => ({ openConnectModal: vi.fn() }),
}))
vi.mock("./season-panels", () => ({
  SeasonEntryButton: () => <button>Enter Season · 1 USDC</button>,
}))

beforeEach(() => {
  vi.stubGlobal("React", React)
  mocks.isConnected = true
  const state = createSeasonPreview()
  mocks.useSeason.mockReturnValue({
    state,
    score: previewScore(state),
    rank: 17,
    entries: 227,
  })
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe("Season Points summaries", () => {
  it.each([false, true])(
    "shows consistent totals, rank and point sources in compact=%s",
    (compact) => {
      const html = renderToStaticMarkup(<SeasonPoints compact={compact} />)
      expect(html).toContain("Season Points")
      expect(html).toContain("Preview")
      expect(html).toContain("<strong>17</strong><small>/227</small>")
      expect(html).not.toContain("#17")
      expect(html).not.toContain("227 entries")
      expect(html).not.toContain("Earned this Season")
      expect(html).toContain("28")
      expect(html).toContain("19")
      expect(html).toContain("9")
      expect(html).toContain('href="/loops"')
      expect(html).toContain('href="/loops?view=streaks"')
      expect(html).toContain('href="/games?view=bonus"')
    }
  )

  it("offers entry separately after connection without presenting personal scores", () => {
    const state = createSeasonPreview("late")
    mocks.useSeason.mockReturnValue({
      state,
      score: previewScore(state),
      rank: 17,
      entries: 227,
    })
    const html = renderToStaticMarkup(<SeasonPoints />)
    expect(html).toContain("Join the Season")
    expect(html).toContain("Enter Season · 1 USDC")
    expect(html).toContain("Eligible activity since Dec 1 is included")
    expect(html).not.toContain("#17")
    expect(html).not.toContain("Earned this Season")
  })

  it("does not show a rank before scoring starts", () => {
    const state = { ...createSeasonPreview("registration"), registered: true }
    mocks.useSeason.mockReturnValue({
      state,
      score: previewScore(state),
      rank: 1,
      entries: 197,
    })
    const html = renderToStaticMarkup(<SeasonPoints compact />)
    expect(html).toContain("Starts Dec 1")
    expect(html).not.toContain("#1")
  })

  it("does not promise entry after registration closes", () => {
    const state = { ...createSeasonPreview("prizes"), registered: false }
    mocks.useSeason.mockReturnValue({
      state,
      score: previewScore(state),
      entries: 227,
    })
    const html = renderToStaticMarkup(<SeasonPoints />)
    expect(html).toContain("Registration is closed")
    expect(html).not.toContain("Enter Season · 1 USDC")
    expect(html).not.toContain("until you enter")
  })

  it("shows a minimal connection prompt instead of cached personal stats", () => {
    mocks.isConnected = false
    const html = renderToStaticMarkup(<SeasonPoints compact />)
    expect(html).toContain("Your Season stats here")
    expect(html).not.toContain("<button")
    expect(html).toContain(
      "Connect your wallet to see how your claims and streaks add up this Season."
    )
    expect(html).not.toContain(
      "Connecting your wallet does not enter the Season"
    )
    expect(html).not.toContain("Guaranteed prize pool")
    expect(html).not.toContain("Season leaderboard")
    expect(html).not.toContain("#17")
    expect(html).not.toContain("Earned this Season")
    expect(html).not.toContain("SP</span>")
    expect(html).not.toContain("Enter Season · 1 USDC")
  })

  it("qualifies preview payout positions as provisional", () => {
    const html = renderToStaticMarkup(<SeasonPoints compact />)
    expect(html).toContain("Currently in a paid position · Provisional")
  })
})
