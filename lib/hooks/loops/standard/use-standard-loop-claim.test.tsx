import React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
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

function seedRegistration(period: string, registered: boolean) {
  mocks.client!.setQueryData(
    [
      "standard-loop",
      "wallet-registration",
      100,
      contract.toLowerCase(),
      mocks.wallet?.toLowerCase(),
      period,
    ],
    registered
  )
}

function render(period: bigint) {
  return renderToStaticMarkup(
    <QueryClientProvider client={mocks.client!}>
      <Probe period={period} />
    </QueryClientProvider>
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
    expect(render(10n)).toContain("claimed")

    expect(render(11n)).toContain("checking")
    seedStatus("11", [false, false])
    seedRegistration("11", false)
    expect(render(11n)).toContain("enter")
  })

  it("does not fetch wallet status or payouts while disconnected", () => {
    mocks.wallet = undefined
    render(11n)
    expect(mocks.reads).toHaveBeenCalled()
    for (const [options] of mocks.reads.mock.calls) {
      expect(options.query.enabled).toBe(false)
    }
  })

  it("isolates a different wallet from a previously cached claim", () => {
    seedStatus("11", [true, true])
    expect(render(11n)).toContain("claimed")
    mocks.wallet = "0x2222222222222222222222222222222222222222"
    expect(render(11n)).toContain("checking")
  })

  it("recognizes this wallet's registration for 184 while it is not registered for 183", () => {
    mocks.wallet = "0x5BE8Bb8d7923879c3DDc9c551C5Aa85Ad0Fa4dE3"
    seedStatus("183", [false, false])
    seedRegistration("183", true)
    expect(render(183n)).toContain("entered")
  })

  it("checks next-period registration before offering another registration", () => {
    seedStatus("183", [false, false])
    expect(render(183n)).toContain("checking")
    seedRegistration("183", false)
    expect(render(183n)).toContain("enter")
  })

  it("does not carry the previous period's look-ahead result into the next period", () => {
    seedStatus("183", [false, false])
    seedRegistration("183", true)
    expect(render(183n)).toContain("entered")
    seedStatus("184", [false, false])
    expect(render(184n)).toContain("checking")
  })

  it("keeps a current-period claim available without waiting for registration history", () => {
    seedStatus("183", [true, false])
    mocks.client!.setQueryData(
      key({
        address: contract,
        chainId: 100,
        functionName: "getPeriodIndividualPayout",
        args: [183n],
        account: mocks.wallet,
      }),
      10n
    )
    expect(render(183n)).toContain("claimable")
  })

  it("does not reuse another wallet's next-period registration", () => {
    seedStatus("183", [false, false])
    seedRegistration("183", true)
    mocks.wallet = "0x2222222222222222222222222222222222222222"
    seedStatus("183", [false, false])
    expect(render(183n)).toContain("checking")
  })
})
