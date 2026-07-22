"use client"

import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { LoopCardData } from "@/data/loops-data"

import { LoopBalance } from "./loop-balance"
import { LoopEligibility, LoopShield } from "./loop-elegibility"
import { LoopSettings } from "./loop-settings"
import { LoopTypeBadge } from "./loop-type-badge"

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
  const [balanceRefreshKey, setBalanceRefreshKey] = useState(0)
  const isSuperLoop = loop.contractType === "superLoop" || loop.super

  return (
    <div
      className={[
        "tamagotchi-card font-body relative p-7 md:p-8",
        isSuperLoop ? "tamagotchi-card-superloop" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-center">
        {/* Loop metadata */}
        <div className="col-span-1 flex min-h-[248px] flex-col justify-between py-2 pr-2">
          <div>
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                {(loop.eligibilityLogoUrl || isSuperLoop) && (
                  <div className="relative flex size-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-background/70 p-2">
                    {loop.eligibilityLogoUrl ? (
                      <Image
                        src={loop.eligibilityLogoUrl}
                        alt={`${loop.eligibility} logo`}
                        width={28}
                        height={28}
                        className="size-7 object-contain"
                      />
                    ) : (
                      <span className="size-3 rounded-full bg-primary" />
                    )}
                    {isSuperLoop ? (
                      <div className="absolute -bottom-1.5 -right-1.5 flex size-6 items-center justify-center rounded-full border border-border bg-card p-1 shadow-[0_8px_20px_rgba(0,0,0,0.12)]">
                        <Image
                          src="/superfluid-logo.png"
                          alt="Superfluid logo"
                          width={16}
                          height={16}
                          className="size-4 object-contain"
                        />
                      </div>
                    ) : null}
                  </div>
                )}
                <div className="min-w-0 self-center">
                  <h2 className="max-w-[14ch] text-[1.65rem] text-foreground">
                    {loop.title}
                  </h2>
                  <div className="mt-1 flex">
                    <LoopTypeBadge isSuper={isSuperLoop} />
                  </div>
                </div>
              </div>
              <div className="max-w-[34ch] space-y-1.5">
                <p className="text-base text-muted-foreground">
                  {loop.description}
                </p>
                <Link
                  href="/eligibilities"
                  className="inline-flex text-sm font-semibold text-secondary-foreground/90 transition-colors hover:text-secondary-foreground"
                >
                  How to be eligible →
                </Link>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-8">
            <span className="inline-flex rounded-lg bg-muted/60 px-3 py-1.5 text-xs font-semibold text-secondary-foreground">
              by {loop.by}
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {loop.chainName}
            </span>
          </div>
        </div>

        {/* Loop Balance / Shield / Elegibility */}
        <div className="col-span-1 flex h-full flex-col justify-center ">
          <LoopBalance
            address={loop.address}
            chainId={loop.chainId}
            contractType={loop.contractType}
            refreshKey={balanceRefreshKey}
            token={loop.token}
          />
          <div className="mt-4 gap-3 sm:grid-cols-2 flex flex-col">
            <LoopShield shieldScore={loop.shieldScore} />
            <LoopEligibility eligibilityCriteria={loop.eligibility} />
          </div>
        </div>

        {/* Loop Setting */}
        <div className="col-span-1 lg:pl-1">
          <LoopSettings
            address={loop.address ?? "0x"}
            chainId={loop.chainId}
            contractType={loop.contractType}
            eligibilityProvider={loop.eligibilityProvider}
            eligibilityLogoUrl={loop.eligibilityLogoUrl}
            isSuper={isSuperLoop}
            loopTitle={loop.title}
            onClaimSuccess={() => setBalanceRefreshKey((key) => key + 1)}
          />
        </div>
      </div>
    </div>
  )
}

export default LoopCard
