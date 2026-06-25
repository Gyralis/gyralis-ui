"use client"

import React from "react"
import Image from "next/image"
import { LoopCardData } from "@/data/loops-data"

import { TooltipProvider } from "@/components/ui/tooltip"

import { LoopClaim } from "./loop-claim"
import {
  LoopDistributionStat,
  LoopPeriodStat,
  useLoopSettingsDetails,
} from "./loop-settings"
import { LoopTypeBadge } from "./loop-type-badge"
import { LoopersModal } from "./loopers-modal"

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
  const isSuperLoop = loop.contractType === "superLoop" || loop.super
  const settingsDetails = useLoopSettingsDetails({
    address: loop.address ?? "0x",
    chainId: loop.chainId,
    contractType: loop.contractType,
    isSuper: isSuperLoop,
  })
  const shieldThreshold = loop.shieldScore
    .match(/\+?\d+(\.\d+)?/)?.[0]
    ?.replace(/^\+/, "")
  const eligibilityLabel = loop.eligibility.replace(/\s+required$/i, "")

  return (
    <TooltipProvider>
      <div
        className={[
          "tamagotchi-card font-body relative w-[560px] max-w-full rounded-[32px] p-[22px]",
          isSuperLoop ? "tamagotchi-card-superloop" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="relative z-10 space-y-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="flex min-w-0 gap-3">
              {(loop.eligibilityLogoUrl || isSuperLoop) && (
                <div className="relative flex size-12 shrink-0 items-center justify-center rounded-full border border-border bg-background/70 p-2">
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
              <div className="min-w-0">
                <h2 className="text-[1.45rem] leading-tight text-foreground">
                  {loop.title}
                </h2>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <LoopTypeBadge
                    isSuper={isSuperLoop}
                    className="px-2.5 py-0.5 text-[10px]"
                  />
                  <div className="inline-flex min-h-[22px] items-center rounded-full border border-dashed border-border/90 bg-background/35 px-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Chain icon · {loop.chainName}
                  </div>
                </div>
              </div>
            </div>

            <div className="min-h-[44px] rounded-[10px] border border-dashed border-border/90 bg-background/35 px-3 py-2 md:w-[165px]">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Sponsor
              </p>
              <p className="mt-0.5 text-xs font-semibold text-foreground">
                Placeholder
              </p>
            </div>
          </div>

          <div className="h-px bg-border/80" />

          <div className="grid overflow-hidden rounded-2xl border border-border/80 bg-background/35 md:grid-cols-[1fr_auto_1fr]">
            <div className="min-h-[90px] border-b border-border/80 px-3.5 py-2.5 md:border-b-0 md:border-r">
              <LoopDistributionStat
                compact
                value={settingsDetails.distributionLabel}
                detail={settingsDetails.distributionDetail}
                tooltip={settingsDetails.distributionTooltip}
              />
            </div>

            <div className="min-h-[90px] min-w-[88px] border-b border-border/80 p-2.5 text-center md:border-b-0 md:border-r">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Loopers
              </p>
              <button
                type="button"
                onClick={() => settingsDetails.setIsLoopersModalOpen(true)}
                className="mt-3 inline-flex size-[52px] items-center justify-center rounded-full border border-dashed border-border/90 bg-background/60 text-[10px] font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                View
              </button>
            </div>

            <div className="min-h-[90px] px-3.5 py-2.5">
              <LoopPeriodStat
                compact
                isLoading={settingsDetails.isLoading}
                nextPeriodStart={settingsDetails.nextPeriodStart}
                timerTitle={settingsDetails.timerTitle}
                onViewLoopers={() =>
                  settingsDetails.setIsLoopersModalOpen(true)
                }
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-[10px] border border-primary/20 bg-background/35 px-3.5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors hover:bg-background/45 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Eligibility
              </p>
              <p className="mt-0.5 line-clamp-2 text-sm font-semibold leading-5 text-primary">
                {eligibilityLabel}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <div className="inline-flex flex-wrap items-center gap-1.5 text-sm text-foreground">
                <span className="text-muted-foreground">Passport score</span>
                {shieldThreshold ? (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold tabular-nums text-primary-foreground">
                    {shieldThreshold}+
                  </span>
                ) : (
                  <span className="font-semibold">{loop.shieldScore}</span>
                )}
              </div>
            </div>
          </div>

          <LoopClaim
            address={loop.address ?? "0x"}
            chainId={loop.chainId}
            contractType={loop.contractType}
            eligibilityProvider={loop.eligibilityProvider}
            onStatusChange={settingsDetails.handleClaimStatusChange}
            onSuccess={settingsDetails.handleClaimSuccess}
          />

          <div className="min-h-[56px] rounded-2xl border border-dashed border-primary/20 bg-background/35 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Streak
            </p>
            <p className="mt-1 text-xs font-semibold text-foreground">
              Bottom streak placeholder
            </p>
          </div>
        </div>

        <LoopersModal
          chainId={loop.chainId}
          currentPeriod={settingsDetails.currentPeriod}
          eligibilityLogoUrl={loop.eligibilityLogoUrl}
          isOpen={settingsDetails.isLoopersModalOpen}
          loopAddress={loop.address ?? "0x"}
          loopContractType={loop.contractType}
          loopIsSuper={isSuperLoop}
          loopToken={settingsDetails.settings?.token}
          loopTitle={loop.title}
          onOpenChange={settingsDetails.setIsLoopersModalOpen}
          firstPeriodStart={settingsDetails.settings?.firstPeriodStart}
          periodLength={settingsDetails.settings?.periodLength}
          refreshKey={settingsDetails.modalRefreshKey}
        />
      </div>
    </TooltipProvider>
  )
}

export default LoopCard
