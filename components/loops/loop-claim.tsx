"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Address } from "viem"

import {
  LoopSettingsProps,
  useLoopSettings,
} from "@/lib/hooks/app/use-next-period-start"

import { Button } from "../ui/button"

interface LoopClaimProps {
  address: Address
  chainId: number
}

export const LoopClaim: React.FC<LoopClaimProps> = ({ address, chainId }) => {
  const [superLoop, setSuperLoop] = useState<boolean>(false)
  const [isAddressesModalOpen, setIsAddressesModalOpen] = useState(false)

  const { settings, currentPeriod, isLoading } = useLoopSettings(
    address,
    chainId
  )

  const nextPeriodStart =
    settings && currentPeriod != null
      ? BigInt(settings.firstPeriodStart) +
        BigInt(settings.periodLength) * (currentPeriod + 1n)
      : undefined

  return (
    <div>
      <Button chainId={chainId} onClick={() => console.log("claim button")}>
        Claim Loggic here
      </Button>
    </div>
  )
}
