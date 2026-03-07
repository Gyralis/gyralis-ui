export type EligibilityKey = "gardens_1hive" | "blockscout_merits"

export interface EligibilityConfig {
  key: EligibilityKey
  label: string
  apiPath: string
}

export const ELIGIBILITY_REGISTRY: Record<EligibilityKey, EligibilityConfig> = {
  gardens_1hive: {
    key: "gardens_1hive",
    label: "1Hive member Gardens v2",
    apiPath: "/api/garden-1hive",
  },

  blockscout_merits: {
    key: "blockscout_merits",
    label: "Blockscout Merits",
    apiPath: "/api/blockscout",
  },
}
