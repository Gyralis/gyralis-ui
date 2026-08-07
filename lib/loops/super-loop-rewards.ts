import type { SuperLoopClaimStatus } from "./super-loop-status"

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

interface SuperLoopRewardTooltipParams {
  claimableRewardLabel?: string
  estimatedPeriodPayoutLabel?: string
  isEstimateLoading: boolean
  status: SuperLoopClaimStatus
}

interface SuperLoopRewardValueParams {
  claimableRewardValue?: string
  status: SuperLoopClaimStatus
}

interface ResolveSuperLoopIndividualPayoutParams {
  estimatedPeriodPayout?: bigint
  isRegistered: boolean
  isRegistrationLoading: boolean
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

export function resolveSuperLoopIndividualPeriodPayout({
  estimatedPeriodPayout,
  isRegistered,
  isRegistrationLoading,
}: ResolveSuperLoopIndividualPayoutParams) {
  if (isRegistrationLoading) return undefined
  return isRegistered ? estimatedPeriodPayout : 0n
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

export function getSuperLoopRewardTooltip({
  claimableRewardLabel,
  estimatedPeriodPayoutLabel,
  isEstimateLoading,
  status,
}: SuperLoopRewardTooltipParams) {
  switch (status) {
    case "enter":
      return "Not participating. Enter the Loop."
    case "entered":
      return "Your rewards will start accumulating next period."
    case "active":
      if (estimatedPeriodPayoutLabel) {
        return `Est. daily rewards: +${estimatedPeriodPayoutLabel}`
      }
      return isEstimateLoading
        ? "Est. daily rewards: Calculating..."
        : "Est. daily rewards: 0"
    case "claimable":
      return `Daily rewards available: +${claimableRewardLabel ?? "0"}`
    case "claimed":
      return "Daily rewards claimed."
    case "checking":
      return "Checking your Loop status..."
    default:
      return "Rewards are currently unavailable."
  }
}

export function getSuperLoopRewardValue({
  claimableRewardValue,
  status,
}: SuperLoopRewardValueParams) {
  switch (status) {
    case "enter":
    case "entered":
      return "0"
    case "error":
      return "—"
    case "claimable":
      return claimableRewardValue ?? "0"
    case "claimed":
      return "0"
    default:
      return "0"
  }
}

export function superLoopRewardShowsToken(status: SuperLoopClaimStatus) {
  return ["enter", "entered", "active", "claimable", "claimed"].includes(status)
}
