import Link from "next/link"
import { LuArrowLeft } from "react-icons/lu"

import { cn } from "@/lib/utils"

type BackToLoopsLinkProps = {
  className?: string
}

export function BackToLoopsLink({ className }: BackToLoopsLinkProps) {
  return (
    <Link
      href="/loops"
      className={cn(
        "inline-flex w-fit items-center gap-2 rounded-full border border-border/80 bg-background/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_14px_32px_-26px_rgba(15,23,42,0.32)] backdrop-blur-xl transition-colors hover:border-primary/35 hover:bg-primary/[0.08] hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        className
      )}
    >
      <LuArrowLeft className="size-4" aria-hidden="true" />
      <span>Loops</span>
    </Link>
  )
}
