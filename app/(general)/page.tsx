"use client"

import { ReactNode, useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import {
  FaArrowRight,
  FaCheck,
  FaDiscord,
  FaFireAlt,
  FaGithub,
  FaLockOpen,
  FaRedoAlt,
  FaShieldAlt,
  FaThumbsUp,
  FaWallet,
} from "react-icons/fa"
import { FaXTwitter } from "react-icons/fa6"
import { LuArrowDown, LuChevronDown } from "react-icons/lu"

import { cn } from "@/lib/utils"
import { GlowingEffect } from "@/components/ui/glowing-effect"
import { NavLogoMark } from "@/components/layout/main-nav"

type HeroHistorySummary = {
  totalClaims: number
  totalRegistrations: number
  uniqueUsers: number
  claimRatePercent: number | null
  snapshotDate: string | null
  recordedAt: string | null
  totalDistributedAmount: string | null
  totalDistributedSymbol: string | null
}

type LoopFeature = {
  title: string
  description: string
  icon: ReactNode
  tone: "primary" | "secondary" | "super"
}

const loopFeatures: LoopFeature[] = [
  {
    title: "Verified Access",
    description:
      "Decide who gets in with human checks and custom eligibility rules that stay visible to everyone.",
    icon: <FaThumbsUp className="size-5" aria-hidden="true" />,
    tone: "secondary",
  },
  {
    title: "Recurring Rewards",
    description:
      "Run repeatable on-chain reward cycles that contributors can count on and return to every distribution period.",
    icon: <FaRedoAlt className="size-5" aria-hidden="true" />,
    tone: "primary",
  },
  {
    title: "Streaks & Scores",
    description:
      "Turn repeat participation into visible momentum with streaks, scores, and social proof that keep contributors coming back.",
    icon: <FaFireAlt className="size-5" aria-hidden="true" />,
    tone: "primary",
  },
  {
    title: "Custom Reward Mechanics",
    description:
      "Shape each loop around your community with custom cadence, incentives, and eligibility logic that fit your program.",
    icon: <FaLockOpen className="size-5" aria-hidden="true" />,
    tone: "secondary",
  },
]

const stepsData = [
  {
    title: "Register",
    icon: <FaShieldAlt className="size-5" aria-hidden="true" />,
    description:
      "Pass the loop requirements and enter the loop to start claiming each distribution period.",
    action: "Enter the Loop",
    helper: "Prove Participation",
    status: "Eligibility Passed",
    loopState:
      "Eligibility is verified and loop access is unlocked for this user.",
  },
  {
    title: "Claim",
    icon: <FaWallet className="size-5" aria-hidden="true" />,
    description:
      "Claim the current distribution period in a simple on-chain flow and receive rewards directly in your wallet.",
    action: "Claim",
    helper: "Earn Rewards",
    status: "Claim Window Open",
    loopState:
      "The current distribution period is available and the claim flow is ready.",
  },
  {
    title: "Streak",
    icon: <FaFireAlt className="size-5" aria-hidden="true" />,
    description:
      "Return next period to keep your streak alive, raise your score, and prove recurring participation over time.",
    action: "Streak",
    helper: "Build Momentum",
    status: "Momentum Building",
    loopState:
      "The streak is active and the next return keeps momentum building.",
  },
]

const eligibilityPartners = [
  {
    title: "1Hive",
    description:
      "Community connected to Gyralis for checking loop eligibility through Gardens.",
    logoUrl: "/1Hive-logo.png",
  },
  {
    title: "Blockscout",
    description:
      "Blockscout community Merits Program integration for checking loop eligibility.",
    logoUrl: "/blockscout-logo.png",
  },
  {
    title: "Human Passport",
    description:
      "Verifies humanity and score through GyraHub to keep loop access human-first.",
    logoUrl: "/passport-logo.svg",
  },
  {
    title: "Gardens",
    description:
      "DAO coordination framework powering community membership checks.",
    logoUrl: "/gardens-logo.png",
  },
] as const

const faqItems = [
  {
    question: "How are rewards calculated?",
    answer:
      "Each Loop uses a fixed distribution percentage that applies to every claim period. The amount to distribute comes from that percentage and the loop balance snapshot of the previous period, and the resulting rewards are split evenly across all registered users in that cycle.",
  },
  {
    question: "Can loops use different settings and cycle lengths?",
    answer:
      "Yes. Loops are customizable, so each protocol or community can set its own distribution percentage, claim cadence, eligibility logic, and reward structure. The default and recommended claiming window is every 24 hours, but loop cycles can be configured to run more or less frequently depending on the program.",
  },
  {
    question: "What is the difference between Loops and SuperLoops?",
    answer:
      "Loops follow a recurring participation cycle where users register, claim, and maintain a streak period by period. Loop rewards decay over time, so earlier participation matters. SuperLoops follow a register, accumulate, and claim model: rewards accumulate every 24 hours and distribute an equal amount each period to every registered user.",
  },
  {
    question: "What happens if I miss a claim period?",
    answer:
      "If you miss a claim period, your streak for that specific loop is lost. You need to register again and wait until the next claiming period to participate.",
  },
  {
    question: "When are eligibility and human score checks evaluated?",
    answer:
      "Eligibility and human score checks are evaluated each time you try to enter or claim. Loop access stays human-first, and every new registration or claim attempt must still satisfy the active requirements for that loop.",
  },
] as const

const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "Loops", href: "#loops" },
      { label: "SuperLoops", href: "#loops" },
      { label: "Stats", href: "/dashboard" },
      { label: "Eligibilities", href: "/eligibilities" },
    ],
  },

  {
    title: "Community",
    links: [
      { label: "Discord", href: "https://discord.gg/VgGQHDpn" },
      { label: "Twitter", href: "https://x.com/gyralis_xyz" },
    ],
  },
  {
    title: "Builders",
    links: [
      {
        label: "GitHub",
        href: "https://github.com/orgs/Gyralis/repositories",
      },
    ],
  },
]

function SurfaceIcon({
  children,
  tone = "primary",
}: {
  children: ReactNode
  tone?: "primary" | "secondary" | "super"
}) {
  return (
    <div
      className={cn(
        "flex size-[52px] items-center justify-center rounded-2xl border border-[#764bff]/22 bg-[#764bff]/12 text-[#764bff] transition-all duration-300",
        "group-hover:border-primary/35 group-hover:bg-primary/12 group-hover:text-primary group-hover:shadow-[0_0_24px_rgba(28,231,131,0.18)]"
      )}
    >
      {children}
    </div>
  )
}

function LandingFeatureCard({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("group h-full list-none", className)}>
      <div className="relative h-full rounded-[1.75rem] border border-border/70 p-2 md:rounded-[1.85rem]">
        <GlowingEffect
          spread={36}
          glow
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
        />
        <div className="relative flex h-full flex-col rounded-[1.2rem] border border-white/[0.06] bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_100%)] p-6 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.35)] backdrop-blur-sm dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.015)_100%)]">
          {children}
        </div>
      </div>
    </div>
  )
}

function LandingStatCard({
  title,
  value,
  suffix,
  helper,
  progress,
}: {
  title: string
  value: ReactNode
  suffix?: string | null
  helper: string
  progress?: number | null
}) {
  return (
    <LandingFeatureCard className="min-h-52">
      <div className="flex h-full flex-col gap-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {title}
        </p>
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-mono text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {value}
          </span>
          {suffix ? (
            <span className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {suffix}
            </span>
          ) : null}
        </div>
        <div className="mt-auto space-y-3">
          {progress != null ? (
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-[linear-gradient(135deg,#1ce783_0%,#4ade80_100%)]"
                style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }}
              />
            </div>
          ) : null}
          <p className="text-sm leading-6 text-muted-foreground">{helper}</p>
        </div>
      </div>
    </LandingFeatureCard>
  )
}

function SectionLabel({
  children,
  className = "",
  textClassName = "",
  lineClassName = "",
}: {
  children: ReactNode
  className?: string
  textClassName?: string
  lineClassName?: string
}) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className={`inline-flex w-fit flex-col items-start ${className}`}>
      <div className="overflow-hidden">
        <motion.span
          initial={shouldReduceMotion ? false : { opacity: 0, x: -18 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className={`block font-mono text-[0.94rem] tracking-[0.18em] text-primary ${textClassName}`}
        >
          {children}
        </motion.span>
      </div>
      <motion.span
        initial={shouldReduceMotion ? false : { scaleX: 0.2, opacity: 0.45 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ delay: 0.14, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`mt-2 block h-px w-full origin-center bg-primary shadow-[0_0_14px_rgba(28,231,131,0.55)] ${lineClassName}`}
      />
    </div>
  )
}

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Register → Claim → Streak: muted green warming to primary, then heating
// into violet to carry the streak feeling.
function TypewriterText({
  text,
  startDelayMs = 150,
}: {
  text: string
  startDelayMs?: number
}) {
  const shouldReduceMotion = useReducedMotion()
  const [typedCount, setTypedCount] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (shouldReduceMotion) {
      setTypedCount(text.length)
      setDone(true)
      return
    }

    let interval: number | undefined
    let doneTimeout: number | undefined
    let current = 0

    const startTimeout = window.setTimeout(() => {
      interval = window.setInterval(() => {
        current += 1
        setTypedCount(current)

        if (current >= text.length) {
          window.clearInterval(interval)
          doneTimeout = window.setTimeout(() => setDone(true), 600)
        }
      }, 45)
    }, startDelayMs)

    return () => {
      window.clearTimeout(startTimeout)
      window.clearInterval(interval)
      window.clearTimeout(doneTimeout)
    }
  }, [shouldReduceMotion, startDelayMs, text])

  return (
    <span aria-label={text} role="text" className="relative inline-block">
      {/* Invisible full text reserves the final width so typing doesn't shift the centered layout. */}
      <span aria-hidden="true" className="invisible">
        {text}
      </span>
      <span aria-hidden="true" className="absolute inset-0 whitespace-nowrap">
        {text.slice(0, typedCount)}
        <span
          className={cn(
            "ml-0.5 inline-block h-[0.95em] w-[0.5ch] translate-y-[0.12em] bg-primary transition-opacity duration-300",
            done ? "opacity-0" : "animate-pulse"
          )}
        />
      </span>
    </span>
  )
}

const stepGradients = [
  "linear-gradient(to bottom right, #17241f, #3d6b57)",
  "linear-gradient(to bottom right, #0f2f25, #1ce783)",
  "linear-gradient(to bottom right, #241043, #764bff 60%, #a34bff)",
]

// Accent per step, taken from the hot end of each card gradient.
const stepAccents = ["#4e8a70", "#1ce783", "#a34bff"]

function HowItWorksSteps() {
  const shouldReduceMotion = useReducedMotion()
  const [activeStep, setActiveStep] = useState(0)
  const step = stepsData[activeStep] ?? stepsData[0]

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-stretch">
      <div className="flex flex-col gap-4">
        {stepsData.map((item, index) => {
          const isActive = index === activeStep
          const accent = stepAccents[index] ?? stepAccents[0]

          return (
            <motion.button
              key={item.title}
              type="button"
              initial={shouldReduceMotion ? false : { opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.45,
                delay: index * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              onClick={() => setActiveStep(index)}
              onMouseEnter={() => setActiveStep(index)}
              onFocus={() => setActiveStep(index)}
              aria-pressed={isActive}
              style={
                isActive
                  ? {
                      borderColor: `${accent}73`,
                      backgroundColor: `${accent}12`,
                      boxShadow: `0 0 30px -12px ${accent}59`,
                    }
                  : undefined
              }
              className={cn(
                "flex w-full items-start gap-5 rounded-3xl border p-6 text-left transition-all duration-200",
                !isActive &&
                  "border-border/70 bg-card/50 hover:border-border hover:bg-card"
              )}
            >
              <div
                style={
                  isActive
                    ? {
                        borderColor: `${accent}73`,
                        backgroundColor: `${accent}26`,
                        color: accent,
                      }
                    : undefined
                }
                className={cn(
                  "mt-0.5 flex size-12 shrink-0 items-center justify-center rounded-2xl border transition-colors duration-200",
                  !isActive && "border-border bg-muted/40 text-muted-foreground"
                )}
              >
                {item.icon}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span
                    style={isActive ? { color: accent } : undefined}
                    className={cn(
                      "font-mono text-xs tracking-[0.18em] transition-colors duration-200",
                      !isActive && "text-foreground"
                    )}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3
                    style={isActive ? { color: accent } : undefined}
                    className={cn(
                      "font-heading text-xl font-semibold transition-colors duration-200",
                      !isActive && "text-foreground"
                    )}
                  >
                    {item.title}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {item.helper}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </motion.button>
          )
        })}
      </div>

      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, x: 28 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="h-full"
      >
        <motion.div
          key={activeStep}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          style={{
            background: stepGradients[activeStep % stepGradients.length],
          }}
          className="h-full min-h-80 overflow-hidden rounded-[1.8rem] shadow-[0_22px_50px_rgba(0,0,0,0.18)]"
        >
          <div className="flex h-full flex-col justify-between gap-6 p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-white/12 text-white shadow-[0_0_18px_rgba(255,255,255,0.14)]">
                {step.icon}
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
                  Participant view
                </p>
                <p className="text-base font-semibold text-white">
                  {step.status}
                </p>
              </div>
            </div>

            <div className="rounded-[1.2rem] border border-white/10 bg-black/15 p-4 backdrop-blur-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
                Loop state
              </p>
              <p className="mt-2 text-sm leading-7 text-white/90">
                {step.loopState}
              </p>
            </div>

            <div className="inline-flex min-h-[46px] w-full items-center justify-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_8px_20px_-18px_rgba(0,0,0,0.45)] backdrop-blur-sm">
              {step.action}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

function AnimatedStatValue({
  value,
  decimals = 0,
  durationMs = 650,
}: {
  value: number
  decimals?: number
  durationMs?: number
}) {
  const shouldReduceMotion = useReducedMotion()
  const ref = useRef<HTMLSpanElement | null>(null)
  const [isInView, setIsInView] = useState(false)
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const node = ref.current

    if (!node || isInView) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries

        if (entry?.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.45 }
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [isInView])

  useEffect(() => {
    if (!isInView) {
      return
    }

    if (shouldReduceMotion) {
      setDisplayValue(value)
      return
    }

    const startValue = 0
    const animationStart = performance.now()
    let frame = 0

    const tick = (now: number) => {
      const progress = Math.min((now - animationStart) / durationMs, 1)
      const eased = 1 - Math.pow(1 - progress, 4)
      const nextValue = startValue + (value - startValue) * eased

      setDisplayValue(nextValue)

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick)
      }
    }

    frame = window.requestAnimationFrame(tick)

    return () => window.cancelAnimationFrame(frame)
  }, [durationMs, isInView, shouldReduceMotion, value])

  return (
    <span ref={ref} className="tabular-nums">
      {displayValue.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </span>
  )
}

export default function HomePage() {
  const shouldReduceMotion = useReducedMotion()
  const [activeFaq, setActiveFaq] = useState(faqItems[0]?.question ?? "")
  const [heroSummary, setHeroSummary] = useState<HeroHistorySummary>({
    totalClaims: 2858,
    totalRegistrations: 3349,
    uniqueUsers: 160,
    claimRatePercent: 85.34,
    snapshotDate: "2026-06-29",
    recordedAt: null,
    totalDistributedAmount: "188.231562112844065919",
    totalDistributedSymbol: "HNY",
  })

  useEffect(() => {
    let cancelled = false

    const loadHeroSummary = async () => {
      try {
        const response = await fetch("/api/loops/history/summary", {
          cache: "no-store",
        })
        if (!response.ok) return

        const payload = (await response.json()) as {
          success?: boolean
          snapshotDate?: string | null
          recordedAt?: string | null
          stats?: {
            totalClaims?: number
            totalRegistrations?: number
            uniqueUsers?: number
            claimRatePercent?: number | null
            totalDistributedAmount?: string | null
            totalDistributedSymbol?: string | null
          }
        }

        if (!cancelled && payload.success && payload.stats) {
          setHeroSummary({
            totalClaims: payload.stats.totalClaims ?? 0,
            totalRegistrations: payload.stats.totalRegistrations ?? 0,
            uniqueUsers: payload.stats.uniqueUsers ?? 0,
            claimRatePercent: payload.stats.claimRatePercent ?? null,
            snapshotDate: payload.snapshotDate ?? null,
            recordedAt: payload.recordedAt ?? null,
            totalDistributedAmount:
              payload.stats.totalDistributedAmount ?? null,
            totalDistributedSymbol:
              payload.stats.totalDistributedSymbol ?? null,
          })
        }
      } catch {
        // Keep the latest known snapshot fallback when the fetch fails.
      }
    }

    void loadHeroSummary()

    return () => {
      cancelled = true
    }
  }, [])

  const latestUpdatedLabel = heroSummary.recordedAt
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(heroSummary.recordedAt))
    : heroSummary.snapshotDate ?? "--"

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(28,231,131,0.09),transparent_24%),radial-gradient(circle_at_80%_18%,rgba(118,75,255,0.08),transparent_24%),radial-gradient(circle_at_50%_120%,rgba(28,231,131,0.06),transparent_28%)]" />
        <div
          className="absolute inset-0 bg-[linear-gradient(rgba(28,231,131,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(28,231,131,0.045)_1px,transparent_1px)]"
          style={{ backgroundSize: "64px 64px" }}
        />
      </div>

      <main>
        <section className="relative min-h-[calc(100vh-76px)] overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[72%] bg-[radial-gradient(circle_at_50%_12%,rgba(28,231,131,0.14),transparent_28%),radial-gradient(circle_at_50%_58%,rgba(118,75,255,0.08),transparent_30%)]" />
          <div className="relative z-10 mx-auto flex min-h-[calc(100vh-76px)] w-full max-w-[1600px] flex-col px-4 pb-8 pt-14 sm:px-6 sm:pt-16 lg:px-10 lg:pt-20">
            <div className="relative flex flex-1 flex-col items-center justify-center text-center">
              <motion.div
                aria-hidden="true"
                initial={
                  shouldReduceMotion ? false : { opacity: 0, scale: 0.55 }
                }
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-none absolute left-1/2 top-1/2 hidden md:block"
                style={{ x: "-50%", y: "-50%" }}
              >
                <Image
                  src="/images/img_1.png"
                  alt=""
                  width={640}
                  height={640}
                  className="size-[min(58vw,640px)] animate-[spin_120s_linear_infinite] opacity-[0.13] motion-reduce:animate-none"
                />
              </motion.div>
              <div className="relative mx-auto max-w-5xl">
                <SectionLabel
                  className="mx-auto items-center"
                  textClassName="font-heading text-[clamp(1.05rem,2vw,1.65rem)] font-medium uppercase tracking-[0.08em]"
                >
                  <TypewriterText text="The participation layer" />
                </SectionLabel>
                <h1 className="mt-8 font-heading text-[clamp(2.1rem,4.15vw,5.6rem)] font-semibold leading-[1.08] tracking-[-0.01em] text-foreground sm:leading-[0.98]">
                  {(
                    [
                      ["Prove", "participation."],
                      ["Earn", "rewards."],
                      ["Build", "trust."],
                    ] as const
                  ).map(([verb, rest], index) => (
                    <motion.span
                      key={verb}
                      initial={
                        shouldReduceMotion ? false : { opacity: 0, y: 18 }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.35 + index * 0.12,
                        duration: 0.55,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className={cn(
                        "block sm:inline-block",
                        index < 2 && "sm:mr-[0.3em]"
                      )}
                    >
                      <span className="italic text-primary">{verb}</span> {rest}
                    </motion.span>
                  ))}
                </h1>
                <motion.p
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.85,
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="mx-auto mt-10 max-w-3xl text-lg leading-8 text-muted-foreground sm:text-[1.15rem]"
                >
                  Gyralis gives protocols and communities on-chain loops to
                  reward verified recurring participation and build retention,
                  trust, and momentum.
                </motion.p>
              </div>
            </div>

            <div className="relative z-20 mt-10 w-full pt-6">
              <div className="flex w-full flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Total Distributed
                  </div>
                  <div className="mt-1 font-mono text-[2rem] font-semibold tracking-tight text-foreground sm:text-[2.4rem]">
                    {heroSummary.totalDistributedAmount == null ? (
                      "--"
                    ) : (
                      <>
                        <AnimatedStatValue
                          value={Number(heroSummary.totalDistributedAmount)}
                          decimals={2}
                        />{" "}
                        <span className="text-base font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          {heroSummary.totalDistributedSymbol}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Claimed across {heroSummary.totalClaims.toLocaleString()}{" "}
                    on-chain claims
                  </div>
                </div>

                <a
                  href="#loops"
                  className="inline-flex items-center gap-3 self-start text-sm text-muted-foreground transition-colors hover:text-foreground lg:self-center"
                >
                  <span>Scroll to explore</span>
                  <motion.span
                    animate={shouldReduceMotion ? undefined : { y: [0, 4, 0] }}
                    transition={{
                      duration: 1.25,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                    className="inline-flex"
                  >
                    <LuArrowDown className="size-4" aria-hidden="true" />
                  </motion.span>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="loops" className="relative py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal className="mb-10">
              <div>
                <SectionLabel className="mb-3">LOOPS</SectionLabel>
                <h2 className="max-w-3xl font-heading text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05] tracking-[-0.01em]">
                  Build momentum with recurring participation.
                </h2>
                <p className="mt-4 max-w-xl text-lg leading-7 text-muted-foreground">
                  Give protocols and communities a repeatable on-chain program
                  with verified access, recurring rewards, streaks, and visible
                  momentum.
                </p>
              </div>
            </Reveal>

            <div className="grid auto-rows-fr gap-4 md:grid-cols-2">
              {loopFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.22 }}
                  transition={{
                    duration: 0.42,
                    delay: index * 0.07,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="h-full"
                >
                  <LandingFeatureCard>
                    <div className="flex h-full flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <SurfaceIcon tone={feature.tone}>
                          {feature.icon}
                        </SurfaceIcon>
                        <h3 className="min-w-0 font-heading text-lg font-semibold">
                          {feature.title}
                        </h3>
                      </div>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </LandingFeatureCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="relative overflow-hidden py-24 sm:py-32">
          <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal className="mb-16">
              <SectionLabel className="mb-3">HOW LOOPS WORK</SectionLabel>
              <h2 className="font-heading text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05] tracking-[-0.01em]">
                The 3-step loop flow.
              </h2>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
                Register, Claim, Streak. Users enter a loop, claim each
                distribution period, and return again to keep their streak
                alive, compound rewards, and build a stronger score over time.
              </p>
            </Reveal>

            <HowItWorksSteps />
          </div>
        </section>

        <section id="metrics" className="relative py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-6">
              <div>
                <SectionLabel className="mb-3">
                  LIVE & ON-CHAIN DATA
                </SectionLabel>
                <h2 className="font-heading text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05] tracking-[-0.01em]">
                  Real participation. Real claims. Real recurrence.
                </h2>
              </div>

              <div className="flex items-center gap-3 font-mono text-sm text-muted-foreground">
                <span className="size-2 rounded-full bg-primary animate-pulse motion-reduce:animate-none" />
                <span>Last updated {latestUpdatedLabel}</span>
              </div>
            </Reveal>

            <div className="grid auto-rows-fr gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Reveal className="h-full">
                <LandingStatCard
                  title="Total Claims"
                  value={<AnimatedStatValue value={heroSummary.totalClaims} />}
                  helper="Across all tracked loops"
                />
              </Reveal>
              <Reveal delay={0.07} className="h-full">
                <LandingStatCard
                  title="Verified Participants"
                  value={<AnimatedStatValue value={heroSummary.uniqueUsers} />}
                  helper={`From ${heroSummary.totalRegistrations.toLocaleString()} total registrations`}
                />
              </Reveal>
              <Reveal delay={0.14} className="h-full">
                <LandingStatCard
                  title="Claim Rate"
                  value={
                    heroSummary.claimRatePercent == null ? (
                      "--"
                    ) : (
                      <AnimatedStatValue
                        value={heroSummary.claimRatePercent}
                        decimals={2}
                      />
                    )
                  }
                  suffix={heroSummary.claimRatePercent == null ? null : "%"}
                  progress={heroSummary.claimRatePercent}
                  helper="Claims over registrations"
                />
              </Reveal>
              <Reveal delay={0.21} className="h-full">
                <LandingStatCard
                  title="Total Distributed"
                  value={
                    heroSummary.totalDistributedAmount == null ? (
                      "--"
                    ) : (
                      <AnimatedStatValue
                        value={Number(heroSummary.totalDistributedAmount)}
                        decimals={0}
                      />
                    )
                  }
                  suffix={heroSummary.totalDistributedSymbol}
                  helper="From all tracked loops"
                />
              </Reveal>
            </div>
          </div>
        </section>

        <section id="connectors" className="relative py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal className="mb-12">
              <SectionLabel className="mb-3">ELIGIBILITY</SectionLabel>
              <h2 className="font-heading text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05] tracking-[-0.01em]">
                Trusted entry rules for every loop.
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-7 text-muted-foreground">
                Every loop defines who can register and claim. Eligibilities are
                pluggable — from humanity checks to custom integrations built
                together with protocols.
              </p>
            </Reveal>

            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <Reveal>
                <ul className="space-y-4 text-sm leading-7 text-muted-foreground">
                  {[
                    "Each loop sets its own eligibility gate — the rules stay visible to everyone.",
                    "Human Passport score checks keep loop access human-first.",
                    "Custom eligibilities are built with partner protocols — your community's own rules, plugged into a loop.",
                  ].map((point) => (
                    <li key={point} className="flex gap-3">
                      <FaCheck
                        className="mt-2 size-3.5 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-7 text-sm leading-7 text-muted-foreground">
                  Building a protocol or community?{" "}
                  <span className="text-foreground">
                    Bring your own eligibility
                  </span>
                  : reward your own users and find new ones through the Gyralis
                  ecosystem.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href="/eligibilities"
                    className="tamagotchi-button inline-flex items-center px-6 py-3 text-sm"
                  >
                    Explore eligibilities
                  </Link>
                  <a
                    href="https://discord.gg/VgGQHDpn"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Loop with us
                  </a>
                </div>
              </Reveal>

              <div className="grid auto-rows-fr gap-4 sm:grid-cols-2">
                {eligibilityPartners.map((partner, index) => (
                  <Reveal
                    key={partner.title}
                    delay={index * 0.07}
                    className="h-full"
                  >
                    <LandingFeatureCard>
                      <div className="flex h-full flex-col gap-5">
                        <div className="flex items-center gap-3">
                          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-background/65">
                            <Image
                              src={partner.logoUrl}
                              alt={`${partner.title} logo`}
                              width={30}
                              height={30}
                              className="size-8 object-contain"
                            />
                          </div>
                          <h3 className="font-heading text-lg font-semibold">
                            {partner.title}
                          </h3>
                        </div>
                        <p className="text-sm leading-7 text-muted-foreground">
                          {partner.description}
                        </p>
                      </div>
                    </LandingFeatureCard>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="relative py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal className="mb-12">
              <SectionLabel className="mb-3">FAQ</SectionLabel>
              <h2 className="font-heading text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05] tracking-[-0.01em]">
                Loop mechanics, distribution, and cycle rules.
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-7 text-muted-foreground">
                The most important details about how rewards, claim periods,
                SuperLoops, and streaks actually work.
              </p>
            </Reveal>

            <div className="space-y-4">
              {faqItems.map((item, index) => {
                const isOpen = activeFaq === item.question

                return (
                  <Reveal
                    key={item.question}
                    delay={index * 0.05}
                    className="h-full"
                  >
                    <LandingFeatureCard>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveFaq((current) =>
                            current === item.question ? current : item.question
                          )
                        }
                        aria-expanded={isOpen}
                        className="flex w-full items-start justify-between gap-6 text-left"
                      >
                        <div>
                          <h3 className="font-heading text-lg font-semibold text-foreground">
                            {item.question}
                          </h3>
                        </div>
                        <motion.span
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.24, ease: "easeOut" }}
                          className="mt-1 inline-flex shrink-0 text-primary"
                        >
                          <LuChevronDown className="size-5" aria-hidden="true" />
                        </motion.span>
                      </button>

                      <motion.div
                        initial={false}
                        animate={{
                          height: isOpen ? "auto" : 0,
                          opacity: isOpen ? 1 : 0,
                          marginTop: isOpen ? 16 : 0,
                        }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="text-sm leading-7 text-muted-foreground">
                          {item.answer}
                        </p>
                      </motion.div>
                    </LandingFeatureCard>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-[2.5rem] bg-[#10121a]"
            >
              <div
                className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] opacity-50"
                style={{ backgroundSize: "56px 56px" }}
              />
              <div className="absolute right-[-10%] top-[-30%] size-[520px] rounded-full bg-[radial-gradient(circle,rgba(28,231,131,0.35)_0%,transparent_62%)]" />
              <div className="absolute bottom-[-40%] right-[14%] size-[460px] rounded-full bg-[radial-gradient(circle,rgba(118,75,255,0.3)_0%,transparent_62%)]" />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute right-[48px] top-1/2 hidden -translate-y-1/2 lg:block"
              >
                <Image
                  src="/images/img_2.png"
                  alt=""
                  width={380}
                  height={380}
                  className="size-[380px] animate-[spin_60s_linear_infinite] opacity-60 motion-reduce:animate-none"
                />
              </div>

              <div className="relative z-10 max-w-2xl px-8 py-16 sm:px-14 sm:py-[72px]">
                <h2 className="font-heading text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[1.03] tracking-[-0.015em] text-white">
                  Enter a live loop today.
                </h2>
                <div className="mt-5 max-w-xl space-y-4 text-lg leading-7 text-white/70">
                  <p>
                    Join{" "}
                    <span className="text-white">
                      {heroSummary.uniqueUsers.toLocaleString()} verified humans
                    </span>{" "}
                    already claiming, returning, and building streaks across the
                    ecosystem.
                  </p>
                  <p>
                    Unlock special access to{" "}
                    <span className="text-white">The True Loopers</span> —
                    coming soon.
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/loops"
                    className="tamagotchi-button inline-flex items-center gap-2 px-7 py-4 text-base"
                  >
                    Explore Loops
                    <FaArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                  <Link
                    href="/eligibilities"
                    className="inline-flex items-center justify-center rounded-lg border border-white/30 px-7 py-4 text-base font-medium text-white transition-colors hover:bg-white/10"
                  >
                    Check Eligibilities
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="relative border-t border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-10 py-16 lg:grid-cols-[2fr_1fr_1fr_1fr]">
            <div>
              <Link href="/" className="mb-5 flex items-center gap-3">
                <NavLogoMark />
                <span className="font-heading text-xl font-bold tracking-tight">
                  Gyralis
                </span>
              </Link>
              <p className="max-w-xs text-[0.92rem] leading-7 text-muted-foreground">
                Infrastructure protocol for recurring on-chain participation.
              </p>
              <div className="mt-5 flex gap-3">
                <a
                  href="https://x.com/gyralis_xyz"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Gyralis on X"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  <FaXTwitter className="size-5" />
                </a>
                <a
                  href="https://github.com/orgs/Gyralis/repositories"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Gyralis GitHub"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  <FaGithub className="size-5" />
                </a>
                <a
                  href="https://discord.gg/VgGQHDpn"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Gyralis Discord"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  <FaDiscord className="size-5" />
                </a>
              </div>
              <p className="mt-5 text-sm text-muted-foreground">
                © 2026 Gyralis. All rights reserved.
              </p>
            </div>

            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className="mb-4 text-sm font-semibold">{column.title}</h3>
                <ul className="space-y-3">
                  {column.links.map((link) => {
                    const external = link.href.startsWith("http")
                    return (
                      <li key={`${column.title}-${link.label}`}>
                        <a
                          href={link.href}
                          {...(external
                            ? { target: "_blank", rel: "noreferrer" }
                            : {})}
                          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link.label}
                        </a>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
