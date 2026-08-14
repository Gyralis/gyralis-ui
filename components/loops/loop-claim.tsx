"use client"

import React, { useEffect, useMemo, useState } from "react"
import { LoopEligibilityProvider } from "@/data/loops-data"
import { Address, formatUnits, parseAbiItem } from "viem"
import {
  useAccount,
  useChainId,
  usePublicClient,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi"

import {
  DEFAULT_LOOP_CONTRACT_TYPE,
  getLoopContractAbi,
  getLoopContractMethods,
  type LoopContractType,
} from "@/lib/contracts/loop-contracts"
import { useLoopTokenBalance } from "@/lib/hooks/app/use-loop-token-balance"
import { useLoopSettings } from "@/lib/hooks/app/use-next-period-start"
import { cn, trimFormattedBalance } from "@/lib/utils"

import { Button } from "../ui/button"
import { useToast } from "../ui/use-toast"

interface LoopClaimProps {
  address: Address
  chainId: number
  contractType?: LoopContractType
  eligibilityProvider: LoopEligibilityProvider
  compact?: boolean
  showHelper?: boolean
  loopId?: number | string
  onSuccess?: () => void
  onStatusChange?: (status: LoopClaimStatus) => void
}

const ELIGIBILITY_ENDPOINTS: Record<LoopEligibilityProvider, string> = {
  garden_1hive: "/api/garden-1hive",
  blockscout: "/api/blockscout",
}

const BLOCKSCOUT_TX_BASE_URLS: Record<number, string> = {
  100: "https://gnosis.blockscout.com/tx",
  10200: "https://gnosis-chiado.blockscout.com/tx",
  8453: "https://basescan.org/tx",
}

const legacyRegisterEventAbiItem = parseAbiItem(
  "event Register(address indexed sender, uint256 indexed periodNumber)"
)
const upgradedRegisterEventAbiItem = parseAbiItem(
  "event Register(address indexed sender, address indexed token, uint256 indexed periodNumber)"
)
const LOG_LOOKBACK_BLOCKS = 100_000n

export type LoopClaimStatus = "default" | "entered" | "claimable" | "claimed"

export const LoopClaim: React.FC<LoopClaimProps> = ({
  address,
  chainId,
  contractType = DEFAULT_LOOP_CONTRACT_TYPE,
  eligibilityProvider,
  compact = false,
  showHelper = true,
  loopId,
  onSuccess,
  onStatusChange,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>()
  const [pendingAction, setPendingAction] = useState<"enter" | "claim">("enter")
  const [hasEnteredNextPeriod, setHasEnteredNextPeriod] = useState(false)
  const [isRegisteredForNextPeriod, setIsRegisteredForNextPeriod] =
    useState(false)
  const [lastClaimedAmount, setLastClaimedAmount] = useState<bigint>()
  const { address: connectedAccount } = useAccount()
  const currentChainId = useChainId()
  const publicClient = usePublicClient({ chainId })
  const { toast } = useToast()
  const { writeContractAsync } = useWriteContract()

  const loopAbi = useMemo(() => {
    return getLoopContractAbi(chainId, contractType)
  }, [chainId, contractType])
  const loopMethods = useMemo(() => {
    return getLoopContractMethods(contractType)
  }, [contractType])

  const { settings, refetch: refetchSettings } = useLoopSettings(
    address,
    chainId,
    contractType
  )
  const { data: loopBalance } = useLoopTokenBalance({
    address,
    chainId,
    contractType,
    enabled: Boolean(address && settings?.token),
    token: settings?.token,
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
    functionName: loopMethods.getCurrentPeriod,
    chainId,
    query: {
      enabled: !!connectedAccount,
      staleTime: 10_000,
      refetchOnWindowFocus: false,
    },
  })

  const currentPeriodValue =
    typeof currentPeriod === "bigint" ? currentPeriod : undefined

  const {
    data: currentPeriodPayout,
    refetch: refetchCurrentPeriodPayout,
    isLoading: isLoadingCurrentPeriodPayout,
  } = useReadContract({
    address,
    abi: loopAbi,
    functionName: "getPeriodIndividualPayout",
    args: [currentPeriodValue ?? 0n],
    account: connectedAccount,
    chainId,
    query: {
      enabled: !!connectedAccount && currentPeriodValue != null,
      staleTime: 10_000,
      refetchOnWindowFocus: false,
    },
  })

  const claimerStatusTuple = claimerStatus as
    | readonly [boolean, boolean]
    | undefined
  const isRegistered = Boolean(claimerStatusTuple?.[0])
  const hasClaimed = Boolean(claimerStatusTuple?.[1])
  const claimableAmount =
    typeof currentPeriodPayout === "bigint" ? currentPeriodPayout : 0n
  const isClaimableNow = isRegistered && !hasClaimed && claimableAmount > 0n
  const isWaitingNextPeriod = isRegistered && !hasClaimed && !isClaimableNow
  const isEnteredForNextPeriod =
    hasEnteredNextPeriod || isRegisteredForNextPeriod || isWaitingNextPeriod
  const isLoadingOnchainState =
    isLoadingCurrentPeriod || isLoadingCurrentPeriodPayout
  const isValidLoopAddress = /^0x[a-fA-F0-9]{40}$/.test(address)
  const wrongNetwork = currentChainId !== chainId
  const claimAmountLabel = loopBalance
    ? `${trimFormattedBalance(
        formatUnits(claimableAmount, loopBalance.decimals),
        2
      )} ${loopBalance.symbol}`
    : undefined
  const claimedAmount = lastClaimedAmount ?? claimableAmount
  const claimedAmountLabel =
    loopBalance && claimedAmount > 0n
      ? `${trimFormattedBalance(
          formatUnits(claimedAmount, loopBalance.decimals),
          2
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
  const blockscoutTxUrl = txHash
    ? `${
        BLOCKSCOUT_TX_BASE_URLS[chainId] ?? "https://gnosis.blockscout.com/tx"
      }/${txHash}`
    : undefined

  useEffect(() => {
    setHasEnteredNextPeriod(false)
    setLastClaimedAmount(undefined)
  }, [address, chainId, connectedAccount, currentPeriodValue])

  useEffect(() => {
    if (!publicClient || !connectedAccount || currentPeriodValue == null) {
      setIsRegisteredForNextPeriod(false)
      return
    }

    let cancelled = false

    const fetchNextPeriodRegistration = async () => {
      try {
        const nextPeriod = currentPeriodValue + 1n
        const latestBlock = await publicClient.getBlockNumber()
        const fromBlock =
          latestBlock > LOG_LOOKBACK_BLOCKS
            ? latestBlock - LOG_LOOKBACK_BLOCKS
            : 0n
        const [legacyLogs, upgradedLogs] = await Promise.all([
          publicClient.getLogs({
            address,
            event: legacyRegisterEventAbiItem,
            args: {
              sender: connectedAccount,
              periodNumber: nextPeriod,
            },
            fromBlock,
            toBlock: "latest",
          }),
          publicClient.getLogs({
            address,
            event: upgradedRegisterEventAbiItem,
            args: {
              sender: connectedAccount,
              periodNumber: nextPeriod,
            },
            fromBlock,
            toBlock: "latest",
          }),
        ])

        if (!cancelled) {
          setIsRegisteredForNextPeriod(
            legacyLogs.length > 0 || upgradedLogs.length > 0
          )
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error fetching next period Register logs:", error)
          setIsRegisteredForNextPeriod(false)
        }
      }
    }

    void fetchNextPeriodRegistration()

    return () => {
      cancelled = true
    }
  }, [address, connectedAccount, currentPeriodValue, publicClient])

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
      link: blockscoutTxUrl
        ? {
            href: blockscoutTxUrl,
            label: "View transaction",
          }
        : undefined,
    } as any)

    const syncClaimScoring = async () => {
      if (
        pendingAction !== "claim" ||
        !connectedAccount ||
        currentPeriodValue == null ||
        !loopId
      ) {
        return
      }

      const response = await fetch("/api/scoring/" + connectedAccount, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txHash,
          chainId,
          contractAddress: address,
          periodNumber: Number(currentPeriodValue),
          loopId: Number(loopId),
        }),
      })

      if (!response.ok) {
        console.error("Failed to sync claim scoring", await response.text())
      }
    }

    void Promise.all([
      syncClaimScoring(),
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
    blockscoutTxUrl,
    connectedAccount,
    currentPeriodValue,
    address,
    chainId,
    loopId,
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
        functionName: loopMethods.claimAndRegister,
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
    ? isEnteredForNextPeriod
      ? "You are in the loop"
      : "Enter the Loop"
    : isEnteredForNextPeriod
    ? "You are in the loop"
    : isLoadingOnchainState
    ? "Checking claim status..."
    : claimAmountLabel
    ? `Claim ${claimAmountLabel}`
    : "Claim"
  const buttonClassName = compact
    ? "min-h-10 min-w-[7.75rem] whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold tracking-normal"
    : "min-h-[56px] w-full rounded-[1.1rem] px-5 py-3.5 text-base font-semibold tracking-[0.01em]"

  return (
    <div className={cn(showHelper ? "space-y-1" : "inline-flex")}>
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
        className={buttonClassName}
      >
        {actionLabel}
      </Button>
      {showHelper && isEnteredForNextPeriod && !hasClaimed && (
        <p className="rounded-2xl py-1 text-center text-xs font-medium text-primary">
          You are registered for the next period claim.
        </p>
      )}
      {showHelper && hasClaimed && (
        <p className="rounded-2xl py-1 text-center text-xs font-medium text-primary">
          {claimedAmountLabel
            ? `Claimed ${claimedAmountLabel} this period. Come back next period.`
            : "Claimed this period. Come back next period."}
        </p>
      )}
    </div>
  )
}
