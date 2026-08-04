"use client"

import type { LoopCardData } from "@/data/loops-data"

import { StandardLoopCard } from "./standard-loop/standard-loop-card"
import { SuperLoopCard } from "./super-loop/super-loop-card"

interface LoopCardProps {
  loop: LoopCardData
  onBalanceUpdate: (
    cardId: number,
    newBalance: number,
    newBalanceString: string
  ) => void
}

export default function LoopCard({ loop, onBalanceUpdate }: LoopCardProps) {
  void onBalanceUpdate

  if (loop.contractType === "superLoop" || loop.super) {
    return <SuperLoopCard loop={loop} />
  }

  return <StandardLoopCard loop={loop} />
}
