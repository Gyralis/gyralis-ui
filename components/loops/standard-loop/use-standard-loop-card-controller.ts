"use client"

import { useCallback, useMemo, useState } from "react"
import type { LoopCardData } from "@/data/loops-data"
import { formatUnits, isAddress } from "viem"

import { useStandardLoopBalance } from "@/lib/hooks/loops/standard/use-standard-loop-balance"
import { useStandardLoopClaim } from "@/lib/hooks/loops/standard/use-standard-loop-claim"
import { useStandardLoopParticipation } from "@/lib/hooks/loops/standard/use-standard-loop-participation"
import { useStandardLoopSettings } from "@/lib/hooks/loops/standard/use-standard-loop-settings"
import {
  getStandardLoopActionLabel,
  getStandardLoopActionPresentation,
  getStandardLoopActionTooltip,
  getStandardLoopTimerTitle,
} from "@/lib/loops/standard-loop-state"
import { trimFormattedBalance } from "@/lib/utils"
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

function formatTokenAmount(
  amount: bigint,
  token:
    | {
        decimals: number
        symbol: string
      }
    | undefined,
  decimals = 4
) {
  if (!token || amount <= 0n) return undefined

  return `${trimFormattedBalance(
    formatUnits(amount, token.decimals),
    decimals
  )} ${token.symbol}`
}

export function useStandardLoopCardController(loop: LoopCardData) {
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
  const refetchBalance = balance.refetch
  const refetchParticipation = participation.refetch
  const refetchSettings = settings.refetch
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
    void Promise.allSettled([refetchSettings(), refetchBalance()])
  }, [refetchBalance, refetchSettings])
  const refreshCardData = useCallback(async () => {
    setModalRefreshKey((key) => key + 1)
    await Promise.allSettled([
      refetchSettings(),
      refetchBalance(),
      refetchParticipation(),
    ])
  }, [refetchBalance, refetchParticipation, refetchSettings])
  const claim = useStandardLoopClaim({
    address: address ?? "0x",
    chainId: loop.chainId,
    currentPeriod: settings.data?.currentPeriod,
    eligibilityProvider: loop.eligibilityProvider,
    onConfirmed: refreshCardData,
    tokenDecimals: balance.data?.decimals,
    tokenSymbol: balance.data?.symbol,
  })

  const balanceState = useMemo<SectionState<LoopBalanceViewData>>(() => {
    const data =
      settings.data && balance.data
        ? {
            formattedBalance: trimFormattedBalance(
              formatUnits(balance.data.value, balance.data.decimals),
              1
            ),
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

    if (settings.data && balance.data) {
      const percent = Number(settings.data.percentPerPeriod)
      const distributionRate = percent === 0 ? "Infinite" : `${percent}%`
      const distributedAmountValue =
        settings.data.percentPerPeriod > 0n
          ? trimFormattedBalance(
              formatUnits(
                (balance.data.value * settings.data.percentPerPeriod) / 100n,
                balance.data.decimals
              ),
              2
            )
          : undefined
      const balanceDetail = `${trimFormattedBalance(
        formatUnits(balance.data.value, balance.data.decimals),
        2
      )} ${balance.data.symbol}`

      data = {
        balanceDetail,
        balanceDetailLabel: "Balance",
        labelDetail:
          settings.data.percentPerPeriod > 0n ? distributionRate : undefined,
        tooltip:
          settings.data.percentPerPeriod > 0n
            ? `Each claim period distributes ${distributionRate} of the balance remaining after the previous period among registered Loopers.`
            : "The loop balance is distributed evenly among registered users each period.",
        value: distributedAmountValue ?? distributionRate,
        valueUnit:
          settings.data.percentPerPeriod > 0n ? balance.data.symbol : undefined,
      }
    }

    const error = !settings.data ? settings.error ?? configError : balance.error

    return createLoopSectionState({
      data,
      error,
      errorMessage: "Failed to fetch reward distribution",
      isFetching: settings.isFetching || balance.isFetching,
      loadingMessage: "Loading rewards...",
      retry: retryDistribution,
    })
  }, [
    balance.data,
    balance.error,
    balance.isFetching,
    configError,
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
          timerTitle: getStandardLoopTimerTitle(claim.status),
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
  const amountLabel = formatTokenAmount(currentAmount, balance.data)
  const actionStatus: LoopActionStatus = claim.isPending
    ? claim.pendingAction === "claim"
      ? "claiming"
      : "entering"
    : claim.status
  const hasClaimError = claim.status === "error"
  const actionTooltip =
    claim.isPending || claim.wrongNetwork
      ? undefined
      : getStandardLoopActionTooltip(claim.status)
  const action: LoopActionViewModel = {
    status: actionStatus,
    label: getStandardLoopActionLabel({
      amountLabel,
      isConfirming: claim.isConfirming,
      pendingAction: claim.pendingAction,
      status: claim.status,
      submissionStage: claim.submissionStage,
    }),
    amountLabel,
    disabled:
      !claim.wrongNetwork &&
      (claim.isPending ||
        !address ||
        !isAddress(address) ||
        ["checking", "entered", "claimed"].includes(claim.status)),
    isPending: claim.isPending,
    presentation: getStandardLoopActionPresentation({
      isPending: claim.isPending,
      status: claim.status,
      wrongNetwork: claim.wrongNetwork,
    }),
    tooltip: actionTooltip,
    execute: hasClaimError ? claim.refetch : claim.execute,
  }

  return {
    action,
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
