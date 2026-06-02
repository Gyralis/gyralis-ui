import { Address } from "viem"

import type { LoopContractType } from "@/lib/contracts/loop-contracts"

export type LoopEligibilityProvider = "garden_1hive" | "blockscout"

export interface LoopCardData {
  id: number
  title: string
  by: string
  address?: Address
  description: string
  token: Address
  eligibilityLogoUrl?: string

  shieldScore: string
  eligibility: string
  chainBadgeColor: string
  shieldAccount?: string
  shieldValue?: string
  registeredAddresses?: { address: string; claimed: boolean }[]
  super?: boolean
  contractType: LoopContractType
  chainId: number
  chainName: string
  eligibilityProvider: LoopEligibilityProvider
  passportMinScore: number
  enabled: boolean
  claimAmount?: string // New: Amount user can claim
  balanceNumeri?: number // New: Numeric balance for calculations
  currency?: string // New: Currency symbol
}

export const LoopCardsData: LoopCardData[] = [
  {
    id: 3,
    title: "1Hive Gardens",
    by: "1Hive",
    address: "0x8995641fb3E452bC1359E79A738a6DE556015696",
    description:
      "Claim HNY token if you meet the 1Hive membership requirement.",
    token: "0x71850b7E9Ee3f13Ab46d67167341E4bDc905Eef9",
    eligibilityLogoUrl: "/gardens-logo.png",
    shieldScore: "Passport Score +15",
    eligibility: "1Hive membership required",
    chainBadgeColor: "bg-custom-green",
    shieldAccount: "0xtt...453",
    shieldValue: "26",
    super: false,
    contractType: "loop",
    chainId: 100,
    chainName: "Gnosis",
    eligibilityProvider: "garden_1hive",
    passportMinScore: 15,
    enabled: true,
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
    eligibility: "Gyralis offer redemption required",
    chainBadgeColor: "bg-custom-green",
    shieldAccount: "0xtt...453",
    shieldValue: "26",
    super: false,
    contractType: "loop",
    chainId: 100,
    chainName: "Gnosis",
    eligibilityProvider: "blockscout",
    passportMinScore: 15,
    enabled: true,
  },
  {
    id: 5,
    title: "Blockscout Merits",
    by: "Gyralis Team",
    address: "0xE32da07a1B6D8776c186A777A23069efbC34D734",
    description:
      "The first SuperLoop now receiving live SUP flow on Base. Eligible loopers can enter and claim each distribution period.",
    token: "0xa69f80524381275A7fFdb3AE01c54150644c8792",
    eligibilityLogoUrl: "/blockscout-logo.png",
    shieldScore: "Passport Score 15+",
    eligibility: "Gyralis offer redemption required",
    chainBadgeColor: "bg-custom-green",
    shieldAccount: "0xtt...453",
    shieldValue: "26",
    super: true,
    contractType: "superLoop",
    chainId: 8453,
    chainName: "Base",
    eligibilityProvider: "blockscout",
    passportMinScore: 0,
    enabled: true,
  },
]
