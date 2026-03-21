"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { LuBadgeCheck, LuClock3, LuShield } from "react-icons/lu"
import { FiRefreshCcw } from "react-icons/fi"

import { useToast } from "@/lib/hooks/use-toast"
import { useAccount } from "wagmi"
import { useGetScore } from "@/integrations/gitcoin-passport/hooks/use-get-score"
import { HAS_NOT_SUBMITTED_PASSPORT_YET_ERROR } from "@/integrations/gitcoin-passport/utils/constants"
import { useSubmitPassport } from "@/integrations/gitcoin-passport/hooks/use-submit-passport"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

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
  actionLabel?: string
  score?: string
  lastSubmittedAt?: string | null
  details?: string | null
  actionInProgress?: boolean
  onAction: (() => Promise<void>) | null
  href: string
}

const statusClassMap: Record<IdentityVerificationStatus, string> = {
  verified:
    "text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300",
  "action-needed":
    "text-amber-700 bg-amber-100 dark:bg-amber-950 dark:text-amber-300",
  error: "text-rose-700 bg-rose-100 dark:bg-rose-950 dark:text-rose-300",
  loading:
    "text-sky-700 bg-sky-100 dark:bg-sky-950 dark:text-sky-300",
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
  const date = new Date(Number(timestamp))
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

const truncateAddress = (address: string) =>
  `${address.slice(0, 8)}…${address.slice(-6)}`

const IdentityHubMethodCard = ({
  method,
  onRefresh,
}: {
  method: IdentityVerificationMethod
  onRefresh: () => void
}) => {
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <LuShield className="size-4 shrink-0 text-muted-foreground" />
            <h4 className="truncate text-sm font-semibold">{method.title}</h4>
          </div>
          <p className="text-sm text-muted-foreground">{method.summary}</p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-1 text-xs font-semibold",
            statusClassMap[method.status]
          )}
        >
          {statusLabelMap[method.status]}
        </span>
      </div>

      <div className="mb-3 grid gap-2 text-sm text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>Passport score:</span>
          {method.score ? (
            <span className="font-mono font-semibold text-foreground">
              {method.score}
            </span>
          ) : method.status === "loading" ? (
            <Skeleton className="h-4 w-16" />
          ) : (
            <span>—</span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span>Last submitted:</span>
          <span>{formatScoreDate(method.lastSubmittedAt) ?? "—"}</span>
        </div>
        {method.details && (
          <p className="rounded-lg bg-background p-2 text-xs text-muted-foreground">
            {method.details}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {method.onAction && method.actionLabel && (
          <Button
            onClick={method.onAction}
            isLoading={method.actionInProgress}
            disabled={method.actionInProgress}
          >
            {method.actionLabel}
          </Button>
        )}
        <Button variant="secondary" onClick={onRefresh}>
          <FiRefreshCcw className="size-4" />
          Refresh
        </Button>
        <Link
          href={method.href}
          className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          Details
        </Link>
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
  const [sheetSide, setSheetSide] = useState<"right" | "bottom">("right")
  const { toast } = useToast()

  const scoreQuery = useGetScore({
    enabled: open,
  })
  const { submitPassport, isLoading: isSubmittingPassport } = useSubmitPassport()

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
          summary: "Identity reputation source based on wallet-linked verifications.",
          status: "disconnected" as const,
          details: "Connect your wallet to load score and verification status.",
          href: "/integration/gitcoin-passport",
          onAction: null,
          actionInProgress: false,
        },
      ]
    }

    if (scoreQuery.isLoading || scoreQuery.isRefetching) {
      return [
        {
          id: "passport",
          title: "Gitcoin Passport",
          summary: "Loading your verification score...",
          status: "loading" as const,
          href: "/integration/gitcoin-passport",
          onAction: null,
          actionInProgress: isSubmittingPassport,
          details: null,
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
              "Your score has not been submitted in this scorer yet.",
            status: "action-needed" as const,
            score: "N/A",
            details: "Submit your passport to request a score calculation.",
            href: "/integration/gitcoin-passport",
            actionLabel: "Submit passport for scoring",
            onAction: submitPassportAndRefresh,
            actionInProgress: isSubmittingPassport,
          },
        ]
      }

      return [
        {
          id: "passport",
          title: "Gitcoin Passport",
          summary: "We could not load the Passport status.",
          status: "error" as const,
          href: "/integration/gitcoin-passport",
          details: errorMessage,
          onAction: null,
          actionInProgress: false,
        },
      ]
    }

    const score = scoreQuery.data?.score
    if (!score) {
      return [
        {
          id: "passport",
          title: "Gitcoin Passport",
          summary: "Score is not available yet for this wallet.",
          status: "action-needed" as const,
          href: "/integration/gitcoin-passport",
          actionLabel: "Submit passport for scoring",
          onAction: submitPassportAndRefresh,
          actionInProgress: isSubmittingPassport,
        },
      ]
    }

    const scoreValue = Number.parseFloat(score)
    return [
      {
        id: "passport",
        title: "Gitcoin Passport",
        summary: "Identity reputation based on verified credentials.",
        status: Number.isFinite(scoreValue) ? "verified" : "error",
        score: `${scoreValue.toFixed(2)}`,
        lastSubmittedAt: scoreQuery.data?.last_score_timestamp,
        href: "/integration/gitcoin-passport",
        details:
          "Tip: refresh after claiming new stamps to update your score.",
        actionLabel: undefined,
        onAction: null,
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
            compact
              ? "h-9 px-3 text-xs"
              : "h-10 px-4 md:px-5",
            className
          )}
        >
          <LuClock3 className="size-4" />
          <span>Id-Hub</span>
        </button>
      </SheetTrigger>
      <SheetContent side={sheetSide} className="w-full sm:max-w-lg">
        <SheetHeader className="pr-8">
          <SheetTitle>Identity Hub</SheetTitle>
          <p className="text-sm text-muted-foreground">
            Wallet identity and verification snapshot. Add more methods here over
            time as they come online.
          </p>
          <div className="mt-2 rounded-lg border border-border bg-muted/40 p-3 text-sm">
            <span className="font-medium">Wallet</span>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-muted-foreground">
              {address ? (
                <>
                  <LuBadgeCheck className="size-4 text-emerald-500" />
                  <span className="font-mono">{truncateAddress(address)}</span>
                </>
              ) : (
                <span>Not connected</span>
              )}
            </div>
          </div>
        </SheetHeader>

        <Separator className="my-4" />

        <div className="space-y-3">
          {methods.map((method) => (
            <IdentityHubMethodCard
              key={method.id}
              method={{
                ...method,
          score: method.score ?? undefined,
              }}
              onRefresh={() => {
                if (address) void scoreQuery.refetch()
              }}
            />
          ))}
        </div>

        <SheetClose asChild>
          <button
            className="mt-6 inline-flex w-full justify-center rounded-md border border-border px-4 py-2 text-sm"
            onClick={() => setOpen(false)}
          >
            Close
          </button>
        </SheetClose>
      </SheetContent>
    </Sheet>
  )
}
