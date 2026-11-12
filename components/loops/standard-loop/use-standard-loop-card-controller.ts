"use client"

import { useCallback, useMemo, useState } from "react"
import type { LoopCardData } from "@/data/loops-data"
import { isAddress } from "viem"

import { useRefreshLatestActivityAfterAction } from "@/lib/hooks/app/use-refresh-latest-activity-after-claim"
import { useRefreshTotalClaimsAfterClaim } from "@/lib/hooks/app/use-refresh-total-claims-after-claim"
import { useSyncProfileAfterClaim } from "@/lib/hooks/app/use-sync-profile-after-claim"
import { useStandardLoopBalance } from "@/lib/hooks/loops/standard/use-standard-loop-balance"
import { useStandardLoopClaim } from "@/lib/hooks/loops/standard/use-standard-loop-claim"
import { useStandardLoopParticipation } from "@/lib/hooks/loops/standard/use-standard-loop-participation"
import { useStandardLoopSettings } from "@/lib/hooks/loops/standard/use-standard-loop-settings"
import {
  formatDailyRewardAmount,
  type DailyRewardEstimate,
} from "@/lib/loops/daily-reward"
import type { LoopActionConfirmation } from "@/lib/loops/loop-action-confirmation"
import {
  getStandardLoopActionLabel,
  getStandardLoopActionPresentation,
  getStandardLoopActionTooltip,
  getStandardLoopTimerTitle,
} from "@/lib/loops/standard-loop-state"
import {
  formatTokenAmount,
  TOKEN_AMOUNT_FORMATS,
} from "@/lib/utils/token-amount"
import { createLoopSectionState } from "@/components/loops/sections/create-loop-section-state"
import type { LoopBalanceViewData } from "@/components/loops/sections/loop-balance-section"
import type {
  LoopActionStatus,
  LoopActionViewModel,
  LoopDistributionViewData,
  LoopPeriodViewData,
  SectionState,
} from "@/components/loops/sections/loop-section-types"
import type { LoopersViewData } from "@/components/loops/sections/loopers-section"

export function useStandardLoopCardController(loop: LoopCardData) {
  const refreshTotalClaimsAfterClaim = useRefreshTotalClaimsAfterClaim()
  const [modalRefreshKey, setModalRefreshKey] = useState(0)
  const address = loop.address
  const configError =
    !address || !isAddress(address)
      ? new Error("Loop address is missing or invalid")
      : undefined
  const settings = useStandardLoopSettings({
    address,
    chainId: loop.chainId,
  })
  const balance = useStandardLoopBalance({
    address,
    chainId: loop.chainId,
    enabled: Boolean(address && settings.data?.token),
    token: settings.data?.token,
  })
  const participation = useStandardLoopParticipation({
    address: address ?? "0x",
    chainId: loop.chainId,
    currentPeriod: settings.data?.currentPeriod,
    enabled: Boolean(address && settings.data),
  })
  const refreshLatestActivityAfterAction = useRefreshLatestActivityAfterAction(
    balance.data?.decimals
  )
  const syncProfileAfterClaim = useSyncProfileAfterClaim({
    contractAddress: address,
    loopId: loop.id,
    periodNumber: settings.data?.currentPeriod,
  })
  const handleClaimConfirmed = useCallback(
    async (confirmation: LoopActionConfirmation) => {
      await Promise.allSettled([
        refreshTotalClaimsAfterClaim(confirmation),
        syncProfileAfterClaim(confirmation),
      ])
    },
    [refreshTotalClaimsAfterClaim, syncProfileAfterClaim]
  )
  const refetchBalance = balance.refetch
  const refetchParticipation = participation.refetch
  const refetchSettings = settings.refetch
  const refetchCurrentPeriod = settings.refetchCurrentPeriod
  const retrySettings = useCallback(() => {
    void refetchSettings()
  }, [refetchSettings])
  const retryBalance = useCallback(() => {
    void refetchBalance()
  }, [refetchBalance])
  const retryParticipation = useCallback(() => {
    void refetchParticipation()
  }, [refetchParticipation])
  const retryDistribution = useCallback(() => {
    void Promise.allSettled([
      refetchSettings(),
      refetchBalance(),
      refetchParticipation(),
    ])
  }, [refetchBalance, refetchParticipation, refetchSettings])
  const refreshCardData = useCallback(async () => {
    setModalRefreshKey((key) => key + 1)
    await Promise.allSettled([
      refetchSettings(),
      refetchBalance(),
      refetchParticipation(),
    ])
  }, [refetchBalance, refetchParticipation, refetchSettings])
  const refreshAfterAction = useCallback(async () => {
    setModalRefreshKey((key) => key + 1)
    await Promise.allSettled([
      refetchCurrentPeriod(),
      refetchBalance(),
      refetchParticipation(),
    ])
  }, [refetchBalance, refetchCurrentPeriod, refetchParticipation])
  const claim = useStandardLoopClaim({
    address: address ?? "0x",
    chainId: loop.chainId,
    currentPeriod: settings.data?.currentPeriod,
    eligibilityProvider: loop.eligibilityProvider,
    onClaimConfirmed: handleClaimConfirmed,
    onActionConfirmed: refreshLatestActivityAfterAction,
    onConfirmed: refreshAfterAction,
    tokenDecimals: balance.data?.decimals,
    tokenSymbol: balance.data?.symbol,
  })
  const fundingUnavailable =
    balance.data != null &&
    balance.data.value <= 0n &&
    claim.status !== "claimed" &&
    claim.status !== "checking" &&
    claim.claimableAmount <= 0n

  const balanceState = useMemo<SectionState<LoopBalanceViewData>>(() => {
    const data =
      settings.data && balance.data
        ? {
            formattedBalance: formatTokenAmount(balance.data.value, {
              decimals: balance.data.decimals,
              ...TOKEN_AMOUNT_FORMATS.balance,
            }),
            symbol: balance.data.symbol,
          }
        : undefined
    const error = !settings.data ? settings.error ?? configError : balance.error

    return createLoopSectionState({
      data,
      error,
      errorMessage: "Failed to fetch balance",
      isFetching: settings.isFetching || balance.isFetching,
      loadingMessage: "Fetching balance...",
      retry: settings.data ? retryBalance : retrySettings,
    })
  }, [
    balance.data,
    balance.error,
    balance.isFetching,
    configError,
    retryBalance,
    retrySettings,
    settings.data,
    settings.error,
    settings.isFetching,
  ])

  const distributionState = useMemo<
    SectionState<LoopDistributionViewData>
  >(() => {
    let data: LoopDistributionViewData | undefined

    if (settings.data && balance.data && participation.data) {
      const percent = Number(settings.data.percentPerPeriod)
      const distributionRate = percent === 0 ? "Infinite" : `${percent}%`
      const distributedAmountValue = formatTokenAmount(
        participation.data.totalPeriodPayout,
        {
          decimals: balance.data.decimals,
          ...TOKEN_AMOUNT_FORMATS.distribution,
        }
      )
      const balanceDetail = formatTokenAmount(balance.data.value, {
        decimals: balance.data.decimals,
        ...TOKEN_AMOUNT_FORMATS.distribution,
        symbol: balance.data.symbol,
      })

      data = {
        balanceDetail,
        balanceDetailLabel: "Balance",
        tooltip: fundingUnavailable
          ? "This Loop has no balance available for rewards."
          : settings.data.percentPerPeriod > 0n
          ? `Each claim period distributes ${distributionRate} of the balance remaining after the previous period among registered Loopers.`
          : "The loop balance is distributed evenly among registered users each period.",
        value: distributedAmountValue,
        valueMuted: fundingUnavailable,
        valueUnit: balance.data.symbol,
      }
    }

    const error = !settings.data
      ? settings.error ?? configError
      : balance.error ?? participation.error

    return createLoopSectionState({
      data,
      error,
      errorMessage: "Failed to fetch reward distribution",
      isFetching:
        settings.isFetching || balance.isFetching || participation.isFetching,
      loadingMessage: "Loading rewards...",
      retry: retryDistribution,
    })
  }, [
    balance.data,
    balance.error,
    balance.isFetching,
    configError,
    fundingUnavailable,
    participation.data,
    participation.error,
    participation.isFetching,
    retryDistribution,
    settings.data,
    settings.error,
    settings.isFetching,
  ])

  const loopersState = useMemo<SectionState<LoopersViewData>>(
    () =>
      createLoopSectionState({
        data: settings.data ? participation.data : undefined,
        error: !settings.data
          ? settings.error ?? configError
          : participation.error,
        errorMessage: "Failed to fetch Loop participation",
        isFetching: settings.isFetching || participation.isFetching,
        loadingMessage: "Loading Loopers...",
        retry: settings.data ? retryParticipation : retrySettings,
      }),
    [
      configError,
      participation.data,
      participation.error,
      participation.isFetching,
      retryParticipation,
      retrySettings,
      settings.data,
      settings.error,
      settings.isFetching,
    ]
  )

  const periodState = useMemo<SectionState<LoopPeriodViewData>>(() => {
    const data = settings.data
      ? {
          nextPeriodStart:
            settings.data.firstPeriodStart +
            settings.data.periodLength * (settings.data.currentPeriod + 1n),
          timerTitle:
            settings.data.currentPeriod === 0n
              ? "Loop opens in"
              : getStandardLoopTimerTitle(claim.status),
        }
      : undefined

    return createLoopSectionState({
      data,
      error: settings.error ?? configError,
      errorMessage: "Failed to fetch period",
      isFetching: settings.isFetching,
      loadingMessage: "Loading period...",
      retry: retrySettings,
    })
  }, [
    claim.status,
    configError,
    retrySettings,
    settings.data,
    settings.error,
    settings.isFetching,
  ])

  const currentAmount =
    claim.status === "claimed"
      ? claim.lastClaimedAmount ?? claim.claimableAmount
      : claim.claimableAmount
  const amountLabel =
    balance.data && currentAmount > 0n
      ? formatTokenAmount(currentAmount, {
          decimals: balance.data.decimals,
          ...TOKEN_AMOUNT_FORMATS.claim,
          symbol: balance.data.symbol,
        })
      : undefined
  const actionStatus: LoopActionStatus = fundingUnavailable
    ? "unavailable"
    : claim.isPending
    ? claim.pendingAction === "claim"
      ? "claiming"
      : "entering"
    : claim.status
  const hasClaimError = claim.status === "error"
  const actionTooltip =
    claim.isPending || claim.wrongNetwork
      ? undefined
      : getStandardLoopActionTooltip(
          claim.status,
          loop.eligibilityProvider === "rwagmi"
            ? { registeredForNextPeriod: claim.registeredForNextPeriod }
            : undefined
        )
  const action: LoopActionViewModel =
    settings.data?.currentPeriod === 0n
      ? {
          status: "unavailable",
          label: "Waiting for next period",
          disabled: true,
          isPending: false,
          presentation: "neutral",
          tooltip: {
            title: "Loop not open yet",
            description:
              "Period 0 is the initial setup period. This Loop becomes available when the next period starts.",
          },
          execute: claim.execute,
        }
      : {
          status: actionStatus,
          label: fundingUnavailable
            ? "Out of funds"
            : getStandardLoopActionLabel({
                amountLabel,
                isConfirming: claim.isConfirming,
                pendingAction: claim.pendingAction,
                status: claim.status,
                submissionStage: claim.submissionStage,
              }),
          amountLabel,
          disabled:
            fundingUnavailable ||
            (!claim.wrongNetwork &&
              (claim.isPending ||
                !address ||
                !isAddress(address) ||
                ["checking", "entered", "claimed"].includes(claim.status))),
          isPending: claim.isPending,
          progress: claim.isPending
            ? {
                stage:
                  claim.submissionStage !== "idle"
                    ? claim.submissionStage
                    : "confirming",
                transactionUrl: claim.transactionUrl,
              }
            : undefined,
          presentation: fundingUnavailable
            ? "neutral"
            : getStandardLoopActionPresentation({
                isPending: claim.isPending,
                status: claim.status,
                wrongNetwork: claim.wrongNetwork,
              }),
          tooltip: fundingUnavailable
            ? {
                title: "Out of funds",
                description: "This Loop has no balance available for rewards.",
              }
            : actionTooltip,
          execute: hasClaimError ? claim.refetch : claim.execute,
        }

  const dailyRewards = createLoopSectionState<DailyRewardEstimate>({
    data:
      settings.data && balance.data && participation.data
        ? {
            value: formatDailyRewardAmount({
              totalPeriodPayout: participation.data.totalPeriodPayout,
              periodLength: settings.data.periodLength,
              decimals: balance.data.decimals,
            }),
            symbol: balance.data.symbol,
          }
        : undefined,
    error:
      configError ?? settings.error ?? balance.error ?? participation.error,
    errorMessage: "Daily rewards could not be loaded",
    isFetching:
      settings.isFetching || balance.isFetching || participation.isFetching,
    retry: retryDistribution,
  })

  return {
    action,
    dailyRewards,
    balance: balanceState,
    distribution: distributionState,
    loopers: loopersState,
    modalRefreshKey,
    period: periodState,
    raw: {
      currentPeriod: settings.data?.currentPeriod,
      settings: settings.data,
    },
    refresh: refreshCardData,
  }
}
