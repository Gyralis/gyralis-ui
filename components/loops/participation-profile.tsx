"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"

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
  ecosystemMetrics: [
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
  const [claims, loopers, claimRate, activeLoops] = ecosystemMetrics

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
            className="relative mx-auto w-full max-w-[920px] rounded-[2.25rem] border border-white/10 bg-[linear-gradient(145deg,rgba(15,20,33,0.9),rgba(8,12,22,0.96))] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_24px_70px_-42px_rgba(28,231,131,0.44)] backdrop-blur-2xl"
            style={{
              opacity: ready ? 1 : 0.65,
              pointerEvents: ready ? "auto" : "none",
            }}
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(28,231,131,0.08),transparent_32%),radial-gradient(circle_at_90%_0%,rgba(140,75,255,0.08),transparent_28%)]" />
            </div>

            <div className="relative grid grid-cols-2 items-stretch md:grid-cols-[1fr_1fr_1.5fr_1fr_1fr]">
              <OverallMetric metric={claims} />
              <OverallMetric metric={loopers} bordered />

              <div className="order-first col-span-2 mb-2 md:order-none md:col-span-1 md:-my-3 md:mb-0 md:px-2">
                <AnimatePresence mode="wait" initial={false}>
                  {!connected ? (
                    <CenterAction
                      key="disconnected"
                      label="Connect Wallet"
                      onClick={openConnectModal}
                      reduceMotion={Boolean(reduceMotion)}
                    />
                  ) : chain.unsupported ? (
                    <CenterAction
                      key="unsupported"
                      label="Switch Network"
                      onClick={openChainModal}
                      reduceMotion={Boolean(reduceMotion)}
                      warning
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
                      className="relative flex min-h-[104px] w-full items-center justify-center gap-5 overflow-hidden rounded-[1.75rem] border border-primary/25 bg-[linear-gradient(145deg,rgba(24,38,38,0.96),rgba(11,20,25,0.98))] px-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_14px_34px_-20px_rgba(28,231,131,0.72)] transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
                    >
                      {preview ? (
                        <span className="absolute right-3 top-2 text-[8px] font-semibold uppercase tracking-[0.14em] text-white/[0.35]">
                          Preview
                        </span>
                      ) : null}

                      <div className="text-center">
                        <span className="block font-heading text-3xl font-bold leading-none">
                          #{profile.rank}
                        </span>
                        <span className="mt-1.5 block text-[9px] font-bold uppercase tracking-[0.14em] text-white/55">
                          {profile.identityLabel}
                        </span>
                      </div>

                      <div className="h-12 w-px bg-white/10" />

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
                          {Array.from({ length: flameCount }, () => "🔥").join(
                            ""
                          )}
                        </motion.span>
                        <span className="mt-1 block font-heading text-3xl font-bold leading-none text-primary drop-shadow-[0_0_14px_rgba(28,231,131,0.32)]">
                          {profile.streak}
                        </span>
                        <span className="mt-1.5 block text-[9px] font-bold uppercase tracking-[0.14em] text-white/55">
                          Current streak
                        </span>
                      </div>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              <OverallMetric metric={claimRate} bordered />
              <OverallMetric metric={activeLoops} />
            </div>
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}

function OverallMetric({
  metric,
  bordered = false,
}: {
  metric: EcosystemMetricData
  bordered?: boolean
}) {
  return (
    <div
      className={`flex min-h-[88px] flex-col items-center justify-center px-3 text-center md:min-h-[92px] ${
        bordered ? "border-l border-white/10" : ""
      }`}
    >
      <span className="font-heading text-2xl font-bold leading-none tabular-nums text-white sm:text-3xl">
        {metric.value}
      </span>
      <span className="mt-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-white/[0.45] sm:text-[10px]">
        {metric.label}
      </span>
    </div>
  )
}

function CenterAction({
  label,
  onClick,
  reduceMotion,
  warning = false,
}: {
  label: string
  onClick: () => void
  reduceMotion: boolean
  warning?: boolean
}) {
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0, scale: 0.98 }}
      className="flex min-h-[104px] items-center justify-center rounded-[1.75rem] border border-white/10 bg-[linear-gradient(145deg,rgba(20,28,39,0.96),rgba(10,16,26,0.98))] px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_14px_34px_-22px_rgba(28,231,131,0.65)]"
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
