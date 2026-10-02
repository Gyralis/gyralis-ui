export const ignoredScoringLoopIds = [1, 2] as const

const ignoredScoringLoopIdSet = new Set<number>(ignoredScoringLoopIds)

export function isIgnoredScoringLoopId(loopId: number) {
  return ignoredScoringLoopIdSet.has(loopId)
}

export function isIncludedScoringLoopId(loopId: number) {
  return !isIgnoredScoringLoopId(loopId)
}
