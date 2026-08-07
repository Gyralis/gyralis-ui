"use client"

import { useEffect, useMemo, useState } from "react"
import type { LoopEligibilityProvider } from "@/data/loops-data"
import { isAddress, type Address } from "viem"
import {
  useAccount,
  useChainId,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi"

import {
  BLOCKSCOUT_TRANSACTION_LABEL,
  getBlockscoutTransactionUrl,
} from "@/lib/blockscout"
import {
  getLoopContractAbi,
  loopContractMethods,
} from "@/lib/contracts/loop-contracts"
import type {
  SuperLoopConfirmedAction,
  SuperLoopSubmissionStage,
} from "@/lib/loops/super-loop-status"
import {
  getClaimedTokenTitle,
  getConfirmationDelayedToast,
  getRevertedTransactionToast,
} from "@/lib/transaction-toast-messages"
import { useToast } from "@/components/ui/use-toast"

const ELIGIBILITY_ENDPOINTS: Record<LoopEligibilityProvider, string> = {
  gardens: "/api/gardens",
  blockscout: "/api/blockscout",
}

const PASSPORT_SCORE_REQUIRED_CODE = "PASSPORT_SCORE_REQUIRED"
const PROVIDER_ELIGIBILITY_REQUIRED_CODE = "PROVIDER_ELIGIBILITY_REQUIRED"

export type SuperLoopPendingAction = "enter" | "claim"

interface UseSuperLoopClaimParams {
  address?: Address
  chainId: number
  claimableAmount: bigint
  currentPeriod?: bigint
  eligibilityProvider: LoopEligibilityProvider
  hasClaimed: boolean
  isClaimable: boolean
  onConfirmed?: () => void | Promise<void>
  tokenDecimals?: number
  tokenSymbol?: string
}

function getPassportScoreRequiredMessage(error?: string) {
  const minScore = error?.match(/at least\s+(\d+(?:\.\d+)?)/i)?.[1]

  return minScore
    ? `This loop requires a Human Passport score of ${minScore}+.`
    : "This loop requires a higher Human Passport score."
}

function getProviderEligibilityMessage(provider: LoopEligibilityProvider) {
  switch (provider) {
    case "blockscout":
      return "Redeem the Gyralis offer in Blockscout Merits to enter this loop."
    case "gardens":
      return "Join the Gardens community required by this loop to enter."
  }
}

export function useSuperLoopClaim({
  address,
  chainId,
  claimableAmount,
  currentPeriod,
  eligibilityProvider,
  hasClaimed,
  isClaimable,
  onConfirmed,
  tokenDecimals,
  tokenSymbol,
}: UseSuperLoopClaimParams) {
  const [submissionStage, setSubmissionStage] =
    useState<SuperLoopSubmissionStage>("idle")
  const [confirmedAction, setConfirmedAction] =
    useState<SuperLoopConfirmedAction>()
  const [lastClaimedAmount, setLastClaimedAmount] = useState<bigint>()
  const [pendingAction, setPendingAction] =
    useState<SuperLoopPendingAction>("enter")
  const [txHash, setTxHash] = useState<`0x${string}`>()
  const { address: connectedAccount } = useAccount()
  const currentChainId = useChainId()
  const { toast } = useToast()
  const { writeContractAsync } = useWriteContract()
  const abi = useMemo(() => getLoopContractAbi(chainId, "superLoop"), [chainId])
  const receipt = useWaitForTransactionReceipt({
    hash: txHash,
    chainId,
    query: { enabled: Boolean(txHash) },
  })
  const isConfirming = receipt.isLoading
  const isPending = submissionStage !== "idle" || isConfirming
  const wrongNetwork = currentChainId !== chainId
  const transactionUrl = getBlockscoutTransactionUrl(chainId, txHash)
  const receiptStatus = receipt.data?.status

  useEffect(() => {
    setLastClaimedAmount(undefined)
  }, [address, chainId, connectedAccount, currentPeriod])

  useEffect(() => {
    setConfirmedAction(undefined)
    setPendingAction("enter")
    setSubmissionStage("idle")
    setTxHash(undefined)
  }, [address, chainId, connectedAccount])

  useEffect(() => {
    if (!receipt.isSuccess || !receiptStatus || !txHash) return

    const completedAction = pendingAction
    const completedTransactionUrl = transactionUrl
    setTxHash(undefined)

    if (receiptStatus === "reverted") {
      toast({
        ...getRevertedTransactionToast(completedAction),
        link: completedTransactionUrl
          ? {
              href: completedTransactionUrl,
              label: BLOCKSCOUT_TRANSACTION_LABEL,
            }
          : undefined,
      })
      return
    }

    setConfirmedAction({ action: completedAction, period: currentPeriod })
    if (completedAction === "claim") setLastClaimedAmount(claimableAmount)

    toast({
      title:
        completedAction === "claim"
          ? getClaimedTokenTitle({
              amount: claimableAmount,
              decimals: tokenDecimals,
              symbol: tokenSymbol,
            })
          : "Entered the Loop",
      description:
        completedAction === "claim"
          ? "You’re registered for the next accumulation period."
          : "Your rewards will start accumulating next period.",
      type: "success",
      link: transactionUrl
        ? { href: transactionUrl, label: BLOCKSCOUT_TRANSACTION_LABEL }
        : undefined,
    })

    void onConfirmed?.()
  }, [
    claimableAmount,
    currentPeriod,
    onConfirmed,
    pendingAction,
    receipt.isSuccess,
    receiptStatus,
    toast,
    tokenDecimals,
    tokenSymbol,
    transactionUrl,
    txHash,
  ])

  useEffect(() => {
    if (!receipt.isError || !txHash) return

    const delayedTransactionUrl = transactionUrl
    setTxHash(undefined)
    toast({
      ...getConfirmationDelayedToast(),
      link: delayedTransactionUrl
        ? {
            href: delayedTransactionUrl,
            label: BLOCKSCOUT_TRANSACTION_LABEL,
          }
        : undefined,
    })
  }, [receipt.isError, toast, transactionUrl, txHash])

  const execute = async () => {
    if (!connectedAccount) {
      toast({
        title: "Wallet not connected",
        description: "Connect your wallet to enter or claim.",
        type: "info",
      })
      return
    }

    if (!address || !isAddress(address)) {
      toast({
        title: "Loop config error",
        description: "Loop address is missing or invalid.",
        type: "error",
      })
      return
    }

    if (hasClaimed) {
      toast({
        title: "Already claimed",
        description: "You already claimed in this period.",
        type: "info",
      })
      return
    }

    const action: SuperLoopPendingAction = isClaimable ? "claim" : "enter"
    setPendingAction(action)
    setSubmissionStage("checkingEligibility")
    setConfirmedAction(undefined)

    try {
      const response = await fetch(ELIGIBILITY_ENDPOINTS[eligibilityProvider], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAddress: connectedAccount,
          loopAddress: address,
          chainId,
        }),
      })
      const payload = (await response.json()) as {
        code?: string
        error?: string
        signature?: `0x${string}`
        success?: boolean
      }

      if (!response.ok || !payload.success || !payload.signature) {
        if (payload.code === PASSPORT_SCORE_REQUIRED_CODE) {
          toast({
            title: "Passport score too low",
            description: getPassportScoreRequiredMessage(payload.error),
            type: "warning",
          })
          return
        }

        if (payload.code === PROVIDER_ELIGIBILITY_REQUIRED_CODE) {
          toast({
            title: "Not eligible yet",
            description: getProviderEligibilityMessage(eligibilityProvider),
            type: "warning",
            link: { href: "/eligibilities", label: "How to enter" },
          })
          return
        }

        throw new Error(payload.error ?? "Eligibility check failed")
      }

      setSubmissionStage("awaitingWallet")
      const hash = await writeContractAsync({
        address,
        abi,
        functionName: loopContractMethods.superLoop.claimAndRegister,
        args: [payload.signature],
        chainId,
      })
      setTxHash(hash)
    } catch {
      toast({
        title: action === "claim" ? "Claim failed" : "Entry failed",
        description:
          action === "claim"
            ? "No rewards were claimed. Try again."
            : "Your entry was not confirmed. Try again.",
        type: "error",
      })
    } finally {
      setSubmissionStage("idle")
    }
  }

  return {
    confirmedAction,
    execute,
    isConfirming,
    isPending,
    lastClaimedAmount,
    pendingAction,
    submissionStage,
    transactionUrl,
    wrongNetwork,
  }
}
