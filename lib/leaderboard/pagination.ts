export function leaderboardPageNumbers(page: number, totalPages: number) {
  const current = Math.max(1, Math.min(page, totalPages))
  const first = Math.max(1, current - 2)
  const last = Math.min(totalPages, current + 2)
  return Array.from(
    { length: Math.max(0, last - first + 1) },
    (_, i) => first + i
  )
}

export function mobileLeaderboardPageNumbers(page: number, totalPages: number) {
  const first = Math.max(1, Math.min(page - 1, totalPages - 2))
  return Array.from({ length: Math.min(3, totalPages) }, (_, i) => first + i)
}
