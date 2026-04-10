"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import {
  LuCheck,
  LuChevronLeft,
  LuChevronRight,
  LuCopy,
  LuUsers,
} from "react-icons/lu"
import { type Address } from "viem"

import { useClaimedUsers } from "@/lib/hooks/app/use-claimed-users"
import { useRegisteredUsers } from "@/lib/hooks/app/use-registered-users"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"

interface LoopersModalProps {
  chainId: number
  currentPeriod?: bigint
  eligibilityLogoUrl?: string
  isOpen: boolean
  loopAddress: Address
  loopIsSuper?: boolean
  loopTitle?: string
  onOpenChange: (open: boolean) => void
}

interface CopyAddressButtonProps {
  address: Address
}

const formatAddress = (address: Address) =>
  `${address.slice(0, 6)}...${address.slice(-4)}`

const formatPeriodLabel = (
  selectedPeriod: bigint | undefined,
  offset: number
) => {
  if (selectedPeriod == null) {
    return "Current Period"
  }

  if (offset === 0) {
    return "Current Period"
  }

  if (offset === -1) {
    return "Previous Period"
  }

  if (offset === 1) {
    return "Next Period"
  }

  return `Period ${selectedPeriod.toString()}`
}

function CopyAddressButton({ address }: CopyAddressButtonProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) {
      return
    }

    const timeout = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timeout)
  }, [copied])

  return (
    <button
      type="button"
      className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-background/80 text-muted-foreground transition hover:border-primary hover:text-primary"
      onClick={async () => {
        await navigator.clipboard.writeText(address)
        setCopied(true)
      }}
      aria-label={`Copy ${address}`}
    >
      {copied ? <LuCheck className="size-4" /> : <LuCopy className="size-4" />}
    </button>
  )
}

export function LoopersModal({
  chainId,
  currentPeriod,
  eligibilityLogoUrl,
  isOpen,
  loopAddress,
  loopIsSuper,
  loopTitle,
  onOpenChange,
}: LoopersModalProps) {
  const [periodOffset, setPeriodOffset] = useState(0)

  useEffect(() => {
    if (!isOpen) {
      setPeriodOffset(0)
    }
  }, [isOpen])

  const selectedPeriod = useMemo(() => {
    if (currentPeriod == null) {
      return undefined
    }

    const nextPeriod = currentPeriod + BigInt(periodOffset)
    return nextPeriod >= 0n ? nextPeriod : 0n
  }, [currentPeriod, periodOffset])

  const { users: registeredUsers, loading: loadingRegisteredUsers } =
    useRegisteredUsers(loopAddress, chainId, selectedPeriod)
  const { users: claimedUsers, loading: loadingClaimedUsers } = useClaimedUsers(
    loopAddress,
    chainId,
    selectedPeriod
  )

  const claimedUsersSet = useMemo(
    () => new Set(claimedUsers.map((user) => user.toLowerCase())),
    [claimedUsers]
  )

  const rows = useMemo(
    () =>
      registeredUsers.map((address) => ({
        address,
        claimed: claimedUsersSet.has(address.toLowerCase()),
      })),
    [claimedUsersSet, registeredUsers]
  )

  const claimedCount = rows.filter((row) => row.claimed).length
  const registeredCount = rows.length
  const claimRate =
    registeredCount > 0 ? Math.round((claimedCount / registeredCount) * 100) : 0
  const isLoading = loadingRegisteredUsers || loadingClaimedUsers
  const canGoBack =
    currentPeriod != null && currentPeriod + BigInt(periodOffset - 1) >= 0n
  const canGoForward =
    currentPeriod != null &&
    currentPeriod + BigInt(periodOffset) < currentPeriod + 1n

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[94vw] max-w-5xl overflow-hidden rounded-[2rem] border border-border bg-card p-0 shadow-[0_24px_80px_rgba(0,0,0,0.16)] md:w-[min(94vw,80rem)] md:max-w-5xl">
        <DialogTitle className="sr-only">
          {loopTitle ? `${loopTitle} loopers` : "Loopers"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Registered loopers and claim status for the selected period.
        </DialogDescription>

        <div className="bg-gradient-to-br from-card via-card to-muted/30">
          <div className="border-b border-border p-6 sm:px-8">
            <div className="flex items-start gap-4 pr-10">
              <div className="flex items-start gap-3">
                {eligibilityLogoUrl && (
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-border bg-background/80 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_6px_16px_rgba(0,0,0,0.08)]">
                    <Image
                      src={eligibilityLogoUrl}
                      alt={`${loopTitle ?? "Loop"} eligibility logo`}
                      width={24}
                      height={24}
                      className="size-6 object-contain"
                    />
                  </div>
                )}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-heading text-2xl text-foreground">
                      {loopTitle ?? "Loopers"}
                    </p>
                    <span
                      className={`inline-flex shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                        loopIsSuper
                          ? "bg-secondary/20 text-orange-200"
                          : "bg-popover text-popover-foreground"
                      }`}
                    >
                      {loopIsSuper ? "SUPER LOOP" : "LOOP"}
                    </span>
                  </div>
                  <p className="font-body text-sm text-muted-foreground">
                    Registered addresses and claim activity by period
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 border-b border-border px-6 py-5 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="grid gap-3 sm:grid-cols-3">
              <MetricCard
                label="Registered"
                value={registeredCount.toString()}
              />
              <MetricCard label="Claimed" value={claimedCount.toString()} />
              <MetricCard label="Rate" value={`${claimRate}%`} />
            </div>

            <div className="flex items-center gap-3">
              <PeriodButton
                disabled={!canGoBack || currentPeriod == null}
                onClick={() => setPeriodOffset((offset) => offset - 1)}
              >
                <LuChevronLeft className="size-4" />
              </PeriodButton>
              <div className="min-w-40 rounded-full border border-border bg-background/90 px-4 py-3 text-center font-body text-sm font-semibold text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_6px_16px_rgba(0,0,0,0.08)]">
                {formatPeriodLabel(selectedPeriod, periodOffset)}
              </div>
              <PeriodButton
                disabled={!canGoForward || currentPeriod == null}
                onClick={() => setPeriodOffset((offset) => offset + 1)}
              >
                <LuChevronRight className="size-4" />
              </PeriodButton>
            </div>
          </div>

          <div className="max-h-[26rem] overflow-y-auto md:max-h-[34rem] xl:max-h-[38rem]">
            <div className="min-w-0">
              {isLoading ? (
                <div className="px-6 py-12 text-center font-body text-sm text-muted-foreground sm:px-8">
                  Loading loopers...
                </div>
              ) : rows.length === 0 ? (
                <div className="px-6 py-12 text-center font-body text-sm text-muted-foreground sm:px-8">
                  No registered loopers for this period.
                </div>
              ) : (
                rows.map((row, index) => (
                  <div
                    key={row.address}
                    className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 px-6 py-4 font-body text-sm text-foreground sm:px-8"
                  >
                    <span className="w-6 text-muted-foreground">
                      {index + 1}
                    </span>
                    <span className="truncate font-medium">
                      {formatAddress(row.address)}
                    </span>
                    <CopyAddressButton address={row.address} />
                    <span
                      className={cn(
                        "inline-flex min-w-[6.5rem] items-center justify-center rounded-full px-3 py-2 text-xs font-semibold",
                        row.claimed
                          ? "bg-primary/12 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {row.claimed ? "Claimed" : "Pending"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-end sm:px-8">
            <button
              type="button"
              className="self-start font-body text-sm font-semibold text-foreground transition hover:text-primary sm:self-auto"
              onClick={() => onOpenChange(false)}
            >
              Close
            </button>
          </div> */}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background/75 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_8px_18px_rgba(0,0,0,0.08)]">
      <p className="font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-heading text-3xl text-foreground">{value}</p>
    </div>
  )
}

function PeriodButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_6px_16px_rgba(0,0,0,0.08)] transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
