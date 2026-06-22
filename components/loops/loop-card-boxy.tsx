import Image from "next/image"
import Link from "next/link"
import { LoopCardData } from "@/data/loops-data"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { LoopTypeBadge } from "./loop-type-badge"

interface LoopCardBoxyProps {
  loop: LoopCardData
}

export function LoopCardBoxy({ loop }: LoopCardBoxyProps) {
  const isSuperLoop = loop.contractType === "superLoop" || loop.super

  return (
    <Card className="group overflow-hidden border-border/80 bg-background/80 shadow-[0_18px_42px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
      <CardHeader className="space-y-4 border-b border-border/70 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <CardTitle className="text-xl leading-tight text-foreground">
              {loop.title}
            </CardTitle>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/50 px-3 py-1.5 font-semibold uppercase tracking-[0.12em] text-[11px]">
                {loop.chainName}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/50 px-3 py-1.5 font-semibold uppercase tracking-[0.12em] text-[11px]">
                by {loop.by}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LoopTypeBadge isSuper={isSuperLoop} className="text-[10px]" />
            {loop.eligibilityLogoUrl ? (
              <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-border/80 bg-background/80">
                <Image
                  src={loop.eligibilityLogoUrl}
                  alt={`${loop.eligibility} logo`}
                  width={36}
                  height={36}
                  className="object-contain"
                />
              </div>
            ) : null}
          </div>
        </div>

        <CardDescription className="text-sm text-muted-foreground">
          {loop.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-5 sm:grid-cols-[1fr_200px]">
        <div className="grid gap-5">
          <div className="grid gap-3 rounded-3xl border border-border/70 bg-background/60 p-4">
            <div className="flex items-center justify-between gap-4 text-sm font-semibold text-foreground">
              <span>Passport requirement</span>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                {loop.shieldScore}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{loop.eligibility}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-border/70 bg-background/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Next distribution
              </p>
              <p className="mt-3 text-lg font-semibold text-foreground">
                Daily claim window
              </p>
            </div>
            <div className="rounded-3xl border border-border/70 bg-background/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Current status
              </p>
              <p className="mt-3 text-lg font-semibold text-foreground">Live</p>
            </div>
          </div>

          <div className="space-y-3 rounded-3xl border border-border/70 bg-background/60 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Summary
            </p>
            <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              <div className="rounded-2xl bg-muted/50 p-3 text-sm text-foreground">
                <p className="text-[11px] uppercase tracking-[0.16em]">Chain</p>
                <p className="mt-2 font-semibold">{loop.chainName}</p>
              </div>
              <div className="rounded-2xl bg-muted/50 p-3 text-sm text-foreground">
                <p className="text-[11px] uppercase tracking-[0.16em]">
                  Provider
                </p>
                <p className="mt-2 font-semibold">{loop.by}</p>
              </div>
              <div className="rounded-2xl bg-muted/50 p-3 text-sm text-foreground">
                <p className="text-[11px] uppercase tracking-[0.16em]">
                  Eligibility
                </p>
                <p className="mt-2 font-semibold">
                  {loop.eligibility.replace(/ required$/i, "")}
                </p>
              </div>
              <div className="rounded-2xl bg-muted/50 p-3 text-sm text-foreground">
                <p className="text-[11px] uppercase tracking-[0.16em]">Token</p>
                <p className="mt-2 font-semibold">
                  {loop.token.slice(0, 6)}…{loop.token.slice(-4)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-border/70 bg-muted/40 p-4">
          <div className="space-y-3">
            <div className="rounded-3xl bg-background/80 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Core metrics
              </p>
              <div className="mt-4 grid gap-3">
                <Metric
                  label="Passport score"
                  value={
                    loop.passportMinScore ? `${loop.passportMinScore}+` : "N/A"
                  }
                />
                <Metric
                  label="Contract type"
                  value={isSuperLoop ? "SuperLoop" : "Loop"}
                />
                <Metric
                  label="Eligibility"
                  value={
                    loop.eligibilityProvider === "garden_1hive"
                      ? "1Hive"
                      : "Blockscout"
                  }
                />
              </div>
            </div>

            <div className="rounded-3xl bg-background/80 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Campaign actions
              </p>
              <div className="mt-4 grid gap-3">
                <ActionButton href="/eligibilities">
                  How to qualify
                </ActionButton>
                <ActionButton href={`/leaderboard`} subtle>
                  View loop leaderboard
                </ActionButton>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">
            Simplified loop dashboard
          </p>
          <p className="text-sm text-muted-foreground">
            Keep the data that matters and move metadata to advanced details.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/eligibilities"
            className="inline-flex items-center justify-center rounded-full border border-border/80 bg-background/70 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/70 hover:text-primary"
          >
            Eligibility guide
          </Link>
          <Link
            href="/leaderboard"
            className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Loop details
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/80 p-3 text-sm">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-semibold text-foreground">{value}</p>
    </div>
  )
}

function ActionButton({
  href,
  children,
  subtle,
}: {
  href: string
  children: React.ReactNode
  subtle?: boolean
}) {
  return (
    <Link
      href={href}
      className={
        subtle
          ? "inline-flex w-full items-center justify-center rounded-2xl border border-border/80 bg-background/80 px-4 py-3 text-sm font-semibold text-muted-foreground transition hover:border-primary/70 hover:text-primary"
          : "inline-flex w-full items-center justify-center rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
      }
    >
      {children}
    </Link>
  )
}
