"use client"

import { LuCheck, LuWallet, LuWaves } from "react-icons/lu"
import { useAccount } from "wagmi"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import type {
  LoopActionTooltip,
  LoopActionViewModel,
} from "./loop-section-types"

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
  const { isConnected } = useAccount()
  const isChecking = isConnected && model.status === "checking"
  const label = isConnected ? model.label : "Connect wallet to enter"
  const icon = !isConnected ? (
    <LuWallet className="size-4 shrink-0" />
  ) : model.status === "claimed" ? (
    <LuCheck className="size-4 shrink-0" />
  ) : undefined
  const buttonClassName = compact
    ? "min-h-10 min-w-[7.75rem] whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold tracking-normal"
    : "min-h-12 w-full rounded-full px-5 py-3 text-sm font-semibold tracking-[0.01em]"
  const statusClassName = compact
    ? "min-h-10 min-w-[7.75rem] px-3 py-1.5 text-xs"
    : "min-h-12 w-full px-5 py-3 text-sm"

  if (model.presentation === "neutral") {
    return (
      <div className={compact ? "inline-flex" : "w-full"}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              role="status"
              tabIndex={0}
              className={`${statusClassName} inline-flex cursor-help items-center justify-center gap-2 rounded-full bg-muted/45 font-semibold tracking-[0.01em] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
            >
              {model.status === "entered" ? (
                <LuCheck
                  className="size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
              ) : (
                <LuWaves
                  className="size-4 shrink-0 text-primary motion-safe:animate-pulse"
                  aria-hidden="true"
                />
              )}
              <span>{model.label}</span>
            </div>
          </TooltipTrigger>
          <StatusTooltipContent
            fallback={model.label}
            tooltip={model.tooltip}
          />
        </Tooltip>
      </div>
    )
  }

  if (model.presentation === "success") {
    return (
      <div className={compact ? "inline-flex" : "w-full"}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              role="status"
              tabIndex={0}
              className={`${statusClassName} inline-flex cursor-help items-center justify-center gap-2 rounded-full bg-primary/10 font-semibold tracking-[0.01em] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_20px_-18px_rgba(28,231,131,0.55)] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
            >
              <LuCheck
                className="size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span>{model.label}</span>
            </div>
          </TooltipTrigger>
          <StatusTooltipContent
            fallback={model.label}
            tooltip={model.tooltip}
          />
        </Tooltip>
      </div>
    )
  }

  return (
    <div className={compact ? "inline-flex" : "w-full"}>
      <Button
        chainId={chainId}
        onClick={model.execute}
        disabled={model.disabled}
        icon={icon}
        isLoading={model.isPending || isChecking}
        className={buttonClassName}
      >
        {label}
      </Button>
    </div>
  )
}

function StatusTooltipContent({
  fallback,
  tooltip,
}: {
  fallback: string
  tooltip?: LoopActionTooltip
}) {
  return (
    <TooltipContent className="w-max max-w-[calc(100vw-2rem)] text-left">
      <span className="block font-semibold">{tooltip?.title ?? fallback}</span>
      {tooltip?.description ? (
        <span className="mt-0.5 block text-popover-foreground/75">
          {tooltip.description}
        </span>
      ) : null}
    </TooltipContent>
  )
}
