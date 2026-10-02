"use client"

import { useRoadTo10k } from "@/lib/hooks/app/use-road-to-10k"

import { LoopInactiveOverlay } from "./loop-inactive-overlay"

const format = (value: number) => value.toLocaleString("en-US")

export function LoopMilestoneUnlock({
  goal,
  eligibility,
}: {
  goal: number
  eligibility: string
}) {
  const model = useRoadTo10k()
  const total = model.total
  const reached = (model.data?.totalClaims ?? 0) >= goal
  const status = reached
    ? "Total claims goal reached · Preparing launch"
    : total != null && total >= goal
    ? "Confirming total claims milestone…"
    : `Unlocks at ${format(goal)} total claims`

  return (
    <LoopInactiveOverlay>
      <p className="font-baloo text-lg font-semibold leading-snug">{status}</p>
      {(total == null || model.pendingCount > 0) && (
        <div className="mt-3">
          {total == null ? (
            model.isPending || model.syncing ? (
              <div
                role="status"
                aria-label="Loading total claims progress"
                className="space-y-3 motion-safe:animate-pulse"
              >
                <div className="mx-auto h-4 w-32 rounded bg-muted" />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Total claims progress is temporarily unavailable.
              </p>
            )
          ) : (
            <>
              {model.pendingCount > 0 && (
                <p role="status" className="mt-2 text-xs text-muted-foreground">
                  {model.syncing
                    ? "Your claim is confirmed. Updating the total…"
                    : "Total update delayed"}
                </p>
              )}
            </>
          )}
        </div>
      )}
      <div className="mt-3 flex w-full items-center justify-center gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Eligibility
        </p>
        <p className="text-sm font-medium text-foreground">{eligibility}</p>
      </div>
    </LoopInactiveOverlay>
  )
}
