"use client"

import { CSSProperties, useEffect, useMemo, useRef, useState } from "react"

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
  const ref = useRef<HTMLDivElement | null>(null)
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
      } as CSSProperties),
    [inactiveZone, proximity, spread, state.active, state.x, state.y]
  )

  // This overlay is pointer-events-none, so pointer tracking has to live on
  // the parent card element.
  useEffect(() => {
    if (disabled) {
      return
    }

    const parent = ref.current?.parentElement

    if (!parent) {
      return
    }

    const handleMouseMove = (event: MouseEvent) => {
      const rect = parent.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width) * 100
      const y = ((event.clientY - rect.top) / rect.height) * 100

      setState({ x, y, active: glow ? 1 : 0 })
    }

    const handleMouseLeave = () => {
      setState((current) => ({ ...current, active: 0 }))
    }

    parent.addEventListener("mousemove", handleMouseMove)
    parent.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      parent.removeEventListener("mousemove", handleMouseMove)
      parent.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [disabled, glow])

  if (disabled) {
    return null
  }

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]",
        className
      )}
      style={style}
    >
      <div className="absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_var(--glow-x)_var(--glow-y),rgba(28,231,131,calc(0.18*var(--glow-active)))_0%,rgba(118,75,255,calc(0.12*var(--glow-active)))_18%,transparent_54%)] transition-opacity duration-300" />
      <div className="absolute inset-px rounded-[inherit] border border-white/[0.08]" />
    </div>
  )
}
