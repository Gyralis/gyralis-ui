"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LuMenu } from "react-icons/lu"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ProfileUserPill } from "@/components/profile/profile-user-pill"

import { WalletConnect } from "../blockchain/wallet-connect"
import { IdentityHubDrawer } from "../identity-hub/identity-hub-drawer"
import { ModeToggle } from "../shared/mode-toggle"
import { NavLogoMark } from "./main-nav"

const navLinks = [
  { href: "/eligibilities", label: "Eligibilities", external: false },
  { href: "/dashboard", label: "Stats", external: false },
  { href: "/#faq", label: "FAQ", external: false },
  // {
  //   href: "https://github.com/orgs/Gyralis/repositories",
  //   label: "Docs",
  //   external: true,
  // },
] as const

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const isLandingPage = pathname === "/"

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <div className="flex min-w-0 w-full items-center justify-between gap-2 md:hidden">
        <Link href="/" className="flex shrink-0 items-center space-x-2">
          <NavLogoMark />
          <span className="sr-only">Gyralis</span>
        </Link>
        <div className="flex min-w-0 items-center justify-end gap-1.5">
          {!isLandingPage ? <ProfileUserPill compact /> : null}
          {!isLandingPage ? <IdentityHubDrawer compact /> : null}
          {!isLandingPage ? <WalletConnect compact className="shrink-0" /> : null}
          <SheetTrigger asChild>
            <Button
              requireWallet={false}
              className="size-10 shrink-0 !p-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <LuMenu className="size-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
        </div>
      </div>
      <SheetContent className="pr-0">
        <SheetTitle className="sr-only">Navigation menu</SheetTitle>
        <SheetDescription className="sr-only">
          Navigate Gyralis and access appearance settings.
        </SheetDescription>
        <div className="flex items-center gap-x-4">
          <MobileLink href="/" onOpenChange={setOpen}>
            <NavLogoMark />
            <span className="sr-only">Gyralis</span>
          </MobileLink>
        </div>

        <ScrollArea className="my-4 mr-4 h-[calc(100vh-8rem)] pb-10">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <MobileLink
                key={link.href}
                href={link.href}
                onOpenChange={setOpen}
              >
                {link.label}
              </MobileLink>
            ))}

            <Separator className="my-0.5" />

            {isLandingPage ? (
              <MobileLink href="/loops" onOpenChange={setOpen}>
                Launch App
              </MobileLink>
            ) : (
              <div className="flex items-center justify-between px-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Theme:
                </span>
                <ModeToggle />
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

const linkClassName =
  "flex select-none items-center rounded-md px-2 py-2 text-sm leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"

function MobileLink({
  href,
  onOpenChange,
  children,
}: {
  href: string
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      onClick={() => onOpenChange?.(false)}
      className={linkClassName}
    >
      {children}
    </Link>
  )
}
