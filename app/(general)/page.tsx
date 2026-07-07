"use client"

import { ReactNode, useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useMotionValueEvent, useScroll } from "framer-motion"
import {
  FaArrowRight,
  FaBolt,
  FaCheck,
  FaCoins,
  FaDiscord,
  FaFireAlt,
  FaGithub,
  FaLockOpen,
  FaRedoAlt,
  FaShieldAlt,
  FaThumbsUp,
  FaTrophy,
  FaUsers,
  FaWallet,
} from "react-icons/fa"
import { FaXTwitter } from "react-icons/fa6"
import { LuArrowDown } from "react-icons/lu"

import { cn } from "@/lib/utils"
import { GlowingEffect } from "@/components/ui/glowing-effect"
import { NavLogoMark } from "@/components/layout/main-nav"
import { HighlightStatCard } from "@/components/stats/highlight-stat-card"

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

const loopFeatures = [
  {
    title: "Recurring Participation",
    description:
      "Turn one-off campaigns into repeatable participation loops with a clear reward cadence.",
    icon: <FaRedoAlt className="size-5" aria-hidden="true" />,
    tone: "primary",
  },
  {
    title: "Retention by Design",
    description:
      "Keep contributors coming back every cycle with streak-driven participation.",
    icon: <FaFireAlt className="size-5" aria-hidden="true" />,
    tone: "primary",
  },
  {
    title: "Trusted Eligibilities",
    description:
      "Gate access with verified eligibilities and human-proof checks.",
    icon: <FaThumbsUp className="size-5" aria-hidden="true" />,
    tone: "secondary",
  },
  {
    title: "Live Reward Claims",
    description:
      "Let users claim on-chain in a simple flow that lands rewards directly in their wallet.",
    icon: <FaCoins className="size-5" aria-hidden="true" />,
    tone: "primary",
  },
  {
    title: "Unlock Reward Mechanics",
    description:
      "Tailor reward structures to fit your community's unique needs and engagement strategies.",
    icon: <FaLockOpen className="size-5" aria-hidden="true" />,
    tone: "super",
  },
  {
    title: "Visible Momentum",
    description:
      "Make community momentum visible through claim activity, streak signals, and season-long competition.",
    icon: <FaTrophy className="size-5" aria-hidden="true" />,
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
    helper: "Verified once",
    status: "Eligibility passed",
    statLabel: "Access",
    statValue: "Unlocked",
  },
  {
    title: "Claim",
    icon: <FaWallet className="size-5" aria-hidden="true" />,
    description:
      "Claim the current distribution period in a simple on-chain flow and receive rewards directly in your wallet.",
    action: "Claim X tokens",
    helper: "Current distribution live",
    status: "Claim window open",
    statLabel: "Reward",
    statValue: "Live now",
  },
  {
    title: "Streak",
    icon: <FaFireAlt className="size-5" aria-hidden="true" />,
    description:
      "Return next period to keep your streak alive, raise your score, and prove recurring participation over time.",
    action: "Streak",
    helper: "Come back next cycle",
    status: "Momentum building",
    statLabel: "Score",
    statValue: "Growing",
  },
]

const eligibilityPartners = [
  {
    title: "1Hive",
    description:
      "Community connected to Gyralis for checking loop eligibility through Gardens.",
    logoUrl: null,
    mark: "1H",
  },
  {
    title: "Blockscout",
    description:
      "Blockscout community Merits Program integration for checking loop eligibility.",
    logoUrl: "/blockscout-logo.png",
    mark: null,
  },
  {
    title: "Human Passport",
    description:
      "Verifies humanity and score through GyraHub to keep loop access human-first.",
    logoUrl: "/passport-logo.svg",
    mark: null,
  },
  {
    title: "Gardens",
    description:
      "DAO coordination framework powering community membership checks.",
    logoUrl: "/gardens-logo.png",
    mark: null,
  },
] as const

const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "Loops", href: "#loops" },
      // { label: "Epochs", href: "#epochs" },
      // { label: "Metrics", href: "#metrics" },
      { label: "SuperLoops", href: "#loops" },
      { label: "Stats", href: "dashboard" },
      { label: "Eligibilities", href: "eligibilities" },
    ],
  },
  {
    title: "Builders",
    links: [
      {
        label: "GitHub",
        href: "https://github.com/orgs/Gyralis/repositories",
      },
      // { label: "SDK", href: "#builders" },
      // {
      //   label: "API Reference",
      //   href: "https://github.com/orgs/Gyralis/repositories",
      // },
      // { label: "Status", href: "#metrics" },
    ],
  },
  {
    title: "Community",
    links: [
      // { label: "Blog", href: "https://x.com/gyralis_xyz" },
      // { label: "Governance", href: "https://discord.gg/VgGQHDpn" },
      { label: "Discord", href: "https://discord.gg/VgGQHDpn" },
      { label: "Twitter", href: "https://x.com/gyralis_xyz" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/" },
      { label: "Terms", href: "/" },
      // { label: "Audits", href: "#trust" },
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
    <div className={cn("group h-full min-h-[15.5rem] list-none", className)}>
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
  return (
    <div className={`inline-flex w-fit flex-col items-start ${className}`}>
      <div className="overflow-hidden">
        <motion.span
          initial={{ opacity: 0, x: -18 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className={`block font-mono text-[0.94rem] tracking-[0.18em] text-primary ${textClassName}`}
        >
          {children}
        </motion.span>
      </div>
      <motion.span
        initial={{ scaleX: 0.2, opacity: 0.45 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ delay: 0.14, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`mt-2 block h-px w-full origin-center bg-primary shadow-[0_0_14px_rgba(28,231,131,0.55)] ${lineClassName}`}
      />
    </div>
  )
}

function HowItWorksHorizontalStepper() {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const stepRefs = useRef<Array<HTMLDivElement | null>>([])
  const [activeStep, setActiveStep] = useState(0)
  const { scrollYProgress } = useScroll({
    container: wrapperRef,
    offset: ["start start", "end start"],
  })

  useMotionValueEvent(scrollYProgress, "change", () => {
    const wrapper = wrapperRef.current

    if (!wrapper) {
      return
    }

    const wrapperCenter = wrapper.scrollTop + wrapper.clientHeight / 2
    let nextActive = 0
    let closestDistance = Number.POSITIVE_INFINITY

    stepRefs.current.forEach((node, index) => {
      if (!node) {
        return
      }

      const itemCenter = node.offsetTop + node.offsetHeight / 2
      const distance = Math.abs(itemCenter - wrapperCenter)

      if (distance < closestDistance) {
        closestDistance = distance
        nextActive = index
      }
    })

    setActiveStep(nextActive)
  })

  const backgroundColors = ["#0f172a", "#000000", "#171717"]
  const gradients = [
    "linear-gradient(to bottom right, #0f2f25, #1ce783)",
    "linear-gradient(to bottom right, #06281d, #16a34a)",
    "linear-gradient(to bottom right, #0f3a2d, #0f766e)",
  ]
  const [backgroundGradient, setBackgroundGradient] = useState(gradients[0])

  useEffect(() => {
    setBackgroundGradient(gradients[activeStep % gradients.length])
  }, [activeStep])

  const content = stepsData.map((step) => ({
    title: `${step.title} / ${step.statLabel}`,
    description: step.description,
    content: (
      <div className="flex h-full flex-col justify-between p-5 text-white">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-white/12 text-white shadow-[0_0_18px_rgba(255,255,255,0.14)]">
            {step.icon}
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
              Participant view
            </p>
            <p className="text-base font-semibold text-white">{step.status}</p>
          </div>
        </div>

        <div className="rounded-[1.2rem] border border-white/10 bg-black/15 p-4 backdrop-blur-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
            Loop state
          </p>
          <p className="mt-2 text-sm leading-7 text-white/90">
            {step.title === "Register"
              ? "Eligibility is verified and loop access is unlocked for this user."
              : step.title === "Claim"
              ? "The current distribution period is available and the claim flow is ready."
              : "The streak is active and the next return keeps momentum building."}
          </p>
        </div>

        <button
          type="button"
          className="inline-flex min-h-[46px] w-full items-center justify-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_8px_20px_-18px_rgba(0,0,0,0.45)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-px hover:bg-white/15"
        >
          {step.action}
        </button>
      </div>
    ),
  }))

  return (
    <motion.div
      animate={{
        backgroundColor: backgroundColors[activeStep % backgroundColors.length],
      }}
      ref={wrapperRef}
      className="relative mx-auto flex h-[30rem] max-w-6xl justify-center space-x-10 overflow-y-auto rounded-[2rem] border border-border/70 p-10 shadow-[0_22px_60px_rgba(0,0,0,0.08)] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-[radial-gradient(circle_at_bottom_center,hsl(var(--secondary)/0.28)_0%,hsl(var(--secondary)/0.18)_24%,hsl(var(--primary)/0.18)_56%,transparent_82%)] dark:bg-[radial-gradient(circle_at_bottom_center,hsl(var(--secondary)/0.34)_0%,hsl(var(--secondary)/0.22)_24%,hsl(var(--primary)/0.22)_56%,transparent_82%)]"
      />
      <div className="relative flex items-start px-4">
        <div className="max-w-2xl">
          {content.map((item, index) => (
            <div
              key={`${item.title}-${index}`}
              ref={(node) => {
                stepRefs.current[index] = node
              }}
              className="my-20 flex gap-5"
            >
              <motion.div
                animate={{
                  opacity: activeStep === index ? 1 : 0.3,
                  scale: activeStep === index ? 1 : 0.94,
                }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className={`mt-1 flex size-12 shrink-0 items-center justify-center rounded-2xl border ${
                  activeStep === index
                    ? "border-primary/45 bg-primary/15 text-primary shadow-[0_0_24px_rgba(28,231,131,0.25)]"
                    : "border-white/10 bg-white/5 text-white/45"
                }`}
              >
                {stepsData[index]?.icon}
              </motion.div>

              <div className="max-w-xl">
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: activeStep === index ? 1 : 0.3 }}
                  className="text-2xl font-bold text-slate-100"
                >
                  {item.title}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: activeStep === index ? 1 : 0.3 }}
                  className="text-kg mt-6 max-w-sm text-slate-300"
                >
                  {item.description}
                </motion.p>
              </div>
            </div>
          ))}
          <div className="h-64" />
        </div>
      </div>

      <div
        style={{ background: backgroundGradient }}
        className={cn(
          "sticky top-10 hidden h-72 w-[22rem] overflow-hidden rounded-[1.8rem] lg:block",
          "shadow-[0_22px_50px_rgba(0,0,0,0.18)]"
        )}
      >
        {content[activeStep]?.content ?? null}
      </div>
    </motion.div>
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
  }, [durationMs, isInView, value])

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

  const heroClaimRateLabel =
    heroSummary.claimRatePercent == null
      ? "--"
      : `${heroSummary.claimRatePercent.toFixed(2)}%`
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
          <div className="relative z-10 mx-auto flex min-h-[calc(100vh-76px)] w-full max-w-[1600px] flex-col px-4 pb-8 pt-14 sm:px-6 sm:pt-16 lg:px-10 lg:pt-18">
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="mx-auto max-w-5xl">
                <SectionLabel
                  className="mx-auto items-center"
                  textClassName="font-heading text-[clamp(1.05rem,2vw,1.65rem)] font-medium uppercase tracking-[0.08em]"
                >
                  The participation layer
                </SectionLabel>
                <h1 className="mt-8 font-heading text-[clamp(1.8rem,4.15vw,5.6rem)] font-semibold leading-[0.98] tracking-[-0.01em] text-foreground">
                  <span className="italic text-primary">Prove</span>{" "}
                  participation.{" "}
                  <span className="italic text-primary">Earn</span> rewards.{" "}
                  <span className="italic text-primary">Build</span> trust.
                </h1>
                <p className="mx-auto mt-10 max-w-3xl text-lg leading-8 text-muted-foreground sm:text-[1.15rem]">
                  Gyralis helps protocols and communities turn recurring
                  participation into visible, rewardable momentum with
                  proof-based loops for verified humans.
                </p>
              </div>

              <div className="mt-[3.25rem] flex flex-col items-center gap-4">
                <Link
                  href="/loops"
                  className="tamagotchi-button inline-flex items-center justify-center gap-2 px-4 py-2 text-sm"
                >
                  Launch App
                  <FaArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="relative z-20 mt-10 w-full pt-6">
              <div className="flex w-full flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-16">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Total Claims
                    </div>
                    <div className="mt-1 font-mono text-[2rem] font-semibold tracking-tight text-foreground sm:text-[2.4rem]">
                      <AnimatedStatValue value={heroSummary.totalClaims} />
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Latest snapshot {heroSummary.snapshotDate ?? "--"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Claim Rate
                    </div>
                    <div className="mt-1 font-mono text-[2rem] font-semibold tracking-tight text-foreground sm:text-[2.4rem]">
                      {heroSummary.claimRatePercent == null ? (
                        "--"
                      ) : (
                        <>
                          <AnimatedStatValue
                            value={heroSummary.claimRatePercent}
                            decimals={2}
                          />
                          %
                        </>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      From {heroSummary.totalRegistrations.toLocaleString()}{" "}
                      total registrations
                    </div>
                  </div>
                </div>

                <a
                  href="#loops"
                  className="inline-flex items-center gap-3 self-start text-sm text-muted-foreground transition-colors hover:text-foreground lg:self-center"
                >
                  <span>Scroll to explore</span>
                  <motion.span
                    animate={{ y: [0, 4, 0] }}
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
            <div className="mb-18">
              <div>
                <SectionLabel className="mb-3">LOOPS</SectionLabel>
                <h2 className="max-w-3xl font-heading text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05] tracking-[-0.01em]">
                  Build momentum with recurring participation.
                </h2>
                <p className="mt-5 max-w-xl text-lg leading-7 text-muted-foreground">
                  Turn participation into a repeatable on-chain rhythm with
                  verified access, recurring claims, streaks, leaderboard and
                  more.
                </p>
              </div>
            </div>

            <div className="mt-10 grid auto-rows-fr gap-4 md:grid-cols-2 xl:grid-cols-3">
              {loopFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 22, filter: "blur(8px)" }}
                  whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  viewport={{ once: true, amount: 0.22 }}
                  transition={{
                    duration: 0.42,
                    delay: index * 0.07,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="h-full"
                >
                  <LandingFeatureCard>
                    <div className="flex h-full flex-col gap-5">
                      <div className="flex items-center gap-4">
                        <SurfaceIcon
                          tone={
                            feature.tone === "super"
                              ? "super"
                              : feature.tone === "secondary"
                              ? "secondary"
                              : "primary"
                          }
                        >
                          {feature.icon}
                        </SurfaceIcon>
                        <div className="min-w-0">
                          <h3 className="font-heading text-xl font-semibold">
                            {feature.title}
                          </h3>
                          {feature.badge ? (
                            <span className="mt-2 inline-flex rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 font-mono text-[0.65rem] tracking-[0.16em] text-primary">
                              {feature.badge}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <p className="mt-auto text-[0.95rem] leading-7 text-muted-foreground">
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
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_96%_96%,rgba(28,231,131,0.12)_0%,rgba(28,231,131,0.08)_12%,transparent_34%),radial-gradient(circle_at_84%_78%,rgba(28,231,131,0.09)_0%,transparent_32%),radial-gradient(circle_at_68%_58%,rgba(28,231,131,0.06)_0%,transparent_38%),radial-gradient(circle_at_50%_120%,rgba(28,231,131,0.04)_0%,transparent_46%)] blur-[10px]" />
          </div>

          <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-16">
              <SectionLabel className="mb-3">HOW LOOPS WORK</SectionLabel>
              <h2 className="font-heading text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05] tracking-[-0.01em]">
                The user journey your loop creates.
              </h2>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
                Register, Claim, Streak. Users enter a loop, claim each
                distribution period, and come back again to keep their streak
                alive, compound rewards, and build a higher score.
              </p>
            </div>

            <HowItWorksHorizontalStepper />
          </div>
        </section>

        {/* <section id="epochs" className="relative overflow-hidden py-24 sm:py-32">
          <div className="pointer-events-none absolute right-[-80px] top-1/2 hidden size-[520px] -translate-y-1/2 opacity-[0.06] lg:block">
            <svg
              viewBox="0 0 200 200"
              fill="none"
              className="size-full animate-[spin_80s_linear_infinite]"
              aria-hidden="true"
            >
              <circle
                cx="100"
                cy="100"
                r="90"
                stroke="#764BFF"
                strokeWidth="2"
                strokeDasharray="4 12"
              />
              <circle cx="100" cy="100" r="62" stroke="#1CE783" strokeWidth="2.5" />
            </svg>
          </div>

          <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="mb-3 font-mono text-[0.8125rem] tracking-[0.18em] text-primary">
                  {"// EPOCHS & GAMES"}
                </p>
                <h2 className="font-heading text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05] tracking-[-0.01em]">
                  Built for the long game.
                </h2>
                <p className="mt-5 text-lg leading-7 text-muted-foreground">
                  Each season is an Epoch - a stretch of competitive games layered
                  on top of your Loops. Loopers earn Season Points, climb the
                  board, and split a shared prize pool.
                </p>

                <div className="mt-8 space-y-6">
                  {[
                    "Compete all season",
                    "Earn Season Points",
                    "Win the prize pool",
                  ].map((title, index) => (
                    <div key={title} className="flex gap-4">
                      <SurfaceIcon tone={index === 1 ? "secondary" : "primary"}>
                        {index === 0 ? (
                          <FaTrophy className="size-[18px]" aria-hidden="true" />
                        ) : index === 1 ? (
                          <FaCheck className="size-[18px]" aria-hidden="true" />
                        ) : (
                          <FaBolt className="size-[18px]" aria-hidden="true" />
                        )}
                      </SurfaceIcon>
                      <div>
                        <h3 className="font-heading text-[1.05rem] font-semibold">
                          {title}
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {index === 0
                            ? "Every claim and streak feeds your standing across the Epoch."
                            : index === 1
                              ? "Points convert participation into a leaderboard you can win."
                              : "Top loopers split rewards funded by sponsors and DAOs."}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="space-y-3">
                  {epochCards.map((card) => (
                    <div
                      key={card.title}
                      className="flex items-center gap-4 rounded-[1.25rem] border border-border bg-card p-5 shadow-[0_8px_30px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)]"
                    >
                      <SurfaceIcon
                        tone={card.tone === "secondary" ? "secondary" : "primary"}
                      >
                        {card.icon}
                      </SurfaceIcon>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-heading text-base font-semibold">
                          {card.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {card.description}
                        </p>
                      </div>
                      <span className="font-mono text-sm font-semibold text-primary">
                        {card.reward}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-[1.25rem] border border-border bg-secondary/5 p-6">
                  <div className="grid gap-4 text-center sm:grid-cols-3">
                    {[
                      ["1.2M", "Season Points"],
                      ["8,421", "Players"],
                      ["36K", "Prize Pool GYR"],
                    ].map(([value, label]) => (
                      <div key={label}>
                        <div className="font-mono text-2xl font-semibold text-secondary">
                          {value}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section> */}

        <section id="metrics" className="relative py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
              <div>
                <SectionLabel className="mb-3">LIVE ON-CHAIN</SectionLabel>
                <h2 className="font-heading text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05] tracking-[-0.01em]">
                  Real participation. Real claims. Real recurrence.
                </h2>
              </div>

              <div className="flex items-center gap-3 font-mono text-sm text-muted-foreground">
                <span className="size-2 rounded-full bg-primary animate-pulse" />
                <span>Latest updated {latestUpdatedLabel}</span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="bg-card p-6">
                <HighlightStatCard
                  title="Total Claims"
                  value={<AnimatedStatValue value={heroSummary.totalClaims} />}
                  icon={FaWallet}
                  className="min-h-[230px]"
                  helperText="Across all tracked loops"
                  substats={[
                    {
                      label: "Latest Snapshot",
                      value: heroSummary.snapshotDate ?? "--",
                      tone: "muted",
                    },
                  ]}
                />
              </div>
              <div className="bg-card p-6">
                <HighlightStatCard
                  title="Unique Registered Users"
                  value={<AnimatedStatValue value={heroSummary.uniqueUsers} />}
                  icon={FaUsers}
                  tone="secondary"
                  className="min-h-[230px]"
                  helperText="Verified participants in history"
                  substats={[
                    {
                      label: "Total Registrations",
                      value: heroSummary.totalRegistrations.toLocaleString(),
                      tone: "positive",
                    },
                  ]}
                />
              </div>
              <div className="bg-card p-6">
                <HighlightStatCard
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
                  icon={FaCheck}
                  className="min-h-[230px]"
                  helperText="Claims over total registrations"
                  progress={{
                    label: "Participation Rate",
                    value: heroClaimRateLabel,
                    percent: heroSummary.claimRatePercent ?? 0,
                  }}
                />
              </div>
              <div className="bg-card p-6">
                <HighlightStatCard
                  title="Total Distributed"
                  value={
                    heroSummary.totalDistributedAmount == null ? (
                      "--"
                    ) : (
                      <AnimatedStatValue
                        value={Number(heroSummary.totalDistributedAmount)}
                        decimals={2}
                      />
                    )
                  }
                  suffix={heroSummary.totalDistributedSymbol}
                  icon={FaCoins}
                  tone="secondary"
                  className="min-h-[230px]"
                  helperText="From the latest history snapshot"
                  substats={[
                    {
                      label: "Last Updated",
                      value: latestUpdatedLabel,
                      tone: "muted",
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        </section>

        <section id="connectors" className="relative py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-12">
              <SectionLabel className="mb-3">ELIGIBILITY</SectionLabel>
              <h2 className="font-heading text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05] tracking-[-0.01em]">
                Trusted entry rules for every loop.
              </h2>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_10px_34px_rgba(0,0,0,0.06)]">
              <div className="grid gap-10 px-6 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:px-12">
                <div>
                  <p className="max-w-xl text-lg leading-7 text-muted-foreground">
                    Gyralis helps protocols and communities decide who can
                    participate, register, and claim with rules that stay
                    visible and human-first.
                  </p>
                  <div className="mt-7 space-y-3 text-sm leading-7 text-muted-foreground">
                    <p>
                      Each loop can define its own membership or humanity gate.
                    </p>
                    <p>
                      Human Passport score checks help keep access human-first.
                    </p>
                    <p>
                      Community membership gates connect real participation to
                      rewards.
                    </p>
                  </div>
                  <Link
                    href="/eligibilities"
                    className="tamagotchi-button mt-6 inline-flex items-center px-6 py-3 text-sm"
                  >
                    View eligibility docs
                  </Link>
                </div>

                <div>
                  <SectionLabel className="mb-4">TRUSTED PARTNERS</SectionLabel>
                  <p className="mb-5 max-w-xl text-sm leading-7 text-muted-foreground">
                    These integrations help verify who gets in, how eligibility
                    works, and why loop participation can be trusted.
                  </p>
                  <div className="grid auto-rows-fr gap-4 sm:grid-cols-2">
                    {eligibilityPartners.map((partner) => (
                      <LandingFeatureCard
                        key={partner.title}
                      >
                        <div className="flex h-full flex-col gap-5">
                          <div className="flex size-14 items-center justify-center rounded-2xl border border-border/70 bg-background/65">
                            {partner.logoUrl ? (
                              <Image
                                src={partner.logoUrl}
                                alt={`${partner.title} logo`}
                                width={30}
                                height={30}
                                className="size-8 object-contain"
                              />
                            ) : (
                              <span className="font-heading text-sm font-bold text-primary">
                                {partner.mark}
                              </span>
                            )}
                          </div>
                          <div className="space-y-2">
                            <h3 className="font-heading text-lg font-semibold">
                              {partner.title}
                            </h3>
                            <p className="text-sm leading-7 text-muted-foreground">
                              {partner.description}
                            </p>
                          </div>
                        </div>
                      </LandingFeatureCard>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* <section id="builders" className="relative py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
              <div>
                <p className="mb-3 font-mono text-[0.8125rem] tracking-[0.18em] text-primary">
                  {"// FOR BUILDERS"}
                </p>
                <h2 className="font-heading text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05] tracking-[-0.01em]">
                  Ship a Loop in an afternoon.
                </h2>
                <p className="mt-5 text-lg leading-7 text-muted-foreground">
                  A thoughtfully designed SDK for creating loops, checking
                  eligibility, and settling claims. TypeScript-first, edge-ready,
                  zero fuss.
                </p>

                <div className="mt-8 space-y-6">
                  {builderFeatures.map((feature) => (
                    <div key={feature.title} className="flex gap-4">
                      <div className="w-1 rounded-full bg-primary" />
                      <div>
                        <h3 className="font-semibold">{feature.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:sticky lg:top-28">
                <div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_10px_34px_rgba(0,0,0,0.06)]">
                  <div className="flex items-center gap-1 border-b border-border bg-muted/40 px-3 py-2.5">
                    {builderTabs.map((tab, index) => (
                      <button
                        key={tab.label}
                        type="button"
                        onClick={() => setActiveTab(index)}
                        className={`rounded-xl px-3.5 py-2 font-mono text-xs transition-all ${
                          activeTab === index
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                    <div className="flex-1" />
                    <button
                      type="button"
                      onClick={handleCopy}
                      aria-label="Copy code sample"
                      className="inline-flex rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {copied ? (
                        <LuCheckCheck className="size-4 text-primary" />
                      ) : (
                        <LuCopy className="size-4" />
                      )}
                    </button>
                  </div>

                  <div className="overflow-x-auto p-6 font-mono text-[0.84rem] leading-7">
                    {currentBuilderTab.code.map((line, index) => (
                      <div key={`${currentBuilderTab.label}-${index}`}>
                        <span className="inline-block w-7 select-none text-muted-foreground/40">
                          {index + 1}
                        </span>
                        <span>{line}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border bg-muted/30 px-5 py-4 font-mono text-[0.78rem]">
                    <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                      <span className="text-primary">$</span>
                      <span>npm install @gyralis/sdk</span>
                    </div>
                    <div className="text-muted-foreground/60">
                      added 1 package in 0.4s
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-4 font-mono text-sm">
                  <a
                    href="https://github.com/orgs/Gyralis/repositories"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary transition-colors hover:text-foreground"
                  >
                    Read the docs
                  </a>
                  <span className="text-border">|</span>
                  <a
                    href="https://github.com/orgs/Gyralis/repositories"
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    View on GitHub
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section> */}

        <section className="relative overflow-hidden py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-[#10121a]">
              <div
                className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] opacity-50"
                style={{ backgroundSize: "56px 56px" }}
              />
              <div className="absolute right-[-10%] top-[-30%] size-[520px] rounded-full bg-[radial-gradient(circle,rgba(28,231,131,0.35)_0%,transparent_62%)]" />
              <div className="absolute bottom-[-40%] right-[14%] size-[460px] rounded-full bg-[radial-gradient(circle,rgba(118,75,255,0.3)_0%,transparent_62%)]" />
              <div className="absolute right-[60px] top-1/2 hidden size-[360px] -translate-y-1/2 opacity-50 lg:block">
                <svg
                  viewBox="0 0 200 200"
                  fill="none"
                  className="size-full animate-[spin_50s_linear_infinite]"
                  aria-hidden="true"
                >
                  <circle
                    cx="100"
                    cy="100"
                    r="86"
                    stroke="#1CE783"
                    strokeWidth="1.5"
                    strokeDasharray="5 10"
                    opacity="0.6"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="60"
                    stroke="#764BFF"
                    strokeWidth="2"
                  />
                  <path
                    d="M132 55 148 68l-19 6"
                    stroke="#1CE783"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div className="relative z-10 max-w-2xl px-8 py-16 sm:px-14 sm:py-[72px]">
                <h2 className="font-heading text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[1.03] tracking-[-0.015em] text-white">
                  Step into live participation loops.
                </h2>
                <div className="mt-5 max-w-xl space-y-4 text-lg leading-7 text-white/70">
                  <p>
                    Join{" "}
                    <span className="text-white">
                      +{heroSummary.uniqueUsers.toLocaleString()} users
                    </span>{" "}
                    already claiming, returning, and building streaks across the
                    ecosystem.
                  </p>
                  <p>
                    Unlock special access to{" "}
                    <span className="text-white">The True Loopers</span>{" "}
                    upcoming soon.
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
            </div>
          </div>
        </section>
      </main>

      <footer className="relative border-t border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-10 py-16 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
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

      <style jsx>{`
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
