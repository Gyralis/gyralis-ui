"use client"

import React, { ReactNode } from "react"
import { LuDoorOpen, LuFingerprint } from "react-icons/lu"

interface LoopShieldProps {
  shieldScore: string
}

export const LoopShield: React.FC<LoopShieldProps> = ({ shieldScore }) => {
  return (
    <LoopCriteriaCard
      icon={<LuFingerprint className="size-3.5 text-primary" />}
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
      icon={<LuDoorOpen className="size-4 text-primary" />}
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
    <div className="rounded-[1.35rem] border border-border py-2 bg-background/35  shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors px-5 hover:bg-background/45 flex items-center gap-2">
      <div className="flex items-center justify-center gap-1 border2">
        <span className=" rounded-full bg-primary/10">{icon}</span>
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
