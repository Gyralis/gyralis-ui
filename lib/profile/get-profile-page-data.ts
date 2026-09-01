import "server-only"

import { isAddress } from "viem"

import { LoopCardData, LoopCardsData } from "@/data/loops-data"
import { getUserGlobalStats } from "@/lib/db/clients/global-stats.client"
import { getGlobalLeaderboardRank } from "@/lib/db/clients/leaderboard.client"
import { getUserLoopStatsForUser } from "@/lib/db/clients/loop-stats.client"
import { getUserProfile } from "@/lib/db/clients/user-profile.client"
import { normalizeDbAddress } from "@/lib/db/ids"
import { ignoredScoringLoopIds } from "@/lib/scoring/loop-filters"
import { parseEarnedStreakBonuses } from "@/lib/scoring/responses"
import { EarnedStreakBonus } from "@/lib/scoring/types"

type ProfileRecord = Awaited<ReturnType<typeof getUserProfile>>
type GlobalStatsRecord = Awaited<ReturnType<typeof getUserGlobalStats>>
type LoopStatsRecord = Awaited<ReturnType<typeof getUserLoopStatsForUser>>[number]

export interface ProfileLoopMetadata {
  id: number
  title: string
  by: string
  sponsorName: string
  address: string | null
  chainId: number
  chainName: string
  contractType: LoopCardData["contractType"] | "archived"
  logoUrl?: string
  communityLogoUrl?: string
  eligibilityLogoUrl?: string
  sponsorLogoUrl?: string
  enabled: boolean
  archived: boolean
}

export interface ProfileLoopStats {
  id: string
  userAddress: string
  loopId: number
  chainId: number
  totalClaims: number
  claimPoints: number
  streakBonusPoints: number
  totalPoints: number
  currentStreak: number
  longestStreak: number
  lastClaimedPeriod: number | null
  earnedStreakBonuses: EarnedStreakBonus[]
  metadata: ProfileLoopMetadata
}

export interface ProfilePageData {
  address: string
  profile: ProfileRecord
  globalStats: GlobalStatsRecord extends infer T
    ? T extends null
      ? null
      : Omit<T, "earnedStreakBonuses"> & {
          earnedStreakBonuses: EarnedStreakBonus[]
        }
    : never
  loopStats: ProfileLoopStats[]
  hasActivity: boolean
  globalRank: number | null
}

const chainNameById: Record<number, string> = {
  100: "Gnosis",
  8453: "Base",
}

function loopMetadataKey(chainId: number, loopId: number) {
  return `${chainId}-${loopId}`
}

const loopMetadataByKey = new Map(
  LoopCardsData.map((loop) => [loopMetadataKey(loop.chainId, loop.id), loop])
)

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

function toLoopMetadata(stats: LoopStatsRecord): ProfileLoopMetadata {
  const loop = loopMetadataByKey.get(
    loopMetadataKey(stats.chainId, stats.loopId)
  )

  if (loop) {
    return {
      id: loop.id,
      title: loop.title,
      by: loop.by,
      sponsorName: loop.sponsorName ?? loop.by,
      address: loop.address ?? null,
      chainId: loop.chainId,
      chainName: loop.chainName,
      contractType: loop.contractType,
      logoUrl:
        loop.communityLogoUrl ?? loop.eligibilityLogoUrl ?? loop.sponsorLogoUrl,
      communityLogoUrl: loop.communityLogoUrl,
      eligibilityLogoUrl: loop.eligibilityLogoUrl,
      sponsorLogoUrl: loop.sponsorLogoUrl,
      enabled: loop.enabled,
      archived: !loop.enabled,
    }
  }

  return {
    id: stats.loopId,
    title: `Archived loop #${stats.loopId}`,
    by: "Gyralis",
    sponsorName: "Gyralis",
    address: null,
    chainId: stats.chainId,
    chainName: chainNameById[stats.chainId] ?? `Chain ${stats.chainId}`,
    contractType: "archived",
    enabled: false,
    archived: true,
  }
}

function mapLoopStats(stats: LoopStatsRecord): ProfileLoopStats {
  return {
    id: stats.id,
    userAddress: stats.userAddress,
    loopId: stats.loopId,
    chainId: stats.chainId,
    totalClaims: stats.totalClaims,
    claimPoints: stats.claimPoints,
    streakBonusPoints: stats.streakBonusPoints,
    totalPoints: stats.totalPoints,
    currentStreak: stats.currentStreak,
    longestStreak: stats.longestStreak,
    lastClaimedPeriod: stats.lastClaimedPeriod,
    earnedStreakBonuses: parseEarnedStreakBonuses(stats.earnedStreakBonuses),
    metadata: toLoopMetadata(stats),
  }
}

export function getBlockExplorerAddressUrl(chainId: number, address: string) {
  if (chainId === 100) return `https://gnosisscan.io/address/${address}`
  if (chainId === 8453) return `https://basescan.org/address/${address}`
  return null
}

export function formatProfileAddress(address: string) {
  return truncateAddress(address)
}

export async function getProfilePageData(
  rawAddress: string
): Promise<ProfilePageData | null> {
  if (!isAddress(rawAddress)) return null

  const address = normalizeDbAddress(rawAddress)
  const [profile, globalStats, loopStats, globalRank] = await Promise.all([
    getUserProfile(address),
    getUserGlobalStats(address),
    getUserLoopStatsForUser(address, {
      excludedLoopIds: ignoredScoringLoopIds,
    }),
    getGlobalLeaderboardRank(address),
  ])

  return {
    address,
    profile,
    globalStats: globalStats
      ? {
          ...globalStats,
          earnedStreakBonuses: parseEarnedStreakBonuses(
            globalStats.earnedStreakBonuses
          ),
        }
      : null,
    loopStats: loopStats.map(mapLoopStats).sort((left, right) => {
      return (
        right.totalPoints - left.totalPoints ||
        right.totalClaims - left.totalClaims ||
        left.loopId - right.loopId
      )
    }),
    hasActivity: loopStats.length > 0,
    globalRank,
  }
}
