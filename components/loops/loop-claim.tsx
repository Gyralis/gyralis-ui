"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Toast } from "@radix-ui/react-toast"
import { Address } from "viem"
import { useAccount, useReadContract, useWriteContract } from "wagmi"

import deployedContracts from "@/lib/generated/deployed-contracts"
import {
  LoopSettingsProps,
  useLoopSettings,
} from "@/lib/hooks/app/use-next-period-start"

import { Button } from "../ui/button"
import { Toaster } from "../ui/toaster"
import { useToast } from "../ui/use-toast"

interface LoopClaimProps {
  address: Address
  chainId: number
}

export const LoopClaim: React.FC<LoopClaimProps> = ({ address, chainId }) => {
  const [superLoop, setSuperLoop] = useState<boolean>(false)
  const [isAddressesModalOpen, setIsAddressesModalOpen] = useState(false)

  const { address: connectedAccount } = useAccount()

  const loopAbi = useMemo(() => {
    return (
      deployedContracts?.[chainId as keyof typeof deployedContracts]?.loop
        ?.abi ?? []
    )
  }, [chainId])

  const { settings, currentPeriod, isLoading } = useLoopSettings(
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

  const nextPeriodStart =
    settings && currentPeriod != null
      ? BigInt(settings.firstPeriodStart) +
        BigInt(settings.periodLength) * (currentPeriod + 1n)
      : undefined

  return (
    <div>
      <Button chainId={chainId} onClick={() => console.log("claim button")}>
        Claim Loggic here
      </Button>
      <ExampleButton />
      {/* <Toaster /> */}
    </div>
  )
}

export function ExampleButton() {
  const { toast } = useToast()

  return (
    <button
      onClick={() =>
        toast({
          title: "Transaction Sent",
          description: "Please confirm it in your wallet.",
        })
      }
      className="rounded-lg bg-red-400 px-4 py-2 text-black"
    >
      Trigger Toast
    </button>
  )
}
