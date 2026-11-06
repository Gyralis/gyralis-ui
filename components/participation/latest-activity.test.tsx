import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { LatestActivityData } from "@/lib/activity/types"

import { LatestActivity } from "./latest-activity"

const mocks = vi.hoisted(() => ({
  address: undefined as string | undefined,
  pathname: "/loops",
  useQuery: vi.fn(),
}))
vi.mock("wagmi", () => ({ useAccount: () => ({ address: mocks.address }) }))
vi.mock("next/navigation", () => ({ usePathname: () => mocks.pathname }))
vi.mock("next/image", () => ({ default: () => null }))
vi.mock("@rainbow-me/rainbowkit", () => ({
  useConnectModal: () => ({ openConnectModal: vi.fn() }),
}))
vi.mock("@tanstack/react-query", () => ({ useQuery: mocks.useQuery }))

const wallet = "0xe9dc34b67006db0910a9761cb031d4bde67dce23"
const snapshot: LatestActivityData = {
  address: wallet,
  items: [
    {
      id: "8453:claim-1",
      chainId: 8453,
      chainName: "Base",
      loopName: "RWAGMI Token Launcher",
      logoSrc: "/rwagmi-logo.png",
      period: "20",
      periodKind: "current",
      amount: "601.034632179558007466",
      tokenSymbol: "RWAGMI",
      timestamp: 1793647765,
      transactionUrl: "https://basescan.org/tx/0x123",
    },
  ],
  totals: [
    { chainId: 8453, tokenSymbol: "RWAGMI", amount: "601.034632179558007466" },
  ],
  unavailableChains: [],
  fetchedAt: "2026-11-02T20:00:00.000Z",
}

beforeEach(() => {
  vi.stubGlobal("React", React)
  mocks.address = wallet
  mocks.pathname = "/loops"
  mocks.useQuery.mockReturnValue({
    isPending: false,
    isFetching: false,
    isError: false,
    data: snapshot,
    refetch: vi.fn(),
  })
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe("latest activity panel", () => {
  it("shows compact claims with actual amounts and transaction links", () => {
    const html = renderToStaticMarkup(<LatestActivity />)
    expect(html).toContain("Latest Activity")
    expect(html).toContain("Claimed: 601.035 RWAGMI</span>")
    expect(html).toContain("RWAGMI Token Launcher")
    expect(html).not.toContain("Current period, or previous if unclaimed")
    expect(html).not.toContain("Claimed in shown periods")
    expect(html).not.toContain("p-activity-totals")
    expect(html).not.toContain("<em>Current</em>")
    expect(html).not.toContain("Gnosis &amp; Base · Updated")
    expect(html).toContain('href="https://basescan.org/tx/0x123"')
    expect(mocks.useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["latest-activity", wallet],
        enabled: true,
        refetchInterval: false,
        refetchOnWindowFocus: true,
      })
    )
  })

  it("shows registrations beside claims without a reward amount", () => {
    const {
      amount: _amount,
      tokenSymbol: _symbol,
      ...base
    } = snapshot.items[0] as import("@/lib/activity/types").ClaimActivityItem
    mocks.useQuery.mockReturnValue({
      data: {
        ...snapshot,
        items: [
          ...snapshot.items,
          {
            ...base,
            id: "registration-1",
            transactionUrl: "https://basescan.org/tx/0x456",
            kind: "registration",
            period: "21",
            periodKind: "next",
            source: "receipt",
          },
        ],
      },
    })
    const html = renderToStaticMarkup(<LatestActivity />)
    expect(html).toContain("Latest Activity")
    expect(html).toContain('p-activity-registration">Registered</span>')
    expect(html).not.toContain("Period 21")
    expect(html).toContain("registered. View transaction")
    expect(html).toContain("Registration confirmed for RWAGMI Token Launcher")
    expect(html.match(/Claimed: 601.035 RWAGMI/g)).toHaveLength(1)
    expect(html.match(/p-latest-activity-row/g)).toHaveLength(2)
  })

  it("shows only the claim when the same transaction registers the next period", () => {
    const {
      amount: _amount,
      tokenSymbol: _symbol,
      ...base
    } = snapshot.items[0] as import("@/lib/activity/types").ClaimActivityItem
    mocks.useQuery.mockReturnValue({
      data: {
        ...snapshot,
        items: [
          ...snapshot.items,
          {
            ...base,
            id: "registration-combined",
            kind: "registration",
            period: "21",
            periodKind: "next",
          },
        ],
      },
    })
    const html = renderToStaticMarkup(<LatestActivity />)
    expect(html.match(/p-latest-activity-row/g)).toHaveLength(1)
    expect(html).toContain("Claimed: 601.035 RWAGMI")
    expect(html).not.toContain("p-activity-registration")
  })

  it("does not hide another Loop's registration in the same transaction", () => {
    const {
      amount: _amount,
      tokenSymbol: _symbol,
      ...base
    } = snapshot.items[0] as import("@/lib/activity/types").ClaimActivityItem
    mocks.useQuery.mockReturnValue({
      data: {
        ...snapshot,
        items: [
          ...snapshot.items,
          {
            ...base,
            loopName: "Another Loop",
            id: "registration-other",
            kind: "registration",
            period: "21",
            periodKind: "next",
          },
        ],
      },
    })
    const html = renderToStaticMarkup(<LatestActivity />)
    expect(html.match(/p-latest-activity-row/g)).toHaveLength(2)
    expect(html).toContain('p-activity-registration">Registered</span>')
  })

  it("uses the viewed profile instead of the connected wallet", () => {
    const viewed = "0x412b7153504217b405af821bdcdc5f21c71e3cbc"
    mocks.pathname = `/profile/${viewed}`
    renderToStaticMarkup(<LatestActivity />)
    expect(mocks.useQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["latest-activity", viewed] })
    )
  })

  it("does not fetch or show cached wallet data when disconnected", () => {
    mocks.address = undefined
    const html = renderToStaticMarkup(<LatestActivity />)
    expect(html).toBe("")
    expect(html).not.toContain("601.034632")
    expect(mocks.useQuery).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false })
    )
  })

  it("distinguishes missing recent claims from unavailable chain data", () => {
    mocks.useQuery.mockReturnValue({
      data: { ...snapshot, items: [], totals: [], unavailableChains: ["Base"] },
    })
    const html = renderToStaticMarkup(<LatestActivity />)
    expect(html).toContain("Base activity is temporarily unavailable")
    expect(html).toContain("No recent activity found on the available chain")
  })

  it("keeps confirmed rows visible while indexing is delayed", () => {
    mocks.useQuery.mockReturnValue({
      data: { ...snapshot, indexingStatus: "delayed" },
      isError: true,
    })
    const html = renderToStaticMarkup(<LatestActivity />)
    expect(html).not.toContain("History update delayed")
    expect(html).toContain("Claimed: 601.035 RWAGMI")
    expect(html).toContain("Showing the last update.")
  })

  it("highlights one receipt-proven claim without extra pending or sync text", () => {
    mocks.useQuery.mockReturnValue({
      data: {
        ...snapshot,
        items: [{ ...snapshot.items[0], source: "receipt" }],
      },
    })
    const html = renderToStaticMarkup(<LatestActivity />)
    expect(html).not.toContain("p-claim-feedback-row")
    expect(html).toContain("p-activity-new-claim")
    expect(html).toContain("Claim confirmed for RWAGMI Token Launcher")
    expect(html.match(/p-latest-activity-row/g)).toHaveLength(1)
  })
})
