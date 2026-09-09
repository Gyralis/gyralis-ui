import { beforeEach, describe, expect, it, vi } from "vitest"

import { runScoringSync } from "./sync"

const mocks = vi.hoisted(() => ({
  fetchAllClaimEventsForUserLoop: vi.fn(),
  fetchClaimEventsFromSubgraph: vi.fn(),
  getScoringSyncState: vi.fn(),
  updateScoringSyncState: vi.fn(),
  ensureUserProfile: vi.fn(),
  getUserLoopStatsForUser: vi.fn(),
  upsertUserLoopStats: vi.fn(),
  upsertLoopLeaderboardEntry: vi.fn(),
  markProcessedClaimEvents: vi.fn(),
  upsertUserGlobalStats: vi.fn(),
  upsertGlobalLeaderboardEntry: vi.fn(),
}))

const gnosisSource = {
  chainId: 100,
  url: "https://example.com/gnosis",
}

vi.mock("@/env.mjs", () => ({
  env: {
    GYRALIS_SUBGRAPH_CHAIN_ID: 100,
    SCORING_SYNC_BATCH_SIZE: 2,
  },
}))

vi.mock("@/lib/db/clients/global-stats.client", () => ({
  clearUserGlobalStats: vi.fn(),
  upsertUserGlobalStats: mocks.upsertUserGlobalStats,
}))

vi.mock("@/lib/db/clients/leaderboard.client", () => ({
  clearLeaderboardEntries: vi.fn(),
  upsertGlobalLeaderboardEntry: mocks.upsertGlobalLeaderboardEntry,
  upsertLoopLeaderboardEntry: mocks.upsertLoopLeaderboardEntry,
}))

vi.mock("@/lib/db/clients/loop-stats.client", () => ({
  clearUserLoopStats: vi.fn(),
  getUserLoopStatsForUser: mocks.getUserLoopStatsForUser,
  upsertUserLoopStats: mocks.upsertUserLoopStats,
}))

vi.mock("@/lib/db/clients/processed-claim-events.client", () => ({
  clearProcessedClaimEvents: vi.fn(),
  markProcessedClaimEvents: mocks.markProcessedClaimEvents,
}))

vi.mock("@/lib/db/clients/sync-state.client", () => ({
  getScoringSyncState: mocks.getScoringSyncState,
  resetScoringSyncState: vi.fn(),
  updateScoringSyncState: mocks.updateScoringSyncState,
}))

vi.mock("@/lib/db/clients/user-profile.client", () => ({
  ensureUserProfile: mocks.ensureUserProfile,
}))

vi.mock("./subgraph-client", () => ({
  fetchAllClaimEventsForUserLoop: mocks.fetchAllClaimEventsForUserLoop,
  fetchClaimEventsFromSubgraph: mocks.fetchClaimEventsFromSubgraph,
  getScoringSubgraphSource: () => gnosisSource,
  getScoringSubgraphSources: () => [gnosisSource],
}))

const userAddress = "0x0000000000000000000000000000000000000001"

function claimEvent(blockNumber: number, id: string) {
  return {
    id,
    userAddress,
    loopId: 3,
    chainId: 100,
    periodNumber: blockNumber,
    payout: "1",
    blockNumber,
    timestamp: new Date(blockNumber * 1000),
    txHash: `0x${blockNumber.toString(16).padStart(64, "0")}`,
    logIndex: 0,
  }
}

describe("incremental scoring sync", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getScoringSyncState.mockResolvedValue({
      lastBlockNumber: 10,
      lastEventId: "0xaaa-0",
    })
    mocks.getUserLoopStatsForUser.mockResolvedValue([
      {
        userAddress,
        loopId: 3,
        chainId: 100,
        totalClaims: 2,
        claimPoints: 2,
        streakBonusPoints: 0,
        totalPoints: 2,
        currentStreak: 2,
        longestStreak: 2,
        lastClaimedPeriod: 11,
        earnedStreakBonuses: [],
      },
    ])
  })

  it("processes one bounded page and checkpoints after projection writes", async () => {
    const historicalEvent = claimEvent(5, "0x111-0")
    const lastBlockEvent = claimEvent(10, "0xbbb-0")
    const newBlockEvent = claimEvent(11, "0xccc-0")
    mocks.fetchClaimEventsFromSubgraph
      .mockResolvedValueOnce([lastBlockEvent])
      .mockResolvedValueOnce([newBlockEvent])
    mocks.fetchAllClaimEventsForUserLoop.mockResolvedValue([
      historicalEvent,
      lastBlockEvent,
      newBlockEvent,
    ])

    const result = await runScoringSync()

    expect(mocks.fetchClaimEventsFromSubgraph).toHaveBeenNthCalledWith(1, {
      source: gnosisSource,
      blockNumber: 10,
      afterEventId: "0xaaa-0",
      first: 2,
      loopId: undefined,
      orderBy: "id",
    })
    expect(mocks.fetchClaimEventsFromSubgraph).toHaveBeenNthCalledWith(2, {
      source: gnosisSource,
      fromBlock: 11,
      first: 1,
      loopId: undefined,
      orderBy: "blockNumber",
    })
    expect(result).toMatchObject({
      processedEvents: 2,
      affectedLoops: 1,
      affectedUsers: 1,
      lastBlockNumber: 11,
      hasMore: true,
    })
    expect(mocks.updateScoringSyncState).toHaveBeenCalledWith({
      chainId: 100,
      lastBlockNumber: 11,
      lastEventId: "0xccc-0",
    })
    expect(mocks.markProcessedClaimEvents).toHaveBeenCalledWith([
      lastBlockEvent,
      newBlockEvent,
    ])
    expect(
      mocks.updateScoringSyncState.mock.invocationCallOrder[0]
    ).toBeGreaterThan(mocks.upsertUserLoopStats.mock.invocationCallOrder[0])
    expect(
      mocks.updateScoringSyncState.mock.invocationCallOrder[0]
    ).toBeGreaterThan(
      mocks.upsertGlobalLeaderboardEntry.mock.invocationCallOrder[0]
    )
  })

  it("does not checkpoint when projection writes fail", async () => {
    const event = claimEvent(11, "0xbbb-0")
    mocks.fetchClaimEventsFromSubgraph
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([event])
    mocks.fetchAllClaimEventsForUserLoop.mockResolvedValue([event])
    mocks.upsertUserLoopStats.mockRejectedValueOnce(new Error("write failed"))

    await expect(runScoringSync()).rejects.toThrow("write failed")
    expect(mocks.updateScoringSyncState).not.toHaveBeenCalled()
  })
})
