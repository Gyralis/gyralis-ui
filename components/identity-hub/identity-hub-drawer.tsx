"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { FiRefreshCcw } from "react-icons/fi"
import {
  HiArrowPath,
  HiArrowRight,
  HiCheckBadge,
  HiCheckCircle,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi2"
import { PiFingerprintLight } from "react-icons/pi"
import { useAccount } from "wagmi"

import { useToast } from "@/lib/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { useGetScore } from "@/integrations/gitcoin-passport/hooks/use-get-score"
import { useSubmitPassport } from "@/integrations/gitcoin-passport/hooks/use-submit-passport"
import { HAS_NOT_SUBMITTED_PASSPORT_YET_ERROR } from "@/integrations/gitcoin-passport/utils/constants"

type IdentityVerificationStatus =
  | "verified"
  | "action-needed"
  | "error"
  | "loading"
  | "disconnected"

type IdentityVerificationMethod = {
  id: string
  title: string
  summary: string
  status: IdentityVerificationStatus
  statusLabel?: string
  actionLabel?: string
  score?: string
  lastSubmittedAt?: string | null
  details?: string | null
  actionInProgress?: boolean
  hideRefresh?: boolean
  onAction: (() => Promise<void>) | null
}

const statusClassMap: Record<IdentityVerificationStatus, string> = {
  verified:
    "text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300",
  "action-needed":
    "text-amber-700 bg-amber-100 dark:bg-amber-950 dark:text-amber-300",
  error: "text-rose-700 bg-rose-100 dark:bg-rose-950 dark:text-rose-300",
  loading: "text-sky-700 bg-sky-100 dark:bg-sky-950 dark:text-sky-300",
  disconnected:
    "text-slate-700 bg-slate-100 dark:bg-slate-900 dark:text-slate-300",
}

const statusLabelMap: Record<IdentityVerificationStatus, string> = {
  verified: "Verified",
  "action-needed": "Action needed",
  error: "Error",
  loading: "Updating",
  disconnected: "Connect wallet",
}

const formatScoreDate = (timestamp: string | null | undefined) => {
  if (!timestamp) return null
  const parsed = Number(timestamp)
  const normalizedTimestamp = Number.isFinite(parsed)
    ? parsed < 1_000_000_000_000
      ? parsed * 1000
      : parsed
    : Date.parse(timestamp)
  const date = new Date(normalizedTimestamp)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date)
}

const truncateAddress = (address: string) =>
  `${address.slice(0, 8)}…${address.slice(-6)}`

const gyraHubSteps = [
  {
    title: "Open Human Passport",
    description:
      "Head to Passport and connect the same wallet you use in GyraHub.",
  },
  {
    title: "Collect verification stamps",
    description:
      "Add identity and reputation proofs to grow your Passport score.",
  },
  {
    title: "Submit your Passport here",
    description:
      "Use the action in GyraHub to sign a message and request scoring.",
  },
  {
    title: "Refresh your status",
    description:
      "After new stamps or a fresh submission, refresh to sync your latest score.",
  },
]

const IdentityHubMethodCard = ({
  method,
  onRefresh,
  isRefreshing = false,
}: {
  method: IdentityVerificationMethod
  onRefresh: () => void
  isRefreshing?: boolean
}) => {
  const isBusy = Boolean(method.actionInProgress)

  return (
    <div className="rounded-[1.75rem] border border-border/60 bg-background/90 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-background shadow-sm">
              <Image
                src="/passport-logo.svg"
                alt="Human Passport"
                width={24}
                height={24}
                className="size-6 object-contain"
              />
            </div>
            <div className="min-w-0">
              <h4 className="truncate text-base font-semibold">
                {method.title}
              </h4>
              <p className="text-sm text-muted-foreground">{method.summary}</p>
            </div>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-3 py-1 text-xs font-semibold",
            statusClassMap[method.status]
          )}
        >
          {method.statusLabel ?? statusLabelMap[method.status]}
        </span>
      </div>

      <div className="mb-4 overflow-hidden rounded-[1.2rem] border border-border/50 bg-muted/20">
        <div>
          <div className="flex min-h-[72px] items-center justify-between gap-4 bg-background/90 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Passport score
            </p>
            {method.status === "loading" ? (
              <Skeleton className="h-10 w-24" />
            ) : (
              <span className="text-3xl font-semibold tracking-tight text-foreground">
                {method.score ?? "—"}
              </span>
            )}
          </div>
          <div className="mx-4 border-t border-border/50" />
          <div className="flex min-h-[72px] items-center justify-between gap-4 bg-background/90 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Last submitted
            </p>
            {method.status === "loading" ? (
              <Skeleton className="h-5 w-32" />
            ) : (
              <p className="max-w-[220px] text-right font-medium text-foreground">
                {formatScoreDate(method.lastSubmittedAt) ?? "Not submitted yet"}
              </p>
            )}
          </div>
        </div>

        {method.details && (
          <p className="mx-4 mb-4 rounded-xl bg-background px-3 py-2.5 text-sm text-muted-foreground">
            {method.details}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {method.onAction && method.actionLabel && (
          <Button
            onClick={method.onAction}
            isLoading={isBusy}
            disabled={isBusy}
            className="w-full"
          >
            {method.actionLabel}
          </Button>
        )}
        {!method.hideRefresh && (
          <Button
            variant="secondary"
            onClick={onRefresh}
            isLoading={isRefreshing}
            disabled={isBusy || isRefreshing}
            className="w-full"
          >
            <FiRefreshCcw className="size-4" />
            Update Score
          </Button>
        )}
      </div>
    </div>
  )
}

export const IdentityHubDrawer = ({
  className,
  compact = false,
}: {
  className?: string
  compact?: boolean
}) => {
  const { address } = useAccount()
  const [open, setOpen] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const [sheetSide, setSheetSide] = useState<"right" | "bottom">("right")
  const { toast } = useToast()
  const drawerWidth = guideOpen ? 800 : 500

  const scoreQuery = useGetScore({
    enabled: open,
  })
  const { submitPassport, isLoading: isSubmittingPassport } =
    useSubmitPassport()

  const submitPassportAndRefresh = useCallback(async () => {
    try {
      await submitPassport()
      scoreQuery.refetch()
      toast({
        title: "Passport submitted",
        description:
          "Your Passport was submitted and score refresh was requested. Check back in a few moments.",
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to submit passport."
      toast({
        title: "Submit failed",
        description: message,
      })
    }
  }, [submitPassport, scoreQuery, toast])

  useEffect(() => {
    const media = window.matchMedia("(max-width: 768px)")
    const updateSide = () => setSheetSide(media.matches ? "bottom" : "right")
    updateSide()
    media.addEventListener("change", updateSide)
    return () => media.removeEventListener("change", updateSide)
  }, [])

  const methods = useMemo<IdentityVerificationMethod[]>(() => {
    if (!address) {
      return [
        {
          id: "passport",
          title: "Gitcoin Passport",
          summary:
            "Identity reputation powered by wallet-linked verifications.",
          status: "disconnected" as const,
          statusLabel: "Connect wallet",
          details:
            "Connect your wallet to unlock GyraHub and view your Human Passport status.",
          onAction: null,
          actionInProgress: false,
          hideRefresh: true,
        },
      ]
    }

    if (scoreQuery.isLoading || scoreQuery.isRefetching) {
      return [
        {
          id: "passport",
          title: "Gitcoin Passport",
          summary: "Fetching your latest Human Passport data.",
          status: "loading" as const,
          onAction: null,
          actionInProgress: true,
          details:
            "GyraHub is syncing your current score and submission status.",
          hideRefresh: false,
        },
      ]
    }

    if (scoreQuery.isError) {
      const errorMessage = String(scoreQuery.error)
      if (errorMessage === HAS_NOT_SUBMITTED_PASSPORT_YET_ERROR) {
        return [
          {
            id: "passport",
            title: "Gitcoin Passport",
            summary:
              "Your Passport has not been submitted to this community yet.",
            status: "action-needed" as const,
            statusLabel: "Ready to submit",
            details:
              "Submit your Passport here to create or update your score for this GyraHub community.",
            actionLabel: "Submit Passport",
            onAction: submitPassportAndRefresh,
            actionInProgress: isSubmittingPassport,
            hideRefresh: true,
          },
        ]
      }

      return [
        {
          id: "passport",
          title: "Gitcoin Passport",
          summary: "We could not load the Passport status.",
          status: "error" as const,
          details: errorMessage,
          onAction: null,
          actionInProgress: false,
          hideRefresh: false,
        },
      ]
    }

    const score = scoreQuery.data?.score
    if (!score) {
      return [
        {
          id: "passport",
          title: "Gitcoin Passport",
          summary: "A score is not available yet for this wallet.",
          status: "action-needed" as const,
          statusLabel: "Need submission",
          actionLabel: "Submit Passport",
          onAction: submitPassportAndRefresh,
          actionInProgress: isSubmittingPassport,
          details:
            "Once submitted, GyraHub will request a score and keep this panel updated.",
          hideRefresh: true,
        },
      ]
    }

    const scoreValue = Number.parseFloat(score)
    return [
      {
        id: "passport",
        title: "Gitcoin Passport",
        summary: "Your live Human Passport score for this connected wallet.",
        status: Number.isFinite(scoreValue) ? "verified" : "error",
        score: `${scoreValue.toFixed(2)}`,
        lastSubmittedAt: scoreQuery.data?.last_score_timestamp,
        details:
          "Claim new stamps in Passport, then refresh here to pull the latest score into GyraHub.",
        onAction: null,
        actionInProgress: false,
        hideRefresh: false,
      },
    ]
  }, [
    address,
    scoreQuery.data,
    scoreQuery.error,
    scoreQuery.isError,
    scoreQuery.isLoading,
    scoreQuery.isRefetching,
    isSubmittingPassport,
    submitPassportAndRefresh,
  ])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className={cn(
            "inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-semibold transition-colors hover:bg-accent hover:text-accent-foreground",
            compact ? "h-9 px-3 text-xs" : "h-10 px-4 md:px-5",
            className
          )}
        >
          <PiFingerprintLight className="size-4 text-primary" />
          <span>GyraHub</span>
        </button>
      </SheetTrigger>
      <SheetContent
        side={sheetSide}
        className="!overflow-hidden !p-0 transition-[width,max-width] duration-300 ease-out"
        style={
          sheetSide === "right"
            ? {
                width: `${drawerWidth}px`,
                maxWidth: "calc(100vw - 1rem)",
              }
            : undefined
        }
      >
        <div
          className={cn(
            "grid h-full min-h-[80vh] grid-cols-1",
            guideOpen
              ? "md:grid-cols-[minmax(0,1fr)_300px]"
              : "md:grid-cols-[minmax(0,1fr)]"
          )}
        >
          <div className="flex h-full min-w-0 flex-col bg-background px-3 py-4 md:px-4 md:py-4">
            <div className="flex-1">
              <SheetHeader className="pr-10 text-left">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      <Image
                        src="/passport-logo.svg"
                        alt="Human Passport"
                        width={24}
                        height={24}
                        className="size-6 object-contain"
                      />
                    </div>
                    <div>
                      <SheetTitle className="flex items-center gap-2 text-2xl tracking-tight">
                        <PiFingerprintLight className="size-6 shrink-0" />
                        <span>GyraHub</span>
                      </SheetTitle>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Your identity checkpoint for score, submission, and
                        trust signals.
                      </p>
                    </div>
                  </div>
                  <button
                    className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/30 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={() => setGuideOpen((current) => !current)}
                    type="button"
                  >
                    {guideOpen ? "Hide guide" : "View guide"}
                    {guideOpen ? (
                      <HiChevronRight className="size-4" />
                    ) : (
                      <HiArrowRight className="size-4" />
                    )}
                  </button>
                </div>
              </SheetHeader>

              <div className="mt-3 overflow-hidden rounded-[1.2rem] border border-border/50 bg-muted/20 shadow-sm">
                <div className="flex min-h-[72px] items-center justify-between gap-4 bg-background/90 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Connected wallet
                  </p>
                  <div className="flex items-center gap-2">
                    {address ? (
                      <>
                        <HiCheckBadge className="size-4 text-emerald-500" />
                        <span className="font-mono text-foreground">
                          {truncateAddress(address)}
                        </span>
                      </>
                    ) : (
                      <span className="text-foreground">Not connected</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                {methods.map((method) => (
                  <IdentityHubMethodCard
                    key={method.id}
                    method={{
                      ...method,
                      score: method.score ?? undefined,
                    }}
                    isRefreshing={
                      scoreQuery.isRefetching || scoreQuery.isLoading
                    }
                    onRefresh={() => {
                      if (address) void scoreQuery.refetch()
                    }}
                  />
                ))}
              </div>

              {!guideOpen && (
                <button
                  className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setGuideOpen(true)}
                  type="button"
                >
                  Need help submitting?
                  <span className="inline-flex items-center gap-1">
                    Open guide
                    <HiArrowRight className="size-4" />
                  </span>
                </button>
              )}
            </div>

            <SheetClose asChild>
              <button
                className="mt-4 inline-flex w-full justify-center rounded-xl border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                onClick={() => setOpen(false)}
              >
                Close GyraHub
              </button>
            </SheetClose>
          </div>

          {guideOpen && (
            <div className="min-w-0 border-t border-border/50 bg-muted/30 px-3 py-4 md:w-[300px] md:border-l md:border-t-0 md:px-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">
                    Step-by-step guide
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Follow this path to keep your Human Passport score current.
                  </p>
                </div>
                <button
                  className="inline-flex size-9 items-center justify-center rounded-full border border-border/70 bg-background/80 text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setGuideOpen(false)}
                  type="button"
                >
                  <HiChevronLeft className="size-4" />
                </button>
              </div>

              <div className="space-y-3">
                {gyraHubSteps.map((step, index) => (
                  <div key={step.title} className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background text-base font-semibold shadow-sm">
                      {index + 1}
                    </div>
                    <div className="pt-0.5">
                      <p className="font-medium text-foreground">
                        {step.title}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-[1.1rem] border border-emerald-200/60 bg-background/80 p-3 dark:border-emerald-900/80">
                <div className="flex items-center gap-3">
                  {isSubmittingPassport || scoreQuery.isRefetching ? (
                    <HiArrowPath className="size-5 animate-spin text-emerald-600" />
                  ) : (
                    <HiCheckCircle className="size-5 text-emerald-600" />
                  )}
                  <div>
                    <p className="font-medium text-foreground">
                      {isSubmittingPassport
                        ? "Submitting your Passport"
                        : scoreQuery.isRefetching
                        ? "Refreshing your score"
                        : "Ready to sync"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isSubmittingPassport
                        ? "Keep this panel open while your signature and submission complete."
                        : scoreQuery.isRefetching
                        ? "GyraHub is checking for the latest score update now."
                        : "When you earn new stamps, return here and sync your updated score."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
