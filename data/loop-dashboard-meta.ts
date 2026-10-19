import type { DashboardLoopKey, DashboardLoopMeta } from "@/lib/dashboard/types"

export const defaultDashboardLoopKeys = [
  "1hive",
  "blockscout",
  "markee-gardens",
  "true-loopers",
] as const satisfies readonly DashboardLoopKey[]

export const loopDashboardMeta: Record<DashboardLoopKey, DashboardLoopMeta> = {
  "true-loopers": {
    loopKey: "true-loopers",
    contractType: "superLoop",
    title: "True Loopers",
    shortTitle: "True Loopers",
    by: "Gyralis",
    description: "Streaming rewards for active Gyralis participants.",
    logoSrc: "/gyralis-logo.svg",
    brandColor: "#8C4BFF",
    chainName: "Base",
    tokenSymbol: "USDCx",
    isVisibleInDashboard: true,
  },
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
  "markee-gardens": {
    loopKey: "markee-gardens",
    contractType: "superLoop",
    title: "Markee Gardens",
    shortTitle: "Markee",
    by: "Markee Cooperative",
    description:
      "Streaming rewards for eligible members of the Markee Gardens community.",
    logoSrc: "/markee-logo.png",
    brandColor: "#22C55E",
    chainName: "Base",
    tokenSymbol: "MARKEE",
    isVisibleInDashboard: true,
  },
}
