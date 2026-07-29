import { parsePagination } from "@/lib/api/pagination"
import {
  LeaderboardFilters,
  LeaderboardQuery,
  LeaderboardSortField,
  leaderboardSortFields,
  SortOrder,
} from "@/lib/scoring/types"

const sortFields = new Set<string>(leaderboardSortFields)

const numericFilterParams = [
  "minTotalPoints",
  "maxTotalPoints",
  "minClaimPoints",
  "maxClaimPoints",
  "minStreakBonusPoints",
  "maxStreakBonusPoints",
  "minTotalClaims",
  "maxTotalClaims",
  "minCurrentStreak",
  "maxCurrentStreak",
  "minActiveLoopStreaks",
  "maxActiveLoopStreaks",
  "minLongestStreak",
  "maxLongestStreak",
] as const

function parseSortBy(value: string | null): LeaderboardSortField {
  return value && sortFields.has(value)
    ? (value as LeaderboardSortField)
    : "totalPoints"
}

function parseSortOrder(value: string | null, sortBy: LeaderboardSortField) {
  if (value === "asc" || value === "desc") return value
  return sortBy === "userAddress" ? "asc" : "desc"
}

function parseOptionalInteger(value: string | null) {
  if (value == null || value.trim() === "") return undefined
  const number = Number(value)
  if (!Number.isFinite(number)) return undefined
  return Math.trunc(number)
}

export function parseLeaderboardQuery(url: string): LeaderboardQuery {
  const parsedUrl = new URL(url)
  const params = parsedUrl.searchParams
  const { limit, offset } = parsePagination(url)
  const sortBy = parseSortBy(params.get("sortBy"))
  const sortOrder = parseSortOrder(params.get("sortOrder"), sortBy)
  const filters: LeaderboardFilters = {}
  const userAddress = params.get("userAddress")?.trim().toLowerCase()

  if (userAddress) {
    filters.userAddress = userAddress
  }

  for (const key of numericFilterParams) {
    const value = parseOptionalInteger(params.get(key))
    if (value != null) {
      filters[key] = value
    }
  }

  return {
    limit,
    offset,
    sortBy,
    sortOrder,
    filters,
  }
}
