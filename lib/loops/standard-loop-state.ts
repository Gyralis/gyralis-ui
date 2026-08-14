export type StandardLoopClaimStatus =
  | "checking"
  | "enter"
  | "entered"
  | "claimable"
  | "claimed"
  | "error"

export type StandardLoopSubmissionStage =
  | "idle"
  | "checkingEligibility"
  | "awaitingWallet"

export type StandardLoopActionPresentation = "button" | "neutral" | "success"

interface StandardLoopParticipationInput {
  claimedUsers: readonly string[]
  registeredUsers: readonly string[]
}

export function calculateStandardLoopParticipation({
  claimedUsers,
  registeredUsers,
}: StandardLoopParticipationInput) {
  const registered = new Set(registeredUsers.map((user) => user.toLowerCase()))
  const claimed = new Set(claimedUsers.map((user) => user.toLowerCase()))
  const claimedCount = Array.from(registered).filter((user) =>
    claimed.has(user)
  ).length
  const registeredCount = registered.size
  const claimRate =
    registeredCount > 0 ? Math.round((claimedCount / registeredCount) * 100) : 0

  return {
    claimedCount,
    claimRate,
    registeredCount,
  }
}

interface StandardLoopClaimStateInput {
  hasClaimed: boolean
  hasError: boolean
  isClaimable: boolean
  isEntered: boolean
  isLoading: boolean
}

export function deriveStandardLoopClaimStatus({
  hasClaimed,
  hasError,
  isClaimable,
  isEntered,
  isLoading,
}: StandardLoopClaimStateInput): StandardLoopClaimStatus {
  if (hasError) return "error"
  if (hasClaimed) return "claimed"
  if (isClaimable) return "claimable"
  if (isEntered) return "entered"
  if (isLoading) return "checking"
  return "enter"
}

export function getStandardLoopTimerTitle(status: StandardLoopClaimStatus) {
  switch (status) {
    case "entered":
      return "Claim opens in"
    case "claimable":
      return "Claim period ends in"
    case "claimed":
      return "Next claim opens in"
    default:
      return "Entry closes in"
  }
}

export function getStandardLoopActionLabel({
  amountLabel,
  isConfirming,
  pendingAction,
  status,
  submissionStage,
}: {
  amountLabel?: string
  isConfirming: boolean
  pendingAction: "enter" | "claim"
  status: StandardLoopClaimStatus
  submissionStage: StandardLoopSubmissionStage
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
    case "claimed":
      return amountLabel ? `Claimed ${amountLabel}` : "Claimed"
    case "claimable":
      return amountLabel ? `Claim ${amountLabel}` : "Claim"
    case "entered":
      return "You are in the Loop"
    case "checking":
      return "Checking your Loop status..."
    case "error":
      return "Retry status check"
    default:
      return "Enter the Loop"
  }
}

export function getStandardLoopActionPresentation({
  isPending,
  status,
  wrongNetwork,
}: {
  isPending: boolean
  status: StandardLoopClaimStatus
  wrongNetwork: boolean
}): StandardLoopActionPresentation {
  if (wrongNetwork || isPending) return "button"
  if (status === "entered") return "neutral"
  if (status === "claimed") return "success"
  return "button"
}

export function getStandardLoopActionTooltip(status: StandardLoopClaimStatus) {
  switch (status) {
    case "entered":
      return {
        title: "You’re registered for the next claim period.",
        description: "Your rewards will be available when it opens.",
      }
    case "claimed":
      return {
        title: "Your rewards were claimed successfully.",
        description: "You’re registered for the next claim period.",
      }
    case "error":
      return {
        title: "We couldn’t load your Loop status.",
        description: "Try checking again.",
      }
    default:
      return undefined
  }
}
