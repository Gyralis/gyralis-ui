export type SuperLoopClaimerStatus = readonly [
  isRegistered: boolean,
  hasClaimed: boolean
]

export type SuperLoopOwedAmounts = readonly [
  pendingAmount: bigint,
  currentAmount: bigint,
  total: bigint
]

export enum SuperLoopPhase {
  NotRegistered = 0,
  Cooldown = 1,
  Accumulating = 2,
  Claimable = 3,
  Claimed = 4,
}

export type SuperLoopClaimStatus =
  | "checking"
  | "enter"
  | "entered"
  | "active"
  | "claimable"
  | "claimed"
  | "error"

export interface SuperLoopConfirmedAction {
  action: "enter" | "claim"
  period?: bigint
}

export type SuperLoopSubmissionStage =
  | "idle"
  | "checkingEligibility"
  | "awaitingWallet"

export type SuperLoopActionPresentation = "button" | "neutral" | "success"

export interface NormalizedSuperLoopClaimerStatus {
  hasClaimed: boolean
  isRegistered: boolean
}

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

export function deriveSuperLoopIsClaimable({
  claimerStatus,
  owedAmounts,
  userPhase,
}: Pick<
  NormalizeSuperLoopStatusReadsParams,
  "claimerStatus" | "owedAmounts" | "userPhase"
>) {
  if (!claimerStatus || !owedAmounts || userPhase == null) return undefined

  const [isRegistered, hasClaimed] = claimerStatus
  const totalOwed = owedAmounts[2]

  return (
    isRegistered &&
    !hasClaimed &&
    userPhase === SuperLoopPhase.Claimable &&
    totalOwed > 0n
  )
}

export function deriveSuperLoopClaimStatus({
  accountConnected,
  claimerStatus,
  hasError,
  isClaimable,
  isLoading,
  userPhase,
}: {
  accountConnected: boolean
  claimerStatus?: NormalizedSuperLoopClaimerStatus
  hasError: boolean
  isClaimable?: boolean
  isLoading: boolean
  userPhase?: number
}): SuperLoopClaimStatus {
  if (!accountConnected) return "enter"
  if (!claimerStatus) return hasError ? "error" : "checking"
  if (!claimerStatus.isRegistered) return "enter"
  if (hasError) return "error"
  if (isLoading || isClaimable == null || userPhase == null) {
    return "checking"
  }
  if (claimerStatus.hasClaimed || userPhase === SuperLoopPhase.Claimed) {
    return "claimed"
  }
  if (isClaimable) return "claimable"
  if (userPhase === SuperLoopPhase.Accumulating) {
    return "active"
  }

  return "entered"
}

export function reconcileSuperLoopConfirmedStatus({
  confirmedAction,
  currentPeriod,
  status,
}: {
  confirmedAction?: SuperLoopConfirmedAction
  currentPeriod?: bigint
  status: SuperLoopClaimStatus
}): SuperLoopClaimStatus {
  if (!confirmedAction) return status

  const confirmationIsCurrent =
    confirmedAction.period == null ||
    currentPeriod == null ||
    confirmedAction.period === currentPeriod
  if (!confirmationIsCurrent) return status

  if (confirmedAction.action === "claim") return "claimed"
  if (status === "enter" || status === "checking") return "entered"

  return status
}

export function getSuperLoopTimerTitle(status: SuperLoopClaimStatus) {
  switch (status) {
    case "active":
      return "Accumulation ends in"
    case "entered":
      return "Accumulation starts in"
    case "claimable":
      return "Claim period ends in"
    case "claimed":
      return "Accumulation starts in"
    default:
      return "Entry closes in"
  }
}

export function getSuperLoopActionPresentation({
  isPending,
  status,
  wrongNetwork,
}: {
  isPending: boolean
  status: SuperLoopClaimStatus
  wrongNetwork: boolean
}): SuperLoopActionPresentation {
  if (wrongNetwork || isPending) return "button"
  if (status === "active" || status === "entered") return "neutral"
  if (status === "claimed") return "success"
  return "button"
}

export function getSuperLoopActionTooltip(status: SuperLoopClaimStatus) {
  switch (status) {
    case "entered":
      return {
        title: "You are registered for the next accumulation period.",
      }
    case "active":
      return {
        title: "Rewards are flowing in now!",
        description: "Claim them at the end of the period.",
      }
    case "claimed":
      return {
        title: "Your rewards were claimed successfully.",
        description: "You are registered for the next accumulation period.",
      }
    default:
      return undefined
  }
}

export function getSuperLoopActionLabel({
  amountLabel,
  isConfirming,
  pendingAction,
  status,
  submissionStage,
}: {
  amountLabel?: string
  isConfirming: boolean
  pendingAction: "enter" | "claim"
  status: SuperLoopClaimStatus
  submissionStage: SuperLoopSubmissionStage
}) {
  if (submissionStage === "checkingEligibility")
    return "Checking eligibility..."
  if (submissionStage === "awaitingWallet") return "Confirm in wallet..."

  if (isConfirming) {
    return pendingAction === "claim"
      ? "Confirming claim..."
      : "Confirming entry..."
  }

  switch (status) {
    case "active":
      return "Accumulating rewards"
    case "entered":
      return "You are in the Loop"
    case "claimable":
      return amountLabel ? `Claim ${amountLabel}` : "Claim"
    case "claimed":
      return amountLabel ? `Claimed ${amountLabel}` : "Claimed"
    case "checking":
      return "Checking your Loop status..."
    case "error":
      return "Retry claim status"
    default:
      return "Enter the Loop"
  }
}

export function normalizeSuperLoopStatusReads({
  claimerStatus,
  currentPeriod,
  owedAmounts,
  previousPeriodPayout,
  userPhase,
}: NormalizeSuperLoopStatusReadsParams) {
  const previousPeriod = getPreviousSuperLoopPeriod(currentPeriod)
  const isClaimable = deriveSuperLoopIsClaimable({
    claimerStatus,
    owedAmounts,
    userPhase,
  })

  return {
    claimerStatus: claimerStatus
      ? {
          hasClaimed: claimerStatus[1],
          isRegistered: claimerStatus[0],
        }
      : undefined,
    currentPeriod,
    isClaimable,
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
