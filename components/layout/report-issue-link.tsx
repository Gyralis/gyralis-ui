"use client"

import { LuBug } from "react-icons/lu"

import { LinkComponent } from "@/components/shared/link-component"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const REPORT_ISSUE_DISCORD_URL = "https://discord.gg/xfEgE9AQ"
const REPORT_ISSUE_LABEL = "Report a bug in Discord"

export function ReportIssueLink() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <LinkComponent
            aria-label={REPORT_ISSUE_LABEL}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-input bg-background text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            href={REPORT_ISSUE_DISCORD_URL}
            isExternal
          >
            <LuBug className="size-5" />
          </LinkComponent>
        </TooltipTrigger>
        <TooltipContent>{REPORT_ISSUE_LABEL}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
