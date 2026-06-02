"use client"

import React, { useEffect } from "react"
import { FaWallet } from "react-icons/fa"
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
    return <StatusCard message="Waiting for addresses..." />
  }

  if (isLoading) {
    return <StatusCard message="Fetching balance..." />
  }

  if (isError || !data) {
    return <StatusCard message="Failed to fetch balance" tone="error" />
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

  return (
    <div className="rounded-[1.45rem] border border-border/80 bg-background/35 p-5">
      <div>
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <FaWallet className="size-3.5 text-primary" />
          <p>Loop Balance</p>
        </div>

        <div className="mt-2 grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-end gap-2.5">
          <div className="min-w-0">
            <span className="block min-w-0 font-heading text-4xl font-bold leading-none tabular-nums text-primary sm:text-5xl md:text-[3.4rem]">
              {formattedBalance}
            </span>
          </div>
          <span className="mb-1 shrink-0 text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {data.symbol}
          </span>
        </div>
      </div>

      {isSuperLoop ? (
        <div className="mt-5 border-t border-border/70 pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Monthly incoming
          </p>
          <p className="mt-1.5 text-base font-semibold text-foreground">
            {monthlyIncomingLabel}
          </p>
        </div>
      ) : null}
    </div>
  )
}

const StatusCard = ({
  message,
  tone = "muted",
}: {
  message: string
  tone?: "muted" | "error"
}) => {
  return (
    <div className="rounded-[1.45rem] border border-border/80 bg-background/35 px-5 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <p
        className={`text-sm ${
          tone === "error" ? "text-destructive" : "text-muted-foreground"
        }`}
      >
        {message}
      </p>
    </div>
  )
}
