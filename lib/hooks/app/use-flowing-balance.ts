import { useEffect, useRef, useState } from "react"
import { formatUnits } from "viem"

import {
  formatTokenAmount,
  TOKEN_AMOUNT_FORMATS,
} from "@/lib/utils/token-amount"

export const SEC_TO_MONTH = 60 * 60 * 24 * 30

export function useFlowingBalance({
  balance,
  flowRatePerSecond,
  decimals,
  enabled = true,
}: {
  balance?: bigint
  flowRatePerSecond?: bigint
  decimals: number
  enabled?: boolean
}) {
  const previousFlowRateRef = useRef<bigint | undefined>()
  const liveBalanceRef = useRef<bigint | undefined>(balance)
  const [snapshot, setSnapshot] = useState<{
    balance: bigint
    timestampMs: number
  } | null>(null)
  const [liveBalance, setLiveBalance] = useState<bigint | undefined>(balance)

  useEffect(() => {
    liveBalanceRef.current = liveBalance
  }, [liveBalance])

  useEffect(() => {
    if (balance == null) return

    setSnapshot({
      balance,
      timestampMs: Date.now(),
    })
    setLiveBalance(balance)
  }, [balance])

  useEffect(() => {
    if (previousFlowRateRef.current === flowRatePerSecond) return

    previousFlowRateRef.current = flowRatePerSecond

    if (liveBalanceRef.current == null) return

    setSnapshot({
      balance: liveBalanceRef.current,
      timestampMs: Date.now(),
    })
  }, [flowRatePerSecond])

  useEffect(() => {
    if (!enabled || !snapshot || flowRatePerSecond == null) return

    let frameId: number

    const tick = () => {
      const elapsedMs = BigInt(Date.now() - snapshot.timestampMs)
      const delta = (flowRatePerSecond * elapsedMs) / 1000n

      setLiveBalance(snapshot.balance + delta)
      frameId = window.requestAnimationFrame(tick)
    }

    frameId = window.requestAnimationFrame(tick)

    return () => window.cancelAnimationFrame(frameId)
  }, [enabled, snapshot, flowRatePerSecond])

  return {
    liveBalance,
    formatted:
      liveBalance != null ? formatUnits(liveBalance, decimals) : undefined,
  }
}

export function formatFlowingDisplayValue(
  value: string | undefined,
  decimals = TOKEN_AMOUNT_FORMATS.estimate.maximumFractionDigits
) {
  return formatTokenAmount(value, {
    maximumFractionDigits: decimals,
    showSmallValues: false,
    missingValue: "0",
  })
}

export function formatMonthlyIncoming({
  flowRatePerSecond,
  decimals,
  maximumFractionDigits = TOKEN_AMOUNT_FORMATS.details.maximumFractionDigits,
  symbol,
}: {
  flowRatePerSecond?: bigint
  decimals: number
  maximumFractionDigits?: number
  symbol: string
}) {
  if (flowRatePerSecond == null) return "--"

  return `${formatTokenAmount(flowRatePerSecond * BigInt(SEC_TO_MONTH), {
    decimals,
    maximumFractionDigits,
    rounding: "round",
    useGrouping: true,
    symbol,
  })} / mo`
}
