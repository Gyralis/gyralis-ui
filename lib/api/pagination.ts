export function parsePagination(url: string) {
  const params = new URL(url).searchParams
  const rawLimit = Number(params.get("limit") ?? 50)
  const rawOffset = Number(params.get("offset") ?? 0)
  const limit = Number.isFinite(rawLimit)
    ? Math.trunc(Math.min(Math.max(rawLimit, 1), 100))
    : 50
  const offset = Number.isFinite(rawOffset)
    ? Math.trunc(Math.max(rawOffset, 0))
    : 0
  return { limit, offset }
}
