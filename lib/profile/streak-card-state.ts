import type { LoopCardData } from "@/data/loops-data"
import { z } from "zod"

import { scoringConfig } from "@/lib/scoring/config"

export const profileStreaksSchema = z.object({
  success: z.literal(true),
  loopStats: z.array(
    z.object({
      chainId: z.number().int(),
      loopId: z.number().int(),
      currentStreak: z.number().int().nonnegative(),
      longestStreak: z.number().int().nonnegative(),
      totalClaims: z.number().int().nonnegative(),
      earnedStreakBonuses: z.array(
        z.object({
          streak: z.number().int().positive(),
          points: z.number().int().nonnegative(),
        })
      ),
    })
  ),
})

export type ProfileStreakRecord = z.infer<
  typeof profileStreaksSchema
>["loopStats"][number]

export function findProfileStreak<
  T extends { chainId: number; loopId: number }
>(loop: LoopCardData, records: readonly T[]) {
  const exact = records.find(
    (record) => record.chainId === loop.chainId && record.loopId === loop.id
  )
  if (exact) return exact
  // Existing RWAGMI profile records use scoring ID 7; its current catalog ID is 9.
  // Restrict the fallback to this contract and chain, without merging records.
  if (
    loop.chainId === 8453 &&
    loop.address?.toLowerCase() === "0xe714bc7f58726490a15d2197bcded598223f5319"
  ) {
    return records.find(
      (record) => record.chainId === 8453 && record.loopId === 7
    )
  }
  return undefined
}

export function getStreakCardState(record?: ProfileStreakRecord) {
  const streak = record?.currentStreak ?? 0
  const firstUnearned = scoringConfig.streakBonuses.find(
    (milestone) =>
      !record?.earnedStreakBonuses.some(
        (bonus) => bonus.streak === milestone.streak
      )
  )
  const milestones = scoringConfig.streakBonuses.map((milestone) => ({
    ...milestone,
    status: record?.earnedStreakBonuses.some(
      (bonus) => bonus.streak === milestone.streak
    )
      ? ("completed" as const)
      : streak >= milestone.streak
      ? ("uncredited" as const)
      : streak > 0 && milestone.streak === firstUnearned?.streak
      ? ("in-progress" as const)
      : ("locked" as const),
  }))
  const completed = milestones.filter(
    (milestone) => milestone.status === "completed"
  ).length
  const goal = scoringConfig.streakBonuses.at(-1)?.streak ?? 30
  return {
    streak,
    completed,
    goal,
    milestones,
    next: milestones.find((milestone) => milestone.status !== "completed"),
  }
}
