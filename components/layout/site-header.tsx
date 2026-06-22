"use client"

import useScroll from "@/lib/hooks/use-scroll"
import { cn } from "@/lib/utils"
import { IdentityHubDrawer } from "@/components/identity-hub/identity-hub-drawer"
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
      <div className="mx-auto flex h-20 w-full max-w-[1600px] items-center justify-between px-4 sm:px-5 lg:px-6">
        <MainNav />
        <MobileNav />
        <div className="hidden items-center justify-end space-x-2 md:flex">
          <WalletConnect />
          <IdentityHubDrawer />
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
