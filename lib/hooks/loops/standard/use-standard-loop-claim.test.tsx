import React from "react"
import { QueryClient } from "@tanstack/react-query"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { hashFn, readContractQueryKey } from "wagmi/query"

import { useStandardLoopClaim } from "./use-standard-loop-claim"

const mocks = vi.hoisted(() => ({
  wallet: "0x1111111111111111111111111111111111111111" as string | undefined,
  client: undefined as QueryClient | undefined,
  reads: vi.fn(),
}))

function key(options: Record<string, unknown>) {
  return readContractQueryKey(
    options as Parameters<typeof readContractQueryKey>[0]
  )
}

vi.mock("wagmi", () => ({
  useAccount: () => ({ address: mocks.wallet }),
  useChainId: () => 100,
  useReadContract: (options: Record<string, unknown>) => {
    mocks.reads(options)
    const data = mocks.client!.getQueryData(key(options))
    const enabled = (options.query as { enabled: boolean }).enabled
    return {
      data,
      isLoading: enabled && data === undefined,
      error: null,
      refetch: vi.fn(),
    }
  },
  useWaitForTransactionReceipt: () => ({}),
  useWriteContract: () => ({ writeContractAsync: vi.fn() }),
}))
vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}))

const contract = "0x8995641fb3E452bC1359E79A738a6DE556015696"

function Probe({ period }: { period: bigint }) {
  const claim = useStandardLoopClaim({
    address: contract,
    chainId: 100,
    currentPeriod: period,
    eligibilityProvider: "gardens",
  })
  return <span>{claim.status}</span>
}

function seedStatus(period: string, status: readonly [boolean, boolean]) {
  mocks.client!.setQueryData(
    key({
      address: contract,
      chainId: 100,
      functionName: "getClaimerStatus",
      args: [mocks.wallet],
      scopeKey: period,
    }),
    status
  )
}

beforeEach(() => {
  vi.stubGlobal("React", React)
  mocks.wallet = "0x1111111111111111111111111111111111111111"
  mocks.client = new QueryClient({
    defaultOptions: { queries: { queryKeyHashFn: hashFn } },
  })
  mocks.reads.mockClear()
})
afterEach(() => {
  mocks.client!.clear()
  vi.unstubAllGlobals()
})

describe("standard Loop wallet state across periods", () => {
  it("does not reuse a completed claim from the previous period", () => {
    seedStatus("10", [true, true])
    expect(renderToStaticMarkup(<Probe period={10n} />)).toContain("claimed")

    expect(renderToStaticMarkup(<Probe period={11n} />)).toContain("checking")
    seedStatus("11", [false, false])
    expect(renderToStaticMarkup(<Probe period={11n} />)).toContain("enter")
  })

  it("does not fetch wallet status or payouts while disconnected", () => {
    mocks.wallet = undefined
    renderToStaticMarkup(<Probe period={11n} />)
    expect(mocks.reads).toHaveBeenCalled()
    for (const [options] of mocks.reads.mock.calls) {
      expect(options.query.enabled).toBe(false)
    }
  })

  it("isolates a different wallet from a previously cached claim", () => {
    seedStatus("11", [true, true])
    expect(renderToStaticMarkup(<Probe period={11n} />)).toContain("claimed")
    mocks.wallet = "0x2222222222222222222222222222222222222222"
    expect(renderToStaticMarkup(<Probe period={11n} />)).toContain("checking")
  })
})
