"use client"

import React, { useEffect, useState } from "react"
import { Address } from "viem"

import { useLoopSettings } from "@/lib/hooks/app/use-loop-settings"
import { secondsToTime } from "@/lib/utils/time"

interface LoopSettingsProps {
  address: Address
  chainId: number
}

export const LoopSettings: React.FC<LoopSettingsProps> = ({
  address,
  chainId,
}) => {
  // Internal state for data
  const [periodLength, setPeriodLength] = useState<bigint | undefined>(
    undefined
  )
  const [periodDistribution, setPeriodDistribution] = useState<
    bigint | undefined
  >(undefined)
  const [superLoop, setSuperLoop] = useState<boolean>(false)
  const [nextDistributionIn, setNextDistributionIn] =
    useState<string>("--:--:--")

  const { readContractData } = useLoopSettings(address, chainId)

  console.log(address, chainId)
  console.log("contractData:", readContractData)

  const [isAddressesModalOpen, setIsAddressesModalOpen] = useState(false)

  // Example effect: fetch loop settings based on address and chainId
  useEffect(() => {
    async function fetchLoopData() {
      // Replace with your real fetching logic
      // const data = await getLoopSettings(address, chainId)
      setPeriodLength(readContractData?.[1])
      setPeriodDistribution(readContractData?.[2])
      setSuperLoop(false)
      setNextDistributionIn("12h 34m")
    }

    fetchLoopData()
  }, [address, chainId])

  return (
    <div>
      <div className="border2 mb-6 grid grid-cols-2 gap-4">
        <div className="cursor-pointer rounded-xl bg-card p-3 shadow-[-2px_-2px_5px_rgba(255,255,255,0.7),2px_2px_5px_rgba(0,0,0,0.15)] transition-all duration-300 hover:shadow-[inset_-2px_-2px_5px_rgba(255,255,255,0.7),inset_2px_2px_5px_rgba(0,0,0,0.15)]">
          <p className="mb-1 text-xs font-medium text-muted-foreground">
            Period Length -
          </p>
          <p className="font-heading text-lg font-bold text-foreground md:text-xl">
            {secondsToTime(Number(readContractData?.[1]))}
          </p>
        </div>
        <div className="cursor-pointer rounded-xl bg-card p-3 shadow-[-2px_-2px_5px_rgba(255,255,255,0.7),2px_2px_5px_rgba(0,0,0,0.15)] transition-all duration-300 hover:shadow-[inset_-2px_-2px_5px_rgba(255,255,255,0.7),inset_2px_2px_5px_rgba(0,0,0,0.15)]">
          <p className="mb-1 text-xs font-medium text-muted-foreground">
            Distribution
          </p>
          <p className="font-heading text-lg font-bold text-foreground md:text-xl">
            {superLoop ? "∞" : Number(periodDistribution)} <span>%</span>
          </p>
        </div>
      </div>

      <div className="border2 mb-6 rounded-xl bg-gradient-to-br from-card/50 to-muted/30 p-4 shadow-[inset_-2px_-2px_5px_rgba(255,255,255,0.7),inset_2px_2px_5px_rgba(0,0,0,0.15)] md:mb-8">
        <p className="mb-2 text-sm font-medium text-muted-foreground">
          Next Distribution in:
        </p>
        <div className="flex items-center justify-between">
          <p className="font-heading text-2xl font-bold text-primary md:text-3xl">
            {nextDistributionIn}
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
  )
}
