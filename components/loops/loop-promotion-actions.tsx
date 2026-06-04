"use client"

import type React from "react"
import { useMemo, useState } from "react"
import Link from "next/link"
import { FaXTwitter } from "react-icons/fa6"
import { LuCheck, LuCopy, LuExternalLink, LuTrophy, LuX } from "react-icons/lu"

import { absoluteUrl, cn } from "@/lib/utils"

const GYRALIS_X_URL = "https://x.com/gyralis_xyz"

type LoopShareContext = {
  claimAmountLabel?: string
  loopId?: number
  loopTitle?: string
  isSuper?: boolean
}

interface LoopPromotionActionsProps extends LoopShareContext {
  chainName?: string
  storageKey: string
  onDismiss?: () => void
}

export function getLoopShareUrl(loopId?: number) {
  return absoluteUrl(loopId ? `/loops#loop-card-${loopId}` : "/loops")
}

export function getLoopShareText({
  claimAmountLabel,
  loopTitle,
  isSuper,
}: LoopShareContext) {
  const loopKind = isSuper ? "SuperLoop" : "Loop"
  const loopLabel = loopTitle ? `${loopTitle} ${loopKind}` : loopKind

  return claimAmountLabel
    ? `I just claimed ${claimAmountLabel} from the ${loopLabel} on Gyralis. Prove. Claim. Repeat.`
    : `I just claimed from the ${loopLabel} on Gyralis. Prove. Claim. Repeat.`
}

export function getLoopXShareIntentUrl(context: LoopShareContext) {
  const params = new URLSearchParams({
    text: getLoopShareText(context),
    url: getLoopShareUrl(context.loopId),
  })

  return `https://twitter.com/intent/tweet?${params.toString()}`
}

export function LoopPromotionActions({
  chainName,
  claimAmountLabel,
  loopId,
  loopTitle,
  isSuper,
  storageKey,
  onDismiss,
}: LoopPromotionActionsProps) {
  const [copied, setCopied] = useState(false)
  const shareUrl = useMemo(() => getLoopShareUrl(loopId), [loopId])
  const xShareIntentUrl = useMemo(
    () =>
      getLoopXShareIntentUrl({
        claimAmountLabel,
        loopId,
        loopTitle,
        isSuper,
      }),
    [claimAmountLabel, isSuper, loopId, loopTitle]
  )

  const claimContext = [
    claimAmountLabel,
    loopTitle ? `${loopTitle}${isSuper ? " SuperLoop" : " Loop"}` : undefined,
    chainName,
  ]
    .filter(Boolean)
    .join(" · ")

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch (error) {
      console.error("Unable to copy loop share link:", error)
    }
  }

  const handleDismiss = () => {
    try {
      window.localStorage.setItem(storageKey, "dismissed")
    } catch (error) {
      console.error("Unable to store promotion dismissal:", error)
    }

    onDismiss?.()
  }

  return (
    <div className="mt-3 rounded-2xl border border-primary/30 bg-primary/10 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground">Claim confirmed</p>
          {claimContext ? (
            <p className="mt-1 text-xs font-medium leading-5 text-muted-foreground">
              {claimContext}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          aria-label="Dismiss promotion actions"
          onClick={handleDismiss}
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background/70 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <LuX className="size-4" />
        </button>
      </div>

      <div className="mt-4 grid gap-2">
        <a
          href={xShareIntentUrl}
          target="_blank"
          rel="noreferrer"
          className="tamagotchi-button flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold"
        >
          <FaXTwitter className="size-4" />
          Share on X
        </a>
        <div className="grid gap-2 sm:grid-cols-3">
          <PromotionActionButton onClick={handleCopy}>
            {copied ? (
              <LuCheck className="size-4 text-primary" />
            ) : (
              <LuCopy className="size-4" />
            )}
            {copied ? "Copied" : "Copy link"}
          </PromotionActionButton>
          <Link href="/leaderboard" className={secondaryActionClassName}>
            <LuTrophy className="size-4" />
            View leaderboard
          </Link>
          <a
            href={GYRALIS_X_URL}
            target="_blank"
            rel="noreferrer"
            className={secondaryActionClassName}
          >
            <LuExternalLink className="size-4" />
            Follow Gyralis
          </a>
        </div>
      </div>
    </div>
  )
}

const secondaryActionClassName =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"

function PromotionActionButton({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode
  className?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(secondaryActionClassName, className)}
    >
      {children}
    </button>
  )
}
