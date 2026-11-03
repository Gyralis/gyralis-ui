import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  createSeasonPreview,
  previewScore,
} from "@/lib/participation/season-preview"

import { SeasonPoints } from "./season-points"

const mocks = vi.hoisted(() => ({ useSeason: vi.fn() }))
vi.mock("./season-context", () => ({ useSeason: mocks.useSeason }))

beforeEach(() => {
  vi.stubGlobal("React", React)
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
      expect(html).toContain("#17")
      expect(html).toContain("227 entries")
      expect(html).toContain("28")
      expect(html).toContain("19")
      expect(html).toContain("9")
      expect(html).toContain("separate from all-time GP")
      expect(html).toContain('href="/loops"')
      expect(html).toContain('href="/loops?view=streaks"')
      expect(html).toContain('href="/games?view=bonus"')
    }
  )

  it("does not present a visitor's potential score as an earned score or rank", () => {
    const state = createSeasonPreview("late")
    mocks.useSeason.mockReturnValue({
      state,
      score: previewScore(state),
      rank: 17,
      entries: 227,
    })
    const html = renderToStaticMarkup(<SeasonPoints />)
    expect(html).toContain("Potential Season Points")
    expect(html).toContain("Not added until you enter")
    expect(html).toContain("Enter to rank")
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
    expect(html).toContain("Not entered in this Season")
    expect(html).not.toContain("until you enter")
  })
})
