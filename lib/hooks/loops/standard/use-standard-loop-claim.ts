"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { LoopEligibilityProvider } from "@/data/loops-data"
import { isAddress, parseAbi, zeroAddress, type Address } from "viem"
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
import type { LoopActionConfirmation } from "@/lib/loops/loop-action-confirmation"
import { getSavedRwagmiToken } from "@/lib/loops/rwagmi-token-store"
import {
  deriveStandardLoopClaimStatus,
  StandardLoopPhase,
  type StandardLoopSubmissionStage,
} from "@/lib/loops/standard-loop-state"
import {
  getClaimedTokenTitle,
  getConfirmationDelayedToast,
  getRevertedTransactionToast,
} from "@/lib/transaction-toast-messages"
import { useToast } from "@/components/ui/use-toast"

const ELIGIBILITY_ENDPOINTS: Record<LoopEligibilityProvider, string> = {
  gardens: "/api/gardens",
  blockscout: "/api/blockscout",
  gyralis: "/api/gyralis",
  rwagmi: "/api/rwagmi/register",
}

const PASSPORT_SCORE_REQUIRED_CODE = "PASSPORT_SCORE_REQUIRED"
const PROVIDER_ELIGIBILITY_REQUIRED_CODE = "PROVIDER_ELIGIBILITY_REQUIRED"
const CLAIMS_REQUIRED_CODE = "CLAIMS_REQUIRED"
const USER_PHASE_ABI = parseAbi([
  "function getUserPhase(address user) view returns (uint8)",
])

type PendingAction = "enter" | "claim"

interface UseStandardLoopClaimParams {
  address: Address
  chainId: number
  currentPeriod?: bigint
  eligibilityProvider: LoopEligibilityProvider
  onConfirmed?: (confirmation: LoopActionConfirmation) => void | Promise<void>
  onClaimConfirmed?: (
    confirmation: LoopActionConfirmation
  ) => void | Promise<void>
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
    case "gyralis":
      return "Complete 50 claims in Gyralis to enter this loop."
    case "rwagmi":
      return "Connect the wallet that created your RWAGMI token to enter this loop."
  }
}

export function useStandardLoopClaim({
  address,
  chainId,
  currentPeriod,
  eligibilityProvider,
  onConfirmed,
  onClaimConfirmed,
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
  const usesUserPhase = eligibilityProvider === "rwagmi"

  const claimerStatusQuery = useReadContract({
    address,
    abi,
    functionName: loopContractMethods.loop.getClaimerStatus,
    args: [connectedAccount ?? zeroAddress],
    chainId,
    query: {
      enabled: validAddress && Boolean(connectedAccount) && !usesUserPhase,
      staleTime: 10_000,
      refetchOnWindowFocus: false,
    },
  })
  const userPhaseQuery = useReadContract({
    address,
    abi: USER_PHASE_ABI,
    functionName: "getUserPhase",
    args: [connectedAccount ?? zeroAddress],
    chainId,
    scopeKey: currentPeriod?.toString(),
    query: {
      enabled:
        validAddress &&
        Boolean(connectedAccount) &&
        usesUserPhase &&
        currentPeriod != null,
      staleTime: 10_000,
      refetchOnWindowFocus: false,
    },
  })
  const userPhase = userPhaseQuery.data
  const claimerStatus = claimerStatusQuery.data as
    | readonly [boolean, boolean]
    | undefined
  const isRegistered = usesUserPhase
    ? userPhase === StandardLoopPhase.Claimable
    : Boolean(claimerStatus?.[0])
  const hasClaimed = usesUserPhase
    ? userPhase === StandardLoopPhase.Claimed
    : Boolean(claimerStatus?.[1])
  const payoutQuery = useReadContract({
    address,
    abi,
    functionName: loopContractMethods.loop.getPeriodIndividualPayout,
    args: [currentPeriod ?? 0n],
    account: connectedAccount,
    chainId,
    query: {
      enabled:
        validAddress &&
        Boolean(connectedAccount) &&
        currentPeriod != null &&
        isRegistered &&
        !hasClaimed,
      staleTime: 10_000,
      refetchOnWindowFocus: false,
    },
  })
  const receipt = useWaitForTransactionReceipt({
    hash: txHash,
    chainId,
    query: { enabled: Boolean(txHash) },
  })
  const refetchClaimerStatus = claimerStatusQuery.refetch
  const refetchUserPhase = userPhaseQuery.refetch
  const refetchPayout = payoutQuery.refetch
  const refreshAccountState = useCallback(async () => {
    if (usesUserPhase) {
      const result = await refetchUserPhase()
      if (!result.isError && result.data === StandardLoopPhase.Claimable) {
        await refetchPayout()
      }
      return
    }
    const result = await refetchClaimerStatus()
    const freshStatus = result.data as readonly [boolean, boolean] | undefined
    if (!result.isError && freshStatus?.[0] && !freshStatus[1]) {
      await refetchPayout()
    }
  }, [refetchClaimerStatus, refetchPayout, refetchUserPhase, usesUserPhase])
  const refetch = refreshAccountState
  const claimableAmount =
    typeof payoutQuery.data === "bigint" ? payoutQuery.data : 0n
  const isClaimable = usesUserPhase
    ? userPhase === StandardLoopPhase.Claimable
    : isRegistered && !hasClaimed && claimableAmount > 0n
  const isEntered =
    hasEnteredNextPeriod ||
    (usesUserPhase && userPhase === StandardLoopPhase.Cooldown) ||
    (isRegistered && !hasClaimed && !isClaimable)
  const isLoading = Boolean(
    connectedAccount &&
      (currentPeriod == null ||
        (usesUserPhase
          ? userPhaseQuery.isLoading
          : claimerStatusQuery.isLoading) ||
        (isRegistered && !hasClaimed && payoutQuery.isLoading))
  )
  const error =
    (usesUserPhase ? userPhaseQuery.error : claimerStatusQuery.error) ??
    (isRegistered && !hasClaimed ? payoutQuery.error : undefined)
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
  const receiptBlockNumber = receipt.data?.blockNumber

  useEffect(() => {
    setHasEnteredNextPeriod(false)
    setLastClaimedAmount(undefined)
    setPendingAction("enter")
    setSubmissionStage("idle")
    setTxHash(undefined)
  }, [address, chainId, connectedAccount, currentPeriod])

  useEffect(() => {
    if (
      !receipt.isSuccess ||
      !receiptStatus ||
      !txHash ||
      receiptBlockNumber == null
    )
      return

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

    if (confirmedAction === "claim") {
      void onClaimConfirmed?.({
        action: confirmedAction,
        chainId,
        transactionHash: txHash,
        blockNumber: receiptBlockNumber,
      })
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
      void onConfirmed?.({
        action: confirmedAction,
        chainId,
        transactionHash: txHash,
        blockNumber: receiptBlockNumber,
      })
    })
  }, [
    chainId,
    claimableAmount,
    onConfirmed,
    onClaimConfirmed,
    pendingAction,
    refreshAccountState,
    receipt.isSuccess,
    receiptStatus,
    receiptBlockNumber,
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

    const rwagmiToken =
      eligibilityProvider === "rwagmi"
        ? getSavedRwagmiToken(connectedAccount)
        : undefined
    if (eligibilityProvider === "rwagmi" && !rwagmiToken) {
      toast({
        title: "Add your RWAGMI token",
        description: "Use Add token on the Loop card before registering.",
        type: "info",
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
          ...(rwagmiToken ? { tokenAddress: rwagmiToken } : {}),
        }),
      })
      const payload = (await response.json()) as {
        claimsRemaining?: number
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

        if (payload.code === CLAIMS_REQUIRED_CODE) {
          const remaining = payload.claimsRemaining
          toast({
            title: "More claims required",
            description:
              typeof remaining === "number"
                ? `${remaining} more ${
                    remaining === 1 ? "claim is" : "claims are"
                  } required to enter this loop.`
                : "Complete 50 claims in Gyralis to enter this loop.",
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
      if (
        eligibilityProvider === "rwagmi" &&
        getSavedRwagmiToken(connectedAccount) !== rwagmiToken
      ) {
        throw new Error(
          "The saved token changed. Check the new token before registering."
        )
      }
      const hash = await writeContractAsync({
        ...(eligibilityProvider === "rwagmi"
          ? { account: connectedAccount }
          : {}),
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
