"use client"

import { cn } from "@/lib/utils"

import { LoopSectionError } from "./loop-section-status"
import type { SectionState } from "./loop-section-types"

export interface LoopersViewData {
  claimedCount: number
  claimRate: number
  registeredCount: number
}

interface LoopersSectionProps {
  onClick: () => void
  state: SectionState<LoopersViewData>
}

export function LoopersSection({ onClick, state }: LoopersSectionProps) {
  if (state.status === "error") {
    return (
      <LoopSectionError
        label="Loopers"
        message={state.message}
        onRetry={state.retry}
      />
    )
  }

  const isLoading = state.status === "loading"
  const data =
    state.status === "ready" || state.status === "refreshing"
      ? state.data
      : { claimedCount: 0, claimRate: 0, registeredCount: 0 }
  const { claimedCount, claimRate, registeredCount } = data
  const hasLoopers = registeredCount > 0
  const ringValue = isLoading ? 0 : claimRate
  const radius = 25
  const circumference = 2 * Math.PI * radius
  const strokeOffset = circumference - (ringValue / 100) * circumference

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex size-full flex-col rounded-xl p-0 text-center transition-colors hover:bg-background/45 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
    >
      <span className="sr-only">
        View loopers. {claimedCount} claimed of {registeredCount} registered.
      </span>
      <p className="w-full text-center text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground transition-colors group-hover:text-primary">
        Loopers
      </p>
      <div className="relative mx-auto mt-2 flex size-[62px] items-center justify-center">
        <svg
          className="absolute inset-0 size-full -rotate-90"
          viewBox="0 0 64 64"
          aria-hidden="true"
        >
          <circle
            cx="32"
            cy="32"
            fill="none"
            r={radius}
            stroke="hsl(var(--border))"
            strokeWidth="5"
          />
          <circle
            cx="32"
            cy="32"
            fill="none"
            r={radius}
            stroke="hsl(var(--primary))"
            strokeDasharray={circumference}
            strokeDashoffset={strokeOffset}
            strokeLinecap="round"
            strokeWidth="5"
            className="transition-[stroke-dashoffset] duration-500 ease-out"
          />
        </svg>
        <span
          className={cn(
            "relative flex flex-col items-center justify-center font-mono leading-none",
            hasLoopers ? "text-foreground" : "text-muted-foreground"
          )}
        >
          <span className="text-sm font-bold">
            {isLoading ? "--" : claimedCount}
          </span>
          <span className="mt-1 text-[10px] text-muted-foreground">
            /{isLoading ? "--" : registeredCount}
          </span>
        </span>
      </div>
    </button>
  )
}
