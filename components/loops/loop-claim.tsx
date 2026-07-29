"use client"

import React, { useEffect, useMemo, useState } from "react"
import { LoopEligibilityProvider } from "@/data/loops-data"
import { LuCheck } from "react-icons/lu"
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
import { getLogsChunked } from "@/lib/hooks/app/get-logs-chunked"
import { useLoopTokenBalance } from "@/lib/hooks/app/use-loop-token-balance"
import { useLoopSettings } from "@/lib/hooks/app/use-next-period-start"
import { trimFormattedBalance } from "@/lib/utils"

import { Button } from "../ui/button"
import { useToast } from "../ui/use-toast"

interface LoopClaimProps {
  address: Address
  chainId: number
  contractType?: LoopContractType
  currentPeriod?: bigint
  eligibilityProvider: LoopEligibilityProvider
  compact?: boolean
  showHelper?: boolean
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
const PASSPORT_SCORE_REQUIRED_CODE = "PASSPORT_SCORE_REQUIRED"
const PROVIDER_ELIGIBILITY_REQUIRED_CODE = "PROVIDER_ELIGIBILITY_REQUIRED"

function getPassportScoreRequiredMessage(error?: string) {
  const minScore = error?.match(/at least\s+(\d+(?:\.\d+)?)/i)?.[1]

  return minScore
    ? `This loop requires a Human Passport score of ${minScore}+.`
    : "This loop requires a higher Human Passport score."
}

function getProviderEligibilityMessage(
  eligibilityProvider: LoopEligibilityProvider
) {
  switch (eligibilityProvider) {
    case "blockscout":
      return "Redeem the Gyralis offer in Blockscout Merits to enter this loop."
    case "garden_1hive":
      return "Join the 1Hive community in GardensV2 to enter this loop."
  }
}

const legacyRegisterEventAbiItem = parseAbiItem(
  "event Register(address indexed sender, uint256 indexed periodNumber)"
)
const upgradedRegisterEventAbiItem = parseAbiItem(
  "event Register(address indexed sender, address indexed token, uint256 indexed periodNumber)"
)
const LOG_LOOKBACK_BLOCKS = 100_000n

export type LoopClaimStatus =
  | "default"
  | "entered"
  | "active"
  | "claimable"
  | "claimed"

type PendingAction = "enter" | "remain" | "claim"

export const LoopClaim: React.FC<LoopClaimProps> = ({
  address,
  chainId,
  contractType = DEFAULT_LOOP_CONTRACT_TYPE,
  currentPeriod: currentPeriodOverride,
  eligibilityProvider,
  compact = false,
  onSuccess,
  onStatusChange,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>()
  const [pendingAction, setPendingAction] = useState<PendingAction>("enter")
  const [hasEnteredNextPeriod, setHasEnteredNextPeriod] = useState(false)
  const [isRegisteredForPreviousPeriod, setIsRegisteredForPreviousPeriod] =
    useState(false)
  const [isRegisteredForCurrentPeriod, setIsRegisteredForCurrentPeriod] =
    useState(false)
  const [isRegisteredForNextPeriod, setIsRegisteredForNextPeriod] =
    useState(false)
  const [registrationRefreshKey, setRegistrationRefreshKey] = useState(0)
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
  const isSuperLoop = contractType === "superLoop"

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
      functionName: loopMethods.getClaimerStatus,
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
    currentPeriodOverride ??
    (typeof currentPeriod === "bigint" ? currentPeriod : undefined)
  const previousPeriodValue =
    currentPeriodValue != null && currentPeriodValue > 0n
      ? currentPeriodValue - 1n
      : undefined

  const {
    data: currentPeriodPayout,
    refetch: refetchCurrentPeriodPayout,
    isLoading: isLoadingCurrentPeriodPayout,
  } = useReadContract({
    address,
    abi: loopAbi,
    functionName: loopMethods.getPeriodIndividualPayout,
    args: [currentPeriodValue ?? 0n],
    account: connectedAccount,
    chainId,
    query: {
      enabled: !!connectedAccount && currentPeriodValue != null,
      staleTime: 10_000,
      refetchOnWindowFocus: false,
    },
  })
  const {
    data: superLoopPreviousPeriodPayout,
    refetch: refetchSuperLoopPreviousPeriodPayout,
    isLoading: isLoadingSuperLoopPreviousPeriodPayout,
  } = useReadContract({
    address,
    abi: loopAbi,
    functionName: loopMethods.getPeriodIndividualPayout,
    args: [previousPeriodValue ?? 0n],
    account: connectedAccount,
    chainId,
    query: {
      enabled: isSuperLoop && !!connectedAccount && previousPeriodValue != null,
      staleTime: 10_000,
      refetchOnWindowFocus: false,
    },
  })
  const claimerStatusTuple = claimerStatus as
    | readonly [boolean, boolean]
    | undefined
  const isRegistered = Boolean(claimerStatusTuple?.[0])
  const hasClaimed = Boolean(claimerStatusTuple?.[1])
  const periodPayoutAmount =
    typeof currentPeriodPayout === "bigint" ? currentPeriodPayout : 0n
  const previousPeriodPayoutAmount =
    typeof superLoopPreviousPeriodPayout === "bigint"
      ? superLoopPreviousPeriodPayout
      : 0n
  const claimableAmount = isSuperLoop
    ? previousPeriodPayoutAmount
    : periodPayoutAmount
  const isClaimableNow =
    isRegistered &&
    !hasClaimed &&
    claimableAmount > 0n &&
    (!isSuperLoop || isRegisteredForPreviousPeriod)
  const isWaitingNextPeriod =
    !isSuperLoop && isRegistered && !hasClaimed && !isClaimableNow
  const isRegisteredAhead = hasEnteredNextPeriod || isRegisteredForNextPeriod
  const isWaitingForAccumulationPeriod =
    isSuperLoop &&
    isRegistered &&
    !isRegisteredForCurrentPeriod &&
    !hasClaimed &&
    !isClaimableNow
  const isActiveThisPeriod =
    isSuperLoop &&
    isRegistered &&
    !hasClaimed &&
    !isClaimableNow &&
    isRegisteredForCurrentPeriod
  const isEnteredForNextPeriod =
    (isSuperLoop
      ? isWaitingForAccumulationPeriod || isRegisteredAhead
      : isRegisteredAhead) || isWaitingNextPeriod
  const isLoadingOnchainState =
    (currentPeriodOverride == null && isLoadingCurrentPeriod) ||
    isLoadingCurrentPeriodPayout ||
    (isSuperLoop && isLoadingSuperLoopPreviousPeriodPayout)
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
    : isClaimableNow
    ? "claimable"
    : isActiveThisPeriod
    ? "active"
    : isEnteredForNextPeriod
    ? "entered"
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
    setIsRegisteredForPreviousPeriod(false)
    setIsRegisteredForCurrentPeriod(false)
    setIsRegisteredForNextPeriod(false)
    setLastClaimedAmount(undefined)
  }, [address, chainId, connectedAccount, currentPeriodValue])

  useEffect(() => {
    if (!publicClient || !connectedAccount || currentPeriodValue == null) {
      setIsRegisteredForCurrentPeriod(false)
      setIsRegisteredForNextPeriod(false)
      setIsRegisteredForPreviousPeriod(false)
      return
    }

    let cancelled = false

    const fetchPeriodRegistration = async (periodNumber: bigint) => {
      const latestBlock = await publicClient.getBlockNumber()
      const fromBlock =
        latestBlock > LOG_LOOKBACK_BLOCKS
          ? latestBlock - LOG_LOOKBACK_BLOCKS
          : 0n
      const [legacyLogs, upgradedLogs] = await Promise.all([
        getLogsChunked(publicClient, {
          address,
          event: legacyRegisterEventAbiItem,
          args: {
            sender: connectedAccount,
            periodNumber,
          },
          fromBlock,
          toBlock: "latest",
        }),
        getLogsChunked(publicClient, {
          address,
          event: upgradedRegisterEventAbiItem,
          args: {
            sender: connectedAccount,
            periodNumber,
          },
          fromBlock,
          toBlock: "latest",
        }),
      ])

      return legacyLogs.length > 0 || upgradedLogs.length > 0
    }

    const fetchPeriodRegistrations = async () => {
      try {
        const nextPeriod = currentPeriodValue + 1n
        const [registeredForPrevious, registeredForCurrent, registeredForNext] =
          await Promise.all([
            isSuperLoop && previousPeriodValue != null
              ? fetchPeriodRegistration(previousPeriodValue)
              : Promise.resolve(false),
            isSuperLoop
              ? fetchPeriodRegistration(currentPeriodValue)
              : Promise.resolve(false),
            fetchPeriodRegistration(nextPeriod),
          ])

        if (!cancelled) {
          setIsRegisteredForPreviousPeriod(registeredForPrevious)
          setIsRegisteredForCurrentPeriod(registeredForCurrent)
          setIsRegisteredForNextPeriod(registeredForNext)
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error fetching period Register logs:", error)
          setIsRegisteredForPreviousPeriod(false)
          setIsRegisteredForCurrentPeriod(false)
          setIsRegisteredForNextPeriod(false)
        }
      }
    }

    void fetchPeriodRegistrations()

    return () => {
      cancelled = true
    }
  }, [
    address,
    connectedAccount,
    currentPeriodValue,
    isSuperLoop,
    previousPeriodValue,
    publicClient,
    registrationRefreshKey,
  ])

  useEffect(() => {
    onStatusChange?.(claimStatus)
  }, [claimStatus, onStatusChange])

  useEffect(() => {
    if (!isConfirmed || !txHash) return

    if (pendingAction === "enter" || pendingAction === "remain") {
      setHasEnteredNextPeriod(true)
    } else {
      setHasEnteredNextPeriod(true)
      setLastClaimedAmount(claimableAmount)
    }

    toast({
      title:
        pendingAction === "enter"
          ? "Entered the Loop"
          : pendingAction === "remain"
          ? "Remaining Active"
          : "Transaction confirmed",
      description:
        pendingAction === "enter"
          ? isSuperLoop
            ? "You are in the loop. Accumulation starts next period."
            : "You are registered for the next period claim."
          : pendingAction === "remain"
          ? isSuperLoop
            ? "You will remain active next period."
            : "You are registered for the next period."
          : isSuperLoop
          ? "Claim confirmed. You are registered for the next active period."
          : "Claim was confirmed onchain.",
      link: blockscoutTxUrl
        ? {
            href: blockscoutTxUrl,
            label: "View transaction",
          }
        : undefined,
    } as any)

    void Promise.all([
      refetchClaimerStatus(),
      refetchSettings(),
      refetchCurrentPeriod(),
      refetchCurrentPeriodPayout(),
      refetchSuperLoopPreviousPeriodPayout(),
    ]).finally(() => {
      setRegistrationRefreshKey((key) => key + 1)
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
    refetchSuperLoopPreviousPeriodPayout,
    onSuccess,
    claimableAmount,
    isSuperLoop,
    blockscoutTxUrl,
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
        code?: string
        success?: boolean
        signature?: `0x${string}`
        error?: string
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
            link: {
              href: "/eligibilities",
              label: "See how to access",
            },
          })
          return
        }

        throw new Error(payload.error ?? "Eligibility check failed")
      }

      const nextAction: PendingAction = isClaimableNow
        ? "claim"
        : isActiveThisPeriod
        ? "remain"
        : "enter"
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
            : nextAction === "remain"
            ? "Registering for the next period..."
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
      : isActiveThisPeriod
      ? "Staying in the loop..."
      : "Entering the Loop..."
    : isConfirming
    ? pendingAction === "claim"
      ? "Confirming claim..."
      : pendingAction === "remain"
      ? "Confirming activity..."
      : "Confirming entry..."
    : hasClaimed
    ? claimedAmountLabel
      ? `Claimed ${claimedAmountLabel}`
      : "Claimed"
    : isClaimableNow
    ? claimAmountLabel
      ? `Claim ${claimAmountLabel}`
      : "Claim"
    : isActiveThisPeriod
    ? isSuperLoop
      ? "Accumulating rewards"
      : isRegisteredAhead
      ? "Accumulating rewards"
      : "Stay in the loop"
    : !isRegistered
    ? isEnteredForNextPeriod
      ? "You are in the loop"
      : "Enter the Loop"
    : isEnteredForNextPeriod
    ? "You are in the loop"
    : isLoadingOnchainState
    ? "Checking claim status..."
    : "Claim"
  const isActionDisabled =
    isSubmitting ||
    isConfirming ||
    hasClaimed ||
    !isValidLoopAddress ||
    isLoadingOnchainState ||
    (isSuperLoop
      ? isActiveThisPeriod || isEnteredForNextPeriod
      : isEnteredForNextPeriod)
  const buttonClassName = compact
    ? "min-h-10 min-w-[7.75rem] whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold tracking-normal"
    : "min-h-12 w-full rounded-full px-5 py-3 text-sm font-semibold tracking-[0.01em]"

  return (
    <div className={compact ? "inline-flex" : "w-full"}>
      <Button
        chainId={chainId}
        onClick={handleClaim}
        disabled={!wrongNetwork && isActionDisabled}
        isLoading={isSubmitting || isConfirming}
        className={buttonClassName}
      >
        {actionLabel}
        {hasClaimed ? <LuCheck className="size-4 shrink-0" /> : null}
      </Button>
    </div>
  )
}
