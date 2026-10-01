export const TRUE_LOOPER_CLAIM_CHAIN_ID = 100
export const TRUE_LOOPER_CLAIM_LOOP_IDS = [3, 4] as const
export const TRUE_LOOPER_REQUIRED_CLAIMS = 50

interface LoopClaimStats {
  chainId: number
  loopId: number
  totalClaims: number
}

export interface TrueLooperClaims {
  qualifyingClaims: number
  requiredClaims: number
  claimsRemaining: number
  requirementMet: boolean
  loopIds: readonly [3, 4]
}

export function summarizeTrueLooperClaims(
  stats: readonly LoopClaimStats[]
): TrueLooperClaims {
  const qualifyingClaims = stats.reduce(
    (total, loop) =>
      loop.chainId === TRUE_LOOPER_CLAIM_CHAIN_ID &&
      TRUE_LOOPER_CLAIM_LOOP_IDS.includes(loop.loopId as 3 | 4)
        ? total + loop.totalClaims
        : total,
    0
  )

  return {
    qualifyingClaims,
    requiredClaims: TRUE_LOOPER_REQUIRED_CLAIMS,
    claimsRemaining: Math.max(
      TRUE_LOOPER_REQUIRED_CLAIMS - qualifyingClaims,
      0
    ),
    requirementMet: qualifyingClaims >= TRUE_LOOPER_REQUIRED_CLAIMS,
    loopIds: TRUE_LOOPER_CLAIM_LOOP_IDS,
  }
}
