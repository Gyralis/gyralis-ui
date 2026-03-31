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
    <div className="rounded-[1.35rem] border border-border/80 bg-background/35 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors hover:bg-background/45">
      <div className="flex items-center gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-foreground">
        {value}
      </p>
    </div>
  )
}
