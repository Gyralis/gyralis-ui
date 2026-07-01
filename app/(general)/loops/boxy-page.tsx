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
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <ParticipationProfile
          profile={participationPreview}
          ecosystemMetrics={ecosystemMetrics}
          preview
        />
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
