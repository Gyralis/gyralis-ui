"use client"

import { useEffect, useRef, useState } from "react"
import { formatUnits } from "viem"

import { calculateSuperLoopAnimatedReward } from "@/lib/loops/super-loop-rewards"

import type { PeriodRewardAnimationViewModel } from "./loop-section-types"

const DISPLAY_DECIMALS = 7

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
  const [whole, fraction = ""] = formatUnits(amount, tokenDecimals).split(".")

  if (visibleDecimals === 0) return whole

  return `${whole}.${fraction
    .padEnd(visibleDecimals, "0")
    .slice(0, visibleDecimals)}`
}
