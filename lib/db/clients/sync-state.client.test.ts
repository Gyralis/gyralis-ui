import { describe, expect, it, vi } from "vitest"

import {
  getScoringSyncState,
  scoringSyncStateId,
  updateScoringSyncState,
} from "./sync-state.client"

const upsert = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ lastBlockNumber: 0 })
)
vi.mock("@/lib/db/client", () => ({ prisma: { scoringSyncState: { upsert } } }))

describe("all-loop scoring cursor migration", () => {
  it("starts Base catch-up independently of the old allowlisted cursor", async () => {
    await getScoringSyncState(8453)
    expect(upsert).toHaveBeenLastCalledWith({
      where: { id: "scoring-sync-8453-all-loops-v1" },
      create: { id: "scoring-sync-8453-all-loops-v1" },
      update: {},
    })
    await updateScoringSyncState({
      chainId: 8453,
      lastBlockNumber: 123,
      lastEventId: "event-1",
    })
    expect(upsert).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: { id: "scoring-sync-8453-all-loops-v1" },
        update: expect.objectContaining({
          lastBlockNumber: 123,
          lastEventId: "event-1",
        }),
      })
    )
  })

  it("leaves other chain cursors unchanged", () => {
    expect(scoringSyncStateId(100)).toBe("scoring-sync")
    expect(scoringSyncStateId(1)).toBe("scoring-sync-1")
  })
})
