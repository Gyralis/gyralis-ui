"use client"

import { useMemo } from "react"
import type { LoopCardData } from "@/data/loops-data"

import { useClaimedUsers } from "@/lib/hooks/app/use-claimed-users"
import { usePeriodLogBlockRange } from "@/lib/hooks/app/use-period-log-block-range"
import { useRegisteredUsers } from "@/lib/hooks/app/use-registered-users"
import type {
  LoopDistributionViewData,
  LoopPeriodViewData,
  SectionState,
} from "@/components/loops/sections/loop-section-types"
import type { LoopersViewData } from "@/components/loops/sections/loopers-section"

import { LoopCardShell } from "../loop-card-shell"
import { LoopClaim } from "../loop-claim"
import { useLoopSettingsDetails } from "../loop-settings"

interface LegacySuperLoopCardProps {
  loop: LoopCardData
}

export function LegacySuperLoopCard({ loop }: LegacySuperLoopCardProps) {
  const settings = useLoopSettingsDetails({
    address: loop.address ?? "0x",
    chainId: loop.chainId,
    contractType: loop.contractType,
    isSuper: true,
  })
  const participation = useLegacySuperLoopParticipation({
    address: loop.address ?? "0x",
    chainId: loop.chainId,
    currentPeriod: settings.currentPeriod,
    firstPeriodStart: settings.settings?.firstPeriodStart,
    periodLength: settings.settings?.periodLength,
    refreshKey: settings.modalRefreshKey,
  })
  const distribution: SectionState<LoopDistributionViewData> =
    settings.isLoading
      ? { status: "loading" }
      : {
          status: "ready",
          data: {
            balanceDetail: settings.balanceDetail,
            balanceDetailLabel: settings.balanceDetailLabel,
            detail: settings.distributionDetail,
            tooltip: settings.distributionTooltip,
            value: settings.distributionLabel,
            valueUnit: settings.distributionUnit,
          },
        }
  const period: SectionState<LoopPeriodViewData> = settings.isLoading
    ? { status: "loading" }
    : {
        status: "ready",
        data: {
          nextPeriodStart: settings.nextPeriodStart,
          timerTitle: settings.timerTitle,
        },
      }
  const loopers: SectionState<LoopersViewData> = participation.isLoading
    ? { status: "loading" }
    : { status: "ready", data: participation.data }

  return (
    <LoopCardShell
      action={
        <LoopClaim
          address={loop.address ?? "0x"}
          chainId={loop.chainId}
          contractType={loop.contractType}
          currentPeriod={settings.currentPeriod}
          eligibilityProvider={loop.eligibilityProvider}
          onStatusChange={settings.handleClaimStatusChange}
          onSuccess={settings.handleClaimSuccess}
        />
      }
      distribution={distribution}
      isSuper
      loop={loop}
      loopers={loopers}
      modal={{
        currentPeriod: settings.currentPeriod,
        firstPeriodStart: settings.settings?.firstPeriodStart,
        loopContractType: loop.contractType,
        loopToken: settings.settings?.token,
        periodLength: settings.settings?.periodLength,
        refreshKey: settings.modalRefreshKey,
      }}
      period={period}
    />
  )
}

function useLegacySuperLoopParticipation({
  address,
  chainId,
  currentPeriod,
  firstPeriodStart,
  periodLength,
  refreshKey,
}: {
  address: `0x${string}`
  chainId: number
  currentPeriod?: bigint
  firstPeriodStart?: bigint
  periodLength?: bigint
  refreshKey: number
}) {
  const rangesReady =
    currentPeriod != null && firstPeriodStart != null && periodLength != null
  const registerWindowPeriod =
    currentPeriod != null && currentPeriod > 0n ? currentPeriod - 1n : 0n
  const registrationRange = usePeriodLogBlockRange({
    chainId,
    enabled: rangesReady,
    firstPeriodStart,
    periodLength,
    windowPeriod: registerWindowPeriod,
  })
  const claimRange = usePeriodLogBlockRange({
    chainId,
    enabled: rangesReady,
    firstPeriodStart,
    periodLength,
    windowPeriod: currentPeriod,
  })
  const registrationBlockRange =
    rangesReady &&
    registrationRange.fromBlock != null &&
    registrationRange.toBlock != null
      ? {
          fromBlock: registrationRange.fromBlock,
          toBlock: registrationRange.toBlock,
        }
      : undefined
  const claimBlockRange =
    rangesReady && claimRange.fromBlock != null && claimRange.toBlock != null
      ? {
          fromBlock: claimRange.fromBlock,
          toBlock: claimRange.toBlock,
        }
      : undefined
  const registration = useRegisteredUsers(
    address,
    chainId,
    currentPeriod,
    refreshKey,
    registrationBlockRange != null,
    registrationBlockRange
  )
  const claims = useClaimedUsers(
    address,
    chainId,
    currentPeriod,
    refreshKey,
    claimBlockRange != null,
    claimBlockRange
  )
  const data = useMemo(() => {
    const claimedUsers = new Set(claims.users.map((user) => user.toLowerCase()))
    const claimedCount = registration.users.filter((user) =>
      claimedUsers.has(user.toLowerCase())
    ).length
    const registeredCount = registration.users.length
    const claimRate =
      registeredCount > 0
        ? Math.round((claimedCount / registeredCount) * 100)
        : 0

    return {
      claimedCount,
      claimRate: Math.max(0, Math.min(claimRate, 100)),
      registeredCount,
    }
  }, [claims.users, registration.users])

  return {
    data,
    isLoading:
      registrationRange.loading ||
      claimRange.loading ||
      registration.loading ||
      claims.loading,
  }
}
