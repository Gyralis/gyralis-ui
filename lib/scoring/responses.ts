import { EarnedStreakBonus } from "./types"

export function parseEarnedStreakBonuses(value: unknown): EarnedStreakBonus[] {
  return Array.isArray(value)
    ? value
        .filter(
          (item): item is EarnedStreakBonus =>
            item != null &&
            typeof item === "object" &&
            typeof (item as EarnedStreakBonus).streak === "number" &&
            typeof (item as EarnedStreakBonus).points === "number"
        )
        .map((item) => ({ streak: item.streak, points: item.points }))
    : []
}

export function toRankedLeaderboardEntry<
  T extends { earnedStreakBonuses: unknown }
>(entry: T, rank: number) {
  return {
    ...entry,
    rank,
    earnedStreakBonuses: parseEarnedStreakBonuses(entry.earnedStreakBonuses),
  }
}
