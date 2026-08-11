"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

type ParticipationSection = "loops" | "leaderboard" | "profile"

const links: Array<{
  href: string
  label: string
  section: ParticipationSection
}> = [
  { href: "/loops", label: "Loops", section: "loops" },
  { href: "/leaderboard", label: "Leaderboard", section: "leaderboard" },
  { href: "/profile", label: "Profile", section: "profile" },
]

export function ParticipationSectionNav({
  className,
}: {
  className?: string
}) {
  const pathname = usePathname()

  function isSectionActive(section: ParticipationSection) {
    if (section === "loops") return pathname.startsWith("/loops")
    if (section === "leaderboard") return pathname.startsWith("/leaderboard")
    return pathname.startsWith("/profile")
  }

  return (
    <div className={cn("flex justify-center px-4", className)}>
      <nav
        aria-label="Loops participation"
        className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1.5 text-card-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_16px_42px_-28px_rgba(15,23,42,0.24)] backdrop-blur-2xl"
      >
        {links.map((link, index) => {
          const isActive = isSectionActive(link.section)

          return (
            <div key={link.section} className="contents">
              {index > 0 ? (
                <div className="h-5 w-px bg-border" aria-hidden="true" />
              ) : null}
              <Link
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex items-center rounded-full px-3 py-2.5 text-[11px] font-semibold uppercase tracking-widest transition-colors sm:px-5 sm:text-xs sm:tracking-[0.12em]",
                  isActive
                    ? "bg-primary/[0.14] text-primary shadow-[0_0_0_1px_rgba(28,231,131,0.32),0_0_24px_-6px_rgba(28,231,131,0.95),0_0_38px_-16px_rgba(28,231,131,0.85)] ring-1 ring-primary/30"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-primary"
                )}
              >
                {link.label}
              </Link>
            </div>
          )
        })}
      </nav>
    </div>
  )
}
