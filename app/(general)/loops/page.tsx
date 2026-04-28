"use client"

import { useState } from "react"
import Image from "next/image"
import loopBackgroundDark from "@/assets/gyralis_background_dark.png"
import loopBackgroundLight from "@/assets/gyralis_background_light.png"
import { LoopCardData, LoopCardsData } from "@/data/loops-data"
import { LuArrowDown } from "react-icons/lu"

import LoopCard from "@/components/loops/loop-card"
import { SearchWithTags } from "@/components/search"

const activeLoopCount = LoopCardsData.length
const chainCount = new Set(LoopCardsData.map((c) => c.chainName)).size
const communityCount = new Set(LoopCardsData.map((c) => c.by)).size

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
          <section className="relative">
            <div className="tamagotchi-card loop-hero-card relative w-full min-h-[520px] !cursor-default !p-8 pb-24 hover:!translate-y-0 hover:!cursor-default sm:min-h-[560px] sm:!p-10 sm:pb-28 lg:min-h-[600px] lg:!p-14 lg:pb-32 before:!opacity-100">
              <Image
                src={loopBackgroundLight}
                alt=""
                fill
                priority
                aria-hidden="true"
                className="rounded-[inherit] object-cover dark:hidden"
              />
              <Image
                src={loopBackgroundDark}
                alt=""
                fill
                priority
                aria-hidden="true"
                className="hidden rounded-[inherit] object-cover dark:block"
              />
              <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-r from-background/84 via-background/46 to-background/34 dark:from-background/88 dark:via-background/50 dark:to-background/38" />
              <div className="absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_18%_55%,rgba(28,231,131,0.22),transparent_52%)] dark:bg-[radial-gradient(circle_at_18%_55%,rgba(28,231,131,0.16),transparent_52%)]" />
              <div className="absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_82%_28%,rgba(140,75,255,0.2),transparent_42%)] dark:bg-[radial-gradient(circle_at_82%_28%,rgba(140,75,255,0.16),transparent_42%)]" />
              <div className="absolute inset-y-0 right-0 w-[46%] rounded-r-[inherit] bg-[linear-gradient(270deg,rgba(7,10,18,0.26),rgba(7,10,18,0.06),transparent)] dark:bg-[linear-gradient(270deg,rgba(2,4,10,0.34),rgba(2,4,10,0.12),transparent)]" />

              <div className="relative z-10 flex min-h-[360px] flex-col justify-center gap-10 lg:min-h-[400px] lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-xl">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/28 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] backdrop-blur-md">
                    <span className="size-2 rounded-full bg-primary" />
                    Daily Loop Rewards
                  </span>
                  <h1 className="mt-5 font-baloo text-[3.2rem] font-bold leading-[0.91] drop-shadow-[0_3px_22px_rgba(0,0,0,0.48)] sm:text-[4.3rem] lg:text-[5rem] text-white">
                    <span className="block">
                      <span>PROVE - </span>
                      <span className="text-primary">CLAIM -</span>
                    </span>
                    <span className="block">REPEAT</span>
                  </h1>
                  <p className="mt-6 max-w-md text-xl leading-9 sm:text-xl  text-accent-foreground">
                    Gyralis is for protocols and communities that value real
                    participation.
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      document
                        .getElementById("loops-grid")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/18 px-5 py-3 text-sm font-semibold text-white/92 shadow-[0_14px_30px_-20px_rgba(0,0,0,0.7)] backdrop-blur-md transition-colors hover:border-primary/45 hover:bg-black/24 hover:text-primary"
                  >
                    Explore Loops
                    <LuArrowDown className="size-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-8 self-start text-white lg:self-center">
                  {[
                    {
                      value: activeLoopCount,
                      label:
                        activeLoopCount === 1 ? "ACTIVE LOOP" : "ACTIVE LOOPS",
                    },
                    {
                      value: chainCount,
                      label: chainCount === 1 ? "CHAIN" : "CHAINS",
                    },
                    {
                      value: communityCount,
                      label: communityCount === 1 ? "COMMUNITY" : "COMMUNITIES",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="min-w-[88px] text-center sm:min-w-[120px]"
                    >
                      <h3 className="font-heading text-5xl font-bold leading-none drop-shadow-[0_2px_16px_rgba(0,0,0,0.4)] sm:text-6xl">
                        {item.value}
                      </h3>
                      <p className="mt-3 text-xs font-medium uppercase tracking-[0.12em] text-secondary-foreground sm:text-sm">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 z-20 flex translate-y-[38%] justify-center px-4">
              <div className="w-full max-w-[58rem]">
                <SearchWithTags
                  value={searchQuery}
                  onChange={setSearch}
                  activeTag={activeTag}
                  onTagChange={setActiveTag}
                  tags={tags}
                  variant="hero"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="mx-auto max-w-screen-xl overflow-visible px-4 pb-8 pt-16 sm:pt-24">
          <div id="loops-grid" className="grid gap-6">
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
