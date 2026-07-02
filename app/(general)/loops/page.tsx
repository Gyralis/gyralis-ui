import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { unstable_noStore as noStore } from "next/cache"

import { LoopsPageClient } from "@/components/loops/loops-page-client"
import type { EcosystemMetricData } from "@/components/loops/participation-profile"

type RawLoopRegistrationCache = {
  loops?: Record<string, unknown>
  global?: {
    uniqueUsers?: unknown[]
    uniqueUserCount?: string | number | null
    uniqueClaimUserCount?: string | number | null
    uniqueClaimUsers?: unknown[]
    stats?: {
      totalRegistrationsCount?: string | number | null
      totalClaimsCount?: string | number | null
      claimRatePercent?: string | number | null
    }
  }
}

const CACHE_FILE_PATH = resolve(
  process.cwd(),
  "data/loop-registration-cache.json"
)

function parseCount(value: string | number | null | undefined): number {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value !== "string" || value.trim() === "") return 0

  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : 0
}

function parsePercent(
  value: string | number | null | undefined
): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value !== "string" || value.trim() === "") return null

  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : null
}

function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value)
}

function formatPercent(value: number | null): string {
  if (value == null) return "N/A"
  return `${(Math.ceil(value * 10) / 10).toFixed(1)}%`
}

async function getLoopsHeaderMetrics(): Promise<
  [
    EcosystemMetricData,
    EcosystemMetricData,
    EcosystemMetricData,
    EcosystemMetricData
  ]
> {
  const raw = await readFile(CACHE_FILE_PATH, "utf8")
  const cache = JSON.parse(raw) as RawLoopRegistrationCache

  const totalClaims = parseCount(cache.global?.stats?.totalClaimsCount)
  const totalRegistrations = parseCount(
    cache.global?.stats?.totalRegistrationsCount
  )
  const claimRate =
    parsePercent(cache.global?.stats?.claimRatePercent) ??
    (totalRegistrations > 0 ? (totalClaims / totalRegistrations) * 100 : null)
  const uniqueUsers =
    parseCount(cache.global?.uniqueUserCount) ||
    (Array.isArray(cache.global?.uniqueUsers)
      ? cache.global.uniqueUsers.length
      : 0)
  return [
    { value: formatCount(uniqueUsers), label: "Unique Users" },
    { value: formatCount(totalClaims), label: "Claims" },
    { value: formatPercent(claimRate), label: "Claim rate" },
    { value: "2", label: "Active Loop" },
  ]
}

export default async function LoopsPage() {
  noStore()

  const ecosystemMetrics = await getLoopsHeaderMetrics()

  return <LoopsPageClient ecosystemMetrics={ecosystemMetrics} />
}
