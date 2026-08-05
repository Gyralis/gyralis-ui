import Image from "next/image"
import type { LoopCardData } from "@/data/loops-data"

interface LoopIdentityMarkProps {
  loop: LoopCardData
}

export function LoopIdentityMark({ loop }: LoopIdentityMarkProps) {
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
    <div className="relative flex size-14 shrink-0 items-center justify-center rounded-full border border-border bg-background/70 p-2.5">
      <Image
        src={primaryLogoUrl}
        alt={
          showsGardensCommunity
            ? `${loop.by} community logo`
            : `${loop.eligibility} logo`
        }
        width={32}
        height={32}
        className="size-8 rounded-full object-contain"
      />
      {showsGardensCommunity ? (
        <span
          aria-label="Gardens community"
          className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full border-2 border-card bg-background p-1 shadow-[0_8px_20px_rgba(0,0,0,0.14)]"
        >
          <Image
            src={loop.eligibilityLogoUrl!}
            alt=""
            width={16}
            height={16}
            className="size-4 object-contain"
          />
        </span>
      ) : null}
    </div>
  )
}
