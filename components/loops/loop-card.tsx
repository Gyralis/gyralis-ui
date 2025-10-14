"use client"

import React, { useMemo, useState } from "react"
import { LoopCardData } from "@/data/loops-data"

import { useWallet } from "@/lib/hooks/web3/use-wallet"
import { Button } from "@/components/ui/button"

import { LoopBalance } from "./loop-balance"
import { LoopEligibility, LoopShield } from "./loop-elegibility"

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
    <div className={className}>
      {CHAIN_ICONS[chainId] ?? (
        <div className="h-6 w-6 rounded-full bg-gray-400" />
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

  const simulateApiCall = async (successRate: number, delay = 500) =>
    new Promise<boolean>((resolve) =>
      setTimeout(() => resolve(Math.random() < successRate), delay)
    )

  const simulateWalletSigning = async () =>
    new Promise<boolean>((resolve) =>
      setTimeout(() => resolve(Math.random() < 0.95), 1500)
    )

  const handleClaimTokens = async () => {
    if (!canClaim) return

    setStatus({
      ...status,
      isClaiming: true,
      message: null,
      type: null,
      shieldPassed: false,
      eligibilityPassed: false,
    })

    const shieldCheck = await simulateApiCall(0.8)
    if (!shieldCheck)
      return setStatus({
        ...status,
        message: "Error: Shield requirement not met.",
        type: "error",
        isClaiming: false,
      })

    const eligibilityCheck = await simulateApiCall(0.7)
    if (!eligibilityCheck)
      return setStatus({
        ...status,
        message: "Error: Eligibility not met.",
        type: "error",
        isClaiming: false,
      })

    const walletSign = await simulateWalletSigning()
    if (!walletSign)
      return setStatus({
        ...status,
        message: "Error: Transaction failed.",
        type: "error",
        isClaiming: false,
      })

    const claimResult = await simulateApiCall(0.9)
    if (claimResult) {
      const claimAmountNumeric = parseFloat(card.claimAmount.split(" ")[0])
      const newBalance = Math.max(0, card.balanceNumeric - claimAmountNumeric)
      onBalanceUpdate(card.id, newBalance, `${newBalance} ${card.currency}`)
      setStatus({
        ...status,
        message: `Successfully claimed ${card.claimAmount}!`,
        type: "success",
        hasClaimed: true,
        isClaiming: false,
      })
    } else {
      setStatus({
        ...status,
        message: "Error: Failed to claim tokens.",
        type: "error",
        isClaiming: false,
      })
    }
  }

  const RenderClaimButton = useMemo(() => {
    if (!isConnected)
      return (
        <Button onClick={connectWallet} className="tamagotchi-button w-full">
          Connect Wallet
        </Button>
      )
    if (status.hasClaimed)
      return (
        <Button
          disabled
          className="w-full cursor-not-allowed rounded-xl bg-muted py-3 text-lg text-muted-foreground"
        >
          Already Claimed
        </Button>
      )
    return (
      <Button
        onClick={handleClaimTokens}
        disabled={status.isClaiming}
        className="tamagotchi-button w-full py-3 text-lg"
      >
        {status.isClaiming ? "Processing..." : "Claim Tokens"}
      </Button>
    )
  }, [isConnected, status.hasClaimed, status.isClaiming])

  return (
    <div className="tamagotchi-card font-body relative p-6 md:p-8">
      <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3">
        {/* Left */}
        <div className="border2 col-span-1 flex flex-col justify-between lg:pr-6">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <ChainIcon
                  chainId={loop.chainId}
                  className="h-7 w-7 flex-shrink-0"
                />
                <h3 className="font-heading text-xl text-foreground md:text-2xl">
                  {loop.title}
                </h3>
              </div>
              <span
                className={`inline-block rounded-full px-3 py-1.5 text-xs font-semibold shadow-lg ${
                  loop.super
                    ? "bg-gradient-to-r from-orange-400 to-pink-400 text-white"
                    : "bg-gradient-to-r from-blue-400 to-teal-400 text-white"
                }`}
              >
                {loop.super ? "SUPER LOOP" : "LOOP"}
              </span>
            </div>
            <p className="mb-6 text-base leading-relaxed text-muted-foreground md:text-lg">
              {loop.description}
            </p>
          </div>
        </div>

        {/* Middle */}
        <div className="border2 col-span-1 flex flex-col justify-between py-4 lg:px-6 lg:py-0">
          <div className="rounded-2xl bg-gradient-to-br from-card/50 to-muted/30 p-4 text-center">
            <LoopBalance
              address={loop.address}
              token={loop.token}
              chain={loop.chainId}
            />
          </div>
          <div className="border2 flex flex-col gap-2">
            <LoopShield shieldScore={loop.shieldScore} />
            <LoopEligibility eligibilityCriteria={loop.eligibility} />
          </div>
        </div>

        {/* Right Section (Loop Setting) */}
        <div className="border2 col-span-1 flex flex-col justify-between rounded-2xl bg-gradient-to-br from-muted/30 to-muted/50 p-4 shadow-[inset_-3px_-3px_8px_rgba(255,255,255,0.7),inset_3px_3px_8px_rgba(0,0,0,0.15)] md:p-6">
          <div>
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div className="cursor-pointer rounded-xl bg-card p-3 shadow-[-2px_-2px_5px_rgba(255,255,255,0.7),2px_2px_5px_rgba(0,0,0,0.15)] transition-all duration-300 hover:shadow-[inset_-2px_-2px_5px_rgba(255,255,255,0.7),inset_2px_2px_5px_rgba(0,0,0,0.15)]">
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  Period Length
                </p>
                <p className="font-heading text-lg font-bold text-foreground md:text-xl">
                  {loop.periodLength}
                </p>
              </div>
              <div className="cursor-pointer rounded-xl bg-card p-3 shadow-[-2px_-2px_5px_rgba(255,255,255,0.7),2px_2px_5px_rgba(0,0,0,0.15)] transition-all duration-300 hover:shadow-[inset_-2px_-2px_5px_rgba(255,255,255,0.7),inset_2px_2px_5px_rgba(0,0,0,0.15)]">
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  Distribution
                </p>
                <p className="font-heading text-lg font-bold text-foreground md:text-xl">
                  {loop.super ? "∞" : loop.periodDistribution}
                </p>
              </div>
            </div>

            <div className="mb-6 rounded-xl bg-gradient-to-br from-card/50 to-muted/30 p-4 shadow-[inset_-2px_-2px_5px_rgba(255,255,255,0.7),inset_2px_2px_5px_rgba(0,0,0,0.15)] md:mb-8">
              <p className="mb-2 text-sm font-medium text-muted-foreground">
                Next Distribution in:
              </p>
              <div className="flex items-center justify-between">
                <p className="font-heading text-2xl font-bold text-primary md:text-3xl">
                  {loop.nextDistributionIn}
                </p>
                <button
                  onClick={() => setIsAddressesModalOpen(true)}
                  className="tamagotchi-button-secondary"
                >
                  Loopers
                </button>
              </div>
            </div>
          </div>

          {/* <RenderClaimButton/> */}
        </div>
      </div>
    </div>
  )
}

export default LoopCard
