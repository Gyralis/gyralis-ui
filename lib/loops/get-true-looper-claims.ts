import "server-only"

import { getUserLoopStatsForUser } from "@/lib/db/clients/loop-stats.client"

import { summarizeTrueLooperClaims } from "./true-looper-claims"

export async function getTrueLooperClaims(userAddress: string) {
  const stats = await getUserLoopStatsForUser(userAddress)
  return summarizeTrueLooperClaims(stats)
}
