"use client"

import { FaWallet } from "react-icons/fa"

import { LoopSectionError } from "./loop-section-status"
import type { SectionState } from "./loop-section-types"

export interface LoopBalanceViewData {
  formattedBalance: string
  symbol: string
  secondary?: {
    label: string
    value: string
  }
}

interface LoopBalanceSectionProps {
  state: SectionState<LoopBalanceViewData>
}

export function LoopBalanceSection({ state }: LoopBalanceSectionProps) {
  if (state.status === "loading") {
    return <StatusCard message={state.message ?? "Fetching balance..."} />
  }

  if (state.status === "error") {
    return (
      <div className="rounded-[1.45rem] border border-border/80 bg-background/35 px-5 py-4">
        <LoopSectionError
          label="Loop balance"
          message={state.message}
          onRetry={state.retry}
        />
      </div>
    )
  }

  const { formattedBalance, secondary, symbol } = state.data

  return (
    <div className="rounded-[1.45rem] border border-border/80 bg-background/35 p-5">
      <div>
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <FaWallet className="size-3.5 text-primary" />
          <p>Loop Balance</p>
        </div>

        <div className="mt-2 grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-end gap-2.5">
          <div className="min-w-0">
            <span className="block min-w-0 font-heading text-4xl font-bold leading-none tabular-nums text-primary sm:text-5xl md:text-[3.4rem]">
              {formattedBalance}
            </span>
          </div>
          <span className="mb-1 shrink-0 text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {symbol}
          </span>
        </div>
      </div>

      {secondary ? (
        <div className="mt-5 border-t border-border/70 pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {secondary.label}
          </p>
          <p className="mt-1.5 text-base font-semibold text-foreground">
            {secondary.value}
          </p>
        </div>
      ) : null}
    </div>
  )
}

function StatusCard({ message }: { message: string }) {
  return (
    <div className="rounded-[1.45rem] border border-border/80 bg-background/35 px-5 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
