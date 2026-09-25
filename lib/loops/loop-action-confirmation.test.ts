import { beforeEach, describe, expect, it, vi } from "vitest"

import { useStandardLoopClaim as runStandardClaimHook } from "@/lib/hooks/loops/standard/use-standard-loop-claim"
import { useSuperLoopClaim as runSuperClaimHook } from "@/lib/hooks/loops/super/use-super-loop-claim"

// Execute hooks with mocked React state/effects to isolate receipt notifications.
const mock = vi.hoisted(() => ({
  states: [] as unknown[],
  effects: [] as Array<() => void>,
  receipt: {
    isSuccess: true,
    isError: false,
    isLoading: false,
    data: { status: "success", blockNumber: 12345n },
  },
  refetch: vi.fn().mockResolvedValue(undefined),
}))
vi.mock("react", () => ({
  useState: () => [mock.states.shift(), vi.fn()],
  useEffect: (effect: () => void) => mock.effects.push(effect),
  useMemo: (factory: () => unknown) => factory(),
  useCallback: (callback: unknown) => callback,
}))
vi.mock("wagmi", () => ({
  useAccount: () => ({ address: "0x1111111111111111111111111111111111111111" }),
  useChainId: () => 100,
  useWriteContract: () => ({ writeContractAsync: vi.fn() }),
  useWaitForTransactionReceipt: () => mock.receipt,
  useReadContract: () => ({ refetch: mock.refetch }),
}))
vi.mock(
  "@/lib/hooks/loops/standard/use-standard-loop-wallet-registration",
  () => ({
    useStandardLoopWalletRegistration: () => ({ refetch: mock.refetch }),
  })
)
vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}))

const onClaimConfirmed = vi.fn()

const transactionHash = `0x${"a".repeat(64)}`

beforeEach(() => {
  onClaimConfirmed.mockClear()
  mock.effects = []
  mock.receipt.isSuccess = true
  mock.receipt.data.status = "success"
})

describe.each(["standard", "super"])("%s claim confirmations", (kind) => {
  async function confirm(action: "enter" | "claim") {
    const onConfirmed = vi.fn()
    mock.states =
      kind === "standard"
        ? [false, undefined, action, "idle", transactionHash]
        : ["idle", undefined, undefined, action, transactionHash]
    const params = {
      address: "0x1111111111111111111111111111111111111111" as const,
      chainId: 100,
      eligibilityProvider: "gardens" as const,
      currentPeriod: 5n,
      onConfirmed,
      onClaimConfirmed,
    }
    if (kind === "standard") runStandardClaimHook(params)
    else
      runSuperClaimHook({
        ...params,
        claimableAmount: 10n,
        hasClaimed: false,
        isClaimable: true,
      })
    mock.effects.forEach((effect) => effect())
    // Standard claims refresh account reads before notifying the controller.
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
    return onConfirmed
  }

  it.each(["enter", "claim"] as const)(
    "preserves the confirmed %s action and transaction identity",
    async (action) => {
      const onConfirmed = await confirm(action)
      expect(onClaimConfirmed).toHaveBeenCalledTimes(action === "claim" ? 1 : 0)
      if (action === "claim") {
        expect(onClaimConfirmed).toHaveBeenCalledWith({
          action,
          chainId: 100,
          transactionHash,
          blockNumber: 12345n,
        })
      }
      expect(onConfirmed).toHaveBeenCalledTimes(1)
      expect(onConfirmed).toHaveBeenCalledWith({
        action,
        chainId: 100,
        transactionHash,
        blockNumber: 12345n,
      })
    }
  )

  it("does not notify for a reverted transaction", async () => {
    mock.receipt.data.status = "reverted"
    expect(await confirm("claim")).not.toHaveBeenCalled()
    expect(onClaimConfirmed).not.toHaveBeenCalled()
  })

  it("does not notify before receipt confirmation", async () => {
    mock.receipt.isSuccess = false
    expect(await confirm("claim")).not.toHaveBeenCalled()
    expect(onClaimConfirmed).not.toHaveBeenCalled()
  })
})
