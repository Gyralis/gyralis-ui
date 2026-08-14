import { formatUnits } from "viem"

import { trimFormattedBalance } from "@/lib/utils"

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

  const value = trimFormattedBalance(formatUnits(amount, decimals), 4)

  return `Claimed ${value} ${symbol}`
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
