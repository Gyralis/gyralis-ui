"use client"

import { useState } from "react"
import Image from "next/image"
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
        <div className="mx-auto max-w-screen-xl px-4 pb-6 pt-10 md:pt-14">
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
              <p className="font-body text-xs font-semibold uppercase tracking-[0.3em] text-foreground sm:text-sm">
                Daily Loop Rewards
              </p>
              <h1 className="mt-4 text-center text-5xl font-extrabold leading-[0.95] tracking-[0.08em] text-foreground">
                <span className="flex flex-col flex-wrap items-center justify-center gap-1 sm:flex-row sm:flex-nowrap sm:gap-3">
                  <span>Prove</span>
                  <span className="hidden sm:inline-block">-</span>
                  <span>Claim</span>
                  <span className="hidden sm:inline-block">-</span>
                  <span>Repeat</span>
                </span>
              </h1>

              <p className="mt-4 max-w-lg font-body text-base text-muted-foreground sm:text-lg">
                <span>Prove you are human, claim tokens, repeat daily.</span>
                <span className="mt-1 block">
                  Gyralis is for protocols that value real participation.
                </span>
              </p>
            </div>
          </section>
        </div>

        <div className="mx-auto max-w-screen-xl overflow-visible px-4 py-8">
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
