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

  return (
    <div className="relative z-10 mb-8 rounded-3xl border bg-background p-4 shadow-md backdrop-blur-sm">
      <div className="flex items-center gap-3">
        {!showSearch ? (
          <>
            <button
              onClick={scrollLeft}
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accemt shadow-sm lg:hidden"
              aria-label="Scroll left"
            >
              <HiChevronLeft className="size-5 text-muted-foreground" />
            </button>

            <div
              ref={scrollContainerRef}
              className="scrollbar-hide flex-1 overflow-x-auto scroll-smooth"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <div className="flex min-w-max gap-2">
                <button
                  key="all"
                  onClick={() => onTagChange?.(null)}
                  className={cn(
                    "font-body whitespace-nowrap rounded-full px-6 py-2.5 text-sm shadow-sm transition-colors duration-200 inline-flex shrink-0 items-center justify-center gap-2 border border-border hover:opacity-80",
                    activeTag === null
                      ? "bg-accent text-foreground font-medium dark:bg-secondary dark:text-secondary-foreground"
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
                      "font-body whitespace-nowrap rounded-full px-6 py-2.5 text-sm font shadow-sm duration-200 inline-flex shrink-0 items-center justify-center gap-2  border border-border   transition-colors  hover:opacity-80",
                      activeTag === tag
                        ? "bg-accent text-foreground font-medium dark:bg-secondary dark:text-secondary-foreground"
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
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accemt shadow-sm lg:hidden"
              aria-label="Scroll right"
            >
              <HiChevronRight className="size-5 text-muted-foreground" />
            </button>

            <button
              onClick={() => setShowSearch(true)}
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accemt shadow-sm"
              aria-label="Search"
            >
              <HiSearch className="size-5 text-muted-foreground" />
            </button>

            {/* Filters button */}
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown((prev) => !prev)}
                className={cn(
                  "flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-card-foreground shadow-sm transition-colors",
                  hasActiveFilters
                    ? "border-primary/30 bg-accent text-foreground hover:bg-accent/90"
                    : "border-border/70 bg-background/80 hover:bg-accent/60"
                )}
              >
                <span className="font-body text-sm font-medium uppercase tracking-wide">
                  Filters
                </span>
                <HiSlidersHorizontal
                  className={cn(
                    "size-4",
                    hasActiveFilters
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                />
              </button>

              {showFilterDropdown && (
                <div className="absolute right-0 top-full z-40 mt-3 w-80 overflow-hidden rounded-3xl border border-border/70 bg-background p-4 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.45)]">
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
                className="font-body w-full rounded-full border-2 border-[#1CE783] bg-accemt py-2.5 pl-12 pr-4 text-sm shadow-sm focus:border-[#1CE783] focus:outline-none"
              />
            </div>
            <button
              onClick={() => {
                setShowSearch(false)
                onChange("")
              }}
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accemt shadow-sm"
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
