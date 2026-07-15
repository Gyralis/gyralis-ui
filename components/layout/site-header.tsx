"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import useScroll from "@/lib/hooks/use-scroll"
import { cn } from "@/lib/utils"
import { IdentityHubDrawer } from "@/components/identity-hub/identity-hub-drawer"
import { MainNav, MainNavMenu } from "@/components/layout/main-nav"
//import { MobileNav } from "@/components/layout/mobile-nav"
import { ModeToggle } from "@/components/shared/mode-toggle"

import { WalletConnect } from "../blockchain/wallet-connect"
import { MobileNav } from "./mobile-nav"

export function SiteHeader() {
  const scrolled = useScroll(0)
  const pathname = usePathname()
  const isLandingPage = pathname === "/"

  return (
    <header
      className={cn(
        "z-50 w-full border-b backdrop-blur transition-all",
        scrolled && "bg-background/50 "
      )}
    >
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-4 py-3 sm:px-2 lg:p-4">
        <MainNav />
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center text-base font-medium md:flex">
          <MainNavMenu />
        </nav>
        <MobileNav />
        <div className="hidden items-center justify-end space-x-2 md:flex">
          {isLandingPage ? (
            <Link
              href="/loops"
              className="tamagotchi-button inline-flex items-center justify-center px-4 py-2 text-sm"
            >
              Launch App
            </Link>
          ) : (
            <>
              <IdentityHubDrawer />
              <WalletConnect />
              <ModeToggle />
            </>
          )}
        </div>
      </div>
    </header>
  )
}
