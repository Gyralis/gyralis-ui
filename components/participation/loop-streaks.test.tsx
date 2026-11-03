import React from "react"
import { rwagmiTestLoop } from "@/data/loops-data"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { ProfileStreakRecord } from "@/lib/profile/streak-card-state"
import { TooltipProvider } from "@/components/ui/tooltip"

import { LoopStreaks, StreakCard } from "./loop-streaks"

const mocks = vi.hoisted(() => ({
  address: undefined as string | undefined,
  search: "",
  useQuery: vi.fn(),
}))
vi.mock("wagmi", () => ({ useAccount: () => ({ address: mocks.address }) }))
vi.mock("@tanstack/react-query", () => ({ useQuery: mocks.useQuery }))
vi.mock("@rainbow-me/rainbowkit", () => ({
  useConnectModal: () => ({ openConnectModal: vi.fn() }),
}))
vi.mock("next/image", () => ({ default: () => null }))
vi.mock("./participation-shell", () => ({
  useParticipationSearch: () => mocks.search,
}))

const stats: ProfileStreakRecord = {
  chainId: 8453,
  loopId: 7,
  totalClaims: 20,
  currentStreak: 6,
  longestStreak: 12,
  earnedStreakBonuses: [{ streak: 3, points: 2 }],
}

beforeEach(() => {
  vi.stubGlobal("React", React)
  mocks.address = "0xe9dc34b67006db0910a9761cb031d4bde67dce23"
  mocks.search = ""
  mocks.useQuery.mockReturnValue({
    data: {
      season: {
        id: "current-season",
        name: "Current Season",
        loops: [{ chainId: 8453, loopId: 7, multiplier: 1 }],
      },
      loopStats: [stats],
    },
    isPending: false,
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  })
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe("streak pill cards", () => {
  it("keeps the design cards visible by default without a wallet or active Season", () => {
    mocks.address = undefined
    mocks.useQuery.mockReturnValue({ isPending: true, data: undefined })
    const html = renderToStaticMarkup(<LoopStreaks />)
    expect(html).toContain(
      "Design preview · Sample SP only. No scores are saved."
    )
    expect(html).toContain('role="meter"')
    expect(html).toContain("All milestones completed")
    expect(html).toContain("In progress")
    expect(html).toContain("Use live data")
    expect(html).not.toContain("Connect your wallet")
    expect(html).not.toContain("Preview claim")
    expect(mocks.useQuery).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false })
    )
  })

  it("does not fetch live scores while showing sample SP for a connected wallet", () => {
    renderToStaticMarkup(<LoopStreaks />)
    expect(mocks.useQuery).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false })
    )
  })

  it("renders the saved streak and accessible milestone states without preview claim controls", () => {
    const html = renderToStaticMarkup(<LoopStreaks initialPreview={false} />)
    expect(html).toContain("Current Season streak")
    expect(html).toContain('aria-valuenow="6"')
    expect(html).toContain("3-claim milestone: Completed")
    expect(html).toContain("3-claim milestone: Completed, 2 SP")
    expect(html).toContain("7-claim milestone: In progress")
    expect(html).toContain("30-claim milestone: Locked")
    expect(html).toContain('aria-label="RWAGMI Token Launcher"')
    for (const removed of [
      "Ready in preview",
      "Preview claim",
      "Open live Loop",
      "This claim",
      "Base roster preview",
      "Season 01",
    ])
      expect(html).not.toContain(removed)
    expect(mocks.useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["season-streaks", mocks.address],
        enabled: true,
      })
    )
  })

  it("keeps the full streak number while bounding the pill meter at 30", () => {
    const html = renderToStaticMarkup(
      <TooltipProvider>
        <StreakCard
          loop={rwagmiTestLoop}
          stats={{
            ...stats,
            currentStreak: 128,
            earnedStreakBonuses: [3, 7, 14, 30].map((streak) => ({
              streak,
              points: 2,
            })),
          }}
        />
      </TooltipProvider>
    )
    expect(html).toContain("128")
    expect(html).toContain('aria-valuenow="30"')
    expect(html).toContain("All milestones completed")
  })

  it("does not show cached wallet data after disconnecting", () => {
    mocks.address = undefined
    const html = renderToStaticMarkup(<LoopStreaks initialPreview={false} />)
    expect(html).toContain("Connect your wallet")
    expect(html).not.toContain('aria-valuenow="6"')
    expect(mocks.useQuery).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false })
    )
  })

  it("does not replace a failed request with zero streaks", () => {
    mocks.useQuery.mockReturnValue({
      isError: true,
      isPending: false,
      refetch: vi.fn(),
    })
    const html = renderToStaticMarkup(<LoopStreaks initialPreview={false} />)
    expect(html).toContain("Your Season streaks couldn’t be loaded")
    expect(html).not.toContain('role="meter"')
  })

  it("shows no active Season rather than reusing all-time streaks", () => {
    mocks.useQuery.mockReturnValue({
      data: { season: null, loopStats: [] },
      isPending: false,
    })
    const html = renderToStaticMarkup(<LoopStreaks initialPreview={false} />)
    expect(html).toContain("No active Season")
    expect(html).toContain("SP counts toward this Season only")
    expect(html).not.toContain('role="meter"')
  })
})
