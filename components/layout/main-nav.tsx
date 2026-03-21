"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { siteConfig } from "@/config/site"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Separator } from "@/components/ui/separator"
import { LightDarkImage } from "@/components/shared/light-dark-image"

import GyralisLogo from "../../assets/GyralisLogo.svg"
import { LinkComponent } from "../shared/link-component"

export function MainNav() {
  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <LightDarkImage
          LightImage={"/gyralis-logo.svg"}
          DarkImage={"/gyralis-logo.svg"}
          alt="Gyralis"
          className="rounded-full"
          height={32}
          width={32}
        />

        <span className="hidden bg-gradient-to-br from-black to-stone-500 bg-clip-text text-2xl font-bold text-transparent dark:from-stone-100 dark:to-yellow-200 sm:inline-block">
          {siteConfig.name}
        </span>
      </Link>
      <nav className="flex items-center space-x-6 text-base font-medium">
        <MainNavMenu />
      </nav>
    </div>
  )
}

function MainNavMenu() {
  const pathname = usePathname()

  const links = [
    { href: "/loops", label: "Loops", disabled: false },
    { href: "/elegibilities", label: "Elegibilities", disabled: false },
    { href: "/leaderboard", label: "Leaderboard", disabled: true },
  ]

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {/* Simple links */}
        {links.map(({ href, label, disabled }) => {
          const isActive = pathname === href
          return (
            <NavigationMenuItem key={href}>
              {disabled ? (
                <NavigationMenuLink
                  className={`${navigationMenuTriggerStyle()} cursor-not-allowed pointer-events-none text-muted-foreground opacity-60`}
                  aria-disabled="true"
                >
                  <span>{label}</span>
                  <span className="ml-2 inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Soon
                  </span>
                </NavigationMenuLink>
              ) : (
                <LinkComponent href={href}>
                  <NavigationMenuLink
                    className={`${navigationMenuTriggerStyle()} ${
                      isActive
                        ? "underline decoration-primary underline-offset-4"
                        : "text-foreground"
                    }`}
                  >
                    {label}
                  </NavigationMenuLink>
                </LinkComponent>
              )}
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

interface NavMenuListItemProps {
  name: string
  description: string
  href: string
  lightImage: string
  darkImage: string
}

const NavMenuListItem = ({
  name,
  description,
  href,
  lightImage,
  darkImage,
}: NavMenuListItemProps) => {
  return (
    <li className="w-full min-w-full" key={name}>
      <NavigationMenuLink asChild>
        <a
          href={href}
          className="flex select-none flex-col gap-y-2 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
        >
          <div className="flex items-center gap-x-2">
            <LightDarkImage
              LightImage={lightImage}
              DarkImage={darkImage}
              alt="icon"
              height={24}
              width={24}
              className="size-6"
            />
            <span className="text-base font-medium leading-none">{name}</span>
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {description}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
}
