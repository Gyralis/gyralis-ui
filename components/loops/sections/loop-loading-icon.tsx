"use client"

import { LuInfinity } from "react-icons/lu"

import { useCardMotion } from "@/components/participation/card-motion-preview"

export function LoopLoadingIcon() {
  const { mode, reducedMotion } = useCardMotion()
  return (
    <LuInfinity
      className="loop-loading-icon"
      data-animated={mode !== "off" && !reducedMotion ? "" : undefined}
      aria-hidden="true"
    />
  )
}
