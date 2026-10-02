import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import DashboardPage from "@/app/(general)/dashboard/page"

const { getDashboardPageData } = vi.hoisted(() => ({
  getDashboardPageData: vi.fn(),
}))

vi.mock("@/lib/dashboard", () => ({ getDashboardPageData }))
vi.mock("@/components/dashboard/dashboard-charts", () => ({
  DashboardCharts: () => null,
}))

describe("dashboard availability", () => {
  beforeEach(() => {
    // Match Next's JSX runtime when rendering TSX through Vitest.
    vi.stubGlobal("React", React)
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it.each([
    "Dashboard subgraph request failed with status 429",
    "fetch failed",
  ])("keeps the page available when the loader fails: %s", async (message) => {
    getDashboardPageData.mockRejectedValue(new Error(message))

    const html = renderToStaticMarkup(await DashboardPage())

    expect(html).toContain("Dashboard temporarily unavailable")
    expect(html).toContain('href="/loops"')
    expect(html).not.toContain(message)
    expect(getDashboardPageData).toHaveBeenCalledTimes(1)
    expect(console.error).toHaveBeenCalled()
  })
})
