export type StandardLoopClaimStatus =
  | "checking"
  | "enter"
  | "entered"
  | "claimable"
  | "claimed"
  | "error"

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
  isSubmitting,
  pendingAction,
  status,
}: {
  amountLabel?: string
  isConfirming: boolean
  isSubmitting: boolean
  pendingAction: "enter" | "claim"
  status: StandardLoopClaimStatus
}) {
  if (isSubmitting) {
    if (status === "claimable") {
      return amountLabel ? `Claiming ${amountLabel}...` : "Claiming..."
    }
    return "Entering the Loop..."
  }

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
      return "You are in the loop"
    case "checking":
      return "Checking claim status..."
    case "error":
      return "Claim unavailable"
    default:
      return "Enter the Loop"
  }
}
