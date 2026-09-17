import Image from "next/image"
import Link from "next/link"
import { FaArrowRight } from "react-icons/fa"

import type { ProfileLoopStats } from "@/lib/profile/get-profile-page-data"
import { getUnclaimedLoops } from "@/lib/profile/profile-opportunities"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export function ProfileExploreLoops({ loops }: { loops: ProfileLoopStats[] }) {
  const unclaimedLoops = getUnclaimedLoops(loops)
  if (unclaimedLoops.length === 0) return null

  return (
    <Card className="rounded-3xl border-border/70 bg-card text-card-foreground">
      <CardContent className="p-8">
        <h2 className="font-heading text-3xl font-bold text-foreground">
          Explore more loops
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          No recorded claims from this wallet in these loops yet. Explore
          their requirements and start earning more GP.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {unclaimedLoops.slice(0, 3).map((loop) => {
            const logoUrl =
              loop.communityLogoUrl ??
              loop.eligibilityLogoUrl ??
              loop.sponsorLogoUrl

            return (
              <Card
                key={`${loop.chainId}-${loop.id}`}
                className="rounded-2xl border-border/70 bg-muted/20"
              >
                <CardContent className="flex h-full flex-col gap-4 p-4">
                  <div className="flex items-center gap-3">
                    <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/70 bg-background/60 font-heading text-lg font-bold text-foreground">
                      {logoUrl ? (
                        <Image
                          src={logoUrl}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-contain p-1"
                        />
                      ) : (
                        loop.title.trim().charAt(0).toUpperCase()
                      )}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-foreground">
                        {loop.title}
                      </h3>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Sponsored by {loop.sponsorName ?? loop.by}
                      </p>
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className="w-fit border-border text-[10px] font-medium text-muted-foreground"
                  >
                    Not claimed yet
                  </Badge>
                  <p className="text-xs leading-5 text-muted-foreground">
                    {loop.eligibility}
                  </p>
                  <Link
                    href={`/loops#loop-card-${loop.id}`}
                    aria-label={`View ${loop.title} loop`}
                    className="tamagotchi-button-secondary mt-auto inline-flex min-h-10 items-center justify-center gap-2 px-4 text-sm"
                  >
                    View loop
                    <FaArrowRight className="size-3" aria-hidden="true" />
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
        {unclaimedLoops.length > 3 ? (
          <Link
            href="/loops"
            className="mt-4 inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            View all loops
          </Link>
        ) : null}
      </CardContent>
    </Card>
  )
}
