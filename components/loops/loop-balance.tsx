"use client"

import React, { useEffect } from "react"
import { motion, useSpring, useTransform } from "framer-motion"
import { FaWallet } from "react-icons/fa"
import { Address, formatUnits } from "viem"
import { useBalance } from "wagmi"

interface LoopBalanceProps {
  address?: Address
  token?: Address
  chainId: number
}

export const LoopBalance: React.FC<LoopBalanceProps> = ({
  address,
  token,
  chainId,
}) => {
  const { data, isLoading, isError } = useBalance({
    address: address!,
    token: token,
    chainId: chainId,
    // query: { enabled: !!address && !!token },
  })

  if (!address || !token) {
    return <StatusCard message="Waiting for addresses..." />
  }

  if (isLoading) {
    return <StatusCard message="Fetching balance..." />
  }

  if (isError || !data) {
    return <StatusCard message="Failed to fetch balance" tone="error" />
  }

  const balance = parseFloat(formatUnits(data.value, data.decimals))
  const formattedBalance = Number(`${balance.toFixed(4)}`)

  return (
    <div className="rounded-xl border border-border/60 bg-background/60 p-4 text-center">
      <div className="mb-3 flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        <FaWallet className="size-3.5 text-primary" />
        <p>Loop Balance</p>
      </div>

      <div className="flex items-end justify-center gap-2">
        <AnimatedNumber value={formattedBalance} />
        <span className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {data.symbol}
        </span>
      </div>
    </div>
  )
}

const StatusCard = ({
  message,
  tone = "muted",
}: {
  message: string
  tone?: "muted" | "error"
}) => {
  return (
    <div className="rounded-xl border border-border/60 bg-background/60 px-4 py-6 text-center">
      <p
        className={`text-sm ${
          tone === "error" ? "text-destructive" : "text-muted-foreground"
        }`}
      >
        {message}
      </p>
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
  )

  useEffect(() => {
    spring.set(value)
  }, [value, spring])

  return (
    <motion.span className="font-heading text-4xl font-bold leading-none text-primary sm:text-5xl md:text-6xl">
      {display}
    </motion.span>
  )
}
