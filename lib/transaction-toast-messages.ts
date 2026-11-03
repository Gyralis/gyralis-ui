import {
  formatTokenAmount,
  TOKEN_AMOUNT_FORMATS,
} from "@/lib/utils/token-amount"

export type TransactionAction = "claim" | "enter" | "remain"

interface ClaimedTokenTitleParams {
  amount: bigint
  decimals?: number
  symbol?: string
}

export function getClaimedTokenTitle({
  amount,
  decimals,
  symbol,
}: ClaimedTokenTitleParams) {
  if (decimals == null || !symbol) return "Rewards claimed"

  return `Claimed ${formatTokenAmount(amount, {
    decimals,
    symbol,
    ...TOKEN_AMOUNT_FORMATS.details,
  })}`
}

export function getRevertedTransactionToast(action: TransactionAction) {
  switch (action) {
    case "claim":
      return {
        title: "Claim failed",
        description: "The transaction reverted. No rewards were claimed.",
        type: "error" as const,
      }
    case "remain":
      return {
        title: "Registration failed",
        description:
          "The transaction reverted. Your registration was not renewed.",
        type: "error" as const,
      }
    case "enter":
      return {
        title: "Entry failed",
        description: "The transaction reverted. Your entry was not confirmed.",
        type: "error" as const,
      }
  }
}

export function getConfirmationDelayedToast() {
  return {
    title: "Confirmation delayed",
    description:
      "We couldn’t confirm this transaction yet. Check Blockscout for its latest status.",
    type: "warning" as const,
  }
}
