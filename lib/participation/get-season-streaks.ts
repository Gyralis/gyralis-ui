import { z } from "zod"

import { profileStreaksSchema } from "@/lib/profile/streak-card-state"

const seasonSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  loops: z.array(
    z.object({
      chainId: z.number().int(),
      loopId: z.number().int(),
      multiplier: z.number().positive().default(1),
    })
  ),
})

const seasonStreaksSchema = z.object({
  success: z.literal(true),
  season: seasonSchema.nullable(),
  loopStats: z.array(
    profileStreaksSchema.shape.loopStats.element.extend({
      earnedStreakBonuses: z.array(
        z.object({
          streak: z.number().int().positive(),
          points: z.number().nonnegative(),
        })
      ),
    })
  ),
})

/** Season projections only: never substitute all-time profile GP or streaks. */
export async function getSeasonStreaks(wallet: string, signal?: AbortSignal) {
  const response = await fetch(
    `/api/seasons/current/users/${wallet.toLowerCase()}/streaks`,
    { signal, cache: "no-store" }
  )
  if (!response.ok) {
    const error = await response.json().catch(() => null)
    if (
      response.status === 503 &&
      error?.error === "Season scoring rebuild required"
    ) {
      throw new Error("Season scoring rebuild required")
    }
    throw new Error("Unable to load Season streaks")
  }
  const { season, loopStats } = seasonStreaksSchema.parse(await response.json())
  if (!season && loopStats.length) throw new Error("Season snapshot mismatch")
  return { season, loopStats }
}
