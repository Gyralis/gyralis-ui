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
  getLoopContractAbi,
  loopContractMethods,
} from "@/lib/contracts/loop-contracts"
import { deriveStandardLoopClaimStatus } from "@/lib/loops/standard-loop-state"
import { useToast } from "@/components/ui/use-toast"

import { useStandardLoopWalletRegistration } from "./use-standard-loop-wallet-registration"

const ELIGIBILITY_ENDPOINTS: Record<LoopEligibilityProvider, string> = {
  garden_1hive: "/api/garden-1hive",
  blockscout: "/api/blockscout",
}

const BLOCK_EXPLORER_TX_URLS: Record<number, string> = {
  100: "https://gnosis.blockscout.com/tx",
  10200: "https://gnosis-chiado.blockscout.com/tx",
  8453: "https://basescan.org/tx",
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
    case "garden_1hive":
      return "Join the 1Hive community in GardensV2 to enter this loop."
  }
}

export function useStandardLoopClaim({
  address,
  chainId,
  currentPeriod,
  eligibilityProvider,
  onConfirmed,
}: UseStandardLoopClaimParams) {
  const [hasEnteredNextPeriod, setHasEnteredNextPeriod] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastClaimedAmount, setLastClaimedAmount] = useState<bigint>()
  const [pendingAction, setPendingAction] = useState<PendingAction>("enter")
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
  const registration = useStandardLoopWalletRegistration({
    address,
    chainId,
    currentPeriod,
    enabled: validAddress && Boolean(connectedAccount),
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
  const refetch = useCallback(async () => {
    await Promise.allSettled([
      refetchClaimerStatus(),
      refetchPayout(),
      refetchRegistration(),
    ])
  }, [refetchClaimerStatus, refetchPayout, refetchRegistration])

  const claimerStatus = claimerStatusQuery.data as
    | readonly [boolean, boolean]
    | undefined
  const isRegistered = Boolean(claimerStatus?.[0])
  const hasClaimed = Boolean(claimerStatus?.[1])
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
  const isPending = isSubmitting || isConfirming
  const wrongNetwork = currentChainId !== chainId
  const transactionUrl = txHash
    ? `${
        BLOCK_EXPLORER_TX_URLS[chainId] ?? "https://gnosis.blockscout.com/tx"
      }/${txHash}`
    : undefined

  useEffect(() => {
    setHasEnteredNextPeriod(false)
    setLastClaimedAmount(undefined)
    setTxHash(undefined)
  }, [address, chainId, connectedAccount, currentPeriod])

  useEffect(() => {
    if (!receipt.isSuccess || !txHash) return

    const confirmedAction = pendingAction
    const claimedAmount = claimableAmount
    setHasEnteredNextPeriod(true)
    if (confirmedAction === "claim") setLastClaimedAmount(claimedAmount)
    setTxHash(undefined)

    toast({
      title:
        confirmedAction === "claim"
          ? "Transaction confirmed"
          : "Entered the Loop",
      description:
        confirmedAction === "claim"
          ? "Claim was confirmed onchain."
          : "You are registered for the next period claim.",
      link: transactionUrl
        ? { href: transactionUrl, label: "View transaction" }
        : undefined,
    } as any)

    void refetch().finally(() => {
      void onConfirmed?.()
    })
  }, [
    claimableAmount,
    onConfirmed,
    pendingAction,
    refetch,
    receipt.isSuccess,
    toast,
    transactionUrl,
    txHash,
  ])

  useEffect(() => {
    if (!receipt.isError || !txHash) return

    const failedTransactionUrl = transactionUrl
    setTxHash(undefined)
    toast({
      title: "Transaction failed",
      description:
        receipt.error instanceof Error
          ? receipt.error.message
          : "The transaction was not confirmed.",
      variant: "destructive",
      link: failedTransactionUrl
        ? { href: failedTransactionUrl, label: "View transaction" }
        : undefined,
    } as any)
  }, [receipt.error, receipt.isError, toast, transactionUrl, txHash])

  const execute = async () => {
    if (!connectedAccount) return

    if (!validAddress) {
      toast({
        title: "Loop config error",
        description: "Loop address is missing or invalid.",
        variant: "destructive",
      })
      return
    }

    if (hasClaimed) {
      toast({
        title: "Already claimed",
        description: "You already claimed in this period.",
      })
      return
    }

    setIsSubmitting(true)

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
            variant: "destructive",
          })
          return
        }

        if (payload.code === PROVIDER_ELIGIBILITY_REQUIRED_CODE) {
          toast({
            title: "Not eligible yet",
            description: getProviderEligibilityMessage(eligibilityProvider),
            variant: "destructive",
            link: { href: "/eligibilities", label: "See how to access" },
          } as any)
          return
        }

        throw new Error(payload.error ?? "Eligibility check failed")
      }

      const action: PendingAction = isClaimable ? "claim" : "enter"
      setPendingAction(action)
      const hash = await writeContractAsync({
        address,
        abi,
        functionName: loopContractMethods.loop.claimAndRegister,
        args: [payload.signature],
        chainId,
      })
      setTxHash(hash)
      toast({
        title: "Transaction sent",
        description:
          action === "claim"
            ? "Claim submitted. Waiting for confirmation..."
            : "Entering the Loop. Waiting for confirmation...",
      })
    } catch (cause) {
      toast({
        title: "Claim failed",
        description:
          cause instanceof Error ? cause.message : "Unable to claim tokens.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    claimableAmount,
    error,
    execute,
    isConfirming,
    isPending,
    isSubmitting,
    lastClaimedAmount,
    pendingAction,
    refetch,
    status,
    transactionUrl,
    wrongNetwork,
  }
}
