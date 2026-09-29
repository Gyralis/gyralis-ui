import { QueryObserver } from "@tanstack/react-query"
import { describe, expect, it, vi } from "vitest"

import { createWalletQueryClient } from "./wallet-query-client"

const queryKey = [
  "ensName",
  { address: "0xa25211B64D041F690C0c818183E32f28ba9647Dd", chainId: 1 },
] as const

describe("wallet ENS queries", () => {
  it("shares and caches successful ENS lookups", async () => {
    const client = createWalletQueryClient()
    const queryFn = vi.fn().mockResolvedValue("example.eth")
    try {
      const options = { queryKey, queryFn }
      expect(
        await Promise.all([
          client.fetchQuery(options),
          client.fetchQuery(options),
        ])
      ).toEqual(["example.eth", "example.eth"])
      expect(await client.fetchQuery(options)).toBe("example.eth")
      expect(queryFn).toHaveBeenCalledTimes(1)
    } finally {
      client.clear()
    }
  })

  it("does not retry rejected ENS queries when wallet controls remount", async () => {
    const client = createWalletQueryClient()
    const queryFn = vi
      .fn()
      .mockRejectedValue(new Error("ETH_MAINNET is not enabled"))
    let unsubscribe = () => {}
    try {
      await expect(client.fetchQuery({ queryKey, queryFn })).rejects.toThrow(
        "ETH_MAINNET is not enabled"
      )
      const observer = new QueryObserver(client, { queryKey, queryFn })
      unsubscribe = observer.subscribe(() => {})
      await new Promise((resolve) => setTimeout(resolve, 0))
      expect(queryFn).toHaveBeenCalledTimes(1)
      expect(observer.getCurrentResult().isError).toBe(true)
      expect(client.getQueryDefaults(["readContract"])).toEqual({})
    } finally {
      unsubscribe()
      client.clear()
    }
  })
})
