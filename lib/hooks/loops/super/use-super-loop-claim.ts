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
  getLoopContractAbi,
  loopContractMethods,
} from "@/lib/contracts/loop-contracts"
import type { SuperLoopConfirmedAction } from "@/lib/loops/super-loop-status"
import { useToast } from "@/components/ui/use-toast"

const ELIGIBILITY_ENDPOINTS: Record<LoopEligibilityProvider, string> = {
  gardens: "/api/gardens",
  blockscout: "/api/blockscout",
}

const BLOCK_EXPLORER_TX_URLS: Record<number, string> = {
  100: "https://gnosis.blockscout.com/tx",
  10200: "https://gnosis-chiado.blockscout.com/tx",
  8453: "https://basescan.org/tx",
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
}: UseSuperLoopClaimParams) {
  const [isSubmitting, setIsSubmitting] = useState(false)
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
  const isPending = isSubmitting || isConfirming
  const wrongNetwork = currentChainId !== chainId
  const transactionUrl = txHash
    ? `${
        BLOCK_EXPLORER_TX_URLS[chainId] ?? "https://gnosis.blockscout.com/tx"
      }/${txHash}`
    : undefined

  useEffect(() => {
    setLastClaimedAmount(undefined)
  }, [address, chainId, connectedAccount, currentPeriod])

  useEffect(() => {
    setConfirmedAction(undefined)
    setPendingAction("enter")
    setTxHash(undefined)
  }, [address, chainId, connectedAccount])

  useEffect(() => {
    if (!receipt.isSuccess || !txHash) return

    const completedAction = pendingAction
    setConfirmedAction({ action: completedAction, period: currentPeriod })
    if (completedAction === "claim") setLastClaimedAmount(claimableAmount)
    setTxHash(undefined)

    toast({
      title:
        completedAction === "claim"
          ? "Transaction confirmed"
          : "Entered the Loop",
      description:
        completedAction === "claim"
          ? "Claim confirmed. You are registered for the next active period."
          : "You are in the loop. Accumulation starts next period.",
      link: transactionUrl
        ? { href: transactionUrl, label: "View transaction" }
        : undefined,
    } as any)

    void onConfirmed?.()
  }, [
    claimableAmount,
    currentPeriod,
    onConfirmed,
    pendingAction,
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
    if (!connectedAccount) {
      toast({
        title: "Wallet not connected",
        description: "Connect your wallet to enter or claim.",
      })
      return
    }

    if (!address || !isAddress(address)) {
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

      const action: SuperLoopPendingAction = isClaimable ? "claim" : "enter"
      setPendingAction(action)
      const hash = await writeContractAsync({
        address,
        abi,
        functionName: loopContractMethods.superLoop.claimAndRegister,
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
    confirmedAction,
    execute,
    isConfirming,
    isPending,
    isSubmitting,
    lastClaimedAmount,
    pendingAction,
    transactionUrl,
    wrongNetwork,
  }
}
