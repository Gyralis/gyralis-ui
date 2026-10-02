"use client"

import { forwardRef, type AnchorHTMLAttributes } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

interface LinkComponentProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  isExternal?: boolean
  target?: string
}

export const LinkComponent = forwardRef<HTMLAnchorElement, LinkComponentProps>(
  function LinkComponent(
    { href, children, isExternal, className, target = "_blank", ...props },
    ref
  ) {
    const pathname = usePathname()
    const classes = cn(className, {
      active: pathname === href,
    })
    const isExternalEnabled =
      href.match(/^([a-z0-9]*:|.{0})\/\/.*$/) || isExternal

    if (isExternalEnabled) {
      return (
        <a
          ref={ref}
          className={classes}
          href={href}
          rel="noopener noreferrer"
          target={target}
          {...props}
        >
          {children}
        </a>
      )
    }

    return (
      <Link ref={ref} className={classes} href={href} {...props}>
        {children}
      </Link>
    )
  }
)
