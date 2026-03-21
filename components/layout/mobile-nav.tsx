"use client"

import { useState } from "react"
import Link from "next/link"
import { LuMenu } from "react-icons/lu"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { LightDarkImage } from "@/components/shared/light-dark-image"
import { ModeToggle } from "../shared/mode-toggle"
import { WalletConnect } from "../blockchain/wallet-connect"
import { IdentityHubDrawer } from "../identity-hub/identity-hub-drawer"

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <div className="flex w-full items-center justify-between md:hidden">
        <Link href="/" className="flex items-center space-x-2">
          <LightDarkImage
            LightImage="/gyralis-logo.svg"
            DarkImage="/gyralis-logo.svg"
            alt="Gyralis"
            className="rounded-full"
            height={32}
            width={32}
          />
        </Link>
        <div className="flex items-center gap-x-4">
          <IdentityHubDrawer compact />
          <WalletConnect className="shrink-0" />
          <SheetTrigger asChild>
            <Button className="px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden">
              <LuMenu className="size-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
        </div>
      </div>
      <SheetContent className="pr-0">
        <div className="flex items-center gap-x-4">
          <MobileLink href="/" onOpenChange={setOpen}>
            <LightDarkImage
              LightImage="/gyralis-logo.svg"
              DarkImage="/gyralis-logo.svg"
              alt="Gyralis"
              height={32}
              width={32}
            />
          </MobileLink>
        </div>

        <ScrollArea className="my-4 mr-4 h-[calc(100vh-8rem)] pb-10">
          <div className="flex flex-col space-y-2">
            <MobileLink href="/loops" onOpenChange={setOpen}>
              Loops
            </MobileLink>
            <MobileLink href="/elegibilities" onOpenChange={setOpen}>
              Elegibilities
            </MobileLink>

            <Separator className="my-0.5" />

            <div className="flex items-center justify-between px-2">
              <span className="text-sm font-medium text-muted-foreground">
                Theme:
              </span>
              <ModeToggle />
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

const linkClassName =
  "block select-none rounded-md px-2 py-2 text-sm leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"

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
