"use client"

import React, { useEffect } from "react"
import { motion, useSpring, useTransform } from "framer-motion"
import { FaWallet } from "react-icons/fa"
import { Address, formatUnits } from "viem"
import { useBalance } from "wagmi"

import { useSuperfluidBalance } from "../../lib/hooks/useSuperFluidBalance"

interface LoopBalanceProps {
  address?: Address
  token?: Address
  chainId: number
  superToken?: boolean
}

export const LoopBalance: React.FC<LoopBalanceProps> = ({
  address,
  token,
  chainId,
  superToken = false,
}) => {
  if (!address || !token) {
    return (
      <div className="flex items-center justify-center rounded-2xl bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">
          Waiting for addresses...
        </p>
      </div>
    )
  }

  const {
    data: erc20Data,
    isLoading: erc20Loading,
    isError: erc20Error,
  } = useBalance({
    address,
    token,
    chainId,
    query: { enabled: !superToken },
  })

  const {
    data: sfData,
    isLoading: sfLoading,
    isError: sfError,
  } = useSuperfluidBalance({
    account: address,
    token,
    chainId,
    enabled: superToken,
  })

  //
  // Choose based on superToken
  //
  const isLoading = superToken ? sfLoading : erc20Loading
  const isError = superToken ? sfError : erc20Error
  const data = superToken ? sfData : erc20Data

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-2xl bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">Fetching balance...</p>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-center rounded-2xl bg-muted/30 p-4">
        <p className="text-sm text-red-500">Failed to fetch balance</p>
      </div>
    )
  }

  const balance = parseFloat(formatUnits(data.value, data.decimals))
  const formattedBalance = Number(`${balance.toFixed(4)}`)

  return (
    <div className="rounded-2xl bg-gradient-to-br from-card/50 to-muted/30 p-4 text-center shadow-inner">
      <div className="flex items-center justify-center gap-2">
        <FaWallet className="h-4 w-4 text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Balance:</p>
      </div>
      <p className="font-heading mt-2 text-3xl font-bold text-primary md:text-4xl">
        {formattedBalance}
      </p>
      <AnimatedNumber value={formattedBalance} />
    </div>
  )
}

//
// AnimatedNumber stays the same
//
const AnimatedNumber = ({ value }: { value: number }) => {
  const spring = useSpring(value, {
    mass: 0.5,
    stiffness: 50,
    damping: 10,
  })

  const display = useTransform(spring, (current) =>
    Number(current).toLocaleString(undefined, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    })
  )

  useEffect(() => {
    spring.set(value)
  }, [value, spring])

  return (
    <motion.span className="text-5xl font-bold text-[#0065BD] sm:text-6xl md:text-7xl">
      {display}
    </motion.span>
  )
}
