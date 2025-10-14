"use client"

import React, { useEffect } from "react"
import { motion, useSpring, useTransform } from "framer-motion"
import { FaWallet } from "react-icons/fa"
import { Address, formatUnits } from "viem"
import { useBalance } from "wagmi"

interface LoopBalanceProps {
  address?: Address
  token?: Address
  chain: number
}

export const LoopBalance: React.FC<LoopBalanceProps> = ({
  address,
  token,
  chain,
}) => {
  const { data, isLoading, isError } = useBalance({
    address: address!,
    token: token,
    chainId: chain,
    // query: { enabled: !!address && !!token },
  })

  if (!address || !token)
    return (
      <div className="flex items-center justify-center rounded-2xl bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">
          Waiting for addresses...
        </p>
      </div>
    )

  if (isLoading)
    return (
      <div className="flex items-center justify-center rounded-2xl bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">Fetching balance...</p>
      </div>
    )

  if (isError || !data)
    return (
      <div className="flex items-center justify-center rounded-2xl bg-muted/30 p-4">
        <p className="text-sm text-red-500">Failed to fetch balance</p>
      </div>
    )

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

type AnimatedNumberProps = {
  value: number
}

const AnimatedNumber = ({ value }: AnimatedNumberProps) => {
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
