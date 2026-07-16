import Image from "next/image"
import Link from "next/link"
import { LoopCardData } from "@/data/loops-data"
import { FaXTwitter } from "react-icons/fa6"
import { LuRepeat2, LuZap } from "react-icons/lu"

import { LoopCriteriaCard } from "./loop-elegibility"

interface LoopCardInactiveProps {
  loop: LoopCardData
}

export const LoopCardInactive: React.FC<LoopCardInactiveProps> = ({ loop }) => {
  const isSuperLoop = loop.contractType === "superLoop" || Boolean(loop.super)
  const TypeIcon = isSuperLoop ? LuZap : LuRepeat2
  const loopLabel = isSuperLoop ? "SuperLoop" : "Loop"
  const eligibilityLabel = loop.eligibility.replace(/\s+required$/i, "")

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
            {(loop.eligibilityLogoUrl || isSuperLoop) && (
              <div className="relative flex size-14 shrink-0 items-center justify-center rounded-full border border-border bg-background/70 p-2.5">
                {loop.eligibilityLogoUrl ? (
                  <Image
                    src={loop.eligibilityLogoUrl}
                    alt={`${loop.eligibility} logo`}
                    width={32}
                    height={32}
                    className="size-8 object-contain"
                  />
                ) : (
                  <span className="size-3.5 rounded-full bg-primary" />
                )}
                {isSuperLoop ? (
                  <div className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full border border-border bg-card p-[3px] shadow-[0_8px_20px_rgba(0,0,0,0.12)]">
                    <Image
                      src="/superfluid-logo.png"
                      alt="Superfluid logo"
                      width={14}
                      height={14}
                      className="size-3.5 object-contain"
                    />
                  </div>
                ) : null}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h2 className="line-clamp-2 min-w-0 text-[1.35rem] leading-[1.05] text-foreground">
                  {loop.title}
                </h2>
                <span
                  aria-label={loopLabel}
                  className={[
                    "inline-flex size-[22px] shrink-0 items-center justify-center rounded-full border",
                    isSuperLoop
                      ? "border-primary/25 bg-primary/10 text-primary"
                      : "border-border/80 bg-background/45 text-muted-foreground",
                  ].join(" ")}
                >
                  <TypeIcon className="size-3" />
                </span>
              </div>
            </div>
          </div>

          <div className="flex min-h-[42px] w-full max-w-full items-center justify-center gap-1.5 rounded-full border border-border/80 bg-background px-2.5 py-1.5 text-muted-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_8px_20px_-18px_rgba(15,23,42,0.16)] dark:border-white/8 dark:bg-background dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_20px_-18px_rgba(0,0,0,0.72)] md:w-[165px]">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em]">
              Coming Soon
            </span>
          </div>
        </div>

        <div className="relative flex flex-col gap-3 rounded-2xl border border-border/80 bg-background/80 px-4 py-3 backdrop-blur-sm">
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {loop.description}
          </p>

          <div className="flex flex-col gap-2">
            {loop.rewardsSummary ? (
              <LoopCriteriaCard label="Rewards" value={loop.rewardsSummary} />
            ) : null}
            <LoopCriteriaCard label="Eligibility" value={eligibilityLabel} />
          </div>

          <Link
            href="https://x.com/gyralis_xyz"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-1.5 self-center text-xs font-semibold text-muted-foreground transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Stay tuned on
            <FaXTwitter className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LoopCardInactive
