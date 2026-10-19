import { beforeEach, describe, expect, it, vi } from "vitest"

import { useSyncProfileAfterClaim } from "./use-sync-profile-after-claim"

const mocks = vi.hoisted(() => ({
  invalidateQueries: vi.fn(),
}))

vi.mock("react", () => ({
  useCallback: (callback: unknown) => callback,
}))

vi.mock("wagmi", () => ({
  useAccount: () => ({
    address: "0x1111111111111111111111111111111111111111",
  }),
}))

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: mocks.invalidateQueries }),
}))

const contractAddress = "0x2222222222222222222222222222222222222222"
const transactionHash = `0x${"a".repeat(64)}` as const

beforeEach(() => {
  mocks.invalidateQueries.mockReset()
  vi.unstubAllGlobals()
})

describe("profile sync after a claim", () => {
  it("syncs a confirmed Base claim", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(Response.json({ success: true }))
    vi.stubGlobal("fetch", fetchMock)
    const syncProfileAfterClaim = useSyncProfileAfterClaim({
      contractAddress,
      loopId: 1,
      periodNumber: 5n,
    })

    await syncProfileAfterClaim({
      action: "claim",
      chainId: 8453,
      transactionHash,
      blockNumber: 12345n,
    })

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/scoring/0x1111111111111111111111111111111111111111",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txHash: transactionHash,
          chainId: 8453,
          loopId: 1,
          contractAddress,
          periodNumber: 5,
        }),
      }
    )
    expect(mocks.invalidateQueries).toHaveBeenCalledWith({
      queryKey: [
        "profile-summary",
        "0x1111111111111111111111111111111111111111",
      ],
    })
  })
})
