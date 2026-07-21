"use client"

import { useQuery } from "@tanstack/react-query"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { FaAward } from "react-icons/fa"

import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

const TRUE_LOOPER_TARGET = 50

type UserScoringResponse = {
  success: boolean
  globalStats: {
    totalClaims: number
  } | null
}

type ParticipationUserPanelProps = {
  address?: string
  connected: boolean
  unsupported: boolean
  onConnect: () => void
  onSwitchNetwork: () => void
  ready: boolean
}

export function ParticipationUserPanel({
  address,
  connected,
  unsupported,
  onConnect,
  onSwitchNetwork,
  ready,
}: ParticipationUserPanelProps) {
  const reduceMotion = useReducedMotion()
  const wrapperClassName =
    "order-first col-span-2 mb-3 md:order-none md:col-span-1 md:mb-0"

  return (
    <AnimatePresence mode="wait" initial={false}>
      {!connected ? (
        <CenterAction
          key="disconnected"
          label="Connect Wallet"
          onClick={onConnect}
          reduceMotion={Boolean(reduceMotion)}
          className={wrapperClassName}
          disabled={!ready}
        />
      ) : unsupported ? (
        <CenterAction
          key="unsupported"
          label="Switch Network"
          onClick={onSwitchNetwork}
          reduceMotion={Boolean(reduceMotion)}
          warning
          className={wrapperClassName}
        />
      ) : address ? (
        <TrueLooperStatusPanel
          key="connected"
          address={address}
          className={wrapperClassName}
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
        />
      ) : null}
    </AnimatePresence>
  )
}

function TrueLooperStatusPanel({
  address,
  className,
  ...motionProps
}: {
  address: string
  className?: string
  initial?: false | { opacity: number; y: number }
  animate?: { opacity: number; y: number }
  exit?: { opacity: number; y: number }
}) {
  const { data, isLoading } = useQuery<UserScoringResponse | null>({
    queryKey: ["user-scoring", address.toLowerCase()],
    queryFn: async () => {
      const response = await fetch(`/api/users/${address}/scoring`)

      if (response.status === 404) return null
      if (!response.ok) {
        throw new Error(`Failed to fetch scoring for ${address}`)
      }

      return response.json()
    },
    enabled: Boolean(address),
  })

  const claims = data?.globalStats?.totalClaims ?? 0
  const isTrueLooper = claims >= TRUE_LOOPER_TARGET
  const claimsRemaining = Math.max(TRUE_LOOPER_TARGET - claims, 0)

  return (
    <motion.div
      title={address}
      className={cn(
        className,
        "relative -translate-y-2 w-full flex items-center gap-2 overflow-hidden rounded-full px-6 py-2 text-card-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_22px_40px_-26px_rgba(15,23,42,0.24),0_26px_34px_-24px_rgba(28,231,131,0.38)] backdrop-blur-xl md:-translate-y-2.5 "
      )}
      {...motionProps}
    >
      {isLoading ? (
        <TrueLooperLoadingSkeleton />
      ) : (
        <>
          <TrueLooperBadge enabled={isTrueLooper} />

          <div className="mx-auto flex min-w-0 w-fit flex-col items-center text-center">
            {isTrueLooper ? (
              <>
                <span className="block whitespace-nowrap font-baloo text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  You are a
                </span>
                <span className="mt-0.5 block whitespace-nowrap font-baloo text-[17px] font-semibold uppercase leading-none text-card-foreground">
                  True Looper
                </span>
              </>
            ) : (
              <>
                <span className="block whitespace-nowrap font-baloo text-[13px] font-semibold uppercase tracking-[0.06em] text-card-foreground">
                  Become True Looper
                </span>
                <span className="mt-1 block truncate text-[11px] leading-none text-muted-foreground">
                  {claimsRemaining} claim{claimsRemaining === 1 ? "" : "s"} left
                  to unlock
                </span>
              </>
            )}
          </div>

          {isTrueLooper ? (
            <TrueLooperClaimsSummary claims={claims} />
          ) : (
            <TrueLooperProgressRing claims={claims} />
          )}
        </>
      )}
    </motion.div>
  )
}

function TrueLooperLoadingSkeleton() {
  return (
    <div className="flex w-full items-center gap-3">
      <Skeleton className="size-[55px] rounded-full border border-muted-foreground bg-muted-foreground" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-28 rounded-full bg-muted-foreground/20" />
        <Skeleton className="h-3 w-44 max-w-full rounded-full bg-muted-foreground/15" />
      </div>
    </div>
  )
}

function TrueLooperBadge({ enabled }: { enabled: boolean }) {
  return (
    <div
      className={cn(
        "relative flex size-[55px] items-center justify-center rounded-full border",
        enabled
          ? "border-primary/45 bg-primary/[0.08] text-primary shadow-[0_0_28px_-18px_rgba(28,231,131,0.8)]"
          : "border-border/80 bg-background/50 text-muted-foreground"
      )}
    >
      <div className="flex flex-col items-center justify-center">
        <FaAward className="size-4" />
        <span className="mt-0.5 font-sans text-[10px] font-bold leading-none tabular-nums">
          +{TRUE_LOOPER_TARGET}
        </span>
      </div>
    </div>
  )
}

function TrueLooperClaimsSummary({ claims }: { claims: number }) {
  return (
    <div className="text-center">
      <span className="block font-sans text-[28px] font-bold leading-none tabular-nums text-primary">
        {claims}
      </span>
      <span className="mt-0.5 block font-baloo text-[8px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        Claims
      </span>
    </div>
  )
}

function TrueLooperProgressRing({ claims }: { claims: number }) {
  const progressValue = Math.max(
    0,
    Math.min(100, Math.round((claims / TRUE_LOOPER_TARGET) * 100))
  )
  const radius = 24
  const circumference = 2 * Math.PI * radius
  const strokeOffset = circumference - (progressValue / 100) * circumference

  return (
    <div className="relative flex size-[64px] items-center justify-center">
      <svg
        className="absolute inset-0 size-full -rotate-90"
        viewBox="0 0 64 64"
        aria-hidden="true"
      >
        <circle
          cx="32"
          cy="32"
          fill="none"
          r={radius}
          stroke="hsl(var(--border))"
          strokeWidth="5"
        />
        <circle
          cx="32"
          cy="32"
          fill="none"
          r={radius}
          stroke="hsl(var(--primary))"
          strokeDasharray={circumference}
          strokeDashoffset={strokeOffset}
          strokeLinecap="round"
          strokeWidth="5"
          className="transition-[stroke-dashoffset] duration-500 ease-out"
        />
      </svg>
      <span className="relative flex flex-col items-center justify-center font-sans leading-none">
        <span className="text-base font-bold text-primary">{claims}</span>
        <span className="mt-0.5 text-[9px] text-muted-foreground">
          /{TRUE_LOOPER_TARGET}
        </span>
      </span>
    </div>
  )
}

function CenterAction({
  label,
  onClick,
  reduceMotion,
  warning = false,
  className,
  disabled = false,
}: {
  label: string
  onClick: () => void
  reduceMotion: boolean
  warning?: boolean
  className?: string
  disabled?: boolean
}) {
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0, scale: 0.98 }}
      className={`${
        className ?? ""
      } flex min-h-[96px] items-center justify-center rounded-[1.75rem] px-4`}
    >
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={
          warning
            ? "inline-flex min-h-12 items-center justify-center rounded-full bg-rose-500/90 px-6 text-sm font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 disabled:pointer-events-none disabled:opacity-60"
            : "inline-flex min-h-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#1ce783_0%,#65df83_100%)] px-7 text-sm font-bold text-[#07140d] shadow-[0_12px_28px_-16px_rgba(28,231,131,0.8)] transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
        }
      >
        {label}
      </button>
    </motion.div>
  )
}
