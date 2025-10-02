"use client"

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
  tags: string[] // list of quick filter tags
  activeTag?: string | null
  onTagChange?: (tag: string | null) => void
  showFilters?: boolean
  onToggleFilters?: () => void
  placeholder?: string
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
}: SearchWithTagsProps) {
  const [showSearch, setShowSearch] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" })
    }
  }

  return (
    <div className="mb-8 rounded-3xl border border-white/20 bg-white/80 p-4 shadow-md backdrop-blur-sm">
      <div className="flex items-center gap-3">
        {!showSearch ? (
          <>
            {/* Scroll left */}
            <button
              onClick={scrollLeft}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-sm"
              aria-label="Scroll left"
            >
              <HiChevronLeft className="h-5 w-5 text-gray-600" />
            </button>

            {/* Tags scrollable */}
            <div
              ref={scrollContainerRef}
              className="scrollbar-hide flex-1 overflow-x-auto scroll-smooth"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <div className="flex min-w-max gap-2">
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

            {/* Scroll right */}
            <button
              onClick={scrollRight}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-sm"
              aria-label="Scroll right"
            >
              <HiChevronRight className="h-5 w-5 text-gray-600" />
            </button>

            {/* Toggle search */}
            <button
              onClick={() => setShowSearch(true)}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-sm"
              aria-label="Search"
            >
              <HiSearch className="h-5 w-5 text-gray-600" />
            </button>

            {/* Filters toggle */}
            <button
              onClick={onToggleFilters}
              className="flex h-10 flex-shrink-0 items-center gap-2 rounded-full bg-white px-4 shadow-sm"
              aria-label="Filters"
            >
              <span className="font-body text-sm font-medium uppercase tracking-wide text-gray-700">
                Filters
              </span>
              <HiSlidersHorizontal className="h-4 w-4 text-gray-600" />
            </button>
          </>
        ) : (
          <>
            {/* Search input */}
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
            {/* Close search */}
            <button
              onClick={() => {
                setShowSearch(false)
                onChange("") // clear search when closing
              }}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-sm"
              aria-label="Close search"
            >
              X{/* <X className="h-5 w-5 text-gray-600" /> */}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
