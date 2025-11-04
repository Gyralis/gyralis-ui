"use client"

import Link from "next/link"
import { ConnectButton } from "@rainbow-me/rainbowkit"

import useScroll from "@/lib/hooks/use-scroll"
import { cn } from "@/lib/utils"
import { MainNav } from "@/components/layout/main-nav"
//import { MobileNav } from "@/components/layout/mobile-nav"
import { ModeToggle } from "@/components/shared/mode-toggle"

import { WalletConnect } from "../blockchain/wallet-connect"
import { MobileNav } from "./mobile-nav"

export function SiteHeader() {
  const scrolled = useScroll(0)

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b backdrop-blur transition-all",
        scrolled && "bg-background/50 "
      )}
    >
      <div className="border2 container flex h-20 items-center justify-between">
        <MainNav />
        <MobileNav />
        <div className="border2 hidden flex-1 items-center justify-between space-x-2 md:flex md:justify-end">
          <WalletConnect />
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
