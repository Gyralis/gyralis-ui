"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { FaChartLine, FaLayerGroup, FaUsers } from "react-icons/fa"

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
  const flameCount = getStreakFlameCount(profile.streak)
  const [claims, uniqueUsers, claimRate, activeLoops] = ecosystemMetrics
  const walletSectionClassName =
    "order-first col-span-2 mb-2 md:order-none md:col-span-1 md:-my-1 md:mb-0 md:px-1"

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
            className="relative mx-auto w-full max-w-[920px] rounded-[1.35rem] border border-border bg-card px-6 py-4 text-card-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_24px_70px_-42px_rgba(28,231,131,0.28)]"
            style={{
              opacity: ready ? 1 : 0.65,
              pointerEvents: ready ? "auto" : "none",
            }}
          >
            <div className="relative grid grid-cols-2 gap-3 items-stretch md:grid-cols-[1.12fr_1.12fr_1.05fr_1.12fr_1.12fr] md:gap-4">
              <div>
                <HighlightStatCard
                  title={uniqueUsers.label}
                  value={uniqueUsers.value}
                  icon={FaUsers}
                  size="compact"
                  className="rounded-[1.35rem]"
                />
              </div>
              <div>
                <HighlightStatCard
                  title={claims.label}
                  value={claims.value}
                  icon={FaLayerGroup}
                  size="compact"
                />
              </div>

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
                  <motion.button
                    key="connected"
                    type="button"
                    onClick={openAccountModal}
                    title={account.address}
                    initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                    className={`${walletSectionClassName} relative flex min-h-[96px] w-full items-center justify-center gap-5 overflow-hidden rounded-[1.75rem] border border-primary/25 bg-card px-5 text-card-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_14px_34px_-20px_rgba(28,231,131,0.42)] transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70`}
                  >
                    {preview ? (
                      <span className="absolute right-3 top-2 text-[8px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Preview
                      </span>
                    ) : null}

                    <div className="text-center">
                      <span className="block font-heading text-3xl font-bold leading-none">
                        #{profile.rank}
                      </span>
                      <span className="mt-1.5 block text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                        {profile.identityLabel}
                      </span>
                    </div>

                    <div className="h-12 w-px bg-border" />

                    <div className="text-center">
                      <motion.span
                        aria-label={`${flameCount} flame streak level`}
                        className="block whitespace-nowrap text-lg leading-none"
                        animate={
                          reduceMotion ? undefined : { scale: [1, 1.06, 1] }
                        }
                        transition={{
                          duration: 2.4,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        {Array.from({ length: flameCount }, () => "🔥").join("")}
                      </motion.span>
                      <span className="mt-1 block font-heading text-3xl font-bold leading-none text-primary drop-shadow-[0_0_14px_rgba(28,231,131,0.32)]">
                        {profile.streak}
                      </span>
                      <span className="mt-1.5 block text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                        Current streak
                      </span>
                    </div>
                  </motion.button>
                )}
              </AnimatePresence>

              <div>
                <HighlightStatCard
                  title={claimRate.label}
                  value={claimRate.value}
                  icon={FaChartLine}
                  size="compact"
                />
              </div>
              <div>
                <HighlightStatCard
                  title={activeLoops.label}
                  value={activeLoops.value}
                  icon={FaLayerGroup}
                  size="compact"
                />
              </div>
            </div>
          </div>
        )
      }}
    </ConnectButton.Custom>
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
      className={`${className ?? ""} flex min-h-[96px] items-center justify-center rounded-[1.75rem] border border-border bg-card px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_14px_34px_-22px_rgba(28,231,131,0.32)]`}
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
