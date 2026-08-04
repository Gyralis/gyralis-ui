interface SuperLoopPeriodPayoutParams {
  accumulatingUsers?: number
  flowRatePerSecond?: bigint
  periodLengthSeconds?: bigint
}

interface SuperLoopAnimatedRewardParams {
  estimatedPeriodPayout: bigint
  nowMilliseconds: bigint
  periodLengthSeconds: bigint
  periodStartSeconds: bigint
}

export function calculateSuperLoopEstimatedPeriodPayout({
  accumulatingUsers,
  flowRatePerSecond,
  periodLengthSeconds,
}: SuperLoopPeriodPayoutParams) {
  if (
    accumulatingUsers == null ||
    !Number.isSafeInteger(accumulatingUsers) ||
    accumulatingUsers <= 0 ||
    flowRatePerSecond == null ||
    flowRatePerSecond <= 0n ||
    periodLengthSeconds == null ||
    periodLengthSeconds <= 0n
  ) {
    return undefined
  }

  return (flowRatePerSecond * periodLengthSeconds) / BigInt(accumulatingUsers)
}

export function calculateSuperLoopAnimatedReward({
  estimatedPeriodPayout,
  nowMilliseconds,
  periodLengthSeconds,
  periodStartSeconds,
}: SuperLoopAnimatedRewardParams) {
  if (estimatedPeriodPayout <= 0n || periodLengthSeconds <= 0n) return 0n

  const periodStartMilliseconds = periodStartSeconds * 1_000n
  const periodLengthMilliseconds = periodLengthSeconds * 1_000n
  const elapsedMilliseconds = nowMilliseconds - periodStartMilliseconds

  if (elapsedMilliseconds <= 0n) return 0n
  if (elapsedMilliseconds >= periodLengthMilliseconds) {
    return estimatedPeriodPayout
  }

  return (
    (estimatedPeriodPayout * elapsedMilliseconds) / periodLengthMilliseconds
  )
}
