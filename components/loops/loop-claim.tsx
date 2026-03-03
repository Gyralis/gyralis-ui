"use client"

import React, { useEffect, useMemo, useState } from "react"
import { LoopEligibilityProvider } from "@/data/loops-data"
import { Address } from "viem"
import {
  useAccount,
  useChainId,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi"

import deployedContracts from "@/lib/generated/deployed-contracts"
import { useLoopSettings } from "@/lib/hooks/app/use-next-period-start"

import { Button } from "../ui/button"
import { useToast } from "../ui/use-toast"

interface LoopClaimProps {
  address: Address
  chainId: number
  eligibilityProvider: LoopEligibilityProvider
}

const ELIGIBILITY_ENDPOINTS: Record<LoopEligibilityProvider, string> = {
  garden_1hive: "/api/garden-1hive",
  blockscout: "/api/blockscout",
}

export const LoopClaim: React.FC<LoopClaimProps> = ({
  address,
  chainId,
  eligibilityProvider,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>()
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

  const { refetch: refetchSettings } = useLoopSettings(address, chainId)

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
  const isLoadingOnchainState =
    isLoadingCurrentPeriod || isLoadingCurrentPeriodPayout
  const isValidLoopAddress = /^0x[a-fA-F0-9]{40}$/.test(address)
  const wrongNetwork = currentChainId !== chainId

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash,
      chainId,
      query: {
        enabled: !!txHash,
      },
    })

  useEffect(() => {
    if (!isConfirmed || !txHash) return

    toast({
      title: "Transaction confirmed",
      description: "Claim was confirmed onchain.",
    })

    void Promise.all([
      refetchClaimerStatus(),
      refetchSettings(),
      refetchCurrentPeriod(),
      refetchCurrentPeriodPayout(),
    ])

    setTxHash(undefined)
  }, [
    isConfirmed,
    txHash,
    refetchClaimerStatus,
    refetchSettings,
    refetchCurrentPeriod,
    refetchCurrentPeriodPayout,
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

      const hash = isRegistered
        ? await writeContractAsync({
            address,
            abi: loopAbi,
            functionName: "claim",
            chainId,
          })
        : await writeContractAsync({
            address,
            abi: loopAbi,
            functionName: "claimAndRegister",
            args: [payload.signature],
            chainId,
          })
      setTxHash(hash)

      toast({
        title: "Transaction sent",
        description: "Transaction submitted. Waiting for confirmation...",
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

  return (
    <div className="space-y-2">
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
            isWaitingNextPeriod)
        }
        isLoading={isSubmitting || isConfirming}
        className="w-full py-3 text-lg"
      >
        {isSubmitting
          ? "Submitting transaction..."
          : isConfirming
          ? "Confirming transaction..."
          : hasClaimed
          ? "Already Claimed"
          : !isRegistered
          ? "Register for next period"
          : isWaitingNextPeriod
          ? "Claim opens next period"
          : isLoadingOnchainState
          ? "Checking claim status..."
          : "Claim now"}
      </Button>
      {isWaitingNextPeriod && (
        <p className="text-xs text-muted-foreground">
          Registered this period. Claim opens next period.
        </p>
      )}
    </div>
  )
}
