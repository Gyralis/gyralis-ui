"use client"

import React from "react"
import type { Chain } from "viem"
import { useAccount, useChainId, useChains, useSwitchChain } from "wagmi"

type ButtonProps = {
  type?: "button" | "submit" | "reset"
  variant?: "primary" | "secondary"
  onClick?: React.DOMAttributes<HTMLButtonElement>["onClick"]
  className?: string
  disabled?: boolean
  children?: React.ReactNode
  isLoading?: boolean
  icon?: React.ReactNode
  style?: React.CSSProperties
  chainId?: number
}

export function Button({
  onClick,
  className = "",
  disabled = false,
  children,
  variant = "primary",
  isLoading = false,
  icon,
  type = "button",
  style,
  chainId,
}: ButtonProps) {
  const { isConnected } = useAccount()
  const currentChainId = useChainId()
  const { switchChain } = useSwitchChain()
  const availableChains = useChains()

  const targetChain: Chain | undefined = chainId
    ? availableChains.find((c) => c.id === chainId)
    : undefined

  const wrongNetwork = chainId != null && currentChainId !== chainId
  
  const baseClass =
    variant === "primary" ? "tamagotchi-button" : "tamagotchi-button-secondary"

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isConnected) return

    if (wrongNetwork && targetChain && switchChain) {
      // Call switchChain without await or .catch()
      switchChain({ chainId: targetChain.id })
      return
    }

    if (onClick) onClick(e)
  }

  const buttonLabel = !isConnected
    ? children
    : wrongNetwork && targetChain
    ? `Switch to ${targetChain.name}`
    : children

  const showTooltip = !isConnected ? "tooltip tooltip-bottom" : ""

  return (
    <div
      className={showTooltip}
      data-tip={!isConnected ? "Connect wallet" : ""}
    >
      <button
        type={type}
        className={`${baseClass} flex items-center justify-center gap-2 transition-all ease-out disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        onClick={handleClick}
        disabled={disabled || isLoading || !isConnected}
        style={style}
        aria-disabled={disabled || isLoading || !isConnected ? "true" : "false"}
        aria-label={typeof buttonLabel === "string" ? buttonLabel : ""}
      >
        {isLoading && (
          <span className="loading loading-spinner loading-sm text-inherit" />
        )}
        {icon && !isLoading && icon}
        {buttonLabel}
      </button>
    </div>
  )
}
