import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function LeaderboardLoading() {
  return (
    <main
      className="px-4 py-8 sm:py-12"
      aria-label="Loading leaderboard"
      aria-busy="true"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <Card className="min-w-0 rounded-3xl p-5 sm:p-8">
          <div className="grid min-w-0 grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:gap-8">
            <div className="min-w-0 space-y-3">
              <Skeleton className="h-9 w-full max-w-xs" />
              <Skeleton className="h-4 w-full max-w-md" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="grid min-w-0 grid-cols-2 gap-3">
              {[0, 1, 2, 3].map((key) => (
                <div
                  key={key}
                  className="min-w-0 rounded-2xl border border-border/60 bg-muted/20 p-3 sm:p-4"
                >
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="mt-2 h-7 w-16" />
                </div>
              ))}
            </div>
          </div>
        </Card>
        <Card className="space-y-4 rounded-3xl p-5 sm:p-8">
          {[0, 1, 2, 3, 4].map((key) => (
            <Skeleton key={key} className="h-12 w-full" />
          ))}
        </Card>
      </div>
    </main>
  )
}
