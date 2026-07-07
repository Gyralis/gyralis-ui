"use client"

import { CSSProperties, useMemo, useState } from "react"

import { cn } from "@/lib/utils"

type GlowingEffectProps = {
  className?: string
  disabled?: boolean
  glow?: boolean
  inactiveZone?: number
  proximity?: number
  spread?: number
}

const INITIAL_POSITION = { x: 50, y: 50, active: 0 }

export function GlowingEffect({
  className,
  disabled = false,
  glow = true,
  inactiveZone = 0.01,
  proximity = 64,
  spread = 40,
}: GlowingEffectProps) {
  const [state, setState] = useState(INITIAL_POSITION)

  const style = useMemo(
    () =>
      ({
        "--glow-x": `${state.x}%`,
        "--glow-y": `${state.y}%`,
        "--glow-active": state.active,
        "--glow-spread": `${spread}%`,
        "--glow-proximity": `${proximity}px`,
        "--glow-inactive-zone": inactiveZone,
      }) as CSSProperties,
    [inactiveZone, proximity, spread, state.active, state.x, state.y]
  )

  if (disabled) {
    return null
  }

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]", className)}
      onMouseMove={(event) => {
        const target = event.currentTarget.getBoundingClientRect()
        const x = ((event.clientX - target.left) / target.width) * 100
        const y = ((event.clientY - target.top) / target.height) * 100

        setState({ x, y, active: glow ? 1 : 0 })
      }}
      onMouseEnter={() => {
        setState((current) => ({ ...current, active: glow ? 1 : 0 }))
      }}
      onMouseLeave={() => {
        setState((current) => ({ ...current, active: 0 }))
      }}
      style={style}
    >
      <div className="absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_var(--glow-x)_var(--glow-y),rgba(28,231,131,calc(0.18*var(--glow-active)))_0%,rgba(118,75,255,calc(0.12*var(--glow-active)))_18%,transparent_54%)] transition-opacity duration-300" />
      <div className="absolute inset-px rounded-[inherit] border border-white/[0.08]" />
    </div>
  )
}
