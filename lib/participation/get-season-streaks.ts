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

const currentSeasonSchema = z.object({
  success: z.literal(true),
  season: seasonSchema.nullable(),
})
const seasonUserSchema = z.object({
  success: z.literal(true),
  season: seasonSchema,
  loops: z.array(
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
  const currentResponse = await fetch("/api/seasons/current", {
    signal,
    cache: "no-store",
  })
  if (!currentResponse.ok) throw new Error("Unable to load current Season")
  const { season } = currentSeasonSchema.parse(await currentResponse.json())
  if (!season) return { season: null, loopStats: [] }

  const response = await fetch(
    `/api/seasons/${encodeURIComponent(season.id)}/users/${wallet}`,
    { signal, cache: "no-store" }
  )
  if (!response.ok) throw new Error("Unable to load Season streaks")
  const data = seasonUserSchema.parse(await response.json())
  if (data.season.id !== season.id) throw new Error("Season snapshot mismatch")
  return { season: data.season, loopStats: data.loops }
}
