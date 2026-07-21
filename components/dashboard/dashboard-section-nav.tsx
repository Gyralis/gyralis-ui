"use client"

import { useEffect, useMemo, useState } from "react"
import { LuLayoutDashboard } from "react-icons/lu"
import { FaChartLine, FaRegCircle, FaTable } from "react-icons/fa"
import { SiLoop } from "react-icons/si"

import { NavLogoMark } from "@/components/layout/main-nav"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type DashboardSectionNavItem = {
  id: string
  label: string
}

type DashboardSectionNavProps = {
  items: DashboardSectionNavItem[]
  className?: string
  brand?: {
    logoSrc: string
    title: string
    version: string
  }
  footerNote?: string
  footerTimestamp?: string | null
}

const sectionIconMap = {
  overview: LuLayoutDashboard,
  loops: SiLoop,
  trends: FaChartLine,
  details: FaTable,
} as const

export function DashboardSectionNav({
  items,
  className,
  brand,
  footerNote,
  footerTimestamp,
}: DashboardSectionNavProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "")

  const itemIds = useMemo(() => items.map((item) => item.id), [items])

  useEffect(() => {
    if (itemIds.length === 0) return

    function updateActiveSection() {
      const sections = itemIds
        .map((id) => document.getElementById(id))
        .filter((section): section is HTMLElement => section != null)

      if (sections.length === 0) return

      const activationLine = window.innerHeight * 0.32
      const sectionsAboveLine = sections.filter(
        (section) => section.getBoundingClientRect().top <= activationLine
      )
      const activeSection =
        sectionsAboveLine[sectionsAboveLine.length - 1] ?? sections[0]

      if (activeSection.id) {
        setActiveId(activeSection.id)
      }
    }

    updateActiveSection()
    window.addEventListener("scroll", updateActiveSection, { passive: true })
    window.addEventListener("resize", updateActiveSection)

    return () => {
      window.removeEventListener("scroll", updateActiveSection)
      window.removeEventListener("resize", updateActiveSection)
    }
  }, [itemIds])

  function handleSectionClick(sectionId: string) {
    const section = document.getElementById(sectionId)
    if (!section) return

    setActiveId(sectionId)
    section.scrollIntoView({ behavior: "smooth", block: "start" })
    window.history.replaceState(null, "", `#${sectionId}`)
  }

  return (
    <>
      <nav
        aria-label="Stats sections"
        className={cn(
          "rounded-2xl border border-border/70 bg-card/80 p-3 shadow-[0_24px_70px_-40px_hsl(var(--foreground)/0.22)] backdrop-blur supports-[backdrop-filter]:bg-card/80 lg:hidden",
          className
        )}
      >
        <div className="px-1 pb-3">
          <span className="text-sm font-semibold tracking-tight text-primary">
            Gyralis
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {items.map((item) => {
            const Icon =
              sectionIconMap[item.id as keyof typeof sectionIconMap] ??
              FaRegCircle

            return (
              <Button
                key={item.id}
                requireWallet={false}
                onClick={() => {
                  handleSectionClick(item.id)
                }}
                icon={<Icon className="size-4" aria-hidden="true" />}
                className={cn(
                  "group min-w-max rounded-xl border-0  text-sm shadow-none",
                  activeId === item.id
                    ? "bg-transparent text-primary"
                    : "bg-transparent text-muted-foreground/65 hover:text-foreground"
                )}
              >
                <span className="font-medium">{item.label}</span>
              </Button>
            )
          })}
        </div>
      </nav>

      <nav
        aria-label="Stats sections"
        className={cn(
          "group hidden h-[calc(100vh-7rem)] w-[5.5rem] flex-col rounded-[2rem] border border-border/70 bg-card/80 px-3 py-5 text-card-foreground shadow-[24px_0_90px_-52px_hsl(var(--foreground)/0.28)] backdrop-blur-xl transition-[width,transform] duration-500 hover:w-64 lg:flex",
          className
        )}
      >
        <div className="flex flex-col items-center gap-3 border-b border-border/60 pb-5">
          <div className="flex size-12 items-center justify-center rounded-2xl border border-border/70 bg-muted/55 shadow-[0_0_0_1px_hsl(var(--background)/0.2)]">
            <NavLogoMark />
          </div>
          <div className="w-full overflow-hidden text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <p className="text-sm font-semibold tracking-tight text-primary">
              {brand?.title ?? "Gyralis"}
            </p>
            <p className="whitespace-nowrap text-xs text-muted-foreground">
              {brand?.version ?? "v2.1.0"}
            </p>
          </div>
        </div>

        <div className="mt-6 flex-1 space-y-4">
          {items.map((item) => {
            const Icon =
              sectionIconMap[item.id as keyof typeof sectionIconMap] ??
              FaRegCircle

            return (
              <button
                key={item.id}
                onClick={() => {
                  handleSectionClick(item.id)
                }}
                className={cn(
                  "flex h-auto w-full items-center justify-center gap-0 rounded-2xl border-0 p-3 text-sm transition-all duration-300 group-hover:justify-start group-hover:gap-3",
                  activeId === item.id
                    ? "bg-transparent text-primary shadow-none"
                    : "bg-transparent text-muted-foreground"
                )}
              >
                <div
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-2xl bg-muted/55 transition-colors",
                    activeId === item.id ? "text-primary" : "text-foreground/70"
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1 overflow-hidden text-left opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <p className="whitespace-nowrap font-medium">{item.label}</p>
                </div>
              </button>
            )
          })}
        </div>

        <div className="border-t border-border/60 pt-4 text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <p className="text-xs leading-5 text-muted-foreground">
            {footerNote ?? "Built from cached JSON data."} Last updated:{" "}
            <span className="text-foreground/80">
              {footerTimestamp ?? "Unknown"}
            </span>
          </p>
        </div>
      </nav>
    </>
  )
}
