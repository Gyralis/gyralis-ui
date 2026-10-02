"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { IdentityHubDrawer } from "@/components/identity-hub/identity-hub-drawer"
import { MainNav, MainNavMenu } from "@/components/layout/main-nav"
//import { MobileNav } from "@/components/layout/mobile-nav"
import { ModeToggle } from "@/components/shared/mode-toggle"
import { ProfileUserPill } from "@/components/profile/profile-user-pill"

import { WalletConnect } from "../blockchain/wallet-connect"
import { MobileNav } from "./mobile-nav"

export function SiteHeader() {
  const pathname = usePathname()
  const isLandingPage = pathname === "/"
  const [isVisible, setIsVisible] = useState(true)
  const [hasEntered, setHasEntered] = useState(false)
  const [hasGlassBackground, setHasGlassBackground] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    setHasEntered(!isLandingPage)
    setHasGlassBackground(window.scrollY > 12)

    const enterFrame = isLandingPage
      ? window.requestAnimationFrame(() => {
          setHasEntered(true)
        })
      : null

    let lastY = window.scrollY

    const onScrollDirection = () => {
      const currentY = Math.max(window.scrollY, 0)

      if (currentY <= 12) {
        setIsVisible(true)
        setHasGlassBackground(false)
      } else if (currentY < lastY) {
        setIsVisible(true)
        setHasGlassBackground(true)
      } else if (currentY > lastY && currentY > 24) {
        setIsVisible(false)
      }

      lastY = currentY
    }

    window.addEventListener("scroll", onScrollDirection, { passive: true })

    return () => {
      if (enterFrame !== null) {
        window.cancelAnimationFrame(enterFrame)
      }
      window.removeEventListener("scroll", onScrollDirection)
    }
  }, [isLandingPage])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/60 transition-[transform,opacity,background-color,box-shadow,backdrop-filter] duration-300 motion-reduce:transition-none",
        hasEntered
          ? isVisible
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0"
          : "-translate-y-4 opacity-0",
        hasGlassBackground &&
          "bg-background/75 shadow-[0_12px_32px_-24px_rgba(0,0,0,0.45)] backdrop-blur-xl"
      )}
    >
      <div className="mx-auto flex h-20 w-full max-w-[1600px] items-center gap-2 px-4 sm:px-2 md:h-auto md:grid md:grid-cols-[minmax(0,1fr)_auto] md:py-3 lg:p-4 xl:h-20 xl:grid-cols-[auto_auto_minmax(0,1fr)] xl:gap-x-12 xl:py-0">
        <div className="col-start-1 row-start-1 hidden items-center justify-self-start md:flex">
          <MainNav />
        </div>
        <nav className="col-span-2 col-start-1 row-start-2 hidden items-center justify-center justify-self-center text-base font-medium md:flex xl:col-span-1 xl:col-start-2 xl:row-start-1 xl:justify-self-start">
          <MainNavMenu />
        </nav>
        <MobileNav />
        <div className="col-start-2 row-start-1 hidden items-center justify-end justify-self-end gap-2 md:flex xl:col-start-3">
          {isLandingPage ? (
            <Link
              href="/loops"
              className="tamagotchi-button inline-flex items-center justify-center px-4 py-2 text-sm"
            >
              Launch App
            </Link>
          ) : (
            <>
              <div className="hidden items-center 2xl:flex"><ProfileUserPill /></div>
              <div className="flex items-center 2xl:hidden"><ProfileUserPill compact /></div>
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
