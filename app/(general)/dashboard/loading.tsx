import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function DashboardStatSkeleton() {
  return (
    <Card className="rounded-2xl border-border/70 bg-card/80 shadow-[0_24px_70px_-52px_hsl(var(--foreground)/0.2)] backdrop-blur-xl">
      <CardContent className="space-y-3 p-5">
        <Skeleton className="h-3 w-28 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
      </CardContent>
    </Card>
  )
}

function LoopCardSkeleton() {
  return (
    <Card className="overflow-hidden rounded-[26px] border border-border/70 bg-card/80 shadow-[0_30px_80px_-56px_hsl(var(--foreground)/0.2)] backdrop-blur-xl">
      <CardHeader className="gap-5 border-b border-border/70 bg-muted/20 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="size-14 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40 rounded-full" />
              <Skeleton className="h-4 w-28 rounded-full" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-7 w-40 rounded-full" />
            <Skeleton className="h-7 w-14 rounded-full" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <DashboardStatSkeleton key={index} />
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.4fr,1fr]">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-border/60 bg-muted/20 p-5"
            >
              <Skeleton className="h-3 w-32 rounded-full" />
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((__, innerIndex) => (
                  <div key={innerIndex} className="space-y-2">
                    <Skeleton className="h-4 w-20 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-xl" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ChartCardSkeleton({
  titleWidth,
  heightClass,
}: {
  titleWidth: string
  heightClass: string
}) {
  return (
    <Card className="rounded-[26px] border border-border/70 bg-card/80 shadow-[0_30px_80px_-56px_hsl(var(--foreground)/0.2)] backdrop-blur-xl">
      <CardHeader className="space-y-2 border-b border-border/70 bg-muted/20">
        <Skeleton className={`h-6 ${titleWidth} rounded-full`} />
        <Skeleton className="h-4 w-full max-w-md rounded-full" />
      </CardHeader>
      <CardContent className="p-6">
        <Skeleton className={`${heightClass} w-full rounded-[22px]`} />
      </CardContent>
    </Card>
  )
}

function SectionHeaderSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-28 rounded-full" />
      <Skeleton className="h-9 w-72 rounded-full" />
      <Skeleton className="h-5 w-full max-w-2xl rounded-full" />
      <Skeleton className="h-5 w-full max-w-xl rounded-full" />
    </div>
  )
}

export default function DashboardLoading() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.14),transparent_28%),radial-gradient(circle_at_top_right,hsl(var(--secondary)/0.16),transparent_26%),linear-gradient(180deg,hsl(var(--background)/0.98),hsl(var(--background)))]" />
        <div className="absolute inset-y-0 left-0 w-40 bg-[linear-gradient(90deg,hsl(var(--muted)/0.65),transparent)] lg:w-64" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-screen-2xl flex-col gap-8 px-4 pb-16 pt-6 sm:px-6 lg:pl-32 lg:pr-8 lg:pt-8 xl:pl-36 xl:pr-10">
        <div className="lg:fixed lg:left-6 lg:top-24 lg:z-30">
          <div className="rounded-2xl border border-border/70 bg-card/80 p-3 shadow-[0_24px_70px_-40px_hsl(var(--foreground)/0.22)] backdrop-blur lg:hidden">
            <Skeleton className="h-3 w-24 rounded-full" />
            <div className="mt-3 flex gap-2 overflow-hidden">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-24 rounded-xl" />
              ))}
            </div>
          </div>

          <div className="hidden h-[calc(100vh-7rem)] w-[5.5rem] rounded-[2rem] border border-border/70 bg-card/80 px-3 py-5 shadow-[24px_0_90px_-52px_hsl(var(--foreground)/0.28)] backdrop-blur-xl lg:flex lg:flex-col">
            <div className="flex flex-col items-center gap-3 border-b border-border/60 pb-5">
              <Skeleton className="size-12 rounded-2xl" />
            </div>
            <div className="mt-5 flex-1 space-y-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-16 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>

        <header className="rounded-[2rem] border border-border/70 bg-[linear-gradient(135deg,hsl(var(--card)/0.96),hsl(var(--card)/0.92)_42%,hsl(var(--primary)/0.14)_140%)] p-6 shadow-[0_38px_110px_-58px_hsl(var(--foreground)/0.22)] backdrop-blur xl:p-8">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)] xl:items-end">
            <div className="space-y-5">
              <div className="flex gap-3">
                <Skeleton className="h-7 w-24 rounded-full" />
                <Skeleton className="h-7 w-36 rounded-full" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-12 w-full max-w-3xl rounded-2xl" />
                <Skeleton className="h-5 w-full max-w-2xl rounded-full" />
                <Skeleton className="h-5 w-full max-w-xl rounded-full" />
              </div>
            </div>

            <Card className="rounded-[1.75rem] border-border/70 bg-card/80 shadow-[0_24px_70px_-48px_hsl(var(--foreground)/0.18)] backdrop-blur-xl">
              <CardContent className="grid gap-4 p-5 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Skeleton className="h-3 w-20 rounded-full" />
                    <Skeleton className="h-5 w-28 rounded-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </header>

        <div className="space-y-12">
          <section className="space-y-5">
            <SectionHeaderSkeleton />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 10 }).map((_, index) => (
                <DashboardStatSkeleton key={index} />
              ))}
            </div>
          </section>

          <section className="space-y-5">
            <SectionHeaderSkeleton />
            <div className="grid gap-5 xl:grid-cols-2">
              <LoopCardSkeleton />
              <LoopCardSkeleton />
            </div>
          </section>

          <section className="space-y-5">
            <SectionHeaderSkeleton />
            <div className="grid gap-5 lg:grid-cols-[1.1fr,0.9fr]">
              <ChartCardSkeleton titleWidth="w-40" heightClass="h-[250px]" />
              <ChartCardSkeleton titleWidth="w-36" heightClass="h-[250px]" />
            </div>
            <div className="space-y-5">
              <div className="grid gap-5 xl:grid-cols-2">
                <ChartCardSkeleton titleWidth="w-52" heightClass="h-[320px]" />
                <ChartCardSkeleton titleWidth="w-44" heightClass="h-[320px]" />
              </div>
              <ChartCardSkeleton titleWidth="w-48" heightClass="h-[340px]" />
            </div>
          </section>

          <section className="space-y-5">
            <SectionHeaderSkeleton />
            <Card className="overflow-hidden rounded-[26px] border border-border/70 bg-card/80 shadow-[0_30px_80px_-56px_hsl(var(--foreground)/0.2)] backdrop-blur-xl">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <div className="min-w-full divide-y divide-border/70">
                    <div className="grid grid-cols-9 gap-4 bg-muted/20 px-4 py-3">
                      {Array.from({ length: 9 }).map((_, index) => (
                        <Skeleton key={index} className="h-3 rounded-full" />
                      ))}
                    </div>
                    {Array.from({ length: 6 }).map((_, rowIndex) => (
                      <div
                        key={rowIndex}
                        className="grid grid-cols-9 gap-4 px-4 py-3"
                      >
                        {Array.from({ length: 9 }).map((__, cellIndex) => (
                          <Skeleton
                            key={cellIndex}
                            className="h-4 rounded-full"
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  )
}
