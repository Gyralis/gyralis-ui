import {
  getLeaderboardData,
  getLeaderboardSummary,
} from "@/lib/leaderboard/get-leaderboard-data"
import {
  leaderboardPageQuery,
  normalizeLeaderboardSearch,
  parseLeaderboardPage,
} from "@/lib/leaderboard/query"
import { LeaderboardPageView } from "@/components/leaderboard/leaderboard-page-view"

export const dynamic = "force-dynamic"

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: { address?: string; page?: string }
}) {
  const search = normalizeLeaderboardSearch(
    typeof searchParams.address === "string" ? searchParams.address : ""
  )
  const page = parseLeaderboardPage(searchParams.page)
  const [rows, summary] = await Promise.allSettled([
    getLeaderboardData(leaderboardPageQuery(search, page), true),
    getLeaderboardSummary(),
  ])
  return (
    <LeaderboardPageView
      initialSearch={search}
      initialPage={page}
      initialRows={rows.status === "fulfilled" ? rows.value : undefined}
      initialSummary={
        summary.status === "fulfilled" ? summary.value : undefined
      }
    />
  )
}
