"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Close as PopoverClose } from "@radix-ui/react-popover"
import { useQuery } from "@tanstack/react-query"
import { FaRegUserCircle } from "react-icons/fa"
import { Cell, Pie, PieChart } from "recharts"
import { useAccount } from "wagmi"

import { useIsMounted } from "@/lib/hooks/use-is-mounted"
import {
  getProfilePillProgress,
  type ProfileSummary,
} from "@/lib/profile/profile-level"
import { Skeleton } from "@/components/ui/skeleton"
import { ProfileDetails } from "@/components/profile/profile-details"

export function ProfileUserPill({
  compact = false,
  onNavigate,
}: {
  compact?: boolean
  onNavigate?: () => void
}) {
  const mounted = useIsMounted()
  const { address, isConnected, isConnecting, isReconnecting } = useAccount()
  const wallet = address?.toLowerCase()
  const walletReady = mounted && !isConnecting && !isReconnecting
  const query = useQuery({
    queryKey: ["profile-summary", wallet],
    enabled: walletReady && isConnected && Boolean(wallet),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    queryFn: async ({ signal }): Promise<ProfileSummary> => {
      if (!wallet) throw new Error("No connected wallet")
      const response = await fetch(`/api/users/${wallet}/profile-summary`, {
        signal,
        cache: "no-store",
      })
      if (!response.ok) throw new Error("Unable to load profile")
      const data: ProfileSummary = await response.json()
      if (
        data.address !== wallet ||
        !Number.isFinite(data.totalPoints) ||
        !Number.isFinite(data.totalClaims)
      ) {
        throw new Error("Invalid profile response")
      }
      return data
    },
  })

  const textClass = compact ? "hidden" : "min-w-0 whitespace-nowrap"
  const pillClass =
    "inline-flex h-10 w-fit shrink-0 items-center justify-center gap-2 rounded-md bg-background/70 px-3 text-left text-sm font-semibold text-foreground shadow-sm backdrop-blur transition-colors hover:bg-accent/60 dark:bg-white/[0.05] dark:hover:bg-white/[0.08]"

  if (!walletReady || (isConnected && query.isPending)) {
    return (
      <div
        role="status"
        aria-label="Loading profile summary"
        aria-busy="true"
        className={pillClass}
      >
        <Skeleton className="size-6 shrink-0 rounded-full" />
        <div aria-hidden="true" className={`${textClass} space-y-1`}>
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-44" />
        </div>
      </div>
    )
  }
  if (!isConnected || !wallet) return null

  if (!query.data) {
    return (
      <ProfilePillTarget
        wallet={wallet}
        compact={compact}
        onNavigate={onNavigate}
        pillClass={pillClass}
        headline="Your profile"
        description="Stats unavailable · Open profile"
        icon={
          <FaRegUserCircle
            className="size-8 shrink-0 p-1.5 text-muted-foreground"
            aria-hidden="true"
          />
        }
      />
    )
  }

  const data = query.data
  const progress = getProfilePillProgress(data)
  const value = Math.min(100, Math.max(0, progress.progress))
  const points = new Intl.NumberFormat("en-US").format(data.totalPoints)
  const headline = `${progress.level} · ${points} GP`

  return (
    <ProfilePillTarget
      wallet={wallet}
      compact={compact}
      onNavigate={onNavigate}
      pillClass={pillClass}
      headline={headline}
      headlineContent={<>{progress.level} · {points}{" "}<span className="text-muted-foreground">GP</span></>}
      description={progress.description}
      icon={
        <span
          aria-hidden="true"
          className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10"
        >
          <PieChart width={24} height={24} accessibilityLayer={false}>
            <Pie
              data={[{ value }, { value: 100 - value }]}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={7}
              outerRadius={10}
              startAngle={90}
              endAngle={-270}
              stroke="none"
              isAnimationActive={false}
            >
              <Cell fill="hsl(var(--primary))" />
              <Cell fill="hsl(var(--primary) / 0.2)" />
            </Pie>
          </PieChart>
        </span>
      }
    />
  )
}

function ProfilePillTarget({
  wallet,
  compact,
  onNavigate,
  pillClass,
  headline,
  headlineContent,
  description,
  icon,
}: {
  wallet: string
  compact: boolean
  onNavigate?: () => void
  pillClass: string
  headline: string
  headlineContent?: ReactNode
  description: string
  icon: ReactNode
}) {
  const pathname = usePathname()
  const isProfilePage = pathname === "/profile" || pathname.startsWith("/profile/")
  const className = `${pillClass} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`
  const text = (
    <span className="min-w-0">
      <span className="block text-[13px] font-semibold leading-4 text-foreground tabular-nums">
        {headlineContent ?? headline}
      </span>
      <span className="block text-[10px] leading-4 text-muted-foreground">
        {description}
      </span>
    </span>
  )

  if (compact) {
    return (
      <ProfileDetails
        key={wallet}
        label={`${headline}. Show profile details`}
        align="end"
        className="w-64 max-w-[calc(100vw-2rem)] rounded-2xl border-border/70 bg-card !p-4 text-left text-card-foreground"
        trigger={
          <button type="button" className={className}>
            {icon}
          </button>
        }
      >
        {text}
        {!isProfilePage && <PopoverClose asChild>
          <Link
            href={`/profile/${wallet}`}
            prefetch={false}
            onClick={onNavigate}
            className="mt-3 inline-flex min-h-10 items-center text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Open profile
          </Link>
        </PopoverClose>}
      </ProfileDetails>
    )
  }

  if (isProfilePage) {
    return (
      <div className={pillClass}>
        {icon}
        <span className="whitespace-nowrap">{text}</span>
      </div>
    )
  }

  return (
    <Link
      href={`/profile/${wallet}`}
      prefetch={false}
      onClick={onNavigate}
      aria-label={`${headline}. ${description}. Open profile.`}
      className={className}
    >
      {icon}
      <span className="whitespace-nowrap">{text}</span>
    </Link>
  )
}
