import { FaInfoCircle } from "react-icons/fa"

import { scoringConfig } from "@/lib/scoring/config"
import { StreakMilestoneIcon } from "@/components/loops/streak-milestone-icon"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function StreakPointsInfo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="How streak points work"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <FaInfoCircle className="size-4" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        aria-labelledby="streak-points-info-title"
        className="w-80 max-w-[calc(100vw-2rem)] rounded-2xl border-border/70 bg-card p-4 text-card-foreground"
      >
        <h3
          id="streak-points-info-title"
          className="font-heading text-lg font-bold text-foreground"
        >
          How streak points work
        </h3>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          Each scored claim earns {scoringConfig.claimPoints} GP. Claim in
          consecutive periods within the same loop to unlock extra points.
          Period lengths vary by loop.
        </p>
        <ul className="my-3 space-y-2">
          {scoringConfig.streakBonuses.map((milestone) => (
            <li
              key={milestone.streak}
              className="flex items-center gap-2 text-sm"
            >
              <StreakMilestoneIcon
                streak={milestone.streak}
                className="size-4 shrink-0"
              />
              <span className="text-foreground">
                {milestone.streak}-claim streak
              </span>
              <span className="ml-auto font-medium text-primary tabular-nums">
                +{milestone.points} GP
              </span>
            </li>
          ))}
        </ul>
        <p className="border-t border-border/70 pt-3 text-xs leading-5 text-muted-foreground">
          Each milestone is awarded once per loop. Bonuses add up, and you
          keep earned points if your streak breaks. Start another loop to
          earn its bonuses too.
        </p>
      </PopoverContent>
    </Popover>
  )
}
