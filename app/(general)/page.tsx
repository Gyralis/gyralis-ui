"use client"

import { ReactNode, useEffect, useRef, useState } from "react"
import Image from "next/image"
import {
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion"
import Link from "next/link"
import {
  FaArrowRight,
  FaBolt,
  FaCheck,
  FaCoins,
  FaCode,
  FaDiscord,
  FaFireAlt,
  FaGithub,
  FaLock,
  FaShieldAlt,
  FaTrophy,
  FaUsers,
  FaWallet,
} from "react-icons/fa"
import { FaXTwitter } from "react-icons/fa6"
import { LuArrowDown } from "react-icons/lu"

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
    title: "Recurring Loops",
    description:
      "Set a reward and a period, and let members register once and claim on repeat.",
    icon: <FaArrowRight className="size-5" aria-hidden="true" />,
    tone: "primary",
  },
  {
    title: "Streaks & Flames",
    description:
      "Every consecutive claim grows a streak. Miss a period and it resets.",
    icon: <FaFireAlt className="size-5" aria-hidden="true" />,
    tone: "primary",
  },
  {
    title: "Eligibility Gates",
    description:
      "Gate participation on a Passport score, DAO membership, or any credential.",
    icon: <FaShieldAlt className="size-5" aria-hidden="true" />,
    tone: "secondary",
  },
  {
    title: "Instant Claims",
    description:
      "One tap, on-chain, non-custodial. Rewards land straight in the wallet.",
    icon: <FaWallet className="size-5" aria-hidden="true" />,
    tone: "primary",
  },
  {
    title: "SuperLoops",
    description:
      "Premium loops backed by continuous token streams. Rewards flow by the second.",
    icon: <FaBolt className="size-5" aria-hidden="true" />,
    tone: "super",
    badge: "STREAM",
  },
  {
    title: "Leaderboards",
    description:
      "Rank loopers by claims and streaks. Turn participation into a season-long competition.",
    icon: <FaTrophy className="size-5" aria-hidden="true" />,
    tone: "secondary",
  },
]

const stepsData = [
  {
    num: "01",
    title: "Register",
    icon: <FaShieldAlt className="size-5" aria-hidden="true" />,
    description:
      "Join a Loop and prove eligibility once - a Passport score, DAO membership, or any credential the creator sets.",
    action: "Enter the Loop",
  },
  {
    num: "02",
    title: "Claim",
    icon: <FaWallet className="size-5" aria-hidden="true" />,
    description:
      "Claim your reward every period. One tap, on-chain, non-custodial - the tokens land straight in your wallet.",
    action: "Claim X tokens",
  },
  {
    num: "03",
    title: "Streak",
    icon: <FaFireAlt className="size-5" aria-hidden="true" />,
    description:
      "Come back next period to keep the streak alive, earn Season Points, and climb the leaderboard.",
    action: "Streak",
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
      { label: "Epochs", href: "#epochs" },
      { label: "Metrics", href: "#metrics" },
      { label: "SuperLoops", href: "#loops" },
    ],
  },
  {
    title: "Builders",
    links: [
      {
        label: "Documentation",
        href: "https://github.com/orgs/Gyralis/repositories",
      },
      { label: "SDK", href: "#builders" },
      {
        label: "API Reference",
        href: "https://github.com/orgs/Gyralis/repositories",
      },
      { label: "Status", href: "#metrics" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Blog", href: "https://x.com/gyralis_xyz" },
      { label: "Governance", href: "https://discord.gg/VgGQHDpn" },
      { label: "Discord", href: "https://discord.gg/VgGQHDpn" },
      { label: "Twitter", href: "https://x.com/gyralis_xyz" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/" },
      { label: "Terms", href: "/" },
      { label: "Audits", href: "#trust" },
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
  const className =
    tone === "secondary"
      ? "bg-secondary/12 text-secondary"
      : tone === "super"
        ? "bg-[linear-gradient(135deg,#764bff_0%,#1ce783_100%)] text-white"
        : "bg-primary/12 text-primary"

  return (
    <div
      className={`flex size-[52px] items-center justify-center rounded-2xl ${className}`}
    >
      {children}
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
  const [activeStep, setActiveStep] = useState(0)
  const { scrollYProgress } = useScroll({
    container: wrapperRef,
  })

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const nextStep = Math.min(
      stepsData.length - 1,
      Math.floor(Math.min(value, 0.9999) * stepsData.length)
    )
    setActiveStep(nextStep)
  })

  return (
    <div
      ref={wrapperRef}
      className="relative mx-auto h-[520px] max-w-4xl snap-y snap-mandatory overflow-y-auto overscroll-contain rounded-[2rem] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="relative z-20 flex flex-col gap-8 px-4 py-3">
        {stepsData.map((step, index) => {
          const active = activeStep === index
          const completed = index < activeStep

          return (
            <motion.article
              key={step.num}
              layout
              className={`tamagotchi-card snap-start relative flex min-h-[230px] w-full flex-col justify-between overflow-hidden p-8 text-left transition-all duration-500 lg:min-h-[220px] lg:px-10 ${
                active
                  ? "border-primary shadow-[0_18px_44px_rgba(28,231,131,0.16)]"
                  : completed
                    ? "border-primary/45 shadow-[0_10px_28px_rgba(28,231,131,0.08)]"
                    : ""
              }`}
            >
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${
                      active
                        ? "bg-primary/14 text-primary shadow-[0_0_20px_rgba(28,231,131,0.24)]"
                        : completed
                          ? "bg-primary/8 text-primary/65"
                          : "bg-muted text-muted-foreground opacity-60"
                    }`}
                  >
                    {step.icon}
                  </div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-heading text-[1.8rem] font-semibold leading-tight text-foreground">
                      {step.title}
                    </h3>
                  </div>
                </div>

                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                  <p className="max-w-[52ch] text-base leading-8 text-muted-foreground">
                    {step.description}
                  </p>

                  <div className="w-full max-w-[220px]">
                    <button
                      type="button"
                      className="inline-flex min-h-[42px] w-full items-center justify-center gap-1.5 rounded-full border border-border/80 bg-background px-3 py-2 text-sm font-medium text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_8px_20px_-18px_rgba(15,23,42,0.16)] transition-all duration-200 hover:-translate-y-px hover:bg-background hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.78),0_12px_24px_-18px_rgba(15,23,42,0.22)] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:border-white/8 dark:bg-background dark:text-white/90 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_20px_-18px_rgba(0,0,0,0.72)] dark:hover:bg-background dark:hover:text-white dark:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_12px_24px_-18px_rgba(0,0,0,0.8)]"
                    >
                      {step.action}
                    </button>
                  </div>
                </div>
              </div>
            </motion.article>
          )
        })}
      </div>
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
            totalDistributedAmount: payload.stats.totalDistributedAmount ?? null,
            totalDistributedSymbol: payload.stats.totalDistributedSymbol ?? null,
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
                  Gyralis helps protocols and communities reward verified humans
                  for consistent participation through proof-based loops.
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
                      From {heroSummary.totalRegistrations.toLocaleString()} total
                      registrations
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
            <div className="mb-18 grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <SectionLabel className="mb-3">LOOPS</SectionLabel>
                <h2 className="max-w-3xl font-heading text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05] tracking-[-0.01em]">
                  Everything you need to build momentum.
                </h2>
                <p className="mt-5 max-w-xl text-lg leading-7 text-muted-foreground">
                  Recurring on-chain participation - eligibility, claims,
                  streaks, and season-long games.
                </p>
              </div>

              <div className="flex justify-center">
                <div className="relative size-[300px]">
                  <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(28,231,131,0.18)_0%,transparent_60%)] blur-md" />
                  <svg
                    viewBox="0 0 200 200"
                    fill="none"
                    className="relative size-full"
                    aria-hidden="true"
                  >
                    <circle
                      cx="100"
                      cy="100"
                      r="82"
                      stroke="#764BFF"
                      strokeWidth="2"
                      strokeDasharray="4 10"
                      opacity="0.5"
                    />
                    <circle cx="100" cy="100" r="60" stroke="#1CE783" strokeWidth="3" />
                    <path
                      d="M132 55 148 68l-19 6"
                      stroke="#1CE783"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="100" cy="100" r="22" fill="#764BFF" opacity="0.9" />
                    <circle cx="100" cy="100" r="9" fill="#1CE783" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
                  className={`tamagotchi-card p-8 transition-all duration-300 hover:-translate-y-0.5 ${
                    feature.tone === "super"
                      ? "border-primary/35 shadow-[0_0_0_1px_hsl(var(--primary)/0.15),0_4px_16px_rgba(28,231,131,0.10),0_2px_6px_rgba(0,0,0,0.06)]"
                      : ""
                  }`}
                >
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
                    <h3 className="font-heading text-xl font-semibold">
                      {feature.title}
                    </h3>
                    {feature.badge ? (
                      <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 font-mono text-[0.65rem] tracking-[0.16em] text-primary">
                        {feature.badge}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-[0.95rem] leading-7 text-muted-foreground">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="how"
          className="relative overflow-hidden py-24 sm:py-32"
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_88%_88%,rgba(28,231,131,0.16),transparent_0%,transparent_18%),radial-gradient(circle_at_82%_72%,rgba(28,231,131,0.12),transparent_28%),radial-gradient(circle_at_68%_58%,rgba(28,231,131,0.08),transparent_34%),radial-gradient(circle_at_50%_120%,rgba(28,231,131,0.05),transparent_40%)]" />
          </div>

          <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-16">
              <SectionLabel className="mb-3">HOW LOOPS WORK</SectionLabel>
              <h2 className="font-heading text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05] tracking-[-0.01em]">
                Participation. On Repeat.
              </h2>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
                Register - Claim - Streak. Enter a Loop, claim each
                distribution period and keep your streak alive with recurring
                participation-claims that compounds into rewards and higher
                score.
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
                  Participation, in real time.
                </h2>
              </div>

              <div className="flex items-center gap-3 font-mono text-sm text-muted-foreground">
                <span className="size-2 rounded-full bg-primary animate-pulse" />
                <span>Latest updated {latestUpdatedLabel}</span>
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-border bg-border shadow-[0_10px_34px_rgba(0,0,0,0.06)]">
              <div className="grid gap-px sm:grid-cols-2">
                <div className="bg-card p-6">
                  <HighlightStatCard
                    title="Total Claims"
                    value={<AnimatedStatValue value={heroSummary.totalClaims} />}
                    icon={FaWallet}
                    className="min-h-[250px]"
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
                    className="min-h-[250px]"
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
                      heroSummary.claimRatePercent == null
                        ? "--"
                        : (
                            <AnimatedStatValue
                              value={heroSummary.claimRatePercent}
                              decimals={2}
                            />
                          )
                    }
                    suffix={heroSummary.claimRatePercent == null ? null : "%"}
                    icon={FaCheck}
                    className="min-h-[250px]"
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
                    className="min-h-[250px]"
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
          </div>
        </section>

        <section id="connectors" className="relative py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_10px_34px_rgba(0,0,0,0.06)]">
              <div className="grid gap-10 px-6 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:px-12">
                <div>
                  <SectionLabel className="mb-3">ELIGIBILITY</SectionLabel>
                  <h2 className="font-heading text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05] tracking-[-0.01em]">
                    Eligibility
                  </h2>
                  <p className="mt-5 max-w-xl text-lg leading-7 text-muted-foreground">
                    Meet the requirements to participate in loops and claim
                    rewards. Gyralis checks eligibility at registration and when
                    you come back to claim.
                  </p>
                  <div className="mt-7 space-y-3 text-sm leading-7 text-muted-foreground">
                    <p>Each loop can define its own membership or humanity gate.</p>
                    <p>Human Passport score checks help keep loop access human-first.</p>
                    <p>Community membership gates connect real on-chain participation to rewards.</p>
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
                  <div className="grid gap-4 sm:grid-cols-2">
                    {eligibilityPartners.map((partner) => (
                      <div
                        key={partner.title}
                        className="rounded-3xl border border-border bg-muted/30 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)]"
                      >
                        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border border-border bg-card">
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
                        <h3 className="font-heading text-lg font-semibold">
                          {partner.title}
                        </h3>
                        <p className="mt-2 text-sm leading-7 text-muted-foreground">
                          {partner.description}
                        </p>
                      </div>
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
                  <circle cx="100" cy="100" r="60" stroke="#764BFF" strokeWidth="2" />
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
                  Enter the Loops, today.
                </h2>
                <div className="mt-5 max-w-xl space-y-4 text-lg leading-7 text-white/70">
                  <p>
                    Join{" "}
                    <span className="text-white">
                      +{heroSummary.uniqueUsers.toLocaleString()} users
                    </span>{" "}
                    building streaks across the ecosystem.
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
                Infrastructure for recurring on-chain participation. Register,
                claim, and build streaks - on repeat.
              </p>
              <div className="mt-5 flex gap-3">
                <a
                  href="https://x.com/gyralis_xyz"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Gyralis on X"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <FaXTwitter className="size-5" />
                </a>
                <a
                  href="https://github.com/orgs/Gyralis/repositories"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Gyralis GitHub"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <FaGithub className="size-5" />
                </a>
                <a
                  href="https://discord.gg/VgGQHDpn"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Gyralis Discord"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <FaDiscord className="size-5" />
                </a>
              </div>
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

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border py-6">
            <p className="text-sm text-muted-foreground">
              © 2026 Gyralis. All rights reserved.
            </p>
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <span className="size-2 rounded-full bg-primary" />
              All systems operational
            </span>
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
