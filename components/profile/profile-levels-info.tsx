import { FaInfoCircle } from "react-icons/fa"

import { ProfileDetails } from "@/components/profile/profile-details"

export function ProfileLevelsInfo() {
  return (
    <ProfileDetails
      label="About beta Looper levels"
      align="start"
      className="w-80 max-w-[calc(100vw-2rem)] rounded-2xl border-border/70 bg-card !p-4 !text-left text-card-foreground"
      trigger={
        <button
          type="button"
          aria-label="About beta Looper levels"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <FaInfoCircle className="size-4" aria-hidden="true" />
        </button>
      }
    >
      <h3 className="font-heading text-lg font-bold text-foreground">
        Looper levels · Beta
      </h3>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        We’re testing three levels during beta. Your total Gyra Points (GP)
        determine your level. Levels and thresholds may change as we learn.
      </p>
      <dl className="my-3 space-y-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt>Looper</dt>
          <dd className="font-medium text-primary tabular-nums">0–49 GP</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt>True Looper</dt>
          <dd className="font-medium text-primary tabular-nums">50–249 GP</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt>LooperX</dt>
          <dd className="font-medium text-primary tabular-nums">250+ GP</dd>
        </div>
      </dl>
      <p className="border-t border-border/70 pt-3 text-xs leading-5 text-muted-foreground">
        True Looper loop access is separate: it requires 50 claims, not 50 GP.
      </p>
    </ProfileDetails>
  )
}
