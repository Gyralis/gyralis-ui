import { getUserClaimRate } from "@/lib/profile/get-user-claim-rate"
import { Skeleton } from "@/components/ui/skeleton"

import { ProfileClaimRateGauge } from "./profile-claim-rate-gauge"

export async function ProfileClaimRate({ address }: { address: string }) {
  try {
    const data = await getUserClaimRate(address)
    return <ProfileClaimRateGauge data={data} />
  } catch {
    // Optional subgraph/RPC data must never block the rest of the profile.
    console.warn("Unable to load profile claim rate")
    return <ProfileClaimRateGauge data={null} />
  }
}

export function ProfileClaimRateSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading claim rate"
      className="flex h-full min-h-20 flex-col items-center justify-center gap-2 rounded-2xl border border-border/70 bg-background/60 px-2.5 py-2"
    >
      <Skeleton aria-hidden="true" className="h-9 w-[72px] rounded-t-full" />
      <Skeleton aria-hidden="true" className="h-3 w-16" />
    </div>
  )
}
