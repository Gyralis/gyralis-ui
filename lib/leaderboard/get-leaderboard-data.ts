import "server-only"

import { unstable_cache } from "next/cache"

import {
  countGlobalLeaderboard,
  getGlobalLeaderboard,
  getGlobalLeaderboardRankForEntry,
  getGlobalLeaderboardSummary,
} from "@/lib/db/clients/leaderboard.client"
import { toRankedLeaderboardEntry } from "@/lib/scoring/responses"
import type {
  GlobalLeaderboardResponse,
  LeaderboardQuery,
} from "@/lib/scoring/types"

import { LEADERBOARD_CACHE_SECONDS, LEADERBOARD_CACHE_TAG } from "./cache"
import { LEADERBOARD_PAGE_SIZE } from "./query"

export async function fetchLeaderboardData(
  query: LeaderboardQuery,
  includeGlobalRank = false
): Promise<GlobalLeaderboardResponse> {
  const effectiveQuery = {
    ...query,
    limit: includeGlobalRank
      ? Math.min(LEADERBOARD_PAGE_SIZE, query.limit)
      : query.limit,
  }
  const [records, totalMatching] = await Promise.all([
    getGlobalLeaderboard(effectiveQuery),
    countGlobalLeaderboard(query.filters),
  ])
  const entries = records.map((entry, index) => ({
    ...toRankedLeaderboardEntry(entry, query.offset + index + 1),
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  }))
  if (includeGlobalRank) {
    // Five count queries at a time, using the entries already loaded above.
    for (let index = 0; index < entries.length; index += 5) {
      await Promise.all(
        entries.slice(index, index + 5).map(async (entry) => {
          Object.assign(entry, {
            globalRank: await getGlobalLeaderboardRankForEntry(entry),
          })
        })
      )
    }
  }
  return { success: true, ...effectiveQuery, totalMatching, entries }
}

export const getLeaderboardData = unstable_cache(
  fetchLeaderboardData,
  ["global-leaderboard-v2"],
  { revalidate: LEADERBOARD_CACHE_SECONDS, tags: [LEADERBOARD_CACHE_TAG] }
)

export const getLeaderboardSummary = unstable_cache(
  getGlobalLeaderboardSummary,
  ["global-leaderboard-summary-eligible-loops-v2"],
  { revalidate: LEADERBOARD_CACHE_SECONDS, tags: [LEADERBOARD_CACHE_TAG] }
)
