import {
  GlobalLeaderboardResponse,
  LeaderboardRequestParams,
  LoopLeaderboardResponse,
} from "@/lib/scoring/types"

import { fetchApi } from "./api.service"

function appendParam(
  params: URLSearchParams,
  key: string,
  value: string | number | undefined
) {
  if (value == null || value === "") return
  params.set(key, String(value))
}

function buildLeaderboardQuery(params: LeaderboardRequestParams = {}) {
  const query = new URLSearchParams()

  appendParam(query, "limit", params.limit)
  appendParam(query, "offset", params.offset)
  appendParam(query, "sortBy", params.sortBy)
  appendParam(query, "sortOrder", params.sortOrder)
  appendParam(query, "userAddress", params.userAddress)
  appendParam(query, "minTotalPoints", params.minTotalPoints)
  appendParam(query, "maxTotalPoints", params.maxTotalPoints)
  appendParam(query, "minClaimPoints", params.minClaimPoints)
  appendParam(query, "maxClaimPoints", params.maxClaimPoints)
  appendParam(query, "minStreakBonusPoints", params.minStreakBonusPoints)
  appendParam(query, "maxStreakBonusPoints", params.maxStreakBonusPoints)
  appendParam(query, "minTotalClaims", params.minTotalClaims)
  appendParam(query, "maxTotalClaims", params.maxTotalClaims)
  appendParam(query, "minCurrentStreak", params.minCurrentStreak)
  appendParam(query, "maxCurrentStreak", params.maxCurrentStreak)
  appendParam(query, "minActiveLoopStreaks", params.minActiveLoopStreaks)
  appendParam(query, "maxActiveLoopStreaks", params.maxActiveLoopStreaks)
  appendParam(query, "minLongestStreak", params.minLongestStreak)
  appendParam(query, "maxLongestStreak", params.maxLongestStreak)

  return query.toString()
}

function withQuery(endpoint: string, params?: LeaderboardRequestParams) {
  const query = buildLeaderboardQuery(params)
  return query ? `${endpoint}?${query}` : endpoint
}

export function getGlobalLeaderboard(params?: LeaderboardRequestParams) {
  return fetchApi<GlobalLeaderboardResponse>(
    withQuery("/api/leaderboards/global", params)
  )
}

export function getLoopLeaderboard(
  chainId: number | string,
  loopId: number | string,
  params?: LeaderboardRequestParams
) {
  return fetchApi<LoopLeaderboardResponse>(
    withQuery(`/api/leaderboards/loops/${chainId}/${loopId}`, params)
  )
}

export function GetGlobalLeaderboard(limit: number, offset: number) {
  return getGlobalLeaderboard({ limit, offset })
}
