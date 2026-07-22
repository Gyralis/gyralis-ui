import {
  EarnedStreakBonus,
  UserGlobalScoringStats,
  UserLoopScoringStats,
} from "@/lib/scoring/types"

import { fetchApi } from "./api.service"

export interface CurrentUserResponse {
  isLoggedIn: boolean
  address?: string
  isAdmin?: boolean
}

export interface UserProfile {
  id: string
  createdAt: string
  updatedAt: string
  address: string
  ensName: string | null
  ensAvatar: string | null
  humanPassportScore: number | null
  humanPassportScoreCheckedAt: string | null
}

export interface UserGlobalStatsResponse extends UserGlobalScoringStats {
  id: string
  createdAt: string
  updatedAt: string
}

export interface UserLoopStatsResponse extends UserLoopScoringStats {
  id: string
  createdAt: string
  updatedAt: string
  earnedStreakBonuses: EarnedStreakBonus[]
}

export interface UserProfileResponse {
  success: true
  profile: UserProfile | null
  globalStats: UserGlobalStatsResponse | null
}

export interface UserScoringResponse {
  success: true
  globalStats: UserGlobalStatsResponse | null
  loopStats: UserLoopStatsResponse[]
}

export interface UserInfoResponse {
  profile: UserProfileResponse
  scoring: UserScoringResponse
}

function userEndpoint(address: string, resource: "profile" | "scoring") {
  return `/api/users/${encodeURIComponent(address)}/${resource}`
}

export function getCurrentUser() {
  return fetchApi<CurrentUserResponse>("/api/app/user")
}

export function getUserProfile(address: string) {
  return fetchApi<UserProfileResponse>(userEndpoint(address, "profile"))
}

export function getUserScoring(address: string) {
  return fetchApi<UserScoringResponse>(userEndpoint(address, "scoring"))
}

export async function getUserInfo(address: string): Promise<UserInfoResponse> {
  const [profile, scoring] = await Promise.all([
    getUserProfile(address),
    getUserScoring(address),
  ])

  return { profile, scoring }
}
