"use client"

import React from "react"
import { FaCheck, FaShieldAlt, FaStar, FaTimes } from "react-icons/fa"

// 🧩 Shield Status Component
interface LoopShieldProps {
  shieldPassed?: boolean
  isClaiming?: boolean
  messageType?: "success" | "error" | null
  message?: string | null
  shieldScore: string
}

export const LoopShield: React.FC<LoopShieldProps> = ({
  shieldPassed,
  isClaiming,
  messageType,
  message,
  shieldScore,
}) => {
  return (
    <div>
      <div className="border2 flex cursor-pointer items-center justify-between rounded-lg bg-gradient-to-br from-muted/30 to-muted/50 p-3 shadow-[-2px_-2px_5px_rgba(255,255,255,0.7),2px_2px_5px_rgba(0,0,0,0.15)] transition-all duration-300 hover:shadow-[inset_-2px_-2px_5px_rgba(255,255,255,0.7),inset_2px_2px_5px_rgba(0,0,0,0.15)] dark:from-muted/20 dark:to-muted/30 dark:shadow-[-2px_-2px_5px_rgba(255,255,255,0.05),2px_2px_5px_rgba(0,0,0,0.4)] dark:hover:shadow-[inset_-2px_-2px_5px_rgba(255,255,255,0.03),inset_2px_2px_5px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-2">
          <FaShieldAlt className="h-4 w-4 text-primary dark:text-primary" />
          <h4 className="font-heading text-xs text-foreground dark:text-foreground">
            Shield
          </h4>
        </div>

        {/* {shieldPassed ? (
          <FaCheck className="h-4 w-4 text-green-500" />
        ) : (
          !isClaiming &&
          messageType === "error" &&
          message?.includes("Shield") && (
            <FaTimes className="h-4 w-4 text-red-500" />
          )
        )} */}
        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground dark:text-muted-foreground">
          {shieldScore}
        </p>
      </div>
    </div>
  )
}

// 🧩 Eligibility Status Component
interface LoopEligibilityProps {
  eligibilityPassed?: boolean
  isClaiming?: boolean
  messageType?: "success" | "error" | null
  message?: string | null
  eligibilityCriteria: string
}

export const LoopEligibility: React.FC<LoopEligibilityProps> = ({
  eligibilityPassed,
  isClaiming,
  messageType,
  message,
  eligibilityCriteria,
}) => {
  return (
    <div>
      <div className="border2 flex cursor-pointer items-center justify-between rounded-lg bg-gradient-to-br from-muted/30 to-muted/50 p-3 shadow-[-2px_-2px_5px_rgba(255,255,255,0.7),2px_2px_5px_rgba(0,0,0,0.15)] transition-all duration-300 hover:shadow-[inset_-2px_-2px_5px_rgba(255,255,255,0.7),inset_2px_2px_5px_rgba(0,0,0,0.15)] dark:from-muted/20 dark:to-muted/30 dark:shadow-[-2px_-2px_5px_rgba(255,255,255,0.05),2px_2px_5px_rgba(0,0,0,0.4)] dark:hover:shadow-[inset_-2px_-2px_5px_rgba(255,255,255,0.03),inset_2px_2px_5px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-2">
          <FaStar className="h-4 w-4 text-primary dark:text-primary" />
          <h4 className="font-heading text-xs text-foreground dark:text-foreground">
            Eligibility
          </h4>
        </div>

        {/* {eligibilityPassed ? (
          <FaCheck className="h-4 w-4 text-green-500" />
        ) : (
          !isClaiming &&
          messageType === "error" &&
          message?.includes("Eligibility") && (
            <FaTimes className="h-4 w-4 text-red-500" />
          )
        )} */}
        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground dark:text-muted-foreground">
          {eligibilityCriteria}
        </p>
      </div>
    </div>
  )
}
