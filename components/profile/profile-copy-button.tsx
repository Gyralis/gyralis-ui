"use client"

import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"

interface ProfileCopyButtonProps {
  value: string
  children: React.ReactNode
  className?: string
}

export function ProfileCopyButton({
  value,
  children,
  className,
}: ProfileCopyButtonProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timeout = window.setTimeout(() => setCopied(false), 1800)
    return () => window.clearTimeout(timeout)
  }, [copied])

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value)
        setCopied(true)
      }}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-full border border-border/80 bg-background/70 px-4 text-xs font-semibold text-muted-foreground transition hover:border-primary/60 hover:text-primary",
        className
      )}
    >
      {copied ? "Copied" : children}
    </button>
  )
}
