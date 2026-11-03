"use client"

import { useEffect, useRef, useState } from "react"

import { calculateSuperLoopAnimatedReward } from "@/lib/loops/super-loop-rewards"
import {
  formatTokenAmount,
  TOKEN_AMOUNT_FORMATS,
} from "@/lib/utils/token-amount"

import type { PeriodRewardAnimationViewModel } from "./loop-section-types"

const DISPLAY_DECIMALS = TOKEN_AMOUNT_FORMATS.estimate.maximumFractionDigits

export function usePeriodRewardCountUp(
  animation?: PeriodRewardAnimationViewModel
) {
  const lastValueRef = useRef<string>()
  const [value, setValue] = useState<string>()

  useEffect(() => {
    if (!animation?.enabled) {
      lastValueRef.current = undefined
      setValue(undefined)
      return
    }

    let frameId: number | undefined
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    const periodEndMilliseconds =
      (animation.periodStartSeconds + animation.periodLengthSeconds) * 1_000n

    const update = () => {
      const nowMilliseconds = BigInt(Date.now())
      const currentReward = calculateSuperLoopAnimatedReward({
        estimatedPeriodPayout: animation.estimatedPeriodPayout,
        nowMilliseconds,
        periodLengthSeconds: animation.periodLengthSeconds,
        periodStartSeconds: animation.periodStartSeconds,
      })
      const nextValue = formatAnimatedReward(
        currentReward,
        animation.tokenDecimals
      )

      if (lastValueRef.current !== nextValue) {
        lastValueRef.current = nextValue
        setValue(nextValue)
      }

      if (!prefersReducedMotion && nowMilliseconds < periodEndMilliseconds) {
        frameId = window.requestAnimationFrame(update)
      }
    }

    update()

    return () => {
      if (frameId != null) window.cancelAnimationFrame(frameId)
    }
  }, [animation])

  return value
}

export function formatAnimatedReward(amount: bigint, tokenDecimals: number) {
  const visibleDecimals = Math.min(DISPLAY_DECIMALS, tokenDecimals)
  return formatTokenAmount(amount, {
    decimals: tokenDecimals,
    maximumFractionDigits: visibleDecimals,
    minimumFractionDigits: visibleDecimals,
    showSmallValues: false,
  })
}
