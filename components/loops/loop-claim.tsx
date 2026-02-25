"use client"

import React, { useMemo, useState } from "react"
import { Address } from "viem"
import { useAccount, useReadContract, useWriteContract } from "wagmi"

import { LoopEligibilityProvider } from "@/data/loops-data"
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
  const [isClaiming, setIsClaiming] = useState(false)
  const { address: connectedAccount } = useAccount()
  const { toast } = useToast()
  const { writeContractAsync } = useWriteContract()

  const loopAbi = useMemo(() => {
    return (
      deployedContracts?.[chainId as keyof typeof deployedContracts]?.loop
        ?.abi ?? []
    )
  }, [chainId])

  const { refetch: refetchSettings } = useLoopSettings(
    address,
    chainId
  )

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

  const isRegistered = Boolean(claimerStatus?.[0])
  const hasClaimed = Boolean(claimerStatus?.[1])
  const isValidLoopAddress = /^0x[a-fA-F0-9]{40}$/.test(address)

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

    setIsClaiming(true)

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

      if (isRegistered) {
        await writeContractAsync({
          address,
          abi: loopAbi,
          functionName: "claim",
          chainId,
        })
      } else {
        await writeContractAsync({
          address,
          abi: loopAbi,
          functionName: "claimAndRegister",
          args: [payload.signature],
          chainId,
        })
      }

      toast({
        title: "Transaction sent",
        description: "Claim transaction submitted to your wallet.",
      })

      void Promise.all([refetchClaimerStatus(), refetchSettings()])
    } catch (error) {
      toast({
        title: "Claim failed",
        description:
          error instanceof Error ? error.message : "Unable to claim tokens.",
        variant: "destructive",
      })
    } finally {
      setIsClaiming(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        chainId={chainId}
        onClick={handleClaim}
        disabled={isClaiming || hasClaimed || !isValidLoopAddress}
        isLoading={isClaiming}
        className="w-full py-3 text-lg"
      >
        {hasClaimed ? "Already Claimed" : "Claim Tokens"}
      </Button>
    </div>
  )
}
