"use client"

import React from "react"
import clsx from "clsx"
import { arbitrum, mainnet, optimism, polygon, sepolia } from "viem/chains"
import { useAccount, useChainId, useSwitchChain } from "wagmi"

type ButtonVariant = "primary" | "secondary" | "ghost"
type ButtonSize = "sm" | "md" | "lg"

type ButtonProps = {
  type?: "button" | "submit" | "reset"
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  className?: string
  disabled?: boolean
  children?: React.ReactNode
  isLoading?: boolean
  icon?: React.ReactNode
  style?: React.CSSProperties
  tooltip?: string
  chainId?: number
}

// Optional map of chain IDs to names
const chainMap: Record<number, string> = {
  [mainnet.id]: mainnet.name,
  [polygon.id]: polygon.name,
  [optimism.id]: optimism.name,
  [arbitrum.id]: arbitrum.name,
  [sepolia.id]: sepolia.name,
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      onClick,
      className,
      disabled = false,
      children,
      variant = "primary",
      size = "md",
      fullWidth = false,
      isLoading = false,
      icon,
      type = "button",
      style,
      tooltip,
      chainId,
    },
    ref
  ) => {
    const connectedChainId = useChainId()
    const { switchChainAsync, isPending } = useSwitchChain()
    const { isConnected } = useAccount()

    const isWrongChain = chainId && connectedChainId !== chainId && isConnected
    const targetChainName = chainId
      ? chainMap[chainId] ?? `Chain ${chainId}`
      : undefined

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isWrongChain && chainId) {
        try {
          await switchChainAsync({ chainId })
        } catch (err) {
          console.error("Failed to switch chain:", err)
        }
      } else {
        onClick?.(e)
      }
    }

    const baseClass =
      variant === "primary"
        ? "bg-primary text-white hover:bg-primary/90"
        : variant === "secondary"
        ? "bg-secondary text-white hover:bg-secondary/90"
        : "bg-transparent hover:bg-base-200 text-primary"

    const sizeClass =
      size === "sm"
        ? "px-3 py-1 text-sm"
        : size === "lg"
        ? "px-6 py-3 text-lg"
        : "px-4 py-2 text-base"

    const buttonClass = clsx(
      "rounded-2xl flex items-center justify-center gap-2 transition-all ease-out disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-offset-2",
      baseClass,
      sizeClass,
      fullWidth && "w-full",
      className
    )

    return (
      <button
        ref={ref}
        type={type}
        className={buttonClass}
        onClick={handleClick}
        disabled={disabled || isLoading || isPending}
        style={style}
        aria-disabled={disabled || isLoading || isPending}
        data-tip={tooltip}
      >
        {isLoading || isPending ? (
          <span className="loading loading-spinner loading-sm text-inherit" />
        ) : (
          <>
            {icon && !isWrongChain && icon}
            {isWrongChain ? `Switch to ${targetChainName}` : children}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = "Button"
