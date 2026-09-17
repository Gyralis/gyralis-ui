import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ProfilePageSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading profile"
      aria-busy="true"
      className="px-4 py-8 sm:py-12"
    >
      <span className="sr-only">Loading profile…</span>
      <div
        aria-hidden="true"
        className="mx-auto flex w-full max-w-6xl flex-col gap-6"
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
          <Card className="min-h-[220px] rounded-3xl border-border/70 bg-card p-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row">
              <div className="space-y-3">
                <Skeleton className="h-8 w-36" />
                <Skeleton className="h-4 w-48 max-w-full" />
                <Skeleton className="h-12 w-40" />
              </div>
              <div className="grid grid-cols-2 gap-2 sm:w-[220px]">
                {[0, 1].map((index) => (
                  <Skeleton key={index} className="h-20 rounded-2xl" />
                ))}
              </div>
            </div>
            <Skeleton className="mt-5 h-3 w-24" />
            <Skeleton className="mt-3 h-2 w-full rounded-full" />
            <div className="mt-3 flex justify-between gap-4">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-28" />
            </div>
          </Card>
          <Card className="flex min-h-[220px] flex-col overflow-hidden rounded-3xl border-border/70 bg-card">
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-16 w-32" />
              <Skeleton className="h-3 w-28" />
            </div>
            <div className="flex justify-center border-t border-border/70 p-4">
              <Skeleton className="h-5 w-32" />
            </div>
          </Card>
        </div>
        <Card className="min-w-0 rounded-3xl border-border/70 bg-card p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <Skeleton className="h-8 w-52 max-w-full" />
            <Skeleton className="h-10 w-28" />
          </div>
          <Skeleton className="mt-3 h-4 w-full max-w-sm" />
          <div className="mt-7 overflow-x-auto">
            <div className="min-w-[770px]">
              {[0, 1, 2, 3].map((row) => (
                <div
                  key={row}
                  className="grid grid-cols-[minmax(0,1fr)_90px_90px_220px_96px] items-center gap-4 border-b border-border/70 px-3 py-3.5"
                >
                  <div className="flex items-center gap-3">
                    {row > 0 && (
                      <Skeleton className="size-9 shrink-0 rounded-lg" />
                    )}
                    <Skeleton className="h-4 w-28" />
                  </div>
                  {[0, 1, 2, 3].map((column) => (
                    <Skeleton key={column} className="ml-auto h-4 w-14" />
                  ))}
                </div>
              ))}
              <div className="flex justify-between px-3 py-3.5">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-14" />
              </div>
            </div>
          </div>
        </Card>
        <Card className="rounded-3xl border-border/70 bg-card p-8">
          <Skeleton className="h-8 w-48 max-w-full" />
          <Skeleton className="mt-3 h-4 w-full max-w-sm" />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-5 rounded-2xl border border-border/70 p-5"
              >
                <Skeleton className="size-10" />
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
