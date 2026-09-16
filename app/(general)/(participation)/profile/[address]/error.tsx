"use client"

import { useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Card } from "@/components/ui/card"

export default function ProfileError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function retry() {
    startTransition(() => {
      router.refresh()
      reset()
    })
  }

  return (
    <div className="px-4 py-8 sm:py-12">
      <Card className="mx-auto w-full max-w-6xl rounded-3xl border-border/70 bg-card p-8 text-center">
        <div role="alert">
          <h1 className="font-heading text-2xl font-bold text-foreground">
            We couldn’t load this profile.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Please try again.
          </p>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={retry}
            disabled={isPending}
            aria-busy={isPending}
            className="tamagotchi-button min-h-12 px-6 text-sm disabled:cursor-wait disabled:opacity-60"
          >
            {isPending ? "Trying again…" : "Try again"}
          </button>
          <Link
            href="/loops"
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Back to loops
          </Link>
        </div>
      </Card>
    </div>
  )
}
