"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import useScroll from "@/lib/hooks/use-scroll"
import { cn } from "@/lib/utils"
import { IdentityHubDrawer } from "@/components/identity-hub/identity-hub-drawer"
import { MainNav, MainNavMenu } from "@/components/layout/main-nav"
//import { MobileNav } from "@/components/layout/mobile-nav"
import { ModeToggle } from "@/components/shared/mode-toggle"
import { ProfileUserPill } from "@/components/profile/profile-user-pill"

import { WalletConnect } from "../blockchain/wallet-connect"
import { MobileNav } from "./mobile-nav"

export function SiteHeader() {
  const scrolled = useScroll(0)
  const pathname = usePathname()
  const isLandingPage = pathname === "/"
  const [isVisible, setIsVisible] = useState(true)
  const [hasEntered, setHasEntered] = useState(false)

  useEffect(() => {
    if (!isLandingPage) {
      setIsVisible(true)
      setHasEntered(true)
      return
    }

    setIsVisible(true)
    setHasEntered(false)

    const enterFrame = window.requestAnimationFrame(() => {
      setHasEntered(true)
    })

    let lastY = window.scrollY

    const onScrollDirection = () => {
      const currentY = window.scrollY

      if (currentY <= 12) {
        setIsVisible(true)
      } else if (currentY < lastY) {
        setIsVisible(true)
      } else if (currentY > lastY && currentY > 80) {
        setIsVisible(false)
      }

      lastY = currentY
    }

    window.addEventListener("scroll", onScrollDirection, { passive: true })

    return () => {
      window.cancelAnimationFrame(enterFrame)
      window.removeEventListener("scroll", onScrollDirection)
    }
  }, [isLandingPage])

  return (
    <header
      className={cn(
        "z-50 w-full border-b backdrop-blur transition-all duration-300",
        isLandingPage
          ? "sticky top-0"
          : "",
        isLandingPage
          ? hasEntered
            ? isVisible
              ? "translate-y-0 opacity-100"
              : "-translate-y-full opacity-0"
            : "-translate-y-4 opacity-0"
          : "",
        scrolled && "bg-background/50 "
      )}
    >
      <div className="mx-auto flex w-full max-w-[1600px] items-center gap-2 px-4 py-3 sm:px-2 md:grid md:grid-cols-[minmax(0,1fr)_auto] lg:p-4 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <div className="col-start-1 row-start-1 hidden items-center justify-self-start md:flex">
          <MainNav />
        </div>
        <nav className="col-span-2 col-start-1 row-start-2 hidden items-center justify-center justify-self-center text-base font-medium md:flex xl:col-span-1 xl:col-start-2 xl:row-start-1">
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
