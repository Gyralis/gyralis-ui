"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import { FaChartLine, FaLayerGroup, FaUsers } from "react-icons/fa"

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
  preview?: boolean
}

export function ParticipationProfile({
  profile: _profile,
  ecosystemMetrics,
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
            className="relative mx-auto w-full max-w-7xl rounded-full border border-border bg-card px-3 py-3 text-card-foreground md:px-5 md:py-4"
            style={{
              opacity: ready ? 1 : 0.65,
              pointerEvents: ready ? "auto" : "none",
            }}
          >
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
