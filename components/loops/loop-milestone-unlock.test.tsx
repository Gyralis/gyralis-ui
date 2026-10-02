import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { LoopMilestoneUnlock } from "./loop-milestone-unlock"

const { useRoadTo10k } = vi.hoisted(() => ({ useRoadTo10k: vi.fn() }))
vi.mock("@/lib/hooks/app/use-road-to-10k", () => ({ useRoadTo10k }))

beforeEach(() => {
  vi.stubGlobal("React", React)
  useRoadTo10k.mockReturnValue({
    total: 9353,
    data: { totalClaims: 9353 },
    pendingCount: 0,
    syncing: false,
    isPending: false,
  })
})
afterEach(() => vi.unstubAllGlobals())
const render = () =>
  renderToStaticMarkup(
    <LoopMilestoneUnlock goal={10000} eligibility="50+ claims in Gyralis" />
  )

describe("True Looper milestone lock", () => {
  it("shows the unlock requirement without navigation or a claim action", () => {
    const html = render()
    expect(html).toContain("Unlocks at 10,000 total claims")
    expect(html).not.toContain('role="progressbar"')
    expect(html).toContain("50+ claims in Gyralis")
    expect(html).not.toContain("$50 USDC shared pool")
    expect(html).not.toContain("claims to go")
    expect(html).not.toContain('href="#road-to-10k"')
    expect(html).not.toContain("<button")
  })

  it("waits for indexing before announcing the milestone", () => {
    useRoadTo10k.mockReturnValue({
      total: 10000,
      data: { totalClaims: 9999 },
      pendingCount: 1,
      syncing: true,
    })
    const html = render()
    expect(html).toContain("Confirming total claims milestone")
    expect(html).not.toContain("Preparing launch")
  })

  it("keeps the loop preparing after the indexed goal is reached", () => {
    useRoadTo10k.mockReturnValue({
      total: 10001,
      data: { totalClaims: 10001 },
      pendingCount: 0,
      syncing: false,
    })
    const html = render()
    expect(html).toContain("Total claims goal reached · Preparing launch")
    expect(html).not.toContain('role="progressbar"')
    expect(html).not.toContain("<button")
  })

  it("shows loading and unavailable states without a false zero count", () => {
    useRoadTo10k.mockReturnValue({ isPending: true, pendingCount: 0 })
    expect(render()).toContain("Loading total claims progress")
    useRoadTo10k.mockReturnValue({ isPending: false, pendingCount: 0 })
    const html = render()
    expect(html).toContain("Total claims progress is temporarily unavailable")
    expect(html).not.toContain('role="progressbar"')
  })
})
