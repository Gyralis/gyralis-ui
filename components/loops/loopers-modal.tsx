"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import Image from "next/image"
import { LuCheck, LuChevronLeft, LuChevronRight, LuCopy } from "react-icons/lu"
import { formatUnits, type Address } from "viem"
import { usePublicClient, useReadContract } from "wagmi"

import {
  DEFAULT_LOOP_CONTRACT_TYPE,
  getLoopContractAbi,
  getLoopContractMethods,
  type LoopContractType,
} from "@/lib/contracts/loop-contracts"
import { useClaimedUsers } from "@/lib/hooks/app/use-claimed-users"
import { useLoopTokenBalance } from "@/lib/hooks/app/use-loop-token-balance"
import { usePeriodLogBlockRange } from "@/lib/hooks/app/use-period-log-block-range"
import { useRegisteredUsers } from "@/lib/hooks/app/use-registered-users"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"

import { LoopTypeBadge } from "./loop-type-badge"

interface LoopersModalProps {
  chainId: number
  currentPeriod?: bigint
  eligibilityLogoUrl?: string
  isOpen: boolean
  loopAddress: Address
  loopContractType?: LoopContractType
  loopIsSuper?: boolean
  loopToken?: Address
  loopTitle?: string
  onOpenChange: (open: boolean) => void
  periodLength?: bigint
  firstPeriodStart?: bigint
  refreshKey?: number
}

interface CopyAddressButtonProps {
  address: Address
}

const formatAddress = (address: Address) =>
  `${address.slice(0, 6)}...${address.slice(-4)}`

const ENS_LOOKUP_BATCH_SIZE = 10

const formatClaimPayout = (
  payout: bigint,
  decimals: number,
  maxDecimals = 4
) => {
  const formatted = formatUnits(payout, decimals)
  const [whole, fraction = ""] = formatted.split(".")
  const trimmedFraction = fraction.slice(0, maxDecimals).replace(/0+$/, "")

  return trimmedFraction ? `${whole}.${trimmedFraction}` : whole
}

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
      className="inline-flex size-10 items-center justify-center rounded-full border border-border/70 bg-background/70 text-muted-foreground shadow-none transition hover:border-primary hover:text-primary"
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
  loopContractType = DEFAULT_LOOP_CONTRACT_TYPE,
  loopIsSuper,
  loopToken,
  loopTitle,
  onOpenChange,
  periodLength,
  firstPeriodStart,
  refreshKey = 0,
}: LoopersModalProps) {
  const [periodOffset, setPeriodOffset] = useState(0)
  const [ensNamesByAddress, setEnsNamesByAddress] = useState<
    Record<string, string>
  >({})
  const mainnetPublicClient = usePublicClient({ chainId: 1 })

  useEffect(() => {
    if (!isOpen) {
      setPeriodOffset(0)
    }
  }, [isOpen])

  const loopAbi = useMemo(
    () => getLoopContractAbi(chainId, loopContractType),
    [chainId, loopContractType]
  )
  const loopMethods = useMemo(
    () => getLoopContractMethods(loopContractType),
    [loopContractType]
  )

  const selectedPeriod = useMemo(() => {
    if (currentPeriod == null) {
      return undefined
    }

    const nextPeriod = currentPeriod + BigInt(periodOffset)
    return nextPeriod >= 0n ? nextPeriod : 0n
  }, [currentPeriod, periodOffset])
  const isSuperLoop = loopContractType === "superLoop"
  const periodRangesReady =
    isSuperLoop &&
    selectedPeriod != null &&
    firstPeriodStart != null &&
    periodLength != null
  const registerWindowPeriod =
    selectedPeriod != null && selectedPeriod > 0n ? selectedPeriod - 1n : 0n
  const isSelectedFuturePeriod =
    currentPeriod != null && selectedPeriod != null && selectedPeriod > currentPeriod
  const registrationRange = usePeriodLogBlockRange({
    chainId,
    enabled: periodRangesReady,
    firstPeriodStart,
    periodLength,
    windowPeriod: registerWindowPeriod,
  })
  const claimRange = usePeriodLogBlockRange({
    chainId,
    enabled: periodRangesReady && !isSelectedFuturePeriod,
    firstPeriodStart,
    periodLength,
    windowPeriod: selectedPeriod,
  })
  const registrationBlockRange =
    periodRangesReady &&
    registrationRange.fromBlock != null &&
    registrationRange.toBlock != null
      ? {
          fromBlock: registrationRange.fromBlock,
          toBlock: registrationRange.toBlock,
        }
      : undefined
  const claimBlockRange =
    periodRangesReady &&
    !isSelectedFuturePeriod &&
    claimRange.fromBlock != null &&
    claimRange.toBlock != null
      ? {
          fromBlock: claimRange.fromBlock,
          toBlock: claimRange.toBlock,
        }
      : undefined
  const registeredUsersEnabled =
    !isSuperLoop || registrationBlockRange != null
  const claimedUsersEnabled =
    !isSelectedFuturePeriod && (!isSuperLoop || claimBlockRange != null)

  const { users: registeredUsers, loading: loadingRegisteredUsers } =
    useRegisteredUsers(
      loopAddress,
      chainId,
      selectedPeriod,
      refreshKey,
      registeredUsersEnabled,
      registrationBlockRange
    )
  const {
    users: claimedUsers,
    payouts: claimedPayouts,
    loading: loadingClaimedUsers,
  } = useClaimedUsers(
    loopAddress,
    chainId,
    selectedPeriod,
    refreshKey,
    claimedUsersEnabled,
    claimBlockRange
  )
  const { data: loopBalance } = useLoopTokenBalance({
    address: loopAddress,
    chainId,
    contractType: loopContractType,
    enabled: Boolean(loopAddress && loopToken),
    token: loopToken,
  })
  const { data: selectedPeriodPayout } = useReadContract({
    address: loopAddress,
    abi: loopAbi,
    functionName: loopMethods.getPeriodIndividualPayout,
    args: [selectedPeriod ?? 0n],
    chainId,
    query: {
      enabled: selectedPeriod != null,
    },
  })

  const claimedUsersSet = useMemo(
    () => new Set(claimedUsers.map((user) => user.toLowerCase())),
    [claimedUsers]
  )

  const rows = useMemo(
    () =>
      registeredUsers.map((address) => ({
        address,
        claimed: claimedUsersSet.has(address.toLowerCase()),
        payout:
          claimedPayouts[address.toLowerCase()] ?? selectedPeriodPayout ?? 0n,
      })),
    [claimedPayouts, claimedUsersSet, registeredUsers, selectedPeriodPayout]
  )

  useEffect(() => {
    if (!isOpen || !mainnetPublicClient || registeredUsers.length === 0) {
      return
    }

    const addressesToResolve = registeredUsers.filter(
      (address) => !ensNamesByAddress[address.toLowerCase()]
    )

    if (addressesToResolve.length === 0) {
      return
    }

    let cancelled = false

    const resolveEnsNames = async () => {
      const resolved: Array<[string, string]> = []

      for (
        let index = 0;
        index < addressesToResolve.length;
        index += ENS_LOOKUP_BATCH_SIZE
      ) {
        if (cancelled) {
          return
        }

        const batch = addressesToResolve.slice(
          index,
          index + ENS_LOOKUP_BATCH_SIZE
        )
        const batchResolved = await Promise.all(
          batch.map(async (address) => {
            try {
              const ensName = await mainnetPublicClient.getEnsName({ address })
              return ensName ? [address.toLowerCase(), ensName] : null
            } catch {
              return null
            }
          })
        )

        resolved.push(
          ...batchResolved.filter(
            (entry): entry is [string, string] => entry !== null
          )
        )
      }

      if (cancelled) {
        return
      }

      const nextEnsNames = Object.fromEntries(resolved)

      if (Object.keys(nextEnsNames).length === 0) {
        return
      }

      setEnsNamesByAddress((current) => ({ ...current, ...nextEnsNames }))
    }

    void resolveEnsNames()

    return () => {
      cancelled = true
    }
  }, [ensNamesByAddress, isOpen, mainnetPublicClient, registeredUsers])

  const claimedCount = rows.filter((row) => row.claimed).length
  const registeredCount = rows.length
  const claimRate =
    registeredCount > 0 ? Math.round((claimedCount / registeredCount) * 100) : 0
  const claimRateWidth = Math.max(0, Math.min(claimRate, 100))
  const selectedPeriodPayoutAmount =
    typeof selectedPeriodPayout === "bigint" ? selectedPeriodPayout : null
  const amountToDistributeThisPeriod =
    loopBalance && selectedPeriodPayoutAmount != null
      ? `${formatClaimPayout(
          selectedPeriodPayoutAmount * BigInt(registeredCount),
          loopBalance.decimals,
          2
        )} ${loopBalance.symbol}`
      : "--"
  const isLoading =
    registrationRange.loading ||
    claimRange.loading ||
    loadingRegisteredUsers ||
    loadingClaimedUsers
  const canGoBack =
    currentPeriod != null && currentPeriod + BigInt(periodOffset - 1) >= 0n
  const canGoForward =
    currentPeriod != null &&
    currentPeriod + BigInt(periodOffset) < currentPeriod + 1n

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[94vw] max-w-5xl overflow-hidden rounded-[2rem] border border-border/70 bg-card p-0 shadow-[0_30px_80px_-56px_hsl(var(--foreground)/0.2)] md:w-[min(94vw,80rem)] md:max-w-5xl">
        <DialogTitle className="sr-only">
          {loopTitle ? `${loopTitle} loopers` : "Loopers"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Registered loopers and claim status for the selected period.
        </DialogDescription>

        <div className="relative overflow-hidden bg-card">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,hsl(var(--primary)/0.13),transparent_40%),radial-gradient(circle_at_88%_12%,hsl(var(--secondary)/0.12),transparent_34%),linear-gradient(180deg,hsl(var(--card)),hsl(var(--card)))]" />
          <div className="relative z-10 border-b border-border/70 bg-muted/20 p-6 sm:px-8">
            <div className="flex items-start gap-4 pr-10">
              <div className="flex items-start gap-4">
                {eligibilityLogoUrl && (
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-muted/55 p-2">
                    <Image
                      src={eligibilityLogoUrl}
                      alt={`${loopTitle ?? "Loop"} eligibility logo`}
                      width={24}
                      height={24}
                      className="size-6 object-contain"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-2xl font-semibold tracking-tight text-card-foreground">
                      {loopTitle ?? "Loopers"}
                    </p>
                    <LoopTypeBadge isSuper={loopIsSuper} />
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Registered loopers and claim activity for the selected
                    period.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 grid gap-5 border-b border-border/70 bg-card/60 px-6 py-5 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="grid gap-3 sm:grid-cols-3">
              <MetricCard
                label="Registered"
                value={registeredCount.toString()}
              />
              <MetricCard label="Claimed" value={claimedCount.toString()} />
              <MetricCard
                label="To Claim This Period"
                value={amountToDistributeThisPeriod}
                tone="secondary"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-center gap-3 lg:justify-end">
                <PeriodButton
                  disabled={!canGoBack || currentPeriod == null}
                  onClick={() => setPeriodOffset((offset) => offset - 1)}
                >
                  <LuChevronLeft className="size-4" />
                </PeriodButton>
                <div className="min-w-40 rounded-full border border-border/70 bg-muted/30 px-4 py-3 text-center text-sm font-semibold text-foreground">
                  {formatPeriodLabel(selectedPeriod, periodOffset)}
                </div>
                <PeriodButton
                  disabled={!canGoForward || currentPeriod == null}
                  onClick={() => setPeriodOffset((offset) => offset + 1)}
                >
                  <LuChevronRight className="size-4" />
                </PeriodButton>
              </div>
              <div className="min-w-60 space-y-2">
                <div className="flex items-center justify-between gap-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <span>Claim Rate</span>
                  <span className="text-card-foreground">{claimRate}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(135deg,#1ce783_0%,#4ade80_100%)]"
                    style={{ width: `${claimRateWidth}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 max-h-[26rem] overflow-auto md:max-h-[34rem] xl:max-h-[38rem]">
            <div>
              {isLoading ? (
                <LoopersLoadingState />
              ) : rows.length === 0 ? (
                <div className="px-6 py-12 sm:px-8">
                  <div className="rounded-2xl border border-border/60 bg-muted/20 px-6 py-10 text-center text-sm text-muted-foreground">
                    No registered loopers for this period.
                  </div>
                </div>
              ) : (
                <div className="min-w-[43rem]">
                  <div className="sticky top-0 z-10 grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-3 border-b border-border/70 bg-card px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground sm:px-8">
                    <span className="w-6" />
                    <span>Address</span>
                    <span className="size-10" />
                    <span className="min-w-[6.5rem] text-right">Payout</span>
                    <span className="min-w-[6.5rem] text-center">Status</span>
                  </div>
                  {rows.map((row, index) => (
                    <div
                      key={row.address}
                      className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-3 border-b border-border/50 px-6 py-4 text-sm text-foreground transition-colors last:border-b-0 hover:bg-muted/20 sm:px-8"
                    >
                      <span className="w-6 text-muted-foreground">
                        {index + 1}
                      </span>
                      <span
                        className="truncate font-medium"
                        title={row.address}
                      >
                        {ensNamesByAddress[row.address.toLowerCase()] ??
                          formatAddress(row.address)}
                      </span>
                      <CopyAddressButton address={row.address} />
                      <span
                        className={cn(
                          "min-w-[6.5rem] text-right text-xs font-semibold",
                          row.claimed ? "text-primary" : "text-muted-foreground"
                        )}
                      >
                        {loopBalance
                          ? `${formatClaimPayout(
                              row.payout,
                              loopBalance.decimals
                            )} ${loopBalance.symbol}`
                          : "--"}
                      </span>
                      <span
                        className={cn(
                          "inline-flex min-w-[6.5rem] items-center justify-center rounded-full px-3 py-2 text-xs font-semibold",
                          row.claimed
                            ? "bg-primary/12 text-primary"
                            : "bg-muted/70 text-muted-foreground"
                        )}
                      >
                        {row.claimed ? "Claimed" : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function MetricCard({
  label,
  value,
  tone = "default",
}: {
  label: string
  value: string
  tone?: "default" | "secondary"
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3 shadow-none">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 text-3xl font-semibold tracking-tight",
          tone === "secondary" ? "text-secondary" : "text-card-foreground"
        )}
      >
        {value}
      </p>
    </div>
  )
}

function LoopersLoadingState() {
  return (
    <div className="min-w-[43rem] px-6 py-5 sm:px-8">
      <div className="space-y-3 rounded-2xl border border-border/60 bg-muted/20 p-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-3"
          >
            <div className="h-4 w-6 rounded-full bg-primary/10" />
            <div className="h-4 w-44 rounded-full bg-primary/10" />
            <div className="size-10 rounded-full bg-primary/10" />
            <div className="h-4 w-24 rounded-full bg-primary/10" />
            <div className="h-8 w-24 rounded-full bg-primary/10" />
          </div>
        ))}
      </div>
    </div>
  )
}

function PeriodButton({
  children,
  disabled,
  onClick,
}: {
  children: ReactNode
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className="inline-flex size-11 items-center justify-center rounded-full border border-border/70 bg-muted/30 text-foreground shadow-none transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
