"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { LoopCardData, LoopCardsData } from "@/data/loops-data"
import { FaDiscord, FaGithub } from "react-icons/fa"
import { LuBook } from "react-icons/lu"

import { siteConfig } from "@/config/site"
import { useLoopSettings } from "@/lib/hooks/app/use-loop-settings"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  PageHeader,
  PageHeaderCTA,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/layout/page-header"
import LoopCard from "@/components/loops/loop-card"
import { LoopMetadata } from "@/components/loops/loop-metadata"
import { SearchWithTags } from "@/components/search"
import { CopyButton } from "@/components/shared/copy-button"

export default function HomePage() {
  const [cards, setCards] = useState<LoopCardData[]>(LoopCardsData)

  const [searchQuery, setSearch] = useState("")
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [selectedCommunity, setSelectedCommunity] = useState("All")

  const tags = Array.from(new Set(LoopCardsData.map((loop) => loop.by)))

  const filteredLoopCards = LoopCardsData.filter((card) => {
    const matchesSearch =
      !searchQuery ||
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.by.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTag =
      activeTag === null || // "All" selected
      card.by.toLowerCase() === activeTag.toLowerCase() // exact match with tag

    return matchesSearch && matchesTag
  })

  // Handler to update card balances
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
        {/* Floating decorative elements */}
        <div className="pointer-events-none absolute inset-0">
          <div className="floating absolute left-10 top-20 h-8 w-8 rounded-full bg-orange-300 opacity-60"></div>
          <div className="floating absolute right-20 top-40 h-6 w-6 rounded-full bg-blue-300 opacity-60"></div>
          <div className="floating absolute left-1/4 top-60 h-4 w-4 rounded-full bg-green-300 opacity-60"></div>
          <div className="floating absolute bottom-40 right-10 h-10 w-10 rounded-full bg-pink-300 opacity-60"></div>
        </div>

        {/* loop-page-header */}
        <div className="border2 mx-auto max-w-6xl px-4 py-16">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left side - Text content */}
            <div className="space-y-8">
              <h1 className="font-heading text-5xl leading-tight text-gray-800 lg:text-6xl">
                Keep the
                <br />
                <span className="text-primary">Loop Alive.</span>
              </h1>

              <p className="font-body max-w-lg text-xl leading-relaxed text-gray-600">
                Gyralis is where communities grow by showing up. Think of it
                like a digital heartbeat—feed it, nurture it, and earn rewards
                as your loop thrives.
              </p>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Button
                  chainId={100}
                  onClick={() => console.log("Button click as primary")}
                >
                  Feed the loop
                </Button>
              </div>
            </div>

            {/* Right side - Tamagotchi device */}
            <div className="relative flex justify-center">
              <div className="relative">
                {/* Main device body */}
                <div className="relative h-96 w-80 rounded-3xl bg-gradient-to-b from-pink-300 to-pink-400 shadow-2xl">
                  {/* Device screen */}
                  <div className="absolute left-8 right-8 top-12 h-48 overflow-hidden rounded-2xl border-4 border-yellow-400 bg-gradient-to-b from-yellow-200 to-yellow-300">
                    {/* Digital pet */}
                    <div className="flex h-full items-center justify-center">
                      <div className="pulse-glow relative h-24 w-24 rounded-full bg-green-400">
                        {/* Eyes */}
                        <div className="absolute left-4 top-6 h-3 w-3 rounded-full bg-black"></div>
                        <div className="absolute right-4 top-6 h-3 w-3 rounded-full bg-black"></div>
                        {/* Mouth */}
                        <div className="absolute bottom-6 left-1/2 h-4 w-8 -translate-x-1/2 transform rounded-full border-b-4 border-black"></div>
                        {/* Cheeks */}
                        <div className="absolute left-1 top-8 h-4 w-4 rounded-full bg-pink-300 opacity-80"></div>
                        <div className="absolute right-1 top-8 h-4 w-4 rounded-full bg-pink-300 opacity-80"></div>
                      </div>
                    </div>
                  </div>

                  {/* Device buttons */}
                  <div className="absolute bottom-16 left-1/2 flex -translate-x-1/2 transform gap-4">
                    <div className="h-12 w-12 rounded-full bg-orange-400 shadow-lg"></div>
                    <div className="h-12 w-12 rounded-full bg-orange-400 shadow-lg"></div>
                    <div className="h-12 w-12 rounded-full bg-orange-400 shadow-lg"></div>
                  </div>

                  {/* Device details */}
                  <div className="absolute left-1/2 top-4 flex -translate-x-1/2 transform gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-400"></div>
                    <div className="h-3 w-3 rounded-full bg-red-400"></div>
                    <div className="h-3 w-3 rounded-full bg-red-400"></div>
                  </div>
                </div>

                {/* Decorative gears and elements */}
                <div className="floating absolute -right-4 -top-4 h-16 w-16 rounded-full bg-blue-400 opacity-80"></div>
                <div
                  className="floating absolute -bottom-8 -left-8 h-12 w-12 bg-orange-400 opacity-80"
                  style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
                ></div>
                <div
                  className="floating absolute -right-12 top-1/2 h-8 w-8 bg-teal-400 opacity-80"
                  style={{
                    clipPath:
                      "polygon(30% 0%, 0% 50%, 30% 100%, 70% 100%, 100% 50%, 70% 0%)",
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl overflow-visible px-4 py-8">
          {/* search */}
          <div className="z-50">
            <SearchWithTags
              value={searchQuery}
              onChange={setSearch}
              activeTag={activeTag} // <-- this should control your tag filter
              onTagChange={setActiveTag} // <-- updates activeTag
              tags={tags}
            />
          </div>
          {/* loops */}

          <div className="grid gap-6">
            {filteredLoopCards.map((loop) => (
              <>
                <LoopCard
                  key={loop.id}
                  loop={loop}
                  onBalanceUpdate={handleBalanceUpdate}
                />
              </>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
