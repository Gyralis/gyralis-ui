export type SuperLoopClaimerStatus = readonly [
  isRegistered: boolean,
  hasClaimed: boolean
]

export type SuperLoopOwedAmounts = readonly [
  pendingAmount: bigint,
  currentAmount: bigint,
  total: bigint
]

interface NormalizeSuperLoopStatusReadsParams {
  claimerStatus?: SuperLoopClaimerStatus
  currentPeriod?: bigint
  owedAmounts?: SuperLoopOwedAmounts
  previousPeriodPayout?: bigint
  userPhase?: number
}

export function getPreviousSuperLoopPeriod(currentPeriod?: bigint) {
  return currentPeriod != null && currentPeriod > 0n
    ? currentPeriod - 1n
    : undefined
}

export function normalizeSuperLoopStatusReads({
  claimerStatus,
  currentPeriod,
  owedAmounts,
  previousPeriodPayout,
  userPhase,
}: NormalizeSuperLoopStatusReadsParams) {
  const previousPeriod = getPreviousSuperLoopPeriod(currentPeriod)

  return {
    claimerStatus: claimerStatus
      ? {
          hasClaimed: claimerStatus[1],
          isRegistered: claimerStatus[0],
        }
      : undefined,
    currentPeriod,
    owed: owedAmounts
      ? {
          currentAmount: owedAmounts[1],
          pendingAmount: owedAmounts[0],
          total: owedAmounts[2],
        }
      : undefined,
    previousPeriod,
    previousPeriodPayout:
      previousPeriod == null ? undefined : previousPeriodPayout,
    userPhase,
  }
}
