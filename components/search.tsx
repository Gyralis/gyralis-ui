import { useRef, useState } from "react"
import {
  HiCheck,
  HiChevronLeft,
  HiChevronRight,
  HiSearch,
  HiOutlineAdjustments as HiSlidersHorizontal,
  HiX,
} from "react-icons/hi"

import { cn } from "@/lib/utils"

interface SearchWithTagsProps {
  value: string
  onChange: (v: string) => void
  tags: string[]
  activeTag?: string | null
  onTagChange?: (tag: string | null) => void
  showFilters?: boolean
  onToggleFilters?: () => void
  placeholder?: string
  selectedChain?: string | null
  onChainChange?: (chain: string | null) => void
  selectedType?: string | null
  onTypeChange?: (type: string | null) => void
  className?: string
  variant?: "default" | "hero"
}

export function SearchWithTags({
  value,
  onChange,
  tags,
  activeTag,
  onTagChange,
  showFilters = false,
  onToggleFilters,
  placeholder = "Search loops...",
  selectedChain,
  onChainChange,
  selectedType,
  onTypeChange,
  className,
  variant = "default",
}: SearchWithTagsProps) {
  const [showSearch, setShowSearch] = useState(false)
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const chains = [
    { name: "Gnosis", soon: false },
    { name: "Base", soon: true },
    { name: "Optimism", soon: true },
  ]
  const types = [
    { name: "Loops", soon: false },
    { name: "Superloops", soon: true },
  ]

  const scrollLeft = () =>
    scrollContainerRef.current?.scrollBy({ left: -200, behavior: "smooth" })
  const scrollRight = () =>
    scrollContainerRef.current?.scrollBy({ left: 200, behavior: "smooth" })
  const hasActiveFilters =
    Boolean(activeTag) || Boolean(selectedChain) || Boolean(selectedType)
  const isHero = variant === "hero"

  const heroShellClass =
    "rounded-[2rem]  bg-[linear-gradient(180deg,rgba(248,248,252,0.96)_0%,rgba(234,235,245,0.98)_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_24px_70px_-28px_rgba(15,23,42,0.24)] backdrop-blur-xl  dark:bg-[linear-gradient(180deg,rgba(26,29,42,0.96)_0%,rgba(14,16,27,0.98)_100%)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_24px_70px_-28px_rgba(0,0,0,0.74)]"
  const heroIconButtonClass =
    "bg-white/70 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_10px_24px_-18px_rgba(15,23,42,0.18)] hover:border-border hover:bg-white  dark:bg-white/5 dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_10px_24px_-18px_rgba(0,0,0,0.72)] dark:hover:border-white/16 dark:hover:bg-white/8"
  const heroPillClass =
    "bg-[linear-gradient(180deg,#f4f5fb_0%,#e8eaf6_100%)] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_10px_24px_-18px_rgba(15,23,42,0.18)] hover:border-[#cdd2e8] hover:bg-[linear-gradient(180deg,#f7f8fd_0%,#edf0fb_100%)] dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(64,55,108,0.92)_0%,rgba(43,37,77,0.98)_100%)] dark:text-white/90 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_10px_24px_-18px_rgba(0,0,0,0.72)] dark:hover:border-white/16 dark:hover:bg-[linear-gradient(180deg,rgba(74,63,124,0.96)_0%,rgba(53,45,93,0.99)_100%)] dark:hover:text-white"
  const heroPillActiveClass =
    "bg-secondary text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_12px_30px_-18px_rgba(140,75,255,0.22)] hover:border-secondary/55 hover:bg-secondary/92 dark:border-primary/35 dark:bg-[linear-gradient(135deg,#88e593_0%,#57c76f_100%)] dark:text-[#112212] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.24),0_12px_30px_-18px_rgba(28,231,131,0.38)] dark:hover:border-primary/45 dark:hover:bg-[linear-gradient(135deg,#92ea9c_0%,#60cc78_100%)] dark:hover:text-[#112212]"
  const baseTagButtonClass =
    "font-body inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200"

  void showFilters
  void onToggleFilters

  return (
    <div
      className={cn(
        "relative z-10",
        isHero
          ? heroShellClass
          : "mb-8 rounded-3xl border bg-background p-4 shadow-md backdrop-blur-sm",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {!showSearch ? (
          <>
            <button
              onClick={scrollLeft}
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-full shadow-sm lg:hidden",
                isHero ? heroIconButtonClass : "bg-accent"
              )}
              aria-label="Scroll left"
            >
              <HiChevronLeft
                className={cn(
                  "size-5",
                  isHero
                    ? "text-foreground/70 dark:text-white/72"
                    : "text-muted-foreground"
                )}
              />
            </button>

            <div
              ref={scrollContainerRef}
              className="scrollbar-hide flex-1 overflow-x-auto scroll-smooth"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <div className="flex min-w-max gap-2.5">
                <button
                  key="all"
                  onClick={() => onTagChange?.(null)}
                  className={cn(
                    baseTagButtonClass,
                    isHero
                      ? heroPillClass
                      : "border border-border hover:opacity-80",
                    activeTag === null
                      ? isHero
                        ? heroPillActiveClass
                        : "bg-accent font-medium text-foreground dark:bg-secondary dark:text-secondary-foreground"
                      : isHero
                      ? ""
                      : "text-muted-foreground"
                  )}
                >
                  All
                </button>
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() =>
                      onTagChange?.(activeTag === tag ? null : tag)
                    }
                    className={cn(
                      baseTagButtonClass,
                      isHero
                        ? heroPillClass
                        : "border border-border hover:opacity-80",
                      activeTag === tag
                        ? isHero
                          ? heroPillActiveClass
                          : "bg-accent font-medium text-foreground dark:bg-secondary dark:text-secondary-foreground"
                        : isHero
                        ? ""
                        : "text-muted-foreground"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={scrollRight}
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-full shadow-sm lg:hidden",
                isHero ? heroIconButtonClass : "bg-accemt"
              )}
              aria-label="Scroll right"
            >
              <HiChevronRight
                className={cn(
                  "size-5",
                  isHero
                    ? "text-foreground/70 dark:text-white/72"
                    : "text-muted-foreground"
                )}
              />
            </button>

            <button
              onClick={() => setShowSearch(true)}
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-2xl shadow-sm",
                isHero ? heroPillClass : "rounded-full bg-accemt"
              )}
              aria-label="Search"
            >
              <HiSearch
                className={cn(
                  "size-5",
                  isHero
                    ? "text-foreground dark:text-white"
                    : "text-muted-foreground"
                )}
              />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown((prev) => !prev)}
                className={cn(
                  "flex h-10 shrink-0 items-center gap-2 border px-4 shadow-sm transition-colors",
                  isHero
                    ? "rounded-2xl border-border/70 bg-card px-5  shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_10px_24px_-18px_rgba(15,23,42,0.24)] hover:opacity-80"
                    : "rounded-full text-card-foreground",
                  hasActiveFilters
                    ? isHero
                      ? "border-primary/40"
                      : "border-primary/30 bg-accent text-foreground hover:bg-accent/90"
                    : isHero
                    ? ""
                    : "border-border/70 bg-background/80 hover:bg-accent/60"
                )}
              >
                <span className="font-body text-sm font-semibold uppercase tracking-wide">
                  Filters
                </span>
                <HiSlidersHorizontal
                  className={cn(
                    "size-4",
                    isHero ? "text-[#151515]" : "text-muted-foreground",
                    hasActiveFilters && !isHero && "text-foreground"
                  )}
                />
              </button>

              {showFilterDropdown && (
                <div className="absolute right-0 top-full z-40 mt-3 w-80 overflow-hidden rounded-3xl  bg-background p-4 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.45)]">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                        Filters
                      </p>
                    </div>
                    <button
                      onClick={() => setShowFilterDropdown(false)}
                      className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border/70 bg-muted/60 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      aria-label="Close filters"
                    >
                      <HiX className="size-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <section>
                      <div className="mb-3 flex items-center justify-between pr-1">
                        <h3 className="text-sm font-semibold text-foreground">
                          Chain
                        </h3>
                      </div>
                      <div className="flex flex-col gap-2">
                        {chains.map((chain) => {
                          const isSelected = selectedChain === chain.name
                          return (
                            <button
                              key={chain.name}
                              disabled={chain.soon}
                              onClick={() => {
                                onChainChange?.(isSelected ? null : chain.name)
                                setShowFilterDropdown(false)
                              }}
                              className={cn(
                                "flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition-all",
                                isSelected
                                  ? "border-primary bg-accent text-primary-foreground shadow-sm"
                                  : "border-border/70 bg-muted/30 text-muted-foreground hover:border-border hover:bg-accent/40",
                                chain.soon &&
                                  "cursor-not-allowed opacity-70 hover:bg-muted/30"
                              )}
                            >
                              <span className="font-medium">{chain.name}</span>
                              {isSelected && !chain.soon && (
                                <HiCheck className="size-4 shrink-0 text-primary-foreground" />
                              )}
                              {chain.soon && (
                                <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                  Soon
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </section>

                    <div className="h-px bg-border/70" />

                    <section>
                      <div className="mb-3 flex items-center justify-between pr-1">
                        <h3 className="text-sm font-semibold text-foreground">
                          Type
                        </h3>
                      </div>
                      <div className="flex flex-col gap-2">
                        {types.map((type) => {
                          const isSelected = selectedType === type.name
                          return (
                            <button
                              key={type.name}
                              disabled={type.soon}
                              onClick={() => {
                                onTypeChange?.(isSelected ? null : type.name)
                                setShowFilterDropdown(false)
                              }}
                              className={cn(
                                "flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition-all",
                                isSelected
                                  ? "border-primary bg-accent text-primary-foreground shadow-sm"
                                  : "border-border/70 bg-muted/30 text-muted-foreground hover:border-border hover:bg-accent/40",
                                type.soon &&
                                  "cursor-not-allowed opacity-70 hover:bg-muted/30"
                              )}
                            >
                              <span className="font-medium">{type.name}</span>
                              {isSelected && !type.soon && (
                                <HiCheck className="size-4 shrink-0 text-primary-foreground" />
                              )}
                              {type.soon && (
                                <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                  Soon
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </section>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="relative flex-1">
              <HiSearch className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                autoFocus
                className={cn(
                  "font-body w-full py-2.5 pl-12 pr-4 text-sm shadow-sm focus:outline-none",
                  isHero
                    ? "rounded-2xl border border-[#d9dced] bg-[linear-gradient(180deg,#f4f5fb_0%,#e8eaf6_100%)] text-foreground placeholder:text-foreground/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_10px_24px_-18px_rgba(15,23,42,0.18)] focus:border-primary dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(64,55,108,0.92)_0%,rgba(43,37,77,0.98)_100%)] dark:text-white dark:placeholder:text-white/50 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_10px_24px_-18px_rgba(0,0,0,0.72)]"
                    : "rounded-full border-2 border-[#1CE783] bg-accemt focus:border-[#1CE783]"
                )}
              />
            </div>
            <button
              onClick={() => {
                setShowSearch(false)
                onChange("")
              }}
              className={cn(
                "flex size-10 shrink-0 items-center justify-center shadow-sm",
                isHero
                  ? "rounded-2xl border border-[#d9dced] bg-[linear-gradient(180deg,#f4f5fb_0%,#e8eaf6_100%)] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_10px_24px_-18px_rgba(15,23,42,0.18)] dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(64,55,108,0.92)_0%,rgba(43,37,77,0.98)_100%)] dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_10px_24px_-18px_rgba(0,0,0,0.72)]"
                  : "rounded-full bg-accemt"
              )}
              aria-label="Close search"
            >
              X
            </button>
          </>
        )}
      </div>
    </div>
  )
}
