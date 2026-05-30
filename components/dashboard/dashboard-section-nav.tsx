"use client"

import { useEffect, useMemo, useState } from "react"

import { cn } from "@/lib/utils"

type DashboardSectionNavItem = {
  id: string
  label: string
}

type DashboardSectionNavProps = {
  items: DashboardSectionNavItem[]
  className?: string
}

export function DashboardSectionNav({
  items,
  className,
}: DashboardSectionNavProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "")

  const itemIds = useMemo(() => items.map((item) => item.id), [items])

  useEffect(() => {
    if (itemIds.length === 0) return

    const sections = itemIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section != null)

    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (visibleEntries[0]?.target?.id) {
          setActiveId(visibleEntries[0].target.id)
        }
      },
      {
        rootMargin: "-18% 0px -62% 0px",
        threshold: [0.1, 0.25, 0.5, 0.75],
      }
    )

    sections.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [itemIds])

  function handleSectionClick(sectionId: string) {
    const section = document.getElementById(sectionId)
    if (!section) return

    setActiveId(sectionId)
    section.scrollIntoView({ behavior: "smooth", block: "start" })
    window.history.replaceState(null, "", `#${sectionId}`)
  }

  return (
    <nav
      aria-label="Dashboard sections"
      className={cn(
        "rounded-2xl border bg-card/85 p-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/75",
        className
      )}
    >
      <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Dashboard
      </p>
      <div className="flex gap-2 overflow-x-auto lg:flex-col">
        {items.map((item, index) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            aria-current={activeId === item.id ? "true" : undefined}
            onClick={(event) => {
              event.preventDefault()
              handleSectionClick(item.id)
            }}
            className={cn(
              "group inline-flex min-w-max items-center gap-3 rounded-xl border px-3 py-2 text-sm transition-colors lg:w-full",
              activeId === item.id
                ? "border-primary/25 bg-primary/10 text-foreground"
                : "border-transparent text-muted-foreground hover:border-border hover:bg-muted/60 hover:text-foreground"
            )}
          >
            <span
              className={cn(
                "flex size-6 items-center justify-center rounded-full text-[11px] font-semibold",
                activeId === item.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground group-hover:text-foreground"
              )}
            >
              {index + 1}
            </span>
            <span className="font-medium">{item.label}</span>
          </a>
        ))}
      </div>
    </nav>
  )
}
