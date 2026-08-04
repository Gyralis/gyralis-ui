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
  getStandardLoopTimerTitle,
} from "@/lib/loops/standard-loop-state"
import { trimFormattedBalance } from "@/lib/utils"
import type { LoopBalanceViewData } from "@/components/loops/sections/loop-balance-section"
import type {
  LoopActionStatus,
  LoopActionViewModel,
  LoopDistributionViewData,
  LoopPeriodViewData,
  SectionState,
} from "@/components/loops/sections/loop-section-types"
import type { LoopersViewData } from "@/components/loops/sections/loopers-section"

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

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
  const refreshCardData = useCallback(async () => {
    participation.refetch()
    setModalRefreshKey((key) => key + 1)
    await Promise.allSettled([settings.refetch(), balance.refetch()])
  }, [balance, participation, settings])
  const claim = useStandardLoopClaim({
    address: address ?? "0x",
    chainId: loop.chainId,
    currentPeriod: settings.data?.currentPeriod,
    eligibilityProvider: loop.eligibilityProvider,
    onConfirmed: refreshCardData,
  })

  const balanceState = useMemo<SectionState<LoopBalanceViewData>>(() => {
    if (settings.isError) {
      return {
        status: "error",
        message: getErrorMessage(settings.error, "Failed to fetch settings"),
      }
    }
    if (balance.isError) {
      return {
        status: "error",
        message: getErrorMessage(balance.error, "Failed to fetch balance"),
      }
    }
    if (!balance.data) return { status: "loading" }

    const data = {
      formattedBalance: trimFormattedBalance(
        formatUnits(balance.data.value, balance.data.decimals),
        1
      ),
      symbol: balance.data.symbol,
    }

    return balance.isFetching
      ? { status: "refreshing", data }
      : { status: "ready", data }
  }, [
    balance.data,
    balance.error,
    balance.isError,
    balance.isFetching,
    settings,
  ])

  const distributionState = useMemo<
    SectionState<LoopDistributionViewData>
  >(() => {
    if (settings.isError) {
      return {
        status: "error",
        message: getErrorMessage(settings.error, "Failed to fetch settings"),
      }
    }
    if (balance.isError) {
      return {
        status: "error",
        message: getErrorMessage(balance.error, "Failed to fetch balance"),
      }
    }
    if (!settings.data || !balance.data) return { status: "loading" }

    const percent = Number(settings.data.percentPerPeriod)
    const value = percent === 0 ? "Infinite" : `${percent}%`
    const distributedAmount =
      settings.data.percentPerPeriod > 0n
        ? `${trimFormattedBalance(
            formatUnits(
              (balance.data.value * settings.data.percentPerPeriod) / 100n,
              balance.data.decimals
            ),
            4
          )} ${balance.data.symbol}`
        : undefined
    const balanceDetail = `${trimFormattedBalance(
      formatUnits(balance.data.value, balance.data.decimals),
      4
    )} ${balance.data.symbol}`
    const data: LoopDistributionViewData = {
      balanceDetail,
      balanceDetailLabel: "Balance",
      detail: distributedAmount,
      tooltip:
        settings.data.percentPerPeriod > 0n
          ? `Each period releases ${value} of the remaining balance, split evenly among registered users.`
          : "The loop balance is distributed evenly among registered users each period.",
      value,
    }
    const isRefreshing = settings.isFetching || balance.isFetching

    return isRefreshing
      ? { status: "refreshing", data }
      : { status: "ready", data }
  }, [balance, settings])

  const loopersState = useMemo<SectionState<LoopersViewData>>(
    () =>
      participation.isLoading
        ? { status: "loading" }
        : { status: "ready", data: participation.data },
    [participation.data, participation.isLoading]
  )

  const periodState = useMemo<SectionState<LoopPeriodViewData>>(() => {
    if (settings.isError) {
      return {
        status: "error",
        message: getErrorMessage(settings.error, "Failed to fetch period"),
      }
    }
    if (!settings.data) return { status: "loading" }

    const data = {
      nextPeriodStart:
        settings.data.firstPeriodStart +
        settings.data.periodLength * (settings.data.currentPeriod + 1n),
      timerTitle: getStandardLoopTimerTitle(claim.status),
    }

    return settings.isFetching
      ? { status: "refreshing", data }
      : { status: "ready", data }
  }, [claim.status, settings])

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
  const action: LoopActionViewModel = {
    status: actionStatus,
    label: getStandardLoopActionLabel({
      amountLabel,
      isConfirming: claim.isConfirming,
      isSubmitting: claim.isSubmitting,
      pendingAction: claim.pendingAction,
      status: claim.status,
    }),
    amountLabel,
    disabled:
      !claim.wrongNetwork &&
      (claim.isPending ||
        !address ||
        !isAddress(address) ||
        ["checking", "entered", "claimed", "error"].includes(claim.status)),
    isPending: claim.isPending,
    execute: claim.execute,
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
