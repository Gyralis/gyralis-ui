"use client"

import { useEffect, useState } from "react"
import { LoopCardData, LoopCardsData } from "@/data/loops-data"
// import { motion } from "framer-motion"
import { LuX } from "react-icons/lu"

// import { LuLayoutGrid, LuList } from "react-icons/lu"

import LoopCard from "@/components/loops/loop-card"
import { LoopCardInactive } from "@/components/loops/loop-card-inactive"
// import { LoopsTable } from "@/components/loops/loops-table"
// import {
//   EcosystemMetricData,
//   ParticipationProfile,
//   ParticipationProfileData,
// } from "@/components/loops/participation-profile"

// type ViewMode = "grid" | "list"

// const participationPreview: ParticipationProfileData = {
//   rank: 4,
//   percentile: "Top 5%",
//   identityLabel: "True Looper",
//   streak: 14,
//   tierLabel: "Core Looper",
//   claims: 42,
//   points: 58,
//   earnings: 100,
//   earningsSymbol: "HNY",
//   activeLoops: 2,
// }

const UPGRADE_NOTICE_STORAGE_KEY = "gyralis-loops-upgrade-notice-dismissed"

export function LoopsPageClient() {
  const [cards, setCards] = useState<LoopCardData[]>(LoopCardsData)
  // const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [showUpgradeNotice, setShowUpgradeNotice] = useState(false)

  useEffect(() => {
    setShowUpgradeNotice(
      localStorage.getItem(UPGRADE_NOTICE_STORAGE_KEY) !== "true"
    )
  }, [])

  const dismissUpgradeNotice = () => {
    localStorage.setItem(UPGRADE_NOTICE_STORAGE_KEY, "true")
    setShowUpgradeNotice(false)
  }

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
        <LoopsUpgradeNotice
          visible={showUpgradeNotice}
          onDismiss={dismissUpgradeNotice}
        />

        {/* Participation profile / hero stats temporarily disabled.
        <header className="mx-auto max-w-screen-xl px-4 py-8 sm:py-10">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-8 sm:gap-10">
            <ParticipationProfile
              profile={participationPreview}
              ecosystemMetrics={ecosystemMetrics}
              statsLastUpdatedLabel={statsLastUpdatedLabel}
              preview
            />
          </div>
        </header>
        */}

        <div
          id="loops-grid"
          className="mx-auto max-w-screen-2xl overflow-visible px-4 py-8 sm:pt-10"
        >
          <div className="mx-auto hidden max-w-[560px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between xl:max-w-[calc(1120px+1.5rem)]">
            {/* Table view is temporarily disabled while its data path is refactored.
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                View
              </span>
              <div className="inline-flex rounded-full border border-border/80 bg-background/60 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                {(
                  [
                    { mode: "grid", label: "Grid", icon: LuLayoutGrid },
                    { mode: "list", label: "List", icon: LuList },
                  ] as const
                ).map(({ mode, label, icon: Icon }) => (
                  <motion.button
                    key={mode}
                    type="button"
                    onClick={() => setViewMode(mode)}
                    aria-label={label}
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
                    className={`group relative overflow-hidden rounded-full p-2.5 transition-colors ${
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
                    <span className="relative z-10 flex items-center justify-center">
                      <Icon className="size-4" />
                    </span>
                    <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 rounded-md border border-border/70 bg-background/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground opacity-0 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.4)] transition-opacity group-hover:opacity-100">
                      {label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
            */}

            {/* <DropdownMenu>
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
            </DropdownMenu> */}
          </div>

          {/* Table view is temporarily disabled while its data path is refactored.
          {viewMode === "grid" ? (
            <div className="grid grid-cols-[minmax(0,560px)] items-start justify-center gap-6 xl:grid-cols-[repeat(2,minmax(0,560px))]">
              {cards.map((loop) => (
                <div key={loop.id} id={`loop-card-${loop.id}`}>
                  {loop.enabled ? (
                    <LoopCard loop={loop} onBalanceUpdate={handleBalanceUpdate} />
                  ) : (
                    <LoopCardInactive loop={loop} />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="mx-auto w-full max-w-[1120px]">
              <LoopsTable loops={cards} />
            </div>
          )}
          */}

          <div className="grid grid-cols-[minmax(0,560px)] items-start justify-center gap-6 xl:grid-cols-[repeat(2,minmax(0,560px))]">
            {cards.map((loop) => (
              <div key={loop.id} id={`loop-card-${loop.id}`}>
                {loop.enabled ? (
                  <LoopCard loop={loop} onBalanceUpdate={handleBalanceUpdate} />
                ) : (
                  <LoopCardInactive loop={loop} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function LoopsUpgradeNotice({
  visible,
  onDismiss,
}: {
  visible: boolean
  onDismiss: () => void
}) {
  if (!visible) return null

  return (
    <div className="mx-auto max-w-screen-xl px-4 pt-5">
      <div className="mx-auto max-w-5xl rounded-2xl border border-primary/20 bg-primary/[0.06] px-4 py-3 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_38px_-30px_rgba(28,231,131,0.65)] sm:px-5">
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-4">
            <p className="font-baloo text-sm font-semibold uppercase tracking-[0.12em] text-primary">
              Building The Next Layer
            </p>
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss upgrade notice"
              className="inline-flex size-7 shrink-0 items-center justify-center text-primary/80 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              <LuX className="size-3.5" />
            </button>
          </div>
          <p className="mt-1 text-sm leading-6 text-foreground/80">
            We&apos;re improving real-time user stats across Loops, Profile, and
            Leaderboard. During this upgrade, claim counts and rankings may not
            reflect.
          </p>
        </div>
      </div>
    </div>
  )
}
