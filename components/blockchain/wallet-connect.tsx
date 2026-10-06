"use client"

import { HtmlHTMLAttributes, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { FaWallet } from "react-icons/fa"
import { LuChevronDown, LuLink } from "react-icons/lu"
import { useSwitchChain } from "wagmi"

import { deployedChains } from "@/config/networks"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const CHAIN_ICONS: Record<number, string> = {
  8453: "/icons/NetworkBaseTest.svg",
  100: "/icons/NetworkGnosis.svg",
}

export const WalletConnect = ({
  className,
  compact = false,
  ...props
}: HtmlHTMLAttributes<HTMLDivElement> & { compact?: boolean }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout>>()
  const { switchChain, isPending, variables, error, reset } = useSwitchChain()

  const cancelClose = () => clearTimeout(closeTimer.current)
  const openMenu = () => {
    cancelClose()
    setMenuOpen(true)
  }
  const scheduleClose = () => {
    cancelClose()
    closeTimer.current = setTimeout(() => setMenuOpen(false), 200)
  }

  useEffect(() => () => clearTimeout(closeTimer.current), [])

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        mounted,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
      }) => {
        const ready = mounted && authenticationStatus !== "loading"
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated")

        return (
          <div
            className={className}
            {...props}
            style={{
              ...props.style,
              opacity: ready ? 1 : 0.6,
              pointerEvents: ready ? "auto" : "none",
              userSelect: "none",
            }}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    type="button"
                    onClick={openConnectModal}
                    aria-label="Connect wallet"
                    className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md border border-primary/40 bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
                  >
                    <FaWallet className="size-4" />
                    <span className="hidden sm:inline">Connect wallet</span>
                    <span className={compact ? "hidden" : "sm:hidden"}>
                      Wallet
                    </span>
                  </button>
                )
              }

              const walletLabel = account.ensName ?? account.displayName

              return (
                <DropdownMenu
                  modal={false}
                  open={menuOpen}
                  onOpenChange={(open) => {
                    cancelClose()
                    setMenuOpen(open)
                  }}
                >
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      onPointerEnter={(event) => {
                        if (event.pointerType === "mouse") openMenu()
                      }}
                      onPointerLeave={scheduleClose}
                      aria-label={`Wallet networks for ${walletLabel}`}
                      className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md border border-border bg-background px-4 text-xs font-semibold text-foreground shadow-sm transition-colors hover:bg-accent/60 dark:hover:bg-white/[0.08]"
                    >
                      <FaWallet className="size-4 text-primary" />
                      <span
                        className={compact ? "hidden sm:inline" : undefined}
                      >
                        {chain.unsupported ? "Wrong network" : walletLabel}
                      </span>
                      <LuChevronDown className="size-3 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56"
                    onPointerEnter={cancelClose}
                    onPointerLeave={scheduleClose}
                  >
                    <DropdownMenuLabel>Deployed chains</DropdownMenuLabel>
                    {deployedChains.map((network) => (
                      <DropdownMenuItem
                        key={network.id}
                        disabled={isPending}
                        onSelect={(event) => {
                          event.preventDefault()
                          cancelClose()
                          if (chain.id === network.id) return
                          reset()
                          switchChain(
                            { chainId: network.id },
                            { onSuccess: () => setMenuOpen(false) }
                          )
                        }}
                        className="cursor-pointer gap-2 py-2"
                      >
                        {CHAIN_ICONS[network.id] ? (
                          <Image
                            src={CHAIN_ICONS[network.id]}
                            alt=""
                            width={20}
                            height={20}
                            className="size-5 shrink-0 rounded-full"
                          />
                        ) : (
                          <LuLink
                            aria-hidden="true"
                            className="size-5 shrink-0 text-muted-foreground"
                          />
                        )}
                        <span>{network.name}</span>
                        {isPending && variables?.chainId === network.id ? (
                          <span className="ml-auto text-xs text-muted-foreground">
                            Switching…
                          </span>
                        ) : chain.id === network.id ? (
                          <span className="ml-auto flex size-4 shrink-0 items-center justify-center">
                            <span
                              aria-hidden="true"
                              className="size-2 rounded-full bg-emerald-500 motion-safe:animate-pulse motion-safe:[animation-duration:3s]"
                            />
                            <span className="sr-only">Connected chain</span>
                          </span>
                        ) : null}
                      </DropdownMenuItem>
                    ))}
                    {error && (
                      <p
                        role="alert"
                        className="px-2 py-1.5 text-xs text-destructive"
                      >
                        Network switch failed. Try again in your wallet.
                      </p>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={openAccountModal}>
                      Wallet details
                    </DropdownMenuItem>
                    {chain.unsupported && (
                      <DropdownMenuItem onSelect={openChainModal}>
                        Other networks
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}
