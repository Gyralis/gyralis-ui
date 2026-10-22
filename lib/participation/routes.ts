export const participationRoutes = [
  "/discover",
  "/loops",
  "/games",
  "/milestones",
  "/leaderboard",
  "/profile",
] as const

export function isParticipationRoute(pathname: string) {
  return participationRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
}
