"use client"

import React, { useEffect } from "react"
import { motion, useSpring, useTransform } from "framer-motion"
import { FaWallet } from "react-icons/fa"
import { Address, formatUnits } from "viem"

import {
  DEFAULT_LOOP_CONTRACT_TYPE,
  type LoopContractType,
} from "@/lib/contracts/loop-contracts"
import { useLoopTokenBalance } from "@/lib/hooks/app/use-loop-token-balance"

interface LoopBalanceProps {
  address?: Address
  chainId: number
  contractType?: LoopContractType
  refreshKey?: number
  token?: Address
}

export const LoopBalance: React.FC<LoopBalanceProps> = ({
  address,
  chainId,
  contractType = DEFAULT_LOOP_CONTRACT_TYPE,
  refreshKey = 0,
  token,
}) => {
  const { data, isLoading, isError, refetch } = useLoopTokenBalance({
    address,
    chainId,
    contractType,
    token,
  })

  useEffect(() => {
    if (!address || !token) return

    void refetch()
  }, [address, token, refreshKey, refetch])

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
    <div className="rounded-[1.45rem] border border-border/80 bg-background/35 px-5 py-5">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        <FaWallet className="size-3.5 text-primary" />
        <p>Loop Balance</p>
      </div>

      <div className="mt-2.5 flex items-end gap-2.5">
        <AnimatedNumber value={formattedBalance} />
        <span className="mb-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
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
    <div className="rounded-[1.45rem] border border-border/80 bg-background/35 px-5 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
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
    <motion.span className="block font-heading text-4xl font-bold leading-none text-primary sm:text-5xl md:text-[3.4rem]">
      {display}
    </motion.span>
  )
}
