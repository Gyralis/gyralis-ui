"use client"

import Image from "next/image"
import { useState } from "react"

import loopBackgroundDark from "@/assets/gyralis_background_dark.png"
import loopBackgroundLight from "@/assets/gyralis_background_light.png"
import { LoopCardData, LoopCardsData } from "@/data/loops-data"
import LoopCard from "@/components/loops/loop-card"
import { SearchWithTags } from "@/components/search"

export default function HomePage() {
  const [cards, setCards] = useState<LoopCardData[]>(LoopCardsData)
  const [searchQuery, setSearch] = useState("")
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const tags = Array.from(new Set(cards.map((loop) => loop.by)))

  const filteredLoopCards = cards.filter((card) => {
    const matchesSearch =
      !searchQuery ||
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.by.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTag =
      activeTag === null || card.by.toLowerCase() === activeTag.toLowerCase()

    return matchesSearch && matchesTag
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
      <div className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 pb-6 pt-10 md:pt-14">
          <section className="relative overflow-hidden rounded-3xl border border-border/70 shadow-[0_16px_48px_-28px_rgba(0,0,0,0.4)]">
            <Image
              src={loopBackgroundLight}
              alt=""
              fill
              priority
              aria-hidden="true"
              className="object-cover dark:hidden"
            />
            <Image
              src={loopBackgroundDark}
              alt=""
              fill
              priority
              aria-hidden="true"
              className="hidden object-cover dark:block"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/45 dark:from-background/90 dark:via-background/70 dark:to-background/30" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(28,231,131,0.24),transparent_45%)] dark:bg-[radial-gradient(circle_at_20%_30%,rgba(28,231,131,0.18),transparent_45%)]" />

            <div className="relative flex min-h-[280px] flex-col items-center justify-center px-6 py-10 text-center sm:min-h-[320px] sm:px-10">
              <p className="font-body text-xs font-semibold uppercase tracking-[0.3em] text-primary/90 sm:text-sm">
                Daily Loop Rewards
              </p>
              <h1 className="mt-4 font-heading text-4xl leading-[0.9] sm:text-6xl md:text-7xl">
                <span className="inline-block text-black dark:text-white">
                  PROVE
                </span>
                <span className="mx-3 inline-block size-2 rounded-full bg-black/70 align-middle dark:bg-white/80" />
                <span className="mx-3 inline-block text-primary">CLAIM</span>
                <span className="mx-3 inline-block size-2 rounded-full bg-black/70 align-middle dark:bg-white/80" />
                <span className="inline-block text-[#ff6f61]">REPEAT</span>
              </h1>
              <p className="mt-4 max-w-2xl font-body text-base text-muted-foreground sm:text-lg">
                Prove you are human. Claim tokens every day.
              </p>

              <div className="mt-8 flex w-full max-w-3xl flex-nowrap items-center justify-center gap-2 overflow-x-auto pb-1 sm:gap-4">
                {[
                  {
                    label: "Prove you are a human",
                    color: "bg-black/90 text-white dark:bg-white/90 dark:text-black",
                  },
                  {
                    label: "Claim token - every day",
                    color: "bg-[#1CE783]/90 text-black",
                  },
                  {
                    label: "Repeat daily",
                    color: "bg-[#ff6f61]/90 text-white",
                  },
                ].map((step) => (
                  <div
                    key={step.label}
                    className="flex shrink-0 items-center justify-center"
                  >
                    <div
                      className={`whitespace-nowrap rounded-full px-3 py-2 font-body text-[11px] font-semibold uppercase tracking-[0.08em] shadow-lg sm:py-3 sm:text-sm ${step.color}`}
                    >
                      {step.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="mx-auto max-w-6xl overflow-visible px-4 py-8">
          <div className="z-50">
            <SearchWithTags
              value={searchQuery}
              onChange={setSearch}
              activeTag={activeTag}
              onTagChange={setActiveTag}
              tags={tags}
            />
          </div>

          <div className="grid gap-6">
            {filteredLoopCards.map((loop) => (
              <LoopCard
                key={loop.id}
                loop={loop}
                onBalanceUpdate={handleBalanceUpdate}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
