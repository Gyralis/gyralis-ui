const DEFAULT_PAGE_SIZE = 1000
const MAX_PAGE_SIZE = 1000

export function parsePagination(url: string) {
  const params = new URL(url).searchParams
  const rawLimit = Number(params.get("limit") ?? DEFAULT_PAGE_SIZE)
  const rawOffset = Number(params.get("offset") ?? 0)
  const limit = Number.isFinite(rawLimit)
    ? Math.trunc(Math.min(Math.max(rawLimit, 1), MAX_PAGE_SIZE))
    : DEFAULT_PAGE_SIZE
  const offset = Number.isFinite(rawOffset)
    ? Math.trunc(Math.max(rawOffset, 0))
    : 0
  return { limit, offset }
}
