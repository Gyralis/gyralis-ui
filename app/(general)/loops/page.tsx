import { unstable_noStore as noStore } from "next/cache"

import { LoopsPageClient } from "@/components/loops/loops-page-client"
import type { EcosystemMetricData } from "@/components/loops/participation-profile"
import { getDashboardPageData } from "@/lib/dashboard"

function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value)
}

function formatPercent(value: number | null): string {
  if (value == null) return "N/A"
  return `${(Math.ceil(value * 10) / 10).toFixed(1)}%`
}

type LoopsHeaderData = {
  metrics: [
    EcosystemMetricData,
    EcosystemMetricData,
    EcosystemMetricData,
    EcosystemMetricData
  ]
  updatedAtLabel: string
}

function formatUpdatedAt(value: string | null | undefined): string {
  if (!value) return "Unknown"

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value))
}

async function getLoopsHeaderData(): Promise<LoopsHeaderData> {
  const dashboard = await getDashboardPageData()
  const totalClaims = dashboard.overview.totalClaims
  const totalRegistrations = dashboard.overview.totalRegistrations
  const claimRate = dashboard.overview.claimParticipationRatePercent
  const uniqueUsers = dashboard.overview.globalUniqueRegisteredUsers
  return {
    metrics: [
      { value: formatCount(uniqueUsers), label: "Unique Users" },
      { value: formatCount(totalClaims), label: "Claims" },
      { value: formatPercent(claimRate), label: "Claim rate" },
      {
        value: formatCount(dashboard.loopSummaries.length),
        label: "Active Loop",
      },
    ],
    updatedAtLabel: formatUpdatedAt(dashboard.generatedAt),
  }
}

export default async function LoopsPage() {
  noStore()

  const { metrics: ecosystemMetrics, updatedAtLabel } =
    await getLoopsHeaderData()

  return (
    <LoopsPageClient
      ecosystemMetrics={ecosystemMetrics}
      statsLastUpdatedLabel={updatedAtLabel}
    />
  )
}
