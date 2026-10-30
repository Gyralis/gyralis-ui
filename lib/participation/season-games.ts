import { seasonPhases, type PreviewState } from "./season-preview"

// Objective examples for UX review. Rewards remain unpublished until approved.
export const seasonGames = [
  {
    id: "sprint",
    title: "30-Day Sprint",
    type: "Consistency",
    description: "Make a qualifying claim on each day of the Season.",
    target: 30,
    unit: "active days",
    art: "/images/img_2.png",
  },
  {
    id: "race",
    title: "First 50 to 20 claims",
    type: "Claim Race",
    description: "Be among the first 50 entrants to reach 20 eligible claims.",
    target: 20,
    unit: "claims",
    art: "/images/super_loops_img.png",
  },
  {
    id: "explorer",
    title: "Find your next Loop",
    type: "Explorer",
    description: "Discover and claim from five different Season Loops.",
    target: 5,
    unit: "Loops",
    art: "/images/img_1.png",
  },
  {
    id: "marathon",
    title: "The long game",
    type: "Consistency",
    description: "Claim on 25 different days during the 30-day Season.",
    target: 25,
    unit: "active days",
    art: "/images/loop_img.png",
  },
] as const
export function seasonGameProgress(id: string, state: PreviewState) {
  if (id === "race")
    return (
      state.loops.reduce((sum, loop) => sum + loop.claims, 0) +
      Number(state.dayClaimed)
    )
  if (id === "explorer")
    return state.loops.filter((loop) => loop.claims > 0).length
  const baseDays =
    state.phase === "registration"
      ? 0
      : state.phase === "late"
      ? 1
      : state.phase === "prizes"
      ? 28
      : 11
  return Math.min(
    seasonPhases[state.phase].day,
    baseDays +
      Number(state.loops.some((loop) => loop.claimedToday) || state.dayClaimed)
  )
}
