import type { LoopCardData } from "@/data/loops-data"

export const loopArtwork = (loop: LoopCardData) =>
  loop.eligibilityProvider === "blockscout"
    ? "/discover/merits.png"
    : loop.gardensCommunity === "1hive"
    ? "/discover/gardens.png"
    : loop.eligibilityProvider === "rwagmi"
    ? "/rwagmi-cover.png"
    : "/images/img_2.png"

export const loopLogo = (loop: LoopCardData) =>
  loop.communityLogoUrl ?? loop.eligibilityLogoUrl ?? "/gyralis-logo.svg"
