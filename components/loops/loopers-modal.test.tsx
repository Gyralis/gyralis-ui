import React, { type ReactNode } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { LoopersModal } from "./loopers-modal"

const mocks = vi.hoisted(() => ({
  balance: vi.fn(),
  payout: vi.fn(),
  registration: vi.fn(),
  claims: vi.fn(),
  range: vi.fn(),
  registrationError: null as Error | null,
  claimError: null as Error | null,
  rangeError: undefined as Error | undefined,
}))

vi.mock("wagmi", () => ({
  usePublicClient: () => undefined,
  useReadContract: mocks.payout,
}))
vi.mock("@/lib/hooks/app/use-loop-token-balance", () => ({
  useLoopTokenBalance: mocks.balance,
}))
vi.mock("@/lib/hooks/app/use-registered-users", () => ({
  useRegisteredUsers: mocks.registration,
}))
vi.mock("@/lib/hooks/app/use-claimed-users", () => ({
  useClaimedUsers: mocks.claims,
}))
vi.mock("@/lib/hooks/app/use-period-log-block-range", () => ({
  usePeriodLogBlockRange: mocks.range,
}))
vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: ReactNode }) => <>{children}</>,
  DialogContent: ({ children }: { children: ReactNode }) => <>{children}</>,
  DialogTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
  DialogDescription: ({ children }: { children: ReactNode }) => (
    <p>{children}</p>
  ),
}))

const props = {
  chainId: 100,
  currentPeriod: 11n,
  isOpen: false,
  loopAddress: "0x8995641fb3E452bC1359E79A738a6DE556015696" as const,
  loopToken: "0x71850b7E9Ee3f13Ab46d67167341E4bDc905Eef9" as const,
  onOpenChange: vi.fn(),
}

beforeEach(() => {
  vi.stubGlobal("React", React)
  vi.clearAllMocks()
  mocks.registrationError = null
  mocks.claimError = null
  mocks.rangeError = undefined
  mocks.balance.mockReturnValue({ data: undefined })
  mocks.payout.mockReturnValue({ data: undefined })
  mocks.registration.mockImplementation(() => ({
    users: [],
    loading: false,
    error: mocks.registrationError,
  }))
  mocks.claims.mockImplementation(() => ({
    users: [],
    payouts: {},
    loading: false,
    error: mocks.claimError,
  }))
  mocks.range.mockImplementation(() => ({
    loading: false,
    error: mocks.rangeError,
  }))
})
afterEach(() => vi.unstubAllGlobals())

describe("Looper dialog data lifecycle", () => {
  it("disables all detail reads while the dialog is closed", () => {
    renderToStaticMarkup(<LoopersModal {...props} />)
    expect(mocks.balance).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false })
    )
    expect(mocks.payout).toHaveBeenCalledWith(
      expect.objectContaining({ query: { enabled: false } })
    )
    expect(mocks.registration.mock.calls[0][4]).toBe(false)
    expect(mocks.claims.mock.calls[0][4]).toBe(false)
  })

  it("enables public participant data on open without requiring a wallet", () => {
    const html = renderToStaticMarkup(<LoopersModal {...props} isOpen />)
    expect(mocks.balance).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: true })
    )
    expect(mocks.payout).toHaveBeenCalledWith(
      expect.objectContaining({ query: { enabled: true } })
    )
    expect(mocks.registration.mock.calls[0][4]).toBe(true)
    expect(mocks.claims.mock.calls[0][4]).toBe(true)
    expect(html).toContain("No registered loopers for this period.")
  })

  it.each(["registration", "claims", "range"] as const)(
    "shows unavailable participation rather than an empty list when %s fails",
    (source) => {
      if (source === "registration") mocks.registrationError = new Error("RPC")
      if (source === "claims") mocks.claimError = new Error("RPC")
      if (source === "range") mocks.rangeError = new Error("RPC")
      const html = renderToStaticMarkup(<LoopersModal {...props} isOpen />)
      expect(html).toContain("We couldn’t load participation for this period.")
      expect(html).toContain("Retry participation")
      expect(html).not.toContain("No registered loopers")
      expect(html).not.toContain(">0%<")
    }
  )

  it("keeps unresolved period data loading instead of displaying zero participants", () => {
    const html = renderToStaticMarkup(
      <LoopersModal {...props} isOpen currentPeriod={undefined} />
    )
    expect(html).not.toContain("No registered loopers")
    expect(html).not.toContain(">0%<")
    expect(mocks.payout).toHaveBeenCalledWith(
      expect.objectContaining({ query: { enabled: false } })
    )
  })

  it("does not fabricate a zero payout when the amount is unavailable", () => {
    mocks.balance.mockReturnValue({ data: { decimals: 18, symbol: "HNY" } })
    mocks.registration.mockReturnValue({
      users: [props.loopAddress],
      loading: false,
      error: null,
    })
    const html = renderToStaticMarkup(<LoopersModal {...props} isOpen />)
    expect(html).toContain("Pending")
    expect(html).not.toContain("0 HNY")
  })

  it("does not show a zero distribution while participant data is loading", () => {
    mocks.balance.mockReturnValue({ data: { decimals: 18, symbol: "HNY" } })
    mocks.payout.mockReturnValue({ data: 1000000000000000000n })
    mocks.registration.mockReturnValue({
      users: [],
      loading: true,
      error: null,
    })
    const html = renderToStaticMarkup(<LoopersModal {...props} isOpen />)
    expect(html).not.toContain("No registered loopers")
    expect(html).not.toContain("0 HNY")
    expect(html).not.toContain(">0%<")
  })
})
