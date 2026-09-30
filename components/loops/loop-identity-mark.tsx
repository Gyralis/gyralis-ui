import Image from "next/image"
import type { LoopCardData } from "@/data/loops-data"

interface LoopIdentityMarkProps {
  loop: LoopCardData
}

export function LoopIdentityMark({ loop }: LoopIdentityMarkProps) {
  if (loop.unlockAtCommunityClaims === 10_000) {
    return (
      <div
        aria-label="10K claims milestone"
        className="flex size-14 shrink-0 flex-col items-center justify-center rounded-2xl border border-white/10 bg-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_10px_24px_-18px_rgba(15,23,42,0.7)]"
      >
        <span className="font-baloo text-xl font-bold leading-none tracking-tight text-primary">
          10K
        </span>
        <span className="mt-0.5 text-[7px] font-bold uppercase leading-none tracking-[0.16em] text-white/80">
          Claims
        </span>
      </div>
    )
  }

  const showsGardensCommunity = Boolean(
    loop.eligibilityProvider === "gardens" &&
      loop.communityLogoUrl &&
      loop.eligibilityLogoUrl
  )
  const primaryLogoUrl = showsGardensCommunity
    ? loop.communityLogoUrl
    : loop.eligibilityLogoUrl

  if (!primaryLogoUrl) return null

  return (
    <div className="relative flex size-14 shrink-0 items-center justify-center rounded-2xl bg-background/70 p-2.5">
      <Image
        src={primaryLogoUrl}
        alt={
          showsGardensCommunity
            ? `${loop.by} community logo`
            : `${loop.eligibility} logo`
        }
        width={32}
        height={32}
        className="size-8 object-contain"
      />
      {showsGardensCommunity ? (
        <span
          aria-label="Gardens community"
          className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full border-2 border-card bg-background p-1 shadow-[0_8px_20px_rgba(0,0,0,0.14)]"
        >
          <Image
            src={loop.eligibilityLogoUrl!}
            alt=""
            width={12}
            height={12}
            className="size-3 shrink-0 object-contain"
          />
        </span>
      ) : null}
    </div>
  )
}
