export default function LeaderboardPage() {
  return (
    <main className="px-4 py-8 sm:py-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="rounded-[2.25rem] border border-border/70 bg-card/90 p-8 text-center shadow-[0_28px_90px_rgba(15,23,42,0.09)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Gyralis leaderboard
          </p>
          <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Leaderboard
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
            Public rankings are being refined. Use the pills above to move
            between Loops, Leaderboard, and Profile.
          </p>
        </section>
      </div>
    </main>
  )
}
