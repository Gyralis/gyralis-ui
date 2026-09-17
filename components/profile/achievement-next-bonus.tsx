import type { ProfileLoopStats } from "@/lib/profile/get-profile-page-data"
import { getVerifiedStreakBonus } from "@/lib/profile/get-verified-streak-bonus"

export async function AchievementNextBonus({
  loops,
}: {
  loops: ProfileLoopStats[]
}) {
  const verified = await Promise.all(
    loops.map(async (loop) => {
      const bonus = await getVerifiedStreakBonus(loop)
      return bonus ? [{ loop, bonus }] : []
    })
  )
  const closest = verified
    .flat()
    .sort(
      (left, right) =>
        left.bonus.remainingClaims - right.bonus.remainingClaims ||
        left.loop.metadata.title.localeCompare(right.loop.metadata.title)
    )[0]

  if (!closest) return null

  const { remainingClaims, points } = closest.bonus
  return (
    <p className="text-xs leading-5 text-muted-foreground">
      {remainingClaims} more consecutive {remainingClaims === 1 ? "claim" : "claims"}{" "}
      in <span className="text-foreground">{closest.loop.metadata.title}</span>{" "}
      to unlock <span className="font-medium text-primary">+{points} GP</span>.
    </p>
  )
}
