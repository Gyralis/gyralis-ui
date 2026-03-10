"use client"

import React, { ReactNode } from "react"
import { FaShieldAlt, FaStar } from "react-icons/fa"

interface LoopShieldProps {
  shieldScore: string
}

export const LoopShield: React.FC<LoopShieldProps> = ({ shieldScore }) => {
  return (
    <LoopCriteriaCard
      icon={<FaShieldAlt className="size-3.5" />}
      label="Shield"
      value={shieldScore}
    />
  )
}

interface LoopEligibilityProps {
  eligibilityCriteria: string
}

export const LoopEligibility: React.FC<LoopEligibilityProps> = ({
  eligibilityCriteria,
}) => {
  return (
    <LoopCriteriaCard
      icon={<FaStar className="size-3.5" />}
      label="Eligibility"
      value={eligibilityCriteria}
    />
  )
}

const LoopCriteriaCard = ({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) => {
  return (
    <div className="rounded-xl border border-border/60 bg-background/60 p-3 transition-colors hover:bg-background/75">
      <div className="flex items-center gap-2">
        <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary">
          {icon}
        </span>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
      </div>
      <p className="mt-2 line-clamp-2 text-sm leading-snug text-foreground">
        {value}
      </p>
    </div>
  )
}
