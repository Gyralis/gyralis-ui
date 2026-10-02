import type { LeaderboardQuery } from "@/lib/scoring/types"

export const LEADERBOARD_PAGE_SIZE = 15
export function normalizeLeaderboardSearch(value: string) {
  return value.trim().toLowerCase().slice(0, 42)
}
export function parseLeaderboardPage(value?: string | null) {
  const number = Number(value)
  return Number.isSafeInteger(number) &&
    number > 0 &&
    number <= Math.floor(Number.MAX_SAFE_INTEGER / LEADERBOARD_PAGE_SIZE)
    ? number
    : 1
}
export function leaderboardPageQuery(
  search: string,
  page: number
): LeaderboardQuery {
  return {
    limit: LEADERBOARD_PAGE_SIZE,
    offset: (page - 1) * LEADERBOARD_PAGE_SIZE,
    sortBy: "totalPoints",
    sortOrder: "desc",
    filters: { minTotalClaims: 1, ...(search ? { userAddress: search } : {}) },
  }
}
