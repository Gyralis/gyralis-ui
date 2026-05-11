import { HTMLAttributes } from "react"
import Image from "next/image"
import Link from "next/link"
import { FaDiscord, FaGithub } from "react-icons/fa"
import { FaXTwitter } from "react-icons/fa6"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"

import { NavLogoMark } from "./main-nav"
import { LinkComponent } from "../shared/link-component"

export function Footer({ className, ...props }: HTMLAttributes<HTMLElement>) {
  const classes = cn(
    className,
    "border-t border-border/60 bg-background/80 pb-5 pt-3"
  )

  return (
    <footer className={classes} {...props}>
      <div className="mx-auto grid w-full max-w-6xl items-center gap-4 md:grid-cols-3">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 md:justify-start [&_svg]:size-7"
        >
          <NavLogoMark />
          <span className="text-xl font-bold text-foreground">
            {siteConfig.name}
          </span>
        </Link>

        <div className="flex items-center justify-center gap-2.5">
          <LinkComponent
            aria-label="Gyralis GitHub repositories"
            className="flex size-9 items-center justify-center rounded-full border border-border bg-background text-lg text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            href="https://github.com/orgs/Gyralis/repositories"
          >
            <FaGithub />
          </LinkComponent>
          <LinkComponent
            aria-label="Gyralis on X"
            className="flex size-9 items-center justify-center rounded-full border border-border bg-background text-lg text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            href="https://x.com/gyralis_xyz"
          >
            <FaXTwitter />
          </LinkComponent>
          <LinkComponent
            aria-label="Gyralis Discord"
            className="flex size-9 items-center justify-center rounded-full border border-border bg-background text-lg text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            href="https://discord.gg/VgGQHDpn"
          >
            <FaDiscord />
          </LinkComponent>
        </div>

        <div className="flex justify-center md:justify-end">
          <LinkComponent
            href="https://1hive.org/"
            className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Image
              src="/1Hive-logo.png"
              alt="1Hive logo"
              width={20}
              height={20}
              className="size-5 object-contain"
            />
            Powered by 1Hive
          </LinkComponent>
        </div>
      </div>
    </footer>
  )
}
