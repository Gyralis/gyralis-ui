"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import { FaChartLine, FaLayerGroup, FaUsers } from "react-icons/fa"
import { LuInfo } from "react-icons/lu"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ParticipationUserPanel } from "@/components/loops/participation-user-panel"
import { HighlightStatCard } from "@/components/stats/highlight-stat-card"

export interface ParticipationProfileData {
  rank: number
  percentile: string
  identityLabel: string
  streak: number
  tierLabel: string
  claims: number
  points: number
  earnings: number
  earningsSymbol: string
  activeLoops: number
}

export interface EcosystemMetricData {
  label: string
  value: string
}

interface ParticipationProfileProps {
  profile: ParticipationProfileData
  ecosystemMetrics: readonly [
    EcosystemMetricData,
    EcosystemMetricData,
    EcosystemMetricData,
    EcosystemMetricData
  ]
  statsLastUpdatedLabel: string
  preview?: boolean
}

export function ParticipationProfile({
  profile: _profile,
  ecosystemMetrics,
  statsLastUpdatedLabel,
  preview: _preview = false,
}: ParticipationProfileProps) {
  const [claims, uniqueUsers, claimRate, activeLoops] = ecosystemMetrics

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        mounted,
        openChainModal,
        openConnectModal,
        authenticationStatus,
      }) => {
        const ready = mounted && authenticationStatus !== "loading"
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated")

        return (
          <div
            id="participation-profile"
            className="relative mx-auto w-full max-w-7xl rounded-full sm:border sm:border-border bg-none sm:bg-card px-3 py-2 text-card-foreground md:px-5 md:py-2.5 md:pr-10"
            style={{
              opacity: ready ? 1 : 0.65,
              pointerEvents: ready ? "auto" : "none",
            }}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label="Stats last updated"
                    className="absolute right-3 top-1/2 z-10 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/[0.08] hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    <LuInfo className="size-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" align="end">
                  Stats last updated: {statsLastUpdatedLabel}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="relative grid grid-cols-2 items-stretch gap-3.5 md:grid-cols-[1.08fr_auto_1.08fr_2.2fr_1.08fr_auto_1.08fr] md:gap-4.5">
              <HighlightStatCard
                title={uniqueUsers.label}
                value={uniqueUsers.value}
                icon={FaUsers}
                size="compact"
              />
              <div
                className="hidden h-10 w-px self-center justify-self-center bg-border md:block"
                aria-hidden="true"
              />
              <HighlightStatCard
                title={claims.label}
                value={claims.value}
                icon={FaLayerGroup}
                size="compact"
              />

              <ParticipationUserPanel
                address={account?.address}
                connected={connected ?? false}
                unsupported={Boolean(chain?.unsupported)}
                onConnect={openConnectModal}
                onSwitchNetwork={openChainModal}
                ready={ready}
              />

              <HighlightStatCard
                title={claimRate.label}
                value={claimRate.value}
                icon={FaChartLine}
                size="compact"
              />
              <div
                className="hidden h-10 w-px self-center justify-self-center bg-border md:block"
                aria-hidden="true"
              />
              <HighlightStatCard
                title={activeLoops.label}
                value={activeLoops.value}
                icon={FaLayerGroup}
                size="compact"
              />
            </div>
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}
