"use client"

import { LoopCardsData } from "@/data/loops-data"

import { scoringLoopRegistry } from "@/config/scoring-loops"
import type { publicSeasonLoopStats } from "@/lib/scoring/season-api"
import { TooltipProvider } from "@/components/ui/tooltip"

import { StreakCard } from "./loop-streaks"

export function StoredSeasonStreaks({
  loops,
}: {
  loops: ReturnType<typeof publicSeasonLoopStats>[]
}) {
  return (
    <section className="p-streaks" aria-label="Stored Season streaks">
      <header className="p-streaks-heading">
        <div>
          <p className="p-eyebrow">SP · Season Points</p>
          <h2>Season streaks</h2>
          <p>Saved streaks at the end of this season’s scoring period.</p>
        </div>
      </header>
      <TooltipProvider delayDuration={150}>
        <div className="p-streak-grid">
          {loops.map((stats) => {
            const entry = scoringLoopRegistry.find(
              (loop) =>
                loop.chainId === stats.chainId && loop.loopId === stats.loopId
            )
            const catalogLoop = LoopCardsData.find(
              (loop) =>
                loop.chainId === stats.chainId &&
                loop.address?.toLowerCase() === entry?.address.toLowerCase()
            )
            // Historical Markee scores use scoring ID 1; its card is hidden
            // from the current directory. Keep it visible in this saved season.
            const loop = catalogLoop ?? {
              ...LoopCardsData[0],
              id: stats.loopId,
              chainId: stats.chainId,
              title:
                stats.chainId === 8453 && stats.loopId === 1
                  ? "Markee"
                  : `Loop ${stats.loopId}`,
              communityLogoUrl:
                stats.chainId === 8453 && stats.loopId === 1
                  ? "/markee-logo.png"
                  : "/gyralis-logo.svg",
            }
            return (
              <StreakCard
                key={`${stats.chainId}-${stats.loopId}`}
                loop={loop}
                stats={stats}
              />
            )
          })}
        </div>
      </TooltipProvider>
    </section>
  )
}
