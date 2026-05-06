"use client"

import React, { useEffect, useMemo, useState } from "react"
import { LoopEligibilityProvider } from "@/data/loops-data"
import { Address, formatUnits } from "viem"
import {
  useAccount,
  useBalance,
  useChainId,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi"

import deployedContracts from "@/lib/generated/deployed-contracts"
import { useLoopSettings } from "@/lib/hooks/app/use-next-period-start"
import { trimFormattedBalance } from "@/lib/utils"

import { Button } from "../ui/button"
import { useToast } from "../ui/use-toast"

interface LoopClaimProps {
  address: Address
  chainId: number
  eligibilityProvider: LoopEligibilityProvider
  onSuccess?: () => void
  onStatusChange?: (status: LoopClaimStatus) => void
}

const ELIGIBILITY_ENDPOINTS: Record<LoopEligibilityProvider, string> = {
  garden_1hive: "/api/garden-1hive",
  blockscout: "/api/blockscout",
}

export type LoopClaimStatus = "default" | "entered" | "claimable" | "claimed"

export const LoopClaim: React.FC<LoopClaimProps> = ({
  address,
  chainId,
  eligibilityProvider,
  onSuccess,
  onStatusChange,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>()
  const [pendingAction, setPendingAction] = useState<"enter" | "claim">("enter")
  const [hasEnteredNextPeriod, setHasEnteredNextPeriod] = useState(false)
  const [lastClaimedAmount, setLastClaimedAmount] = useState<bigint>()
  const { address: connectedAccount } = useAccount()
  const currentChainId = useChainId()
  const { toast } = useToast()
  const { writeContractAsync } = useWriteContract()

  const loopAbi = useMemo(() => {
    return (
      deployedContracts?.[chainId as keyof typeof deployedContracts]?.loop
        ?.abi ?? []
    )
  }, [chainId])

  const { settings, refetch: refetchSettings } = useLoopSettings(
    address,
    chainId
  )
  const { data: loopBalance } = useBalance({
    address,
    token: settings?.token,
    chainId,
    query: {
      enabled: Boolean(address && settings?.token),
    },
  })

  const { data: claimerStatus, refetch: refetchClaimerStatus } =
    useReadContract({
      address,
      abi: loopAbi,
      functionName: "getClaimerStatus",
      args: [connectedAccount ?? "0x"],
      chainId,
      query: {
        enabled: !!connectedAccount,
        staleTime: 10_000, // optional: avoid refetching too often
        refetchOnWindowFocus: false, // optional: control re-fetching behavior
      },
    })

  const {
    data: currentPeriod,
    refetch: refetchCurrentPeriod,
    isLoading: isLoadingCurrentPeriod,
  } = useReadContract({
    address,
    abi: loopAbi,
    functionName: "getCurrentPeriod",
    chainId,
    query: {
      enabled: !!connectedAccount,
      staleTime: 10_000,
      refetchOnWindowFocus: false,
    },
  })

  const {
    data: currentPeriodPayout,
    refetch: refetchCurrentPeriodPayout,
    isLoading: isLoadingCurrentPeriodPayout,
  } = useReadContract({
    address,
    abi: loopAbi,
    functionName: "getPeriodIndividualPayout",
    args: [currentPeriod ?? 0n],
    account: connectedAccount,
    chainId,
    query: {
      enabled: !!connectedAccount && currentPeriod != null,
      staleTime: 10_000,
      refetchOnWindowFocus: false,
    },
  })

  const isRegistered = Boolean(claimerStatus?.[0])
  const hasClaimed = Boolean(claimerStatus?.[1])
  const claimableAmount = currentPeriodPayout ?? 0n
  const isClaimableNow = isRegistered && !hasClaimed && claimableAmount > 0n
  const isWaitingNextPeriod = isRegistered && !hasClaimed && !isClaimableNow
  const isEnteredForNextPeriod = hasEnteredNextPeriod || isWaitingNextPeriod
  const isLoadingOnchainState =
    isLoadingCurrentPeriod || isLoadingCurrentPeriodPayout
  const isValidLoopAddress = /^0x[a-fA-F0-9]{40}$/.test(address)
  const wrongNetwork = currentChainId !== chainId
  const claimAmountLabel = loopBalance
    ? `${trimFormattedBalance(
        formatUnits(claimableAmount, loopBalance.decimals),
        4
      )} ${loopBalance.symbol}`
    : undefined
  const claimedAmount = lastClaimedAmount ?? claimableAmount
  const claimedAmountLabel =
    loopBalance && claimedAmount > 0n
      ? `${trimFormattedBalance(
          formatUnits(claimedAmount, loopBalance.decimals),
          4
        )} ${loopBalance.symbol}`
      : undefined
  const claimStatus: LoopClaimStatus = hasClaimed
    ? "claimed"
    : isEnteredForNextPeriod
    ? "entered"
    : isClaimableNow
    ? "claimable"
    : "default"

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash,
      chainId,
      query: {
        enabled: !!txHash,
      },
    })

  useEffect(() => {
    setHasEnteredNextPeriod(false)
    setLastClaimedAmount(undefined)
  }, [address, chainId, connectedAccount, currentPeriod])

  useEffect(() => {
    onStatusChange?.(claimStatus)
  }, [claimStatus, onStatusChange])

  useEffect(() => {
    if (!isConfirmed || !txHash) return

    if (pendingAction === "enter") {
      setHasEnteredNextPeriod(true)
    } else {
      setLastClaimedAmount(claimableAmount)
    }

    toast({
      title:
        pendingAction === "enter"
          ? "Entered the Loop"
          : "Transaction confirmed",
      description:
        pendingAction === "enter"
          ? "You are registered for the next period claim."
          : "Claim was confirmed onchain.",
    })

    void Promise.all([
      refetchClaimerStatus(),
      refetchSettings(),
      refetchCurrentPeriod(),
      refetchCurrentPeriodPayout(),
    ]).finally(() => {
      onSuccess?.()
    })

    setTxHash(undefined)
  }, [
    isConfirmed,
    txHash,
    pendingAction,
    refetchClaimerStatus,
    refetchSettings,
    refetchCurrentPeriod,
    refetchCurrentPeriodPayout,
    onSuccess,
    claimableAmount,
    toast,
  ])

  const handleClaim = async () => {
    if (!connectedAccount) {
      toast({
        title: "Wallet not connected",
        description: "Connect your wallet to claim.",
      })
      return
    }

    if (!isValidLoopAddress) {
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
      const endpoint = ELIGIBILITY_ENDPOINTS[eligibilityProvider]
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userAddress: connectedAccount,
          loopAddress: address,
          chainId,
        }),
      })

      const payload = (await response.json()) as {
        success?: boolean
        signature?: `0x${string}`
        error?: string
      }

      if (!response.ok || !payload.success || !payload.signature) {
        throw new Error(payload.error ?? "Eligibility check failed")
      }

      const nextAction = isClaimableNow ? "claim" : "enter"
      setPendingAction(nextAction)

      const hash = await writeContractAsync({
        address,
        abi: loopAbi,
        functionName: "claimAndRegister",
        args: [payload.signature],
        chainId,
      })
      setTxHash(hash)

      toast({
        title: "Transaction sent",
        description:
          nextAction === "claim"
            ? "Claim submitted. Waiting for confirmation..."
            : "Entering the Loop. Waiting for confirmation...",
      })
    } catch (error) {
      toast({
        title: "Claim failed",
        description:
          error instanceof Error ? error.message : "Unable to claim tokens.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const actionLabel = isSubmitting
    ? isClaimableNow && claimAmountLabel
      ? `Claiming ${claimAmountLabel}...`
      : isClaimableNow
      ? "Claiming..."
      : "Entering the Loop..."
    : isConfirming
    ? pendingAction === "claim"
      ? "Confirming claim..."
      : "Confirming entry..."
    : hasClaimed
    ? "Claimed this period"
    : !isRegistered
    ? hasEnteredNextPeriod
      ? "Entered - claim next period"
      : "Enter the Loop"
    : isEnteredForNextPeriod
    ? "Entered - claim next period"
    : isLoadingOnchainState
    ? "Checking claim status..."
    : claimAmountLabel
    ? `Claim ${claimAmountLabel}`
    : "Claim"

  return (
    <div className="space-y-1 border2 ">
      <Button
        chainId={chainId}
        onClick={handleClaim}
        disabled={
          !wrongNetwork &&
          (isSubmitting ||
            isConfirming ||
            hasClaimed ||
            !isValidLoopAddress ||
            isLoadingOnchainState ||
            isEnteredForNextPeriod)
        }
        isLoading={isSubmitting || isConfirming}
        className="min-h-[56px] w-full rounded-[1.1rem] px-5 py-3.5 text-base font-semibold tracking-[0.01em]"
      >
        {actionLabel}
      </Button>
      {isEnteredForNextPeriod && (
        <p className="rounded-[1rem] py-1 text-center text-xs font-medium text-primary">
          You are registered for the next period claim.
        </p>
      )}
      {hasClaimed && (
        <p className="rounded-[1rem] py-1 text-center text-xs font-medium text-primary">
          {claimedAmountLabel
            ? `Claimed ${claimedAmountLabel} this period. Come back next period.`
            : "Claimed this period. Come back next period."}
        </p>
      )}
    </div>
  )
}
