"use client"

import React, { useCallback, useMemo, useState } from "react"
import { LoopCardsData } from "@/data/loops-data"
import { Address, type Abi } from "viem"
import { useAccount, useReadContract, useWriteContract } from "wagmi"

import { checkEligibility } from "@/lib/checkEligibility"
import deployedContracts from "@/lib/generated/deployed-contracts"
import { useLoopSettings } from "@/lib/hooks/app/use-next-period-start"

import { Button } from "../ui/button"
import { useToast } from "../ui/use-toast"

interface LoopClaimProps {
  address: Address
  chainId: number
}

export const LoopClaim: React.FC<LoopClaimProps> = ({ address, chainId }) => {
  const { toast } = useToast()
  const { address: connectedAccount } = useAccount()

  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false)

  // 1) Match the loop meta for this rendered loop
  const loopMeta = useMemo(() => {
    const addr = address.toLowerCase()
    return LoopCardsData.find(
      (l) => l.address?.toLowerCase() === addr && l.chainId === chainId
    )
  }, [address, chainId])

  const superToken = Boolean(loopMeta?.super)

  // 2) Pick ABI based on loop type
  const loopAbi = useMemo<Abi>(() => {
    const chainKey = chainId as keyof typeof deployedContracts
    const chain = deployedContracts?.[chainKey]
    if (!chain) return []

    return superToken
      ? ((chain.streaming_loop?.abi ?? []) as Abi)
      : ((chain.loop?.abi ?? []) as Abi)
  }, [chainId, superToken])

  const { settings, currentPeriod, isLoading, refetch } = useLoopSettings(
    address,
    chainId,
    superToken
  )

  const {
    data: claimerStatus,
    refetch: refetchClaimerStatus,
    isLoading: isLoadingClaimerStatus,
  } = useReadContract({
    address,
    abi: loopAbi,
    functionName: "getClaimerStatus",
    args: [connectedAccount ?? "0x"],
    chainId,
    query: {
      enabled: Boolean(connectedAccount && !superToken && loopAbi.length),
      staleTime: 10_000,
      refetchOnWindowFocus: false,
    },
  })

  // Next period start
  const nextPeriodStart =
    settings && currentPeriod != null
      ? BigInt(settings.firstPeriodStart) +
        BigInt(settings.periodLength) * (currentPeriod + 1n)
      : undefined

  const { writeContractAsync } = useWriteContract()

  const onClaim = useCallback(async () => {
    try {
      if (!connectedAccount) {
        toast({
          title: "Connect wallet",
          description: "Please connect your wallet to continue.",
          variant: "destructive" as any,
        })
        return
      }

      if (!loopMeta) {
        toast({
          title: "Loop metadata missing",
          description:
            "Could not find this loop in LoopCardsData (address + chainId).",
          variant: "destructive" as any,
        })
        console.error("LoopClaim: loopMeta missing", { address, chainId })
        return
      }

      if (!loopMeta.eligibility) {
        toast({
          title: "Eligibility config missing",
          description: "This loop has no eligibility key configured.",
          variant: "destructive" as any,
        })
        console.error("LoopClaim: loopMeta.eligibility missing", loopMeta)
        return
      }

      if (!loopAbi.length) {
        toast({
          title: "ABI missing",
          description:
            "ABI for this loop type is missing in deployed-contracts.",
          variant: "destructive" as any,
        })
        const chainKey = chainId as keyof typeof deployedContracts
        console.error("LoopClaim: ABI missing", {
          chainId,
          superToken,
          deployedContracts: deployedContracts?.[chainKey] ?? null,
        })
        return
      }

      setIsCheckingEligibility(true)

      console.log("LoopClaim: checking eligibility", {
        loopAddress: address,
        userAddress: connectedAccount,
        chainId,
        eligibility: loopMeta.eligibility,
        superToken,
      })

      const { signature } = await checkEligibility({
        loopAddress: address,
        userAddress: connectedAccount,
        chainId,
        eligibility: loopMeta.eligibility,
      })

      console.log("LoopClaim: got signature", signature)

      toast({
        title: "Eligibility OK",
        description: "Signature generated. Please confirm the transaction.",
      })

      const functionName = superToken
        ? ("streamingClaimAndRegister" as const)
        : ("claimAndRegister" as const)

      console.log("LoopClaim: sending tx", {
        address,
        chainId,
        functionName,
        signature,
      })

      await writeContractAsync({
        address,
        abi: loopAbi,
        functionName,
        args: [signature],
        chainId,
      })

      toast({
        title: "Transaction sent",
        description: "Waiting for confirmation in your wallet.",
      })

      void refetch()
      if (!superToken) {
        void refetchClaimerStatus()
      }
    } catch (err: any) {
      console.error("LoopClaim error:", err)

      toast({
        title: "Claim failed",
        description:
          err?.shortMessage ||
          err?.message ||
          "Something went wrong while claiming.",
        variant: "destructive" as any,
      })
    } finally {
      setIsCheckingEligibility(false)
    }
  }, [
    connectedAccount,
    loopMeta,
    loopAbi,
    address,
    chainId,
    superToken,
    toast,
    writeContractAsync,
    refetch,
    refetchClaimerStatus,
  ])

  const disabled =
    isLoading ||
    isCheckingEligibility ||
    !connectedAccount ||
    !loopMeta ||
    !loopAbi.length

  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs opacity-70">
        <div>Loop: {address}</div>
        <div>Chain: {chainId}</div>
        <div>Type: {superToken ? "streaming" : "erc20"}</div>
        <div>Eligibility: {loopMeta?.eligibility ?? "unknown"}</div>
        <div>
          Current period:{" "}
          {currentPeriod != null ? currentPeriod.toString() : "—"}
        </div>
        <div>
          Next period start:{" "}
          {nextPeriodStart != null ? nextPeriodStart.toString() : "—"}
        </div>
        {!superToken && (
          <div>
            Claimer status loading: {String(isLoadingClaimerStatus)} | value:{" "}
            {claimerStatus ? JSON.stringify(claimerStatus) : "—"}
          </div>
        )}
      </div>

      <Button chainId={chainId} disabled={disabled} onClick={onClaim}>
        {isCheckingEligibility ? "Checking eligibility..." : "Claim & Register"}
      </Button>
    </div>
  )
}
