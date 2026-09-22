import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
} from "react-icons/fi"

import {
  leaderboardPageNumbers,
  mobileLeaderboardPageNumbers,
} from "@/lib/leaderboard/pagination"

export function LeaderboardPagination({
  page,
  totalPages,
  disabled,
  onPageChange,
}: {
  page: number
  totalPages: number
  disabled: boolean
  onPageChange: (page: number) => void
}) {
  const pages = leaderboardPageNumbers(page, totalPages)
  const mobilePages = mobileLeaderboardPageNumbers(page, totalPages)
  const buttonClass =
    "inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-background text-sm font-semibold tabular-nums text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:size-10 sm:text-base"

  return (
    <nav
      aria-label="Leaderboard pagination"
      className="mt-6 flex flex-wrap items-center justify-center gap-1 sm:gap-2"
    >
      {page > 1 && (
        <>
          <button
            type="button"
            aria-label="First page"
            className={buttonClass}
            disabled={disabled}
            onClick={() => onPageChange(1)}
          >
            <FiChevronsLeft className="size-4 sm:size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Previous page"
            className={buttonClass}
            disabled={disabled}
            onClick={() => onPageChange(Math.min(totalPages, page - 1))}
          >
            <FiChevronLeft className="size-4 sm:size-5" aria-hidden="true" />
          </button>
        </>
      )}
      {pages.map((number) => (
        <button
          key={number}
          type="button"
          aria-label={`Page ${number}`}
          aria-current={number === page ? "page" : undefined}
          className={`${buttonClass} ${
            mobilePages.includes(number) ? "" : "!hidden sm:!inline-flex"
          } ${number === page ? "!bg-primary !text-primary-foreground" : ""}`}
          disabled={disabled}
          onClick={() => {
            if (number !== page) onPageChange(number)
          }}
        >
          {number}
        </button>
      ))}
      {page < totalPages && (
        <>
          <button
            type="button"
            aria-label="Next page"
            className={buttonClass}
            disabled={disabled}
            onClick={() => onPageChange(page + 1)}
          >
            <FiChevronRight className="size-4 sm:size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Last page"
            className={buttonClass}
            disabled={disabled}
            onClick={() => onPageChange(totalPages)}
          >
            <FiChevronsRight className="size-4 sm:size-5" aria-hidden="true" />
          </button>
        </>
      )}
    </nav>
  )
}
