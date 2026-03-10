"use client"

import React, { useMemo, useState } from "react"
import { LoopCardData } from "@/data/loops-data"

import { useWallet } from "@/lib/hooks/web3/use-wallet"
import { Button } from "@/components/ui/button"

import { LoopBalance } from "./loop-balance"
import { LoopClaim } from "./loop-claim"
import { LoopEligibility, LoopShield } from "./loop-elegibility"
import { LoopSettings } from "./loop-settings"

interface LoopCardProps {
  loop: LoopCardData
  onBalanceUpdate: (
    cardId: number,
    newBalance: number,
    newBalanceString: string
  ) => void
}

const CHAIN_ICONS: Record<number, JSX.Element> = {
  1: (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M12 2L5 12.5L12 16.5L19 12.5L12 2Z" fill="#627EEA" />
      <path
        d="M12 17.5L5 13.5L12 22L19 13.5L12 17.5Z"
        fill="#627EEA"
        fillOpacity="0.6"
      />
    </svg>
  ),
  100: (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#04795B" />
      <path
        d="M12 6C8.686 6 6 8.686 6 12C6 15.314 8.686 18 12 18C15.314 18 18 15.314 18 12C18 8.686 15.314 8 12 8C14.209 8 16 9.791 16 12C16 14.209 14.209 16 12 16Z"
        fill="white"
      />
    </svg>
  ),
  137: (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M15.5 8.5L12 6.5L8.5 8.5V12.5L12 14.5L15.5 12.5V8.5Z"
        fill="#8247E5"
        stroke="#8247E5"
        strokeWidth="1.5"
      />
      <path
        d="M12 14.5V18.5L8.5 16.5V12.5L12 14.5Z"
        fill="#8247E5"
        fillOpacity="0.7"
      />
      <path
        d="M15.5 12.5V16.5L12 18.5V14.5L15.5 12.5Z"
        fill="#8247E5"
        fillOpacity="0.7"
      />
    </svg>
  ),
  42161: (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#28A0F0" />
      <path
        d="M14 8L12 12L10 8H8L11 14L8 16H10L12 14L14 16H16L13 14L16 8H14Z"
        fill="white"
        stroke="white"
        strokeWidth="0.5"
      />
    </svg>
  ),
  10: (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#FF0420" />
      <ellipse cx="9" cy="11" rx="2" ry="3" fill="white" />
      <ellipse cx="15" cy="11" rx="2" ry="3" fill="white" />
    </svg>
  ),
  42220: (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="10" cy="12" r="6" fill="#FCFF52" />
      <circle cx="14" cy="12" r="6" fill="#35D07F" fillOpacity="0.7" />
    </svg>
  ),
}

const ChainIcon = ({
  chainId,
  className = "w-6 h-6",
}: {
  chainId: number
  className?: string
}) => {
  return (
    <div className={`${className} [&>svg]:size-full`}>
      {CHAIN_ICONS[chainId] ?? (
        <div className="size-6 rounded-full bg-gray-400" />
      )}
    </div>
  )
}

const LoopCard: React.FC<LoopCardProps> = ({ loop, onBalanceUpdate }) => {
  const [status, setStatus] = useState({
    message: null as string | null,
    type: null as "success" | "error" | null,
    isClaiming: false,
    hasClaimed: false,
    shieldPassed: false,
    eligibilityPassed: false,
  })

  const [isAddressesModalOpen, setIsAddressesModalOpen] = useState(false)
  const [isSwitchingChain, setIsSwitchingChain] = useState(false)

  const { isConnected, currentChainId, connectWallet, switchChain } =
    useWallet()

  const isCorrectChain = currentChainId === loop.chainId

  const canClaim = isConnected && isCorrectChain && !status.hasClaimed

  return (
    <div className="tamagotchi-card font-body relative p-6 md:p-8">
      <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3">
        {/* Loop metadata */}
        <div className="col-span-1 flex flex-col rounded-2xl border border-border/60 bg-gradient-to-br from-card/80 via-card/65 to-muted/30 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] lg:pr-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="inline-flex min-w-0 items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <ChainIcon chainId={loop.chainId} className="size-4 shrink-0" />
              <span className="truncate text-foreground">
                Deployed on {loop.chainName}
              </span>
            </span>
            <span
              className={`inline-flex shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                loop.super
                  ? "bg-gradient-to-r from-orange-400 to-pink-400 text-white"
                  : "bg-gradient-to-r from-blue-400 to-teal-400 text-white"
              }`}
            >
              {loop.super ? "SUPER LOOP" : "LOOP"}
            </span>
          </div>

          <h3 className="font-heading text-2xl leading-tight text-foreground md:text-[2rem]">
            {loop.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            {loop.description}
          </p>

          <div className="mt-auto pt-5">
            <span className="inline-flex rounded-full bg-popover px-3 py-1.5 text-xs font-semibold text-secondary-foreground">
              by {loop.by}
            </span>
          </div>
        </div>

        {/* Loop Balance / Shield / Elegibility */}
        <div className="col-span-1 flex flex-col rounded-2xl border border-border/60 bg-gradient-to-br from-card/80 via-card/65 to-muted/30 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] lg:px-6">
          <div className="rounded-2xl bg-background/35 p-1">
            <LoopBalance
              address={loop.address}
              token={loop.token}
              chainId={loop.chainId}
            />
          </div>
          <div className="mt-4 flex flex-col gap-3">
            <LoopShield shieldScore={loop.shieldScore} />
            <LoopEligibility eligibilityCriteria={loop.eligibility} />
          </div>
        </div>

        {/* Loop Setting */}
        <div className="col-span-1 flex flex-col rounded-2xl border border-border/60 bg-gradient-to-br from-card/80 via-card/65 to-muted/30 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] lg:px-6">
          <LoopSettings
            address={loop.address ?? "0x"}
            chainId={loop.chainId}
            loopTitle={loop.title}
          />

          {/* <ClaimButton/> */}
          <LoopClaim
            address={loop.address ?? "0x"}
            chainId={loop.chainId}
            eligibilityProvider={loop.eligibilityProvider}
          />
        </div>
      </div>
    </div>
  )
}

export default LoopCard
