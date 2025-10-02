import { useRef, useState } from "react"
import {
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

  const chains = ["Gnosis", "Celo", "Optimism"]
  const types = ["Superloops", "Loops"]

  const scrollLeft = () =>
    scrollContainerRef.current?.scrollBy({ left: -200, behavior: "smooth" })
  const scrollRight = () =>
    scrollContainerRef.current?.scrollBy({ left: 200, behavior: "smooth" })

  return (
    <div className="z-50 mb-8 rounded-3xl border border-white/20 bg-white/80 p-4 shadow-md backdrop-blur-sm">
      <div className="flex items-center gap-3">
        {!showSearch ? (
          <>
            <button
              onClick={scrollLeft}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-sm"
              aria-label="Scroll left"
            >
              <HiChevronLeft className="h-5 w-5 text-gray-600" />
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
                    "font-body whitespace-nowrap rounded-full px-6 py-2.5 text-sm font-medium shadow-sm transition-colors duration-200",
                    activeTag === null
                      ? "bg-[#1CE783] text-white"
                      : "bg-gray-100 text-gray-700"
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
                      "font-body whitespace-nowrap rounded-full px-6 py-2.5 text-sm font-medium shadow-sm transition-colors duration-200",
                      activeTag === tag
                        ? "bg-[#1CE783] text-white"
                        : "bg-gray-100 text-gray-700"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={scrollRight}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-sm"
              aria-label="Scroll right"
            >
              <HiChevronRight className="h-5 w-5 text-gray-600" />
            </button>

            <button
              onClick={() => setShowSearch(true)}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-sm"
              aria-label="Search"
            >
              <HiSearch className="h-5 w-5 text-gray-600" />
            </button>

            {/* Filters button */}
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown((prev) => !prev)}
                className="flex h-10 flex-shrink-0 items-center gap-2 rounded-full bg-white px-4 shadow-sm"
              >
                <span className="font-body text-sm font-medium uppercase tracking-wide text-gray-700">
                  Filters
                </span>
                <HiSlidersHorizontal className="h-4 w-4 text-gray-600" />
              </button>

              {showFilterDropdown && (
                <div className="absolute right-0 top-full z-[10] mt-2 w-48 rounded-xl bg-white p-4 shadow-lg">
                  <div className="mb-2 font-semibold">Chain</div>
                  <div className="mb-4 flex flex-col gap-2">
                    {chains.map((chain) => (
                      <button
                        key={chain}
                        onClick={() =>
                          onChainChange?.(
                            selectedChain === chain ? null : chain
                          )
                        }
                        className={cn(
                          "rounded-full px-4 py-2 text-left text-sm",
                          selectedChain === chain
                            ? "bg-[#1CE783] text-white"
                            : "bg-gray-100 text-gray-700"
                        )}
                      >
                        {chain}
                      </button>
                    ))}
                  </div>

                  <div className="mb-2 font-semibold">Type</div>
                  <div className="flex flex-col gap-2">
                    {types.map((type) => (
                      <button
                        key={type}
                        onClick={() =>
                          onTypeChange?.(selectedType === type ? null : type)
                        }
                        className={cn(
                          "rounded-full px-4 py-2 text-left text-sm",
                          selectedType === type
                            ? "bg-[#1CE783] text-white"
                            : "bg-gray-100 text-gray-700"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="relative flex-1">
              <HiSearch className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                autoFocus
                className="font-body w-full rounded-full border-2 border-[#1CE783] bg-white py-2.5 pl-12 pr-4 text-sm shadow-sm focus:border-[#1CE783] focus:outline-none"
              />
            </div>
            <button
              onClick={() => {
                setShowSearch(false)
                onChange("")
              }}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-sm"
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
