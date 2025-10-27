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
      <Link href={"/loops"}>Loops</Link>
    </div>
  )
}
