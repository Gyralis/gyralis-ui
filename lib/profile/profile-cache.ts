import { revalidateTag } from "next/cache"

import { normalizeDbAddress } from "@/lib/db/ids"
import { LEADERBOARD_CACHE_TAG } from "@/lib/leaderboard/cache"

export const PROFILE_CACHE_SECONDS = 300
export const PROFILE_STATS_CACHE_TAG = "profile-stats"
export const PROFILE_RANK_CACHE_TAG = "profile-ranks"

export function profileStatsCacheTag(address: string) {
  return `${PROFILE_STATS_CACHE_TAG}:${normalizeDbAddress(address)}`
}

/** Call after scoring writes; omit the wallet for a full scoring rebuild. */
export function invalidateProfilePageData(address?: string) {
  revalidateTag(
    address ? profileStatsCacheTag(address) : PROFILE_STATS_CACHE_TAG
  )
  // One wallet gaining points can change every other wallet's rank.
  revalidateTag(PROFILE_RANK_CACHE_TAG)
  revalidateTag(LEADERBOARD_CACHE_TAG)
}
