import { Address } from "viem"

import type { LoopContractType } from "@/lib/contracts/loop-contracts"
import type { DashboardLoopKey } from "@/lib/dashboard/types"

export type LoopEligibilityProvider = "gardens" | "blockscout"
export type GardensCommunityKey = "1hive" | "markee"

export interface LoopCardData {
  id: number
  title: string
  by: string
  address?: Address
  description: string
  token: Address
  communityLogoUrl?: string
  eligibilityLogoUrl?: string

  shieldScore: string
  eligibility: string
  eligibilityUrl?: string
  chainBadgeColor: string
  shieldAccount?: string
  shieldValue?: string
  registeredAddresses?: { address: string; claimed: boolean }[]
  super?: boolean
  contractType: LoopContractType
  chainId: number
  chainName: string
  historyLoopKey: DashboardLoopKey
  eligibilityProvider: LoopEligibilityProvider
  gardensCommunity?: GardensCommunityKey
  passportMinScore: number
  enabled: boolean
  claimAmount?: string // New: Amount user can claim
  balanceNumeri?: number // New: Numeric balance for calculations
  currency?: string // New: Currency symbol
  rewardsSummary?: string
  statusLabel?: string
  sponsorName?: string
  sponsorLogoUrl?: string
  sponsorUrl?: string
}

export const LoopCardsData: LoopCardData[] = [
  {
    id: 5,
    title: "Markee",
    by: "Markee cooperative",
    address: "0x213310e1dbD6991cD488AB247c81faD82CD88E7A",
    description:
      "The first SuperLoop on Base, streaming rewards you can claim daily.",
    token: "0xa69f80524381275A7fFdb3AE01c54150644c8792",
    communityLogoUrl: "/markee-logo.png",
    eligibilityLogoUrl: "/gardens-logo.png",
    shieldScore: "Passport Score 15+",
    eligibility: "Join Markee community in Gardens required",
    eligibilityUrl:
      "https://app.gardens.fund/gardens/8453/0x9a378ebed22610e9fbb941fe27323fe00cdeebc6",
    chainBadgeColor: "bg-custom-green",
    shieldAccount: "0xtt...453",
    shieldValue: "26",
    super: true,
    contractType: "superLoop",
    chainId: 8453,
    chainName: "Base",
    historyLoopKey: "test-superloops",
    eligibilityProvider: "gardens",
    gardensCommunity: "markee",
    passportMinScore: 0,
    enabled: true,
    rewardsSummary: "1000 markee tokens",
    sponsorName: "Markee Cooperative",
    sponsorLogoUrl: "/markee-logo.png",
    sponsorUrl: "https://www.markee.xyz/",
  },
  {
    id: 3,
    title: "1Hive Gardens",
    by: "1Hive",
    address: "0x8995641fb3E452bC1359E79A738a6DE556015696",
    description:
      "Claim HNY token if you meet the 1Hive membership requirement.",
    token: "0x71850b7E9Ee3f13Ab46d67167341E4bDc905Eef9",
    communityLogoUrl: "/1Hive-logo.png",
    eligibilityLogoUrl: "/gardens-logo.png",
    shieldScore: "Passport Score +15",
    eligibility: "Join 1Hive community in Gardens required",
    eligibilityUrl:
      "https://app.gardens.fund/gardens/100/0xe2396fe2169ca026962971d3b2e373ba925b6257",
    chainBadgeColor: "bg-custom-green",
    shieldAccount: "0xtt...453",
    shieldValue: "26",
    super: false,
    contractType: "loop",
    chainId: 100,
    chainName: "Gnosis",
    historyLoopKey: "1hive",
    eligibilityProvider: "gardens",
    gardensCommunity: "1hive",
    passportMinScore: 0,
    enabled: true,
    sponsorName: "1Hive",
    sponsorLogoUrl: "/1Hive-logo.png",
    sponsorUrl: "https://1hive.org",
  },
  {
    id: 4,
    title: "Blockscout Merits",
    by: "Blockscout",
    address: "0xaB25dBaFD11b1eb606B2455Eecec67e6746E409b",
    description:
      "Claim HNY token if you redeem the Gyralis offer in Blockscout Merits.",
    token: "0x71850b7E9Ee3f13Ab46d67167341E4bDc905Eef9",
    eligibilityLogoUrl: "/blockscout-logo.png",
    shieldScore: "Passport Score +15",
    eligibility: "Redeem Gyralis offer in Blockscout Merits",
    eligibilityUrl: "https://merits.blockscout.com/?tab=spend",
    chainBadgeColor: "bg-custom-green",
    shieldAccount: "0xtt...453",
    shieldValue: "26",
    super: false,
    contractType: "loop",
    chainId: 100,
    chainName: "Gnosis",
    historyLoopKey: "blockscout",
    eligibilityProvider: "blockscout",
    passportMinScore: 15,
    enabled: true,
    sponsorName: "1Hive",
    sponsorLogoUrl: "/1Hive-logo.png",
    sponsorUrl: "https://1hive.org",
  },

  {
    id: 6,
    title: "True Loopers",
    by: "Gyralis",
    address: "0x5034003B12c05dE5D85bC58AD17360c77d13ae36",
    description: "Engage Daily. Earn Fairly with Gyralis superLoops.",
    token: "0xa69f80524381275A7fFdb3AE01c54150644c8792",
    eligibilityLogoUrl: "/gyralis-logo.svg",
    shieldScore: "Passport Score 15+",
    eligibility: "+50 Claims in Gyralis",
    chainBadgeColor: "bg-custom-green",
    shieldAccount: "0xtt...453",
    shieldValue: "26",
    super: false,
    contractType: "superLoop",
    chainId: 8453,
    chainName: "Base",
    historyLoopKey: "test-superloops",
    eligibilityProvider: "blockscout",
    passportMinScore: 0,
    enabled: false,
    rewardsSummary: "Up to $50 USDC",
    statusLabel: "Preparing",
    sponsorName: "TBA",
    sponsorLogoUrl: "/gyralis-logo.svg",
    sponsorUrl: "/",
  },
]
