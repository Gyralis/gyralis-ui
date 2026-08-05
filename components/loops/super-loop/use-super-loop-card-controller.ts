"use client"

import { useCallback, useMemo } from "react"
import type { LoopCardData } from "@/data/loops-data"
import { formatUnits, isAddress } from "viem"
import { useAccount } from "wagmi"

import { formatMonthlyIncoming } from "@/lib/hooks/app/use-flowing-balance"
import { useLoopTokenBalance } from "@/lib/hooks/app/use-loop-token-balance"
import { useSuperLoopClaim } from "@/lib/hooks/loops/super/use-super-loop-claim"
import { useSuperLoopParticipation } from "@/lib/hooks/loops/super/use-super-loop-participation"
import { useSuperLoopSettings } from "@/lib/hooks/loops/super/use-super-loop-settings"
import { useSuperLoopStatus } from "@/lib/hooks/loops/super/use-super-loop-status"
import {
  calculateSuperLoopEstimatedPeriodPayout,
  getSuperLoopRewardTooltip,
  resolveSuperLoopIndividualPeriodPayout,
} from "@/lib/loops/super-loop-rewards"
import {
  deriveSuperLoopClaimStatus,
  getSuperLoopActionLabel,
  getSuperLoopTimerTitle,
  reconcileSuperLoopConfirmedStatus,
} from "@/lib/loops/super-loop-status"
import { trimFormattedBalance } from "@/lib/utils"
import { createLoopSectionState } from "@/components/loops/sections/create-loop-section-state"
import type {
  LoopActionStatus,
  LoopActionViewModel,
  LoopDistributionViewData,
  LoopPeriodViewData,
  SectionState,
} from "@/components/loops/sections/loop-section-types"
import type { LoopersViewData } from "@/components/loops/sections/loopers-section"

export function useSuperLoopCardController(loop: LoopCardData) {
  const { address: account } = useAccount()
  const address = loop.address
  const validAddress = Boolean(address && isAddress(address))
  const configError = validAddress
    ? undefined
    : new Error("Loop address is missing or invalid")
  const statusReads = useSuperLoopStatus({
    address,
    chainId: loop.chainId,
    user: account,
  })
  const settings = useSuperLoopSettings({
    address,
    chainId: loop.chainId,
  })
  const balance = useLoopTokenBalance({
    address,
    chainId: loop.chainId,
    contractType: "superLoop",
    enabled: Boolean(address && settings.data?.token),
    token: settings.data?.token,
  })
  const participation = useSuperLoopParticipation({
    address,
    chainId: loop.chainId,
    enabled: validAddress,
  })
  const refetchBalance = balance.refetch
  const refetchParticipation = participation.refetch
  const refetchSettings = settings.refetch
  const refetchStatus = statusReads.refetch
  const retryDistribution = useCallback(() => {
    void Promise.allSettled([refetchSettings(), refetchBalance()])
  }, [refetchBalance, refetchSettings])
  const retryPeriod = useCallback(() => {
    void Promise.allSettled([refetchSettings(), refetchStatus()])
  }, [refetchSettings, refetchStatus])
  const retryParticipation = useCallback(() => {
    void refetchParticipation()
  }, [refetchParticipation])
  const refreshAfterAction = useCallback(async () => {
    await Promise.allSettled([refetchParticipation(), refetchStatus()])
  }, [refetchParticipation, refetchStatus])
  const refreshCardData = useCallback(async () => {
    await Promise.allSettled([
      refetchParticipation(),
      refetchStatus(),
      refetchSettings(),
      refetchBalance(),
    ])
  }, [refetchBalance, refetchParticipation, refetchSettings, refetchStatus])
  const claimerStatus = statusReads.data.claimerStatus
  const claimableAmount = statusReads.data.owed?.total ?? 0n
  const derivedStatus = deriveSuperLoopClaimStatus({
    accountConnected: Boolean(account),
    claimerStatus,
    hasError: statusReads.isError,
    isClaimable: statusReads.data.isClaimable,
    isLoading: statusReads.isLoading,
    userPhase: statusReads.data.userPhase,
  })
  const claim = useSuperLoopClaim({
    address,
    chainId: loop.chainId,
    claimableAmount,
    currentPeriod: statusReads.data.currentPeriod,
    eligibilityProvider: loop.eligibilityProvider,
    hasClaimed: Boolean(claimerStatus?.hasClaimed),
    isClaimable: statusReads.data.isClaimable === true,
    onConfirmed: refreshAfterAction,
  })
  const status = reconcileSuperLoopConfirmedStatus({
    confirmedAction: claim.confirmedAction,
    currentPeriod: statusReads.data.currentPeriod,
    status: derivedStatus,
  })
  const accumulatingUsers = participation.data?.registeredCount
  const calculatedPeriodPayout = calculateSuperLoopEstimatedPeriodPayout({
    accumulatingUsers,
    flowRatePerSecond: balance.data?.flowRatePerSecond,
    periodLengthSeconds: settings.data?.periodLength,
  })
  const hasConfirmedEntry =
    status === "entered" && claim.confirmedAction?.action === "enter"
  const isRegistrationLoading =
    Boolean(account) &&
    claimerStatus == null &&
    !hasConfirmedEntry &&
    statusReads.isLoading &&
    !statusReads.isError
  const userIsRegistered =
    claimerStatus?.isRegistered === true || hasConfirmedEntry
  const estimatedPeriodPayout = resolveSuperLoopIndividualPeriodPayout({
    estimatedPeriodPayout: calculatedPeriodPayout,
    isRegistered: userIsRegistered,
    isRegistrationLoading,
  })
  const estimatedPeriodPayoutIsLoading =
    isRegistrationLoading ||
    (userIsRegistered &&
      calculatedPeriodPayout == null &&
      participation.isLoading &&
      !participation.isError &&
      !statusReads.isError)
  const estimatedPeriodPayoutLabel =
    balance.data && estimatedPeriodPayout != null && estimatedPeriodPayout > 0n
      ? `${trimFormattedBalance(
          formatUnits(estimatedPeriodPayout, balance.data.decimals),
          7
        )} ${balance.data.symbol}`
      : undefined
  const claimableRewardValue =
    balance.data && claimableAmount > 0n
      ? trimFormattedBalance(
          formatUnits(claimableAmount, balance.data.decimals),
          7
        )
      : undefined
  const claimableRewardLabel =
    balance.data && claimableRewardValue
      ? `${claimableRewardValue} ${balance.data.symbol}`
      : undefined
  const claimedRewardAmount =
    status === "claimed"
      ? claim.lastClaimedAmount ??
        statusReads.data.previousPeriodPayout ??
        claimableAmount
      : undefined
  const claimedRewardLabel =
    balance.data && claimedRewardAmount != null && claimedRewardAmount > 0n
      ? `${trimFormattedBalance(
          formatUnits(claimedRewardAmount, balance.data.decimals),
          7
        )} ${balance.data.symbol}`
      : undefined
  const rewardsTooltip = getSuperLoopRewardTooltip({
    claimableRewardLabel,
    claimedRewardLabel,
    estimatedPeriodPayoutLabel,
    isEstimateLoading: estimatedPeriodPayoutIsLoading,
    status,
  })
  const displayedAmount =
    status === "claimed" ? claimedRewardAmount ?? 0n : claimableAmount
  const amountLabel =
    balance.data && displayedAmount > 0n
      ? `${trimFormattedBalance(
          formatUnits(displayedAmount, balance.data.decimals),
          4
        )} ${balance.data.symbol}`
      : undefined
  const actionStatus: LoopActionStatus = claim.isPending
    ? claim.pendingAction === "claim"
      ? "claiming"
      : "entering"
    : status
  const action: LoopActionViewModel = {
    status: actionStatus,
    label: getSuperLoopActionLabel({
      amountLabel,
      isConfirming: claim.isConfirming,
      isSubmitting: claim.isSubmitting,
      pendingAction: claim.pendingAction,
      status,
    }),
    amountLabel,
    disabled:
      !claim.wrongNetwork &&
      (claim.isPending ||
        !validAddress ||
        ["checking", "entered", "active", "claimed"].includes(status)),
    isPending: claim.isPending,
    execute: status === "error" ? refetchStatus : claim.execute,
  }

  const distribution = useMemo<SectionState<LoopDistributionViewData>>(() => {
    const data =
      settings.data && balance.data
        ? {
            animation:
              status === "active" &&
              estimatedPeriodPayout != null &&
              statusReads.data.currentPeriod != null
                ? {
                    enabled: true,
                    estimatedPeriodPayout,
                    periodLengthSeconds: settings.data.periodLength,
                    periodStartSeconds:
                      settings.data.firstPeriodStart +
                      settings.data.periodLength *
                        statusReads.data.currentPeriod,
                    tokenDecimals: balance.data.decimals,
                  }
                : undefined,
            balanceDetail: balance.data.flowRateError
              ? "Unavailable"
              : formatMonthlyIncoming({
                  flowRatePerSecond: balance.data.flowRatePerSecond,
                  decimals: balance.data.decimals,
                  symbol: balance.data.symbol,
                }),
            balanceDetailLabel: "Flow Rate",
            detail: balance.data.symbol,
            isLoading: estimatedPeriodPayoutIsLoading,
            tooltip: rewardsTooltip,
            value: status === "claimable" ? claimableRewardValue ?? "0" : "0",
          }
        : undefined
    const error = !settings.data ? settings.error ?? configError : balance.error

    return createLoopSectionState({
      data,
      error,
      errorMessage: "Failed to fetch SuperLoop rewards",
      isFetching: settings.isFetching || balance.isFetching,
      loadingMessage: "Loading rewards...",
      retry: retryDistribution,
    })
  }, [
    balance.data,
    balance.error,
    balance.isFetching,
    accumulatingUsers,
    calculatedPeriodPayout,
    claimableRewardLabel,
    claimableRewardValue,
    configError,
    estimatedPeriodPayout,
    estimatedPeriodPayoutLabel,
    estimatedPeriodPayoutIsLoading,
    participation.isError,
    participation.isLoading,
    retryDistribution,
    rewardsTooltip,
    settings.data,
    settings.error,
    settings.isFetching,
    status,
    statusReads.data.currentPeriod,
  ])

  const period = useMemo<SectionState<LoopPeriodViewData>>(() => {
    const currentPeriod = statusReads.data.currentPeriod
    const data =
      settings.data && currentPeriod != null
        ? {
            nextPeriodStart:
              settings.data.firstPeriodStart +
              settings.data.periodLength * (currentPeriod + 1n),
            onCountdownComplete: refreshCardData,
            timerTitle: getSuperLoopTimerTitle(status),
          }
        : undefined
    const error = !settings.data
      ? settings.error ?? configError
      : statusReads.errors.currentPeriod

    return createLoopSectionState({
      data,
      error,
      errorMessage: "Failed to fetch SuperLoop period",
      isFetching: settings.isFetching || statusReads.isFetching,
      loadingMessage: "Loading period...",
      retry: retryPeriod,
    })
  }, [
    configError,
    refreshCardData,
    retryPeriod,
    settings.data,
    settings.error,
    settings.isFetching,
    status,
    statusReads.data.currentPeriod,
    statusReads.errors.currentPeriod,
    statusReads.isFetching,
  ])

  const loopers = useMemo<SectionState<LoopersViewData>>(() => {
    return createLoopSectionState({
      data: participation.data,
      error: configError ?? participation.error,
      errorMessage: "Failed to fetch SuperLoop participation",
      isFetching: participation.isFetching,
      loadingMessage: "Loading Loopers...",
      retry: retryParticipation,
    })
  }, [
    configError,
    participation.data,
    participation.error,
    participation.isFetching,
    retryParticipation,
  ])

  return {
    action,
    distribution,
    error:
      statusReads.error ??
      settings.error ??
      balance.error ??
      participation.error ??
      configError,
    errors: {
      balance: balance.error,
      config: configError,
      participation: participation.error,
      settings: settings.error,
      status: statusReads.errors,
    },
    isError:
      statusReads.isError ||
      settings.isError ||
      balance.isError ||
      participation.isError ||
      Boolean(configError),
    isFetching:
      statusReads.isFetching ||
      settings.isFetching ||
      balance.isFetching ||
      participation.isFetching,
    isLoading:
      statusReads.isLoading ||
      settings.isLoading ||
      balance.isLoading ||
      participation.isLoading,
    loopers,
    modalRefreshKey: participation.refreshKey,
    period,
    raw: {
      account,
      balance: balance.data,
      settings: settings.data,
      ...statusReads.data,
    },
    refresh: refreshCardData,
    status,
  }
}
