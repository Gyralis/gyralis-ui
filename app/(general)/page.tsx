"use client"

import { ReactNode, useEffect, useState } from "react"
import Link from "next/link"
import {
  FaArrowRight,
  FaBolt,
  FaCheck,
  FaCode,
  FaDiscord,
  FaFireAlt,
  FaGithub,
  FaLock,
  FaShieldAlt,
  FaTrophy,
  FaWallet,
} from "react-icons/fa"
import { FaXTwitter } from "react-icons/fa6"
import { LuArrowDown, LuCheckCheck, LuCopy } from "react-icons/lu"

import { NavLogoMark } from "@/components/layout/main-nav"

type MetricState = {
  claims: number
  loopers: number
  rewards: number
  streak: number
}

type HeroHistorySummary = {
  totalClaims: number
  totalRegistrations: number
  claimRatePercent: number | null
  snapshotDate: string | null
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
    description:
      "Join a Loop and prove eligibility once - a Passport score, DAO membership, or any credential the creator sets.",
    code: [
      "gyralis.register({",
      "  loop: 'gitcoin-weekly',",
      "  address: user.wallet",
      "})",
    ],
  },
  {
    num: "02",
    title: "Claim",
    description:
      "Claim your reward every period. One tap, on-chain, non-custodial - the tokens land straight in your wallet.",
    code: [
      "const claim = await gyralis.claim({",
      "  loop: 'gitcoin-weekly'",
      "})",
      "// +0.12 USDC · streak 7",
    ],
  },
  {
    num: "03",
    title: "Repeat",
    description:
      "Come back next period to keep the streak alive, earn Season Points, and climb the leaderboard.",
    code: [
      'gyralis.on("period", () => {',
      '  notify(user, "Your Loop is ready")',
      "  // streak grows every claim",
      "})",
    ],
  },
]

const epochCards = [
  {
    title: "Participation League",
    description: "Season-long ranking by claims and streaks",
    reward: "12,000 GYR",
    icon: <FaTrophy className="size-5" aria-hidden="true" />,
    tone: "primary",
  },
  {
    title: "Claim Race",
    description: "First to claim each period earns bonus points",
    reward: "4,000 GYR",
    icon: <FaBolt className="size-5" aria-hidden="true" />,
    tone: "secondary",
  },
  {
    title: "Loop Wars",
    description: "Communities compete for the biggest collective streak",
    reward: "20,000 GYR",
    icon: <FaFireAlt className="size-5" aria-hidden="true" />,
    tone: "primary",
  },
]

const connectors = [
  ["P", "Gitcoin Passport", "Credential score", "primary"],
  ["S", "Snapshot", "Governance", "loop"],
  ["F", "Farcaster", "Social graph", "loop"],
  ["L", "Lens", "Social graph", "loop"],
  ["G", "Guild.xyz", "Roles", "loop"],
  ["≈", "Superfluid", "Token streams", "super"],
  ["◇", "Safe", "Multisig", "primary"],
  ["E", "ENS", "Identity", "loop"],
] as const

const trustCards = [
  {
    title: "On-chain Transparency",
    description: "Every registration and claim is verifiable on-chain.",
    icon: <FaCheck className="size-5" aria-hidden="true" />,
    tone: "primary",
  },
  {
    title: "Eligibility Gating",
    description: "Credential checks keep Loops resistant to sybils.",
    icon: <FaShieldAlt className="size-5" aria-hidden="true" />,
    tone: "secondary",
  },
  {
    title: "Audited Contracts",
    description: "Core contracts independently audited before launch.",
    icon: <FaLock className="size-5" aria-hidden="true" />,
    tone: "primary",
  },
  {
    title: "Non-custodial",
    description: "Rewards go straight to participant wallets.",
    icon: <FaWallet className="size-5" aria-hidden="true" />,
    tone: "primary",
  },
  {
    title: "Open Source",
    description: "Contracts and SDK are fully open and forkable.",
    icon: <FaCode className="size-5" aria-hidden="true" />,
    tone: "secondary",
  },
  {
    title: "Rate Limiting",
    description: "Per-period claim limits prevent abuse and draining.",
    icon: <FaFireAlt className="size-5" aria-hidden="true" />,
    tone: "primary",
  },
]

const builderFeatures = [
  {
    title: "TypeScript-first",
    description: "Full type safety for loops, claims, and eligibility rules.",
  },
  {
    title: "Streaming built-in",
    description: "Native Superfluid streams power SuperLoops out of the box.",
  },
  {
    title: "Edge-ready",
    description: "Runs in Node, Deno, Bun, and edge runtimes.",
  },
  {
    title: "Zero dependencies",
    description: "Lightweight SDK, just 14KB gzipped.",
  },
]

const builderTabs = [
  {
    label: "Create",
    code: [
      "import { Gyralis } from '@gyralis/sdk'",
      "",
      "const gy = new Gyralis({",
      "  apiKey: process.env.GYRALIS_KEY",
      "})",
      "",
      "const loop = await gy.loops.create({",
      "  name: 'Weekly Contributor Loop',",
      "  reward: '0.12 USDC',",
      "  period: 'weekly',",
      "  eligibility: { passportScore: 15 }",
      "})",
    ],
  },
  {
    label: "Claim",
    code: [
      "const claim = await gy.claim({",
      "  loop: loop.id,",
      "  address: user.wallet",
      "})",
      "",
      "console.log(claim.amount, claim.streak)",
      "// '0.12 USDC' 7",
    ],
  },
  {
    label: "Eligibility",
    code: [
      "const ok = await gy.eligibility.check({",
      "  address: user.wallet,",
      "  rules: [",
      "    { passportScore: 15 },",
      "    { dao: 'gitcoin' }",
      "  ]",
      "})",
    ],
  },
]

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

function NumberTicker({ value, prefix = "" }: { value: number; prefix?: string }) {
  return (
    <span className="font-mono text-[2.25rem] font-semibold tracking-tight text-[#18c977] sm:text-[2.4rem]">
      {prefix}
      {Math.round(value).toLocaleString()}
    </span>
  )
}

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

export default function HomePage() {
  const [activeStep, setActiveStep] = useState(0)
  const [activeTab, setActiveTab] = useState(0)
  const [copied, setCopied] = useState(false)
  const [clock, setClock] = useState("")
  const [heroSummary, setHeroSummary] = useState<HeroHistorySummary>({
    totalClaims: 2858,
    totalRegistrations: 3349,
    claimRatePercent: 85.34,
    snapshotDate: "2026-06-29",
  })
  const [metrics, setMetrics] = useState<MetricState>({
    claims: 0,
    loopers: 0,
    rewards: 0,
    streak: 0,
  })

  useEffect(() => {
    setClock(new Date().toLocaleTimeString())
    const interval = window.setInterval(() => {
      setClock(new Date().toLocaleTimeString())
    }, 1000)
    return () => window.clearInterval(interval)
  }, [])

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
          stats?: {
            totalClaims?: number
            totalRegistrations?: number
            claimRatePercent?: number | null
          }
        }

        if (!cancelled && payload.success && payload.stats) {
          setHeroSummary({
            totalClaims: payload.stats.totalClaims ?? 0,
            totalRegistrations: payload.stats.totalRegistrations ?? 0,
            claimRatePercent: payload.stats.claimRatePercent ?? null,
            snapshotDate: payload.snapshotDate ?? null,
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

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveStep((current) => (current + 1) % stepsData.length)
    }, 4000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    const targets = {
      claims: 128940,
      loopers: 8421,
      rewards: 2340118,
      streak: 14,
    }

    const start = performance.now()
    const duration = 1600
    let frame = 0

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)

      setMetrics({
        claims: targets.claims * eased,
        loopers: targets.loopers * eased,
        rewards: targets.rewards * eased,
        streak: targets.streak * eased,
      })

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick)
      }
    }

    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    if (!copied) {
      return
    }
    const timeout = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timeout)
  }, [copied])

  const currentStep = stepsData[activeStep]
  const currentBuilderTab = builderTabs[activeTab]
  const heroClaimRateLabel =
    heroSummary.claimRatePercent == null
      ? "--"
      : `${heroSummary.claimRatePercent.toFixed(2)}%`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentBuilderTab.code.join("\n"))
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(28,231,131,0.09),transparent_24%),radial-gradient(circle_at_80%_18%,rgba(118,75,255,0.08),transparent_24%),radial-gradient(circle_at_50%_120%,rgba(28,231,131,0.06),transparent_28%)]" />
        <div
          className="absolute inset-0 bg-[linear-gradient(rgba(28,231,131,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(28,231,131,0.045)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_72%_58%_at_50%_24%,black_35%,transparent_80%)]"
          style={{ backgroundSize: "64px 64px" }}
        />
      </div>

      <main>
        <section className="relative min-h-[calc(100vh-76px)] overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[72%] bg-[radial-gradient(circle_at_50%_12%,rgba(28,231,131,0.14),transparent_28%),radial-gradient(circle_at_50%_58%,rgba(118,75,255,0.08),transparent_30%)]" />
          <div className="relative z-10 mx-auto flex min-h-[calc(100vh-76px)] w-full max-w-[1600px] flex-col px-4 pb-8 pt-14 sm:px-6 sm:pt-16 lg:px-10 lg:pt-18">
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="mx-auto max-w-5xl">
                <p className="font-heading text-[clamp(1.05rem,2vw,1.65rem)] font-medium uppercase tracking-[0.08em] text-primary">
                  The participation layer protocol
                </p>
                <h1 className="mt-8 font-heading text-[clamp(1.8rem,4.15vw,5.6rem)] font-semibold leading-[0.96] tracking-[0.01em] text-foreground">
                  PROVE PARTICIPATION,{" "}
                  <span className="text-primary">EARN REWARDS</span>,{" "}
                  <span className="text-secondary">BUILD TRUST</span>
                </h1>
                <p className="mx-auto mt-10 max-w-3xl text-lg leading-8 text-muted-foreground sm:text-[1.15rem]">
                  Gyralis helps protocols and communities reward verified humans
                  for consistent participation through proof-based loops.
                </p>
              </div>

              <div className="mt-12 flex flex-col items-center gap-4">
                <Link
                  href="/loops"
                  className="tamagotchi-button inline-flex items-center px-8 py-4 text-base"
                >
                  Launch App
                </Link>
              </div>
            </div>

            <div className="relative z-20 mt-10 w-full border-t border-border/70 pt-6">
              <div className="flex w-full flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:gap-16">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Total Claims
                    </div>
                    <div className="mt-1 font-mono text-[2rem] font-semibold tracking-tight text-foreground sm:text-[2.4rem]">
                      {heroSummary.totalClaims.toLocaleString()}
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
                      {heroClaimRateLabel}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      From {heroSummary.totalRegistrations.toLocaleString()} total
                      registrations
                    </div>
                  </div>
                </div>

                <a
                  href="#loops"
                  className="inline-flex items-center gap-3 self-start text-sm text-muted-foreground transition-colors hover:text-foreground lg:self-end"
                >
                  <span>Scroll to explore</span>
                  <LuArrowDown className="size-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="loops" className="relative py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-18 grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="mb-3 font-mono text-[0.8125rem] tracking-[0.18em] text-primary">
                  {"// LOOPS"}
                </p>
                <h2 className="max-w-3xl font-heading text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05] tracking-[-0.01em]">
                  Everything you need to keep them coming back.
                </h2>
                <p className="mt-5 max-w-xl text-lg leading-7 text-muted-foreground">
                  A complete toolkit for recurring participation - from one-time
                  eligibility to streaks, claims, and season-long games. Set up
                  a Loop in minutes.
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
              {loopFeatures.map((feature) => (
                <div
                  key={feature.title}
                  className={`rounded-[2rem] border bg-card p-8 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)] ${
                    feature.tone === "super"
                      ? "border-primary/35 shadow-[0_0_0_1px_hsl(var(--primary)/0.15),0_4px_16px_rgba(28,231,131,0.10),0_2px_6px_rgba(0,0,0,0.06)]"
                      : "border-border shadow-[0_8px_30px_rgba(0,0,0,0.05)]"
                  }`}
                >
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
                  <div className="mt-5 flex items-center gap-2">
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
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="relative bg-muted/50 py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-16">
              <p className="mb-3 font-mono text-[0.8125rem] tracking-[0.18em] text-primary">
                {"// HOW LOOPS WORK"}
              </p>
              <h2 className="font-heading text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05] tracking-[-0.01em]">
                Register, claim, repeat.
              </h2>
            </div>

            <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
              <div className="flex flex-col gap-2">
                {stepsData.map((step, index) => {
                  const active = activeStep === index
                  return (
                    <button
                      key={step.num}
                      type="button"
                      onClick={() => setActiveStep(index)}
                      className={`w-full rounded-3xl border p-6 text-left transition-all duration-300 ${
                        active
                          ? "border-primary/45 bg-card shadow-[0_10px_34px_rgba(0,0,0,0.06)]"
                          : "border-transparent bg-transparent"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <span
                          className={`pt-0.5 font-mono text-sm ${
                            active ? "text-primary" : "text-muted-foreground"
                          }`}
                        >
                          {step.num}
                        </span>
                        <div className="flex-1">
                          <h3 className="font-heading text-lg font-semibold">
                            {step.title}
                          </h3>
                          <p className="mt-1 text-[0.95rem] leading-7 text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                      </div>
                      {active ? (
                        <div className="ml-8 mt-4 h-[3px] overflow-hidden rounded-full bg-border">
                          <div className="size-full animate-[progress_4s_linear] rounded-full bg-primary" />
                        </div>
                      ) : null}
                    </button>
                  )
                })}
              </div>

              <div className="lg:sticky lg:top-28">
                <div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_10px_34px_rgba(0,0,0,0.06)]">
                  <div className="flex items-center gap-3 border-b border-border bg-muted/40 px-5 py-4">
                    <div className="flex gap-2">
                      <span className="size-2.5 rounded-full bg-[#ff6f61]" />
                      <span className="size-2.5 rounded-full bg-[#fb923c]" />
                      <span className="size-2.5 rounded-full bg-[#1ce783]" />
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">
                      loop.ts
                    </span>
                  </div>
                  <div className="min-h-[200px] p-6 font-mono text-[0.86rem] leading-7">
                    {currentStep.code.map((line, index) => (
                      <div key={`${currentStep.num}-${index}`}>
                        <span className="inline-block w-7 select-none text-muted-foreground/50">
                          {index + 1}
                        </span>
                        <span>{line}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border bg-muted/30 px-5 py-4 font-mono text-[0.78rem] text-primary">
                    <span className="inline-flex items-center gap-2">
                      <span className="size-2 rounded-full bg-primary animate-pulse" />
                      Claimed this period
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="epochs" className="relative overflow-hidden py-24 sm:py-32">
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
        </section>

        <section id="metrics" className="relative py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="mb-3 font-mono text-[0.8125rem] tracking-[0.18em] text-primary">
                  {"// LIVE ON-CHAIN"}
                </p>
                <h2 className="font-heading text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05] tracking-[-0.01em]">
                  Participation, in real time.
                </h2>
              </div>

              <div className="flex items-center gap-3 font-mono text-sm text-muted-foreground">
                <span className="size-2 rounded-full bg-primary animate-pulse" />
                <span>All systems operational</span>
                <span className="text-border">|</span>
                <span>{clock}</span>
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-border bg-border shadow-[0_10px_34px_rgba(0,0,0,0.06)]">
              <div className="grid gap-px md:grid-cols-2 xl:grid-cols-4">
                <div className="bg-card p-8">
                  <NumberTicker value={metrics.claims} />
                  <div className="mt-4">
                    <div className="font-medium">Claims this period</div>
                    <div className="text-sm text-muted-foreground">
                      +8.2% from last period
                    </div>
                  </div>
                </div>
                <div className="bg-card p-8">
                  <NumberTicker value={metrics.loopers} />
                  <div className="mt-4">
                    <div className="font-medium">Active loopers</div>
                    <div className="text-sm text-muted-foreground">
                      across all loops
                    </div>
                  </div>
                </div>
                <div className="bg-card p-8">
                  <NumberTicker value={metrics.rewards} prefix="$" />
                  <div className="mt-4">
                    <div className="font-medium">USDC distributed</div>
                    <div className="text-sm text-muted-foreground">
                      all-time, non-custodial
                    </div>
                  </div>
                </div>
                <div className="bg-card p-8">
                  <NumberTicker value={metrics.streak} />
                  <div className="mt-4">
                    <div className="font-medium">Avg streak</div>
                    <div className="text-sm text-muted-foreground">
                      periods, and rising
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-[2rem] border border-border bg-card p-6 shadow-[0_10px_34px_rgba(0,0,0,0.06)]">
              <div className="mb-4 flex items-center gap-2">
                <span className="size-2 rounded-full bg-primary animate-pulse" />
                <span className="font-mono text-sm text-muted-foreground">
                  Live claim feed
                </span>
              </div>
              <div className="flex flex-col gap-3 font-mono text-[0.8rem] text-muted-foreground">
                {[
                  ["now", "0x8fa…12c claimed 0.12 USDC", "Gitcoin Weekly", "streak 7"],
                  ["1s", "0x3b1…9de entered the loop", "Optimism Builders", "new"],
                  ["2s", "0xa07…4f1 claimed 5.00 OP", "Optimism Builders", "streak 21"],
                  ["3s", "0x5cd…88a streamed 0.004 DAI", "SuperLoop · Grants", "live"],
                ].map(([time, activity, loop, status]) => (
                  <div key={`${time}-${activity}`} className="flex flex-wrap gap-4">
                    <span className="w-9 text-muted-foreground/50">{time}</span>
                    <span className="text-foreground">{activity}</span>
                    <span className="text-muted-foreground/70">{loop}</span>
                    <span
                      className={
                        status === "new" ? "text-secondary" : "text-primary"
                      }
                    >
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="connectors" className="relative py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <p className="mb-3 font-mono text-[0.8125rem] tracking-[0.18em] text-primary">
                {"// ELIGIBILITY & CONNECTORS"}
              </p>
              <h2 className="font-heading text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05] tracking-[-0.01em]">
                Gate on anything. Trust everything.
              </h2>
              <p className="mt-5 text-lg leading-7 text-muted-foreground">
                Plug your Loops into the credentials your community already uses.
                One check at registration keeps participation sybil-resistant.
              </p>
            </div>

            <div className="mb-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {connectors.map(([mark, title, subtitle, tone]) => (
                <div
                  key={title}
                  className="rounded-3xl border border-border bg-card p-6 text-center shadow-[0_8px_30px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)]"
                >
                  <div
                    className={`mx-auto mb-4 flex size-11 items-center justify-center rounded-xl font-heading text-base font-bold ${
                      tone === "super"
                        ? "bg-[linear-gradient(135deg,#764bff_0%,#1ce783_100%)] text-white"
                        : tone === "primary"
                          ? "bg-[linear-gradient(135deg,#1ce783_0%,#4ade80_100%)] text-black"
                          : "bg-[linear-gradient(135deg,#764bff_0%,#9f7aea_100%)] text-white"
                    }`}
                  >
                    {mark}
                  </div>
                  <h3 className="font-heading text-base font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
                </div>
              ))}
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_10px_34px_rgba(0,0,0,0.06)]">
              <div className="grid gap-10 px-6 py-10 lg:grid-cols-2 lg:items-center lg:px-12">
                <div>
                  <h3 className="font-heading text-[1.6rem] font-bold">
                    Need a custom gate?
                  </h3>
                  <p className="mt-4 max-w-xl leading-7 text-muted-foreground">
                    Compose any credential check with our eligibility API. REST
                    and GraphQL, plus webhooks for every registration and claim.
                  </p>
                  <Link
                    href="/eligibilities"
                    className="tamagotchi-button mt-6 inline-flex items-center px-6 py-3 text-sm"
                  >
                    View eligibility docs
                  </Link>
                </div>

                <div className="rounded-[1.25rem] border border-border bg-muted/50 p-6 font-mono text-[0.82rem] leading-8 text-muted-foreground">
                  <div className="mb-2 text-primary">{"// Compose an eligibility gate"}</div>
                  <div>
                    <span className="text-secondary">const</span> ok ={" "}
                    <span className="text-secondary">await</span>{" "}
                    gy.eligibility.check({"{"})
                  </div>
                  <div className="pl-4">
                    <span className="text-primary">address</span>: user.wallet,
                  </div>
                  <div className="pl-4">
                    <span className="text-primary">rules</span>: [{"{"}
                    passportScore: <span className="text-primary">15</span>
                    {"}"}]
                  </div>
                  <div>{"})"}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="trust" className="relative bg-muted/50 py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <p className="mb-3 font-mono text-[0.8125rem] tracking-[0.18em] text-primary">
                {"// SYBIL RESISTANCE"}
              </p>
              <h2 className="font-heading text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05] tracking-[-0.01em]">
                Participation you can trust.
              </h2>
              <p className="mt-5 text-lg leading-7 text-muted-foreground">
                Every registration and claim is verifiable on-chain, gated by
                real credentials, and settled non-custodially. No black boxes.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {trustCards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-3xl border border-border bg-card p-7 shadow-[0_8px_30px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)]"
                >
                  <div
                    className={
                      card.tone === "secondary" ? "text-secondary" : "text-primary"
                    }
                  >
                    {card.icon}
                  </div>
                  <h3 className="mt-4 font-heading text-[1.05rem] font-semibold">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-[0.9rem] leading-7 text-muted-foreground">
                    {card.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-between gap-7 rounded-[2rem] border border-border bg-card p-9 shadow-[0_10px_34px_rgba(0,0,0,0.06)]">
              <div>
                <h3 className="font-heading text-xl font-semibold">
                  Audited & verified
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Independently reviewed security and open bounties.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {[
                  ["OpenZeppelin", "Audit"],
                  ["Spearbit", "Audit"],
                  ["Immunefi", "Bounty"],
                  ["MIT", "License"],
                ].map(([label, detail]) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-muted/60 px-6 py-4"
                  >
                    <span className="font-mono text-xs text-primary">{label}</span>
                    <span className="text-[0.72rem] text-muted-foreground">
                      {detail}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="builders" className="relative py-24 sm:py-32">
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
        </section>

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
                  Enter the Loop, today.
                </h2>
                <p className="mt-5 max-w-xl text-lg leading-7 text-white/70">
                  Join thousands of loopers building streaks across the ecosystem.
                  Free to launch, scales with your community.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/loops"
                    className="tamagotchi-button inline-flex items-center gap-2 px-7 py-4 text-base"
                  >
                    Launch a Loop
                    <FaArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                  <a
                    href="https://discord.gg/VgGQHDpn"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-lg border border-white/30 px-7 py-4 text-base font-medium text-white transition-colors hover:bg-white/10"
                  >
                    Talk to us
                  </a>
                </div>

                <p className="mt-6 font-mono text-[0.82rem] text-white/50">
                  No smart-contract experience required
                </p>
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
