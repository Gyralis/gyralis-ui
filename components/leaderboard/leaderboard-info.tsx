import { FaInfoCircle } from "react-icons/fa"

import { ProfileDetails } from "@/components/profile/profile-details"
import { ProfileUpdatedTime } from "@/components/profile/profile-updated-time"

export function LeaderboardInfo({ updatedAt }: { updatedAt: string | null }) {
  return (
    <ProfileDetails
      label="About the beta leaderboard"
      align="start"
      className="w-80 max-w-[calc(100vw-2rem)] rounded-2xl border-border/70 bg-card !p-4 !text-left text-card-foreground"
      trigger={
        <button
          type="button"
          aria-label="About the beta leaderboard"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <FaInfoCircle className="size-4" aria-hidden="true" />
        </button>
      }
    >
      <h3 className="font-heading text-lg font-bold text-foreground">
        Gyralis Leaderboard · Beta
      </h3>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        The all-time leaderboard ranks loopers by total Gyra Points (GP),
        including claim points and streak bonuses.
      </p>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        Includes the 1Hive and Blockscout loops.
      </p>
      <p className="mt-3 border-t border-border/70 pt-3 text-xs leading-5 text-muted-foreground">
        Updated: <ProfileUpdatedTime updatedAt={updatedAt} />
      </p>
    </ProfileDetails>
  )
}
