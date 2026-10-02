"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import {
  getGlobalLeaderboard,
  getGlobalLeaderboardSummary,
} from "@/services/leaderboard.service"
import { useQuery } from "@tanstack/react-query"
import { FaBolt, FaFire, FaSearch, FaUsers } from "react-icons/fa"
import { FaFire as StreakFlame } from "react-icons/fa6"

import {
  LEADERBOARD_PAGE_SIZE,
  leaderboardPageQuery,
  normalizeLeaderboardSearch,
  parseLeaderboardPage,
} from "@/lib/leaderboard/query"
import type {
  GlobalLeaderboardResponse,
  GlobalLeaderboardSummary,
} from "@/lib/scoring/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

import { LeaderboardInfo } from "./leaderboard-info"
import { LeaderboardPagination } from "./leaderboard-pagination"

const number = new Intl.NumberFormat("en-US")
const grid =
  "grid grid-cols-[64px_minmax(180px,1fr)_140px_130px_130px] items-center gap-4"

export function LeaderboardRowsSkeleton({
  searching = false,
}: {
  searching?: boolean
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="space-y-4 py-6"
    >
      <p className="text-sm text-muted-foreground">
        {searching ? "Searching Looper ..." : "Loading leaderboard…"}
      </p>
      {Array.from({ length: 5 }, (_, index) => (
        <Skeleton key={index} className="h-12 w-full rounded-md" />
      ))}
    </div>
  )
}

function Retry({ message, retry }: { message: string; retry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center gap-3 py-4 text-sm text-muted-foreground"
    >
      <p>{message}</p>
      <Button
        variant="secondary"
        requireWallet={false}
        className="text-xs"
        onClick={retry}
      >
        Retry
      </Button>
    </div>
  )
}

export function LeaderboardPageView({
  initialSearch,
  initialPage,
  initialRows,
  initialSummary,
}: {
  initialSearch: string
  initialPage: number
  initialRows?: GlobalLeaderboardResponse
  initialSummary?: GlobalLeaderboardSummary
}) {
  const params = useSearchParams()
  const pathname = usePathname()
  const search = normalizeLeaderboardSearch(params.get("address") ?? "")
  const page = parseLeaderboardPage(params.get("page"))
  const [draft, setDraft] = useState(search)
  // History navigation restores the input as well as the query key.
  useEffect(() => {
    setDraft(search)
  }, [search])
  useEffect(() => {
    const normalized = normalizeLeaderboardSearch(draft)
    if (normalized === search) return
    const timeout = setTimeout(() => {
      const next = new URLSearchParams(window.location.search)
      if (normalized) next.set("address", normalized)
      else next.delete("address")
      next.delete("page")
      window.history.replaceState(
        null,
        "",
        `${pathname}${next.size ? `?${next.toString()}` : ""}`
      )
    }, 300)
    return () => clearTimeout(timeout)
  }, [draft, search, pathname])

  function navigate(nextPage: number, clear = false) {
    const next = new URLSearchParams(params.toString())
    if (clear) {
      next.delete("address")
      setDraft("")
    }
    if (nextPage === 1) next.delete("page")
    else next.set("page", String(nextPage))
    window.history.pushState(
      null,
      "",
      `${pathname}${next.size ? `?${next.toString()}` : ""}`
    )
  }
  const rows = useQuery({
    queryKey: ["leaderboard", search, page],
    queryFn: ({ signal }) => {
      const query = leaderboardPageQuery(search, page)
      return getGlobalLeaderboard(
        {
          ...query.filters,
          limit: query.limit,
          offset: query.offset,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder,
          includeGlobalRank: true,
        },
        { signal }
      )
    },
    initialData:
      search === initialSearch && page === initialPage
        ? initialRows
        : undefined,
    staleTime: 300_000,
    retry: 1,
  })
  const summary = useQuery({
    queryKey: ["leaderboard-summary"],
    queryFn: ({ signal }) => getGlobalLeaderboardSummary({ signal }),
    initialData: initialSummary,
    staleTime: 300_000,
    retry: 1,
  })
  const stats = [
    {
      label: "All-Time GP Awarded",
      value: summary.data?.totalPoints,
      icon: FaBolt,
      suffix: "GP",
    },
    { label: "Total Claims", value: summary.data?.totalClaims, icon: FaBolt },
    {
      label: "Total Loopers",
      value: summary.data?.totalLoopers,
      icon: FaUsers,
    },
    {
      label: "Longest Streak",
      value: summary.data?.longestStreak,
      icon: FaFire,
    },
  ]
  const total = rows.data?.totalMatching ?? 0
  const pendingSearch = normalizeLeaderboardSearch(draft) !== search
  const loadingRows = pendingSearch || rows.isPending || rows.isFetching

  return (
    <main className="min-w-0 px-4 py-8 sm:py-12">
      <div className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-6">
        <Card className="min-w-0 rounded-3xl border-border/70 bg-card p-5 text-card-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.10),inset_0_-1px_0_rgba(0,0,0,0.05),0_8px_32px_rgba(28,231,131,0.06),0_4px_16px_rgba(140,75,255,0.04),0_2px_8px_rgba(0,0,0,0.08)] sm:p-8">
          <div className="grid min-w-0 grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:gap-8">
            <header className="min-w-0">
              <div className="flex items-start gap-2">
                <h1 className="min-w-0 font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  All-Time{" "}
                  <span className="text-primary">Gyralis Leaderboard</span>
                </h1>
                <LeaderboardInfo
                  updatedAt={summary.data?.lastStatsUpdatedAt ?? null}
                />
              </div>
              <p className="mt-2 max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">
                Loopers ranked by total Gyra Points, including streak bonuses.
              </p>
            </header>
            <section aria-label="Overall leaderboard stats" className="min-w-0">
              <div className="grid grid-cols-2 gap-3">
                {stats.map(({ label, value, icon: Icon, suffix }) => (
                  <div
                    key={label}
                    className="min-w-0 rounded-2xl border border-border/60 bg-muted/20 p-3 sm:p-4"
                  >
                    <div className="flex items-center gap-2">
                      <Icon
                        aria-hidden="true"
                        className="size-3 shrink-0 text-primary"
                      />
                      <p className="text-[10px] leading-4 text-muted-foreground sm:text-xs">
                        {label}
                      </p>
                    </div>
                    {summary.isPending ? (
                      <Skeleton className="mt-2 h-7 w-16" />
                    ) : (
                      <p className="mt-2 flex flex-wrap items-baseline gap-x-1 text-xl font-semibold tabular-nums sm:text-2xl">
                        <span className="min-w-0 break-all">
                          {value == null ? "—" : number.format(value)}
                        </span>
                        {suffix && (
                          <span className="text-xs font-normal text-muted-foreground">
                            {suffix}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              {summary.isError && (
                <Retry
                  message="Overall stats could not be refreshed."
                  retry={() => {
                    void summary.refetch()
                  }}
                />
              )}
            </section>
          </div>
        </Card>
        <Card className="min-w-0 max-w-full rounded-3xl p-5 sm:p-8">
          <div className="flex w-full items-center gap-3 sm:gap-4">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <FaSearch aria-hidden="true" className="shrink-0 text-primary" />
              <Input
                id="leaderboard-search"
                aria-label="Search by wallet address"
                className="min-w-0 !rounded-full !bg-muted/40"
                type="search"
                value={draft}
                maxLength={42}
                autoComplete="off"
                spellCheck={false}
                placeholder="search by address"
                onChange={(event) => setDraft(event.target.value)}
              />
              {(draft || search) && (
                <Button
                  variant="secondary"
                  requireWallet={false}
                  className="text-xs"
                  onClick={() => navigate(1, true)}
                >
                  Clear
                </Button>
              )}
            </div>
            <div
              aria-live="polite"
              className="shrink-0 text-right text-base text-muted-foreground"
            >
              <span aria-hidden="true" className="mr-2">
                /
              </span>
              {loadingRows ? (
                <span aria-label="Loading result count">…</span>
              ) : rows.data ? (
                <>
                  <span className="font-semibold tabular-nums text-foreground">
                    {number.format(total)}
                  </span>{" "}
                  {search ? "matches" : "loopers"}
                </>
              ) : (
                "— loopers"
              )}
              {rows.isError && !loadingRows && (
                <span className="sr-only"> Leaderboard unavailable</span>
              )}
            </div>
          </div>
          {rows.isError && !loadingRows && (
            <Retry
              message="Leaderboard could not be refreshed."
              retry={() => {
                void rows.refetch()
              }}
            />
          )}
          {loadingRows ? (
            <LeaderboardRowsSkeleton
              searching={Boolean(normalizeLeaderboardSearch(draft))}
            />
          ) : (
            rows.data && (
              <>
                <div
                  role="region"
                  aria-label="All-time leaderboard rankings"
                  tabIndex={0}
                  className="mt-4 w-full max-w-full overflow-x-auto overscroll-x-contain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-busy={rows.isFetching}
                >
                  <div
                    role="table"
                    aria-label="Loopers ranked by all-time GP"
                    className="min-w-[740px]"
                  >
                    <div
                      role="row"
                      className={`${grid} border-b py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground`}
                    >
                      {[
                        "Rank",
                        "Looper",
                        "Best streak",
                        "Total claims",
                        "Total GP",
                      ].map((label, index) => (
                        <div
                          role="columnheader"
                          key={label}
                          className={index < 2 ? "text-left" : ""}
                        >
                          {label}
                        </div>
                      ))}
                    </div>
                    {rows.data.entries.map((entry) => (
                      <div
                        role="row"
                        key={entry.id}
                        className={`${grid} border-b border-border/50 py-4 text-right text-sm font-bold tabular-nums hover:bg-muted/30`}
                      >
                        <div
                          role="cell"
                          className="text-left text-muted-foreground"
                        >
                          {entry.globalRank == null
                            ? "—"
                            : `#${number.format(entry.globalRank)}`}
                        </div>
                        <div role="cell" className="text-left">
                          <Link
                            href={`/profile/${entry.userAddress}`}
                            title={entry.userAddress}
                            aria-label={`View profile for ${entry.userAddress}`}
                            className="rounded text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {entry.userAddress.slice(0, 6)}…
                            {entry.userAddress.slice(-4)}
                          </Link>
                        </div>
                        <div
                          role="cell"
                          className={`flex items-center justify-end gap-1.5 ${
                            entry.longestStreak > 0
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        >
                          <StreakFlame
                            aria-hidden="true"
                            className={`size-[13px] ${
                              entry.longestStreak > 0
                                ? "drop-shadow-[0_0_10px_hsl(var(--primary)/0.45)]"
                                : ""
                            }`}
                          />
                          <span>
                            {entry.longestStreak > 49
                              ? "+50"
                              : number.format(entry.longestStreak)}
                          </span>
                        </div>
                        <div
                          role="cell"
                          className="text-right text-sm font-bold leading-5 tabular-nums text-foreground"
                        >
                          +{number.format(entry.totalClaims)}
                          <span className="ml-1 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                            GP
                          </span>
                        </div>
                        <div
                          role="cell"
                          className="text-right text-base font-extrabold leading-5 tabular-nums text-foreground"
                        >
                          {number.format(entry.totalPoints)}
                          <span className="ml-1 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                            GP
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {rows.data.entries.length === 0 && (
                  <p className="py-10 text-center text-sm text-muted-foreground">
                    {total > 0
                      ? "No loopers on this page. Return to an earlier page."
                      : search
                      ? "Looper not found. Try another address"
                      : "No scored claims yet. The first loopers will appear here."}
                  </p>
                )}
                {!search && (
                  <LeaderboardPagination
                    page={page}
                    totalPages={Math.max(
                      1,
                      Math.ceil(total / LEADERBOARD_PAGE_SIZE)
                    )}
                    disabled={pendingSearch || rows.isFetching}
                    onPageChange={navigate}
                  />
                )}
              </>
            )
          )}
        </Card>
      </div>
    </main>
  )
}
