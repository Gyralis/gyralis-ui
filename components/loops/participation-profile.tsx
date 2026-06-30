"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useQuery } from "@tanstack/react-query"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { FaAward, FaChartLine, FaLayerGroup, FaUsers } from "react-icons/fa"

import { cn } from "@/lib/utils"
import { HighlightStatCard } from "@/components/stats/highlight-stat-card"

export interface ParticipationProfileData {
  rank: number
  percentile: string
  identityLabel: string
  streak: number
  tierLabel: string
  claims: number
  points: number
  earnings: number
  earningsSymbol: string
  activeLoops: number
}

export interface EcosystemMetricData {
  label: string
  value: string
}

interface ParticipationProfileProps {
  profile: ParticipationProfileData
  ecosystemMetrics: readonly [
    EcosystemMetricData,
    EcosystemMetricData,
    EcosystemMetricData,
    EcosystemMetricData
  ]
  preview?: boolean
}

export function getStreakFlameCount(streak: number) {
  if (streak >= 30) return 4
  if (streak >= 14) return 3
  if (streak >= 7) return 2
  return 1
}

export function ParticipationProfile({
  profile,
  ecosystemMetrics,
  preview = false,
}: ParticipationProfileProps) {
  const reduceMotion = useReducedMotion()
  const [claims, uniqueUsers, claimRate, activeLoops] = ecosystemMetrics
  const walletSectionClassName =
    "order-first col-span-2 mb-3 md:order-none md:col-span-1 md:mb-0"

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        mounted,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
      }) => {
        const ready = mounted && authenticationStatus !== "loading"
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated")

        return (
          <div
            id="participation-profile"
            className="relative mx-auto w-full max-w-7xl rounded-[1.35rem] bg-card text-card-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_24px_70px_-42px_rgba(28,231,131,0.28)]"
            style={{
              opacity: ready ? 1 : 0.65,
              pointerEvents: ready ? "auto" : "none",
            }}
          >
            <div className="relative grid grid-cols-2 items-stretch gap-3 md:grid-cols-[0.92fr_0.92fr_2.95fr_0.92fr_0.92fr] md:gap-4 border2">
              <HighlightStatCard
                title={uniqueUsers.label}
                value={uniqueUsers.value}
                icon={FaUsers}
                size="compact"
                className="rounded-[1.35rem]"
              />
              <HighlightStatCard
                title={claims.label}
                value={claims.value}
                icon={FaLayerGroup}
                size="compact"
              />

              <AnimatePresence mode="wait" initial={false}>
                {!connected ? (
                  <CenterAction
                    key="disconnected"
                    label="Connect Wallet"
                    onClick={openConnectModal}
                    reduceMotion={Boolean(reduceMotion)}
                    className={walletSectionClassName}
                  />
                ) : chain.unsupported ? (
                  <CenterAction
                    key="unsupported"
                    label="Switch Network"
                    onClick={openChainModal}
                    reduceMotion={Boolean(reduceMotion)}
                    warning
                    className={walletSectionClassName}
                  />
                ) : (
                  <TrueLooperStatusButton
                    key="connected"
                    onClick={openAccountModal}
                    address={account.address}
                    initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                    className={walletSectionClassName}
                    preview={preview}
                  />
                )}
              </AnimatePresence>

              <HighlightStatCard
                title={claimRate.label}
                value={claimRate.value}
                icon={FaChartLine}
                size="compact"
              />
              <HighlightStatCard
                title={activeLoops.label}
                value={activeLoops.value}
                icon={FaLayerGroup}
                size="compact"
              />
            </div>
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}

const TRUE_LOOPER_TARGET = 20

type UserScoringResponse = {
  success: boolean
  globalStats: {
    totalClaims: number
  } | null
}

function formatAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function TrueLooperStatusButton({
  address,
  onClick,
  className,
  ...motionProps
}: {
  address: string
  onClick: () => void
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
  const supportingCopy = isLoading
    ? "Loading claim history"
    : `${claimsRemaining} claim${
        claimsRemaining === 1 ? "" : "s"
      } left to unlock`

  return (
    <motion.button
      type="button"
      onClick={onClick}
      title={address}
      className={cn(
        className,
        "relative grid min-h-[92px] w-full grid-cols-[84px_minmax(0,1fr)_84px] items-center gap-4 overflow-hidden rounded-[1.35rem] border border-border/70 bg-muted/20 px-5 py-2.5 text-card-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_14px_34px_-20px_rgba(28,231,131,0.22)] transition-colors hover:border-primary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
      )}
      {...motionProps}
    >
      <TrueLooperBadge enabled={isTrueLooper} />

      <div className="min-w-0 text-center">
        {isTrueLooper ? (
          <>
            <span className="block font-baloo text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              You are a
            </span>
            <span className="mt-0.5 block whitespace-nowrap font-baloo text-[18px] font-semibold uppercase  text-card-foreground">
              True Looper
            </span>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center gap-2 whitespace-nowrap">
              <span className="font-baloo text-[13px] font-semibold uppercase tracking-[0.08em] text-card-foreground">
                Become True Looper
              </span>
              {/* <span className="truncate font-sans text-[13px] font-semibold text-muted-foreground">
                {formatAddress(address)}
              </span> */}
            </div>
            <span className="mt-1 block truncate text-[11px] leading-none text-muted-foreground">
              {supportingCopy}
            </span>
          </>
        )}
      </div>

      {isLoading ? (
        <TrueLooperClaimsSummary claims={null} label="Loading" />
      ) : isTrueLooper ? (
        <TrueLooperClaimsSummary claims={claims} />
      ) : (
        <TrueLooperProgressRing claims={claims} />
      )}
    </motion.button>
  )
}

function TrueLooperBadge({ enabled }: { enabled: boolean }) {
  return (
    <div
      className={cn(
        "relative flex size-[58px] items-center justify-center rounded-full border",
        enabled
          ? "border-primary/45 bg-primary/[0.08] text-primary shadow-[0_0_28px_-18px_rgba(28,231,131,0.8)]"
          : "border-border/80 bg-background/50 text-muted-foreground"
      )}
    >
      <div className="flex flex-col items-center justify-center">
        <FaAward className="size-4" />
        <span className="mt-0.5 font-baloo text-[8px] font-semibold uppercase tracking-widest">
          {enabled ? "True" : "Loop"}
        </span>
      </div>
    </div>
  )
}

function TrueLooperClaimsSummary({
  claims,
  label = "Claims",
}: {
  claims: number | null
  label?: string
}) {
  return (
    <div className="text-center">
      <span className="block font-sans text-[28px] font-bold leading-none tabular-nums text-primary">
        {claims == null ? "--" : claims}
      </span>
      <span className="mt-0.5 block font-baloo text-[8px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
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
}: {
  label: string
  onClick: () => void
  reduceMotion: boolean
  warning?: boolean
  className?: string
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
        className={
          warning
            ? "inline-flex min-h-12 items-center justify-center rounded-2xl bg-rose-500/90 px-6 text-sm font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
            : "inline-flex min-h-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1ce783_0%,#65df83_100%)] px-7 text-sm font-bold text-[#07140d] shadow-[0_12px_28px_-16px_rgba(28,231,131,0.8)] transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.98]"
        }
      >
        {label}
      </button>
    </motion.div>
  )
}
