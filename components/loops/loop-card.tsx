"use client"

import React from "react"
import Image from "next/image"
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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-center">
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
              <span className="inline-flex shrink-0 rounded-full bg-popover px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-popover-foreground">
                LOOP
              </span>
              {loop.super && (
                <span className="inline-flex shrink-0 rounded-full bg-secondary/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-orange-200">
                  SUPER LOOP
                </span>
              )}
            </div>

            <div className="mt-7 space-y-5">
              <div className="flex items-center gap-1 ">
                {loop.eligibilityLogoUrl && (
                  <div className="mt-1 flex size-11 shrink-0 items-center justify-center rounded-2xl border border-border bg-background/70 p-2">
                    <Image
                      src={loop.eligibilityLogoUrl}
                      alt={`${loop.eligibility} logo`}
                      width={28}
                      height={28}
                      className="size-7 object-contain"
                    />
                  </div>
                )}
                <h2 className="max-w-[14ch] text-foreground  text-[1.65rem]">
                  {loop.title}
                </h2>
              </div>
              <p className="max-w-[34ch] text-base  text-muted-foreground">
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
        <div className="col-span-1 flex h-full flex-col justify-center ">
          <LoopBalance
            address={loop.address}
            token={loop.token}
            chainId={loop.chainId}
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 ">
            <LoopShield shieldScore={loop.shieldScore} />
            <LoopEligibility eligibilityCriteria={loop.eligibility} />
          </div>
        </div>

        {/* Loop Setting */}
        <div className="col-span-1 lg:pl-1">
          <LoopSettings
            address={loop.address ?? "0x"}
            chainId={loop.chainId}
            eligibilityProvider={loop.eligibilityProvider}
            eligibilityLogoUrl={loop.eligibilityLogoUrl}
            isSuper={loop.super}
            loopTitle={loop.title}
          />
        </div>
      </div>
    </div>
  )
}

export default LoopCard
