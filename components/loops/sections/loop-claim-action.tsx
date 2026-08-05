"use client"

import { LuCheck } from "react-icons/lu"

import { Button } from "@/components/ui/button"

import type { LoopActionViewModel } from "./loop-section-types"

interface LoopClaimActionProps {
  chainId: number
  compact?: boolean
  model: LoopActionViewModel
}

export function LoopClaimAction({
  chainId,
  compact = false,
  model,
}: LoopClaimActionProps) {
  const buttonClassName = compact
    ? "min-h-10 min-w-[7.75rem] whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold tracking-normal"
    : "min-h-12 w-full rounded-full px-5 py-3 text-sm font-semibold tracking-[0.01em]"

  return (
    <div className={compact ? "inline-flex" : "w-full"}>
      <Button
        chainId={chainId}
        onClick={model.execute}
        disabled={model.disabled}
        isLoading={model.isPending}
        className={buttonClassName}
      >
        {model.label}
        {model.status === "claimed" ? (
          <LuCheck className="size-4 shrink-0" />
        ) : null}
      </Button>
    </div>
  )
}
