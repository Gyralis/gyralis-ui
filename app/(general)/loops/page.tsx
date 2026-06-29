"use client"

import { useState } from "react"
import Link from "next/link"
import { LoopCardData, LoopCardsData } from "@/data/loops-data"
import { motion } from "framer-motion"
import { HiOutlineAdjustments as HiSlidersHorizontal } from "react-icons/hi"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import LoopCard from "@/components/loops/loop-card"
import { LoopsTable } from "@/components/loops/loops-table"
import {
  EcosystemMetricData,
  ParticipationProfile,
  ParticipationProfileData,
} from "@/components/loops/participation-profile"

type ViewMode = "cards" | "table"

const participationPreview: ParticipationProfileData = {
  rank: 4,
  percentile: "Top 5%",
  identityLabel: "True Looper",
  streak: 14,
  tierLabel: "Core Looper",
  claims: 42,
  points: 58,
  earnings: 100,
  earningsSymbol: "HNY",
  activeLoops: 2,
}

const ecosystemMetrics: [
  EcosystemMetricData,
  EcosystemMetricData,
  EcosystemMetricData,
  EcosystemMetricData
] = [
  { value: "1,444", label: "Total claims" },
  { value: "96", label: "True loopers" },
  { value: "83%", label: "Claim rate" },
  { value: String(LoopCardsData.length), label: "Active loops" },
]

export default function HomePage() {
  const [cards, setCards] = useState<LoopCardData[]>(LoopCardsData)
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [selectedChain, setSelectedChain] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("cards")

  const tags = Array.from(new Set(cards.map((loop) => loop.by)))
  const chains = Array.from(new Set(cards.map((loop) => loop.chainName)))
  const loopTypes = [
    { value: "loop", label: "Loops" },
    { value: "superLoop", label: "Superloops" },
  ]
  const hasActiveFilters = Boolean(activeTag || selectedChain || selectedType)

  const filteredLoopCards = cards.filter((card) => {
    const matchesTag =
      activeTag === null || card.by.toLowerCase() === activeTag.toLowerCase()
    const matchesChain =
      selectedChain === null || card.chainName === selectedChain
    const matchesType =
      selectedType === null || card.contractType === selectedType

    return matchesTag && matchesChain && matchesType
  })

  const handleBalanceUpdate = (
    cardId: number,
    newBalance: number,
    newBalanceString: string
  ) => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === cardId
          ? { ...card, balanceNumeric: newBalance, balance: newBalanceString }
          : card
      )
    )
  }

  return (
    <div className="min-h-screen">
      <div className="relative">
        <div className="sticky top-3 z-40 flex justify-center px-4 pt-8">
          <nav
            aria-label="Loops participation"
            className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1.5 text-card-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_16px_42px_-28px_rgba(15,23,42,0.24)] backdrop-blur-2xl"
          >
            <Link
              href="/loops"
              aria-current="page"
              className="rounded-full bg-primary/[0.14] px-3 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-primary shadow-[0_0_0_1px_rgba(28,231,131,0.32),0_0_24px_-6px_rgba(28,231,131,0.95),0_0_38px_-16px_rgba(28,231,131,0.85)] ring-1 ring-primary/30 sm:px-5 sm:text-xs sm:tracking-[0.12em]"
            >
              Loops
            </Link>
            <div className="h-5 w-px bg-border" aria-hidden="true" />
            <Link
              href="/leaderboard"
              className="rounded-full px-3 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-card-foreground sm:px-5 sm:text-xs sm:tracking-[0.12em]"
            >
              Leaderboard
            </Link>
            <div className="h-5 w-px bg-border" aria-hidden="true" />
            <a
              href="#participation-profile"
              className="rounded-full px-3 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-card-foreground sm:px-5 sm:text-xs sm:tracking-[0.12em]"
            >
              Profile
            </a>
          </nav>
        </div>

        <header className="mx-auto max-w-screen-xl px-4 py-8 sm:py-10">
          <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8 sm:gap-10">
            {/* <LoopsMarkee /> */}

            <ParticipationProfile
              profile={participationPreview}
              ecosystemMetrics={ecosystemMetrics}
              preview
            />
          </div>
        </header>

        <div
          id="loops-grid"
          className="mx-auto max-w-screen-2xl overflow-visible px-4 pb-8 pt-2 sm:pt-4"
        >
          <div className="mx-auto mb-5 flex max-w-[560px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between xl:max-w-[calc(1120px+1.5rem)]">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                View
              </span>
              <div className="inline-flex rounded-full border border-border/80 bg-background/60 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                {(["cards", "table"] as const).map((mode) => (
                  <motion.button
                    key={mode}
                    type="button"
                    onClick={() => setViewMode(mode)}
                    animate={{
                      scale: viewMode === mode ? [1, 1.06, 1] : 1,
                    }}
                    transition={{
                      scale: {
                        duration: 0.28,
                        ease: [0.16, 1, 0.3, 1],
                      },
                    }}
                    whileTap={{ scale: 0.96 }}
                    className={`relative min-w-20 overflow-hidden rounded-full px-4 py-2 text-sm font-semibold capitalize transition-colors ${
                      viewMode === mode
                        ? "text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {viewMode === mode && (
                      <motion.span
                        layoutId="loop-view-switch-background"
                        className="absolute inset-0 rounded-full bg-primary shadow-[0_10px_24px_-18px_rgba(28,231,131,0.7)]"
                        transition={{
                          type: "spring",
                          stiffness: 420,
                          damping: 26,
                          mass: 0.75,
                        }}
                      />
                    )}
                    <span className="relative z-10">{mode}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={`inline-flex h-10 items-center justify-center gap-2 rounded-2xl border bg-card px-5 text-sm font-semibold uppercase tracking-wide text-card-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_24px_-18px_rgba(15,23,42,0.24)] transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 sm:shrink-0 ${
                    hasActiveFilters ? "border-primary/40" : "border-border/70"
                  }`}
                >
                  <span>Filters</span>
                  <HiSlidersHorizontal className="size-4 shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-80 rounded-3xl border-border/70 bg-background/95 p-4 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.65)] backdrop-blur-xl"
              >
                <DropdownMenuLabel className="px-1 pb-3 pt-0 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  Filters
                </DropdownMenuLabel>

                <FilterGroupLabel>Chain</FilterGroupLabel>
                <DropdownMenuRadioGroup
                  value={selectedChain ?? "all-chains"}
                  onValueChange={(value) =>
                    setSelectedChain(value === "all-chains" ? null : value)
                  }
                >
                  <DropdownMenuRadioItem
                    value="all-chains"
                    className="rounded-xl py-2.5 pl-8 pr-3 text-muted-foreground"
                  >
                    All chains
                  </DropdownMenuRadioItem>
                  {chains.map((chain) => (
                    <DropdownMenuRadioItem
                      key={chain}
                      value={chain}
                      className="rounded-xl py-2.5 pl-8 pr-3"
                    >
                      {chain}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>

                <DropdownMenuSeparator className="my-3" />

                <FilterGroupLabel>Type</FilterGroupLabel>
                <DropdownMenuRadioGroup
                  value={selectedType ?? "all-types"}
                  onValueChange={(value) =>
                    setSelectedType(value === "all-types" ? null : value)
                  }
                >
                  <DropdownMenuRadioItem
                    value="all-types"
                    className="rounded-xl py-2.5 pl-8 pr-3 text-muted-foreground"
                  >
                    All types
                  </DropdownMenuRadioItem>
                  {loopTypes.map((type) => (
                    <DropdownMenuRadioItem
                      key={type.value}
                      value={type.value}
                      className="rounded-xl py-2.5 pl-8 pr-3"
                    >
                      {type.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>

                <DropdownMenuSeparator className="my-3" />

                <FilterGroupLabel>Community</FilterGroupLabel>
                <DropdownMenuRadioGroup
                  value={activeTag ?? "all-communities"}
                  onValueChange={(value) =>
                    setActiveTag(value === "all-communities" ? null : value)
                  }
                >
                  <DropdownMenuRadioItem
                    value="all-communities"
                    className="rounded-xl py-2.5 pl-8 pr-3 text-muted-foreground"
                  >
                    All communities
                  </DropdownMenuRadioItem>
                  {tags.map((tag) => (
                    <DropdownMenuRadioItem
                      key={tag}
                      value={tag}
                      className="rounded-xl py-2.5 pl-8 pr-3"
                    >
                      {tag}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {viewMode === "cards" ? (
            <div className="grid grid-cols-[minmax(0,560px)] items-start justify-center gap-6 xl:grid-cols-[repeat(2,minmax(0,560px))]">
              {filteredLoopCards.map((loop) => (
                <div key={loop.id} id={`loop-card-${loop.id}`}>
                  <LoopCard loop={loop} onBalanceUpdate={handleBalanceUpdate} />
                </div>
              ))}
            </div>
          ) : (
            <LoopsTable loops={filteredLoopCards} />
          )}
        </div>
      </div>
    </div>
  )
}

function FilterGroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <DropdownMenuLabel className="px-2 pb-1.5 pt-0 text-sm font-semibold text-foreground">
      {children}
    </DropdownMenuLabel>
  )
}
