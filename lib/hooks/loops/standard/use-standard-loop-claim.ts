"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { LoopEligibilityProvider } from "@/data/loops-data"
import { isAddress, zeroAddress, type Address } from "viem"
import {
  useAccount,
  useChainId,
  useReadContract,
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
import {
  deriveStandardLoopClaimStatus,
  type StandardLoopSubmissionStage,
} from "@/lib/loops/standard-loop-state"
import {
  getClaimedTokenTitle,
  getConfirmationDelayedToast,
  getRevertedTransactionToast,
} from "@/lib/transaction-toast-messages"
import { useToast } from "@/components/ui/use-toast"

import { useStandardLoopWalletRegistration } from "./use-standard-loop-wallet-registration"

const ELIGIBILITY_ENDPOINTS: Record<LoopEligibilityProvider, string> = {
  gardens: "/api/gardens",
  blockscout: "/api/blockscout",
}

const PASSPORT_SCORE_REQUIRED_CODE = "PASSPORT_SCORE_REQUIRED"
const PROVIDER_ELIGIBILITY_REQUIRED_CODE = "PROVIDER_ELIGIBILITY_REQUIRED"

type PendingAction = "enter" | "claim"

interface UseStandardLoopClaimParams {
  address: Address
  chainId: number
  currentPeriod?: bigint
  eligibilityProvider: LoopEligibilityProvider
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

export function useStandardLoopClaim({
  address,
  chainId,
  currentPeriod,
  eligibilityProvider,
  onConfirmed,
  tokenDecimals,
  tokenSymbol,
}: UseStandardLoopClaimParams) {
  const [hasEnteredNextPeriod, setHasEnteredNextPeriod] = useState(false)
  const [lastClaimedAmount, setLastClaimedAmount] = useState<bigint>()
  const [pendingAction, setPendingAction] = useState<PendingAction>("enter")
  const [submissionStage, setSubmissionStage] =
    useState<StandardLoopSubmissionStage>("idle")
  const [txHash, setTxHash] = useState<`0x${string}`>()
  const { address: connectedAccount } = useAccount()
  const currentChainId = useChainId()
  const { toast } = useToast()
  const { writeContractAsync } = useWriteContract()
  const abi = useMemo(() => getLoopContractAbi(chainId, "loop"), [chainId])
  const validAddress = isAddress(address)

  const claimerStatusQuery = useReadContract({
    address,
    abi,
    functionName: loopContractMethods.loop.getClaimerStatus,
    args: [connectedAccount ?? zeroAddress],
    chainId,
    query: {
      enabled: validAddress && Boolean(connectedAccount),
      staleTime: 10_000,
      refetchOnWindowFocus: false,
    },
  })
  const payoutQuery = useReadContract({
    address,
    abi,
    functionName: loopContractMethods.loop.getPeriodIndividualPayout,
    args: [currentPeriod ?? 0n],
    account: connectedAccount,
    chainId,
    query: {
      enabled:
        validAddress && Boolean(connectedAccount) && currentPeriod != null,
      staleTime: 10_000,
      refetchOnWindowFocus: false,
    },
  })
  const claimerStatus = claimerStatusQuery.data as
    | readonly [boolean, boolean]
    | undefined
  const isRegistered = Boolean(claimerStatus?.[0])
  const hasClaimed = Boolean(claimerStatus?.[1])
  const shouldCheckNextPeriodRegistration =
    validAddress &&
    Boolean(connectedAccount) &&
    claimerStatus != null &&
    !hasClaimed
  const registration = useStandardLoopWalletRegistration({
    address,
    chainId,
    currentPeriod,
    enabled: shouldCheckNextPeriodRegistration,
    user: connectedAccount,
  })
  const receipt = useWaitForTransactionReceipt({
    hash: txHash,
    chainId,
    query: { enabled: Boolean(txHash) },
  })
  const refetchClaimerStatus = claimerStatusQuery.refetch
  const refetchPayout = payoutQuery.refetch
  const refetchRegistration = registration.refetch
  const refreshAccountState = useCallback(async () => {
    await Promise.allSettled([refetchClaimerStatus(), refetchPayout()])
  }, [refetchClaimerStatus, refetchPayout])
  const refetch = useCallback(async () => {
    await refreshAccountState()
    if (shouldCheckNextPeriodRegistration) await refetchRegistration()
  }, [
    refetchRegistration,
    refreshAccountState,
    shouldCheckNextPeriodRegistration,
  ])
  const claimableAmount =
    typeof payoutQuery.data === "bigint" ? payoutQuery.data : 0n
  const isClaimable = isRegistered && !hasClaimed && claimableAmount > 0n
  const isEntered =
    hasEnteredNextPeriod ||
    registration.registeredForNextPeriod ||
    (isRegistered && !hasClaimed && !isClaimable)
  const isLoading = Boolean(
    connectedAccount &&
      (currentPeriod == null ||
        claimerStatusQuery.isLoading ||
        payoutQuery.isLoading ||
        registration.isLoading)
  )
  const error =
    claimerStatusQuery.error ?? payoutQuery.error ?? registration.error
  const status = deriveStandardLoopClaimStatus({
    hasClaimed,
    hasError: Boolean(error),
    isClaimable,
    isEntered,
    isLoading,
  })
  const isConfirming = receipt.isLoading
  const isPending = submissionStage !== "idle" || isConfirming
  const wrongNetwork = currentChainId !== chainId
  const transactionUrl = getBlockscoutTransactionUrl(chainId, txHash)
  const receiptStatus = receipt.data?.status

  useEffect(() => {
    setHasEnteredNextPeriod(false)
    setLastClaimedAmount(undefined)
    setPendingAction("enter")
    setSubmissionStage("idle")
    setTxHash(undefined)
  }, [address, chainId, connectedAccount, currentPeriod])

  useEffect(() => {
    if (!receipt.isSuccess || !receiptStatus || !txHash) return

    const confirmedAction = pendingAction
    const claimedAmount = claimableAmount
    const completedTransactionUrl = transactionUrl
    setTxHash(undefined)

    if (receiptStatus === "reverted") {
      toast({
        ...getRevertedTransactionToast(confirmedAction),
        link: completedTransactionUrl
          ? {
              href: completedTransactionUrl,
              label: BLOCKSCOUT_TRANSACTION_LABEL,
            }
          : undefined,
      })
      return
    }

    setHasEnteredNextPeriod(true)
    if (confirmedAction === "claim") setLastClaimedAmount(claimedAmount)

    toast({
      title:
        confirmedAction === "claim"
          ? getClaimedTokenTitle({
              amount: claimedAmount,
              decimals: tokenDecimals,
              symbol: tokenSymbol,
            })
          : "Entered the Loop",
      description: "You’re registered for the next claim period.",
      type: "success",
      link: transactionUrl
        ? { href: transactionUrl, label: BLOCKSCOUT_TRANSACTION_LABEL }
        : undefined,
    })

    void refreshAccountState().finally(() => {
      void onConfirmed?.()
    })
  }, [
    claimableAmount,
    onConfirmed,
    pendingAction,
    refreshAccountState,
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
    if (!connectedAccount) return

    if (!validAddress) {
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

    const action: PendingAction = isClaimable ? "claim" : "enter"
    setPendingAction(action)
    setSubmissionStage("checkingEligibility")

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
        functionName: loopContractMethods.loop.claimAndRegister,
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
    claimableAmount,
    error,
    execute,
    isConfirming,
    isPending,
    lastClaimedAmount,
    pendingAction,
    refetch,
    status,
    submissionStage,
    transactionUrl,
    wrongNetwork,
  }
}
