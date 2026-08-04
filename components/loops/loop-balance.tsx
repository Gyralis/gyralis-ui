"use client"

import React, { useEffect } from "react"
import { Address, formatUnits } from "viem"

import {
  DEFAULT_LOOP_CONTRACT_TYPE,
  type LoopContractType,
} from "@/lib/contracts/loop-contracts"
import {
  formatFlowingDisplayValue,
  formatMonthlyIncoming,
  useFlowingBalance,
} from "@/lib/hooks/app/use-flowing-balance"
import { useLoopTokenBalance } from "@/lib/hooks/app/use-loop-token-balance"
import { trimFormattedBalance } from "@/lib/utils"

import {
  LoopBalanceSection,
  type LoopBalanceViewData,
} from "./sections/loop-balance-section"
import type { SectionState } from "./sections/loop-section-types"

interface LoopBalanceProps {
  address?: Address
  chainId: number
  contractType?: LoopContractType
  refreshKey?: number
  token?: Address
}

export const LoopBalance: React.FC<LoopBalanceProps> = ({
  address,
  chainId,
  contractType = DEFAULT_LOOP_CONTRACT_TYPE,
  refreshKey = 0,
  token,
}) => {
  const { data, isLoading, isError, refetch } = useLoopTokenBalance({
    address,
    chainId,
    contractType,
    token,
  })

  useEffect(() => {
    if (!address || !token) return

    void refetch()
  }, [address, token, refreshKey, refetch])

  const isSuperLoop = contractType === "superLoop"

  const flowingBalance = useFlowingBalance({
    balance: data?.value,
    flowRatePerSecond: data?.flowRatePerSecond,
    decimals: data?.decimals ?? 18,
    enabled: isSuperLoop,
  })

  if (!address || !token) {
    return (
      <LoopBalanceSection
        state={{ status: "loading", message: "Waiting for addresses..." }}
      />
    )
  }

  if (isLoading) {
    return <LoopBalanceSection state={{ status: "loading" }} />
  }

  if (isError || !data) {
    return (
      <LoopBalanceSection
        state={{ status: "error", message: "Failed to fetch balance" }}
      />
    )
  }

  const formattedBalance = isSuperLoop
    ? formatFlowingDisplayValue(flowingBalance.formatted, 7)
    : trimFormattedBalance(formatUnits(data.value, data.decimals), 1)

  const monthlyIncoming = formatMonthlyIncoming({
    flowRatePerSecond: data.flowRatePerSecond,
    decimals: data.decimals,
    symbol: data.symbol,
  })
  const monthlyIncomingLabel = data.flowRateError
    ? "Flow rate unavailable"
    : monthlyIncoming
  const balanceData: LoopBalanceViewData = {
    formattedBalance,
    symbol: data.symbol,
    secondary: isSuperLoop
      ? {
          label: "Monthly incoming",
          value: monthlyIncomingLabel,
        }
      : undefined,
  }
  const balanceState: SectionState<LoopBalanceViewData> = {
    status: "ready",
    data: balanceData,
  }

  return <LoopBalanceSection state={balanceState} />
}
