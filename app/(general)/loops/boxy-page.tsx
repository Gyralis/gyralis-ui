"use client"

import { useMemo, useState } from "react"
import { LoopCardData, LoopCardsData } from "@/data/loops-data"

import { LoopCardBoxy } from "@/components/loops/loop-card-boxy"
import { LoopsMarkee } from "@/components/loops/loops-markee"
import {
  ParticipationProfile,
  ParticipationProfileData,
} from "@/components/loops/participation-profile"

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

const ecosystemMetrics = [
  { value: "1,444", label: "Total claims" },
  { value: "96", label: "True loopers" },
  { value: "83%", label: "Claim rate" },
  { value: String(LoopCardsData.length), label: "Active loops" },
] as const

export default function LoopsBoxyPage() {
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [selectedChain, setSelectedChain] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)

  const tags = useMemo(
    () => Array.from(new Set(LoopCardsData.map((loop) => loop.by))),
    []
  )

  const chains = useMemo(
    () => Array.from(new Set(LoopCardsData.map((loop) => loop.chainName))),
    []
  )

  const filteredLoopCards = useMemo(
    () =>
      LoopCardsData.filter((loop) => {
        const matchesTag =
          activeTag === null ||
          loop.by.toLowerCase() === activeTag.toLowerCase()
        const matchesChain =
          selectedChain === null || loop.chainName === selectedChain
        const matchesType =
          selectedType === null || loop.contractType === selectedType
        return matchesTag && matchesChain && matchesType
      }),
    [activeTag, selectedChain, selectedType]
  )

  return (
    <div className="min-h-screen bg-background w-full">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10 ">
        <div className="space-y-8">
          <div className="rounded-4xl border border-border/80 bg-card/70 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur-xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Loops Dashboard
                </p>
                <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
                  A boxy two-column layout for live loops.
                </h1>
                <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                  Keep the useful loop state, reduce metadata, and make each
                  loop easier to scan across two columns.
                </p>
              </div>
              <LoopsMarkee />
            </div>
          </div>

          <ParticipationProfile
            profile={participationPreview}
            ecosystemMetrics={ecosystemMetrics}
            preview
          />

          <section className="rounded-4xl border border-border/80 bg-card/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
            <div className="mb-6 grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Filter loops
                </h2>
                <p className="text-sm text-muted-foreground">
                  Live sample data from the current loop registry.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <FilterSelect
                  label="Chain"
                  value={selectedChain}
                  options={chains}
                  onChange={setSelectedChain}
                />
                <FilterSelect
                  label="Type"
                  value={selectedType}
                  options={["loop", "superLoop"]}
                  onChange={setSelectedType}
                />
                <FilterSelect
                  label="Community"
                  value={activeTag}
                  options={tags}
                  onChange={setActiveTag}
                />
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {filteredLoopCards.map((loop) => (
                <LoopCardBoxy key={loop.id} loop={loop} />
              ))}
            </div>
          </section>

          <section className="rounded-4xl border border-border/80 bg-card/70 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
            <h2 className="text-xl font-semibold text-foreground">
              Design inspiration
            </h2>
            <div className="mt-4 space-y-4 text-sm text-muted-foreground">
              <p>
                This layout moves from horizontal single-row lists to a boxy
                card grid with two columns. Each card keeps the core loop state
                and eligibility summary while removing lower-value metadata from
                the entry-level view.
              </p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  Left card region is the loop overview and eligibility summary.
                </li>
                <li>
                  Right card region is the key operational state and action
                  entry points.
                </li>
                <li>
                  Use cards to support a larger dataset while keeping each loop
                  visually contained.
                </li>
                <li>
                  Secondary details can live in a detail panel or an advanced
                  drawer, not the default list.
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string | null
  options: string[]
  onChange: (value: string | null) => void
}) {
  return (
    <label className="grid gap-2 text-sm text-muted-foreground">
      <span className="font-semibold text-foreground">{label}</span>
      <select
        value={value ?? "all"}
        onChange={(event) =>
          onChange(event.target.value === "all" ? null : event.target.value)
        }
        className="rounded-3xl border border-border/70 bg-background/80 px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      >
        <option value="all">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}
