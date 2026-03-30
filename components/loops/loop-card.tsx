"use client"

import React from "react"
import { LoopCardData } from "@/data/loops-data"

import { LoopBalance } from "./loop-balance"
import { LoopEligibility, LoopShield } from "./loop-elegibility"
import { LoopSettings } from "./loop-settings"

interface LoopCardProps {
  loop: LoopCardData
  onBalanceUpdate: (
    cardId: number,
    newBalance: number,
    newBalanceString: string
  ) => void
}

const LoopCard: React.FC<LoopCardProps> = ({ loop, onBalanceUpdate }) => {
  void onBalanceUpdate

  return (
    <div className="tamagotchi-card font-body relative p-7 md:p-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_1fr_0.98fr] lg:items-center">
        {/* Loop metadata */}
        <div className="col-span-1 flex min-h-[248px] flex-col justify-between py-2 pr-2">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex min-w-0 items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                <span className="size-2 rounded-full bg-primary" />
                <span className="truncate text-foreground">
                  Deployed on {loop.chainName}
                </span>
              </span>
              <span className="inline-flex shrink-0 rounded-full bg-blue-500/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-300">
                LOOP
              </span>
              {loop.super && (
                <span className="inline-flex shrink-0 rounded-full bg-orange-500/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-orange-200">
                  SUPER LOOP
                </span>
              )}
            </div>

            <div className="mt-7 space-y-5">
              <h3 className="max-w-[14ch] font-heading text-[2.3rem] leading-[1.05] text-foreground">
                {loop.title}
              </h3>
              <p className="max-w-[34ch] text-base leading-8 text-muted-foreground">
                {loop.description}
              </p>
            </div>
          </div>

          <div className="pt-8">
            <span className="inline-flex rounded-lg bg-muted/60 px-3 py-1.5 text-xs font-semibold text-secondary-foreground">
              by {loop.by}
            </span>
          </div>
        </div>

        {/* Loop Balance / Shield / Elegibility */}
        <div className="col-span-1 flex h-full flex-col justify-center">
          <LoopBalance
            address={loop.address}
            token={loop.token}
            chainId={loop.chainId}
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <LoopShield shieldScore={loop.shieldScore} />
            <LoopEligibility eligibilityCriteria={loop.eligibility} />
          </div>
        </div>

        {/* Loop Setting */}
        <div className="col-span-1">
          <LoopSettings
            address={loop.address ?? "0x"}
            chainId={loop.chainId}
            eligibilityProvider={loop.eligibilityProvider}
          />
        </div>
      </div>
    </div>
  )
}

export default LoopCard
