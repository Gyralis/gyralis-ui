"use client"

import React, { ReactNode } from "react"

interface LoopShieldProps {
  shieldScore: string
}

export const LoopShield: React.FC<LoopShieldProps> = ({ shieldScore }) => {
  const threshold = shieldScore.match(/\+?\d+(\.\d+)?/)?.[0]?.replace(/^\+/, "")

  return (
    <LoopCriteriaCard
      label="Shield"
      value={
        <span className="inline-flex flex-wrap items-center gap-1.5">
          <span>Passport score</span>
          {threshold ? (
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold tabular-nums text-primary-foreground">
              {threshold}+
            </span>
          ) : (
            shieldScore
          )}
        </span>
      }
    />
  )
}

interface LoopEligibilityProps {
  eligibilityCriteria: string
}

export const LoopEligibility: React.FC<LoopEligibilityProps> = ({
  eligibilityCriteria,
}) => {
  const eligibilityLabel = eligibilityCriteria.replace(/\s+required$/i, "")

  return (
    <LoopCriteriaCard
      label="Eligibility"
      value={eligibilityLabel}
    />
  )
}

const LoopCriteriaCard = ({
  label,
  value,
}: {
  label: string
  value: ReactNode
}) => {
  return (
    <div className="rounded-[1.35rem] border border-border py-2 bg-background/35  shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors px-5 hover:bg-background/45 flex items-center gap-2">
      <div className="flex items-center justify-center gap-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
          {": "}
        </p>
      </div>
      <div>
        <p className="line-clamp-2 text-sm leading-6 text-foreground ">
          {value}
        </p>
      </div>
    </div>
  )
}
