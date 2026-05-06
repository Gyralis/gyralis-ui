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
  requireWallet?: boolean
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
  requireWallet = true,
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
    if (requireWallet && !isConnected) return

    if (requireWallet && wrongNetwork && targetChain && switchChain) {
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

  const effectiveButtonLabel = !requireWallet
    ? children
    : buttonLabel

  const showTooltip = requireWallet && !isConnected ? "tooltip tooltip-bottom" : ""
  const isDisabled = disabled || isLoading || (requireWallet && !isConnected)
  const ariaDisabled = isDisabled ? "true" : "false"

  return (
    <div
      className={showTooltip}
      data-tip={requireWallet && !isConnected ? "Connect wallet" : ""}
    >
      <button
        type={type}
        className={`${baseClass} flex items-center justify-center gap-2 transition-all ease-out disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        onClick={handleClick}
        disabled={isDisabled}
        style={style}
        aria-disabled={ariaDisabled}
        aria-label={
          typeof effectiveButtonLabel === "string" ? effectiveButtonLabel : ""
        }
      >
        {isLoading && (
          <span className="loading loading-spinner loading-sm text-inherit" />
        )}
        {icon && !isLoading && icon}
        {effectiveButtonLabel}
      </button>
    </div>
  )
}
