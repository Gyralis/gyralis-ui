import Image from "next/image"
import Link from "next/link"
import { LoopCardData } from "@/data/loops-data"
import { FaXTwitter } from "react-icons/fa6"
import { LuLoader2, LuLock, LuMegaphone, LuPause } from "react-icons/lu"

import { NavLogoMark } from "@/components/layout/main-nav"

import { LoopCriteriaCard } from "./loop-elegibility"
import { LoopIdentityMark } from "./loop-identity-mark"
import { LoopInactiveOverlay } from "./loop-inactive-overlay"
import { LoopMilestoneUnlock } from "./loop-milestone-unlock"
import { LoopTypeBadge } from "./loop-type-badge"

type InactiveLoopStatus = "Announced" | "Preparing"

const CHAIN_ICON_SRC: Record<string, string> = {
  Base: "/icons/NetworkBaseTest.svg",
  Gnosis: "/icons/NetworkGnosis.svg",
}

const STATUS_CONFIG: Record<
  InactiveLoopStatus,
  {
    icon: typeof LuMegaphone
    iconClassName?: string
  }
> = {
  Announced: {
    icon: LuMegaphone,
  },
  Preparing: {
    icon: LuLoader2,
    iconClassName: "text-primary",
  },
}

interface LoopCardInactiveProps {
  loop: LoopCardData
}

export const LoopCardInactive: React.FC<LoopCardInactiveProps> = ({ loop }) => {
  const isSuperLoop = loop.contractType === "superLoop" || Boolean(loop.super)
  const isPaused = isSuperLoop && loop.statusLabel === "Paused"
  const hasOverlay = Boolean(loop.unlockAtCommunityClaims) || isPaused
  const eligibilityLabel = loop.eligibility.replace(/\s+required$/i, "")
  const statusLabel =
    loop.statusLabel === "Preparing" ? "Preparing" : "Announced"
  const StatusIcon = STATUS_CONFIG[statusLabel].icon

  return (
    <div
      className={[
        "tamagotchi-card loop-card-shell tamagotchi-card-inactive font-body relative w-[560px] max-w-full rounded-[32px] p-[22px]",
        isSuperLoop ? "tamagotchi-card-superloop" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="relative z-10 space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-1.5">
            {hasOverlay ? (
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-slate-950 p-2.5">
                {isPaused ? (
                  <LuPause className="size-7 text-white" aria-hidden="true" />
                ) : (
                  <LuLock className="size-7 text-white" aria-hidden="true" />
                )}
              </div>
            ) : (
              <LoopIdentityMark loop={loop} />
            )}
            <div className="min-w-0 flex-1">
              <h2 className="line-clamp-2 min-w-0 text-[1.35rem] leading-[1.05] text-foreground">
                {loop.title}
              </h2>
              <div className="mt-1.5 flex shrink-0 items-center gap-1">
                <LoopTypeBadge isSuper={isSuperLoop} />
                <span
                  aria-label={`${loop.chainName} chain`}
                  className="inline-flex size-[22px] shrink-0 items-center justify-center rounded-full border border-border/80 bg-background/45"
                >
                  {CHAIN_ICON_SRC[loop.chainName] ? (
                    <Image
                      src={CHAIN_ICON_SRC[loop.chainName]}
                      alt=""
                      width={12}
                      height={12}
                      className="size-4 rounded-full"
                    />
                  ) : (
                    <span className="size-2 rounded-full bg-primary/70" />
                  )}
                </span>
              </div>
            </div>
          </div>

          {hasOverlay && (
            <div className="flex min-h-[42px] w-full items-center justify-center gap-2 rounded-full border border-border/80 bg-background px-2.5 py-1.5 text-left md:w-auto md:min-w-[165px] md:justify-start">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-950">
                {loop.unlockAtCommunityClaims ? (
                  <NavLogoMark className="text-white" />
                ) : loop.sponsorLogoUrl ? (
                  <Image
                    src={loop.sponsorLogoUrl}
                    alt=""
                    width={24}
                    height={24}
                    className="size-6 object-contain"
                  />
                ) : null}
              </span>
              <div>
                <p className="text-[8px] font-semibold uppercase leading-none tracking-widest text-muted-foreground">
                  Sponsored by
                </p>
                <p className="mt-1 text-[11px] font-semibold leading-none text-foreground">
                  {loop.sponsorName}
                </p>
              </div>
            </div>
          )}
          {!hasOverlay && (
            <div className="flex min-h-[42px] w-full max-w-full items-center justify-center gap-1.5 rounded-full border border-border/80 bg-background px-2.5 py-1.5 text-muted-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_8px_20px_-18px_rgba(15,23,42,0.16)] dark:border-white/8 dark:bg-background dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_20px_-18px_rgba(0,0,0,0.72)] md:w-[165px]">
              <StatusIcon
                className={[
                  "size-3.5 shrink-0",
                  STATUS_CONFIG[statusLabel].iconClassName ?? "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-hidden="true"
              />
              <span className="text-[10px] font-bold uppercase tracking-[0.14em]">
                {statusLabel}
              </span>
            </div>
          )}
        </div>

        <div
          className={
            hasOverlay
              ? "relative mx-[-22px] !mb-[-22px] grid overflow-hidden rounded-b-[32px]"
              : undefined
          }
        >
          <div
            aria-hidden={hasOverlay ? true : undefined}
            className={`relative flex flex-col gap-3 rounded-2xl border border-border/80 bg-background/80 px-4 py-3 backdrop-blur-sm ${
              hasOverlay
                ? "pointer-events-none col-start-1 row-start-1 select-none"
                : ""
            }`}
          >
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {loop.description}
            </p>

            <div className="flex flex-col gap-2">
              {loop.rewardsSummary ? (
                <LoopCriteriaCard label="Rewards" value={loop.rewardsSummary} />
              ) : null}
              {!hasOverlay && (
                <LoopCriteriaCard
                  label="Eligibility"
                  value={eligibilityLabel}
                />
              )}
            </div>

            {!hasOverlay && (
              <Link
                href="https://x.com/gyralis_xyz"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 self-center text-xs font-semibold text-muted-foreground transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Stay tuned on
                <FaXTwitter className="size-3.5" aria-hidden="true" />
              </Link>
            )}
          </div>
          {isPaused ? (
            <LoopInactiveOverlay>
              <p className="font-baloo text-lg font-semibold leading-snug">
                SuperLoop paused
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                Rewards will resume when streaming restarts.
              </p>
            </LoopInactiveOverlay>
          ) : loop.unlockAtCommunityClaims ? (
            <LoopMilestoneUnlock
              goal={loop.unlockAtCommunityClaims}
              eligibility={eligibilityLabel}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default LoopCardInactive
