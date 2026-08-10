import type { PublicClient } from "viem"
import { describe, expect, it, vi } from "vitest"

import { getLogsChunked } from "./get-logs-chunked"

describe("getLogsChunked", () => {
  it("queries contiguous 10,000-block ranges without overlap", async () => {
    const getLogs = vi.fn().mockResolvedValue([])
    const publicClient = { getLogs } as unknown as PublicClient

    await getLogsChunked(
      publicClient,
      {
        fromBlock: 100n,
        toBlock: 20_100n,
      },
      10_000n
    )

    expect(getLogs).toHaveBeenCalledTimes(3)
    expect(getLogs).toHaveBeenNthCalledWith(1, {
      fromBlock: 100n,
      toBlock: 10_099n,
    })
    expect(getLogs).toHaveBeenNthCalledWith(2, {
      fromBlock: 10_100n,
      toBlock: 20_099n,
    })
    expect(getLogs).toHaveBeenNthCalledWith(3, {
      fromBlock: 20_100n,
      toBlock: 20_100n,
    })
  })
})
