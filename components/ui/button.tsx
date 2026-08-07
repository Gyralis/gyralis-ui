"use client"

import React from "react"
import Image from "next/image"
import type { Chain } from "viem"
import { useAccount, useChainId, useChains, useSwitchChain } from "wagmi"

const CHAIN_ICON_SRC: Partial<Record<number, string>> = {
  100: "/icons/NetworkGnosis.svg",
  8453: "/icons/NetworkBaseTest.svg",
  10200: "/icons/NetworkGnosis.svg",
  84532: "/icons/NetworkBaseTest.svg",
}

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
  const switchingNetwork =
    requireWallet && isConnected && wrongNetwork && Boolean(targetChain)
  const chainIconSrc =
    switchingNetwork && targetChain ? CHAIN_ICON_SRC[targetChain.id] : undefined

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

  const effectiveButtonLabel = !requireWallet ? children : buttonLabel

  const showTooltip =
    requireWallet && !isConnected ? "tooltip tooltip-bottom" : ""
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
        {chainIconSrc && !isLoading ? (
          <Image
            src={chainIconSrc}
            alt=""
            width={16}
            height={16}
            className="size-4 shrink-0 rounded-full"
          />
        ) : icon && !isLoading ? (
          icon
        ) : null}
        {effectiveButtonLabel}
      </button>
    </div>
  )
}
