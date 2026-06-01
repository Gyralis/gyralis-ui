import type { DashboardLoopKey, DashboardLoopMeta } from "@/lib/dashboard/types"

export const defaultDashboardLoopKeys = [
  "1hive",
  "blockscout",
] as const satisfies readonly DashboardLoopKey[]

export const loopDashboardMeta: Record<DashboardLoopKey, DashboardLoopMeta> = {
  "1hive": {
    loopKey: "1hive",
    contractType: "loop",
    title: "1Hive Gardens",
    shortTitle: "1Hive",
    by: "1Hive",
    description:
      "Claim HNY token if you meet the 1Hive membership requirement.",
    logoSrc: "/gardens-logo.png",
    brandColor: "#22C55E",

    chainName: "Gnosis",
    tokenSymbol: "HNY",
    isVisibleInDashboard: true,
  },
  blockscout: {
    loopKey: "blockscout",
    contractType: "loop",
    title: "Blockscout Merits",
    shortTitle: "Blockscout",
    by: "Blockscout",
    description:
      "Claim HNY token if you redeem the Gyralis offer in Blockscout Merits.",
    logoSrc: "/blockscout-logo.png",
    brandColor: "#2C7BE5",
    chainName: "Gnosis",
    tokenSymbol: "HNY",
    isVisibleInDashboard: true,
  },
  "test-superloops": {
    loopKey: "test-superloops",
    contractType: "superLoop",
    title: "TEST SUPERLOOPS",
    shortTitle: "Superloops",
    by: "Gyralis Team",
    description:
      "The first SuperLoop now receiving live SUP flow on Base for eligible loopers.",
    logoSrc: "/blockscout-logo.png",
    brandColor: "#F97316",
    chainName: "Base",
    tokenSymbol: "SUP",
    isVisibleInDashboard: false,
  },
}
