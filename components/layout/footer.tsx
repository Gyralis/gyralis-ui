import { HTMLAttributes } from "react"
import Link from "next/link"
import { FaDiscord, FaGithub } from "react-icons/fa"
import { FaXTwitter } from "react-icons/fa6"

import { cn } from "@/lib/utils"

import { NavLogoMark } from "./main-nav"

const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "Loops", href: "/loops" },
      { label: "Stats", href: "/dashboard" },
      { label: "Eligibilities", href: "/eligibilities" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Discord", href: "https://discord.gg/VgGQHDpn" },
      { label: "Twitter", href: "https://x.com/gyralis_xyz" },
    ],
  },
  {
    title: "Builders",
    links: [
      {
        label: "GitHub",
        href: "https://github.com/orgs/Gyralis/repositories",
      },
    ],
  },
] as const

export function Footer({ className, ...props }: HTMLAttributes<HTMLElement>) {
  const classes = cn(className, "relative border-t border-border")

  return (
    <footer className={classes} {...props}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 py-16 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="mb-5 flex items-center gap-3">
              <NavLogoMark />
              <span className="font-heading text-xl font-bold tracking-tight">
                Gyralis
              </span>
            </Link>
            <p className="max-w-xs text-[0.92rem] leading-7 text-muted-foreground">
              Infrastructure protocol for recurring on-chain participation.
            </p>
            <div className="mt-5 flex gap-3">
              <a
                href="https://x.com/gyralis_xyz"
                target="_blank"
                rel="noreferrer"
                aria-label="Gyralis on X"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                <FaXTwitter className="size-5" />
              </a>
              <a
                href="https://github.com/orgs/Gyralis/repositories"
                target="_blank"
                rel="noreferrer"
                aria-label="Gyralis GitHub"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                <FaGithub className="size-5" />
              </a>
              <a
                href="https://discord.gg/VgGQHDpn"
                target="_blank"
                rel="noreferrer"
                aria-label="Gyralis Discord"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                <FaDiscord className="size-5" />
              </a>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">
              © 2026 Gyralis. All rights reserved.
            </p>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-4 text-sm font-semibold">{column.title}</h3>
              <ul className="space-y-3">
                {column.links.map((link) => {
                  const external = link.href.startsWith("http")
                  return (
                    <li key={`${column.title}-${link.label}`}>
                      <a
                        href={link.href}
                        {...(external
                          ? { target: "_blank", rel: "noreferrer" }
                          : {})}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}
