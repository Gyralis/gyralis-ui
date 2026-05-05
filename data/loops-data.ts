import { Address } from "viem"

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
    id: 1,
    title: "1Hive Gardens",
    by: "1Hive",
    address: "0xB29018e60Cbdc1938C77d02c588c74c1B060C6B3",
    description:
      "Claim HNY tokens by being a member in 1Hive community on Gardnes.",
    token: "0x012270Fc0c65bE86FC87d9C0D5C8860b0103BA55",
    eligibilityLogoUrl: "/gardens-logo.png",
    shieldScore: "Passport Score +15",
    eligibility: "1Hive Membership",
    chainBadgeColor: "bg-custom-green",
    shieldAccount: "0xtt...453",
    shieldValue: "26",
    super: false,
    chainId: 100,
    chainName: "Gnosis",
    eligibilityProvider: "garden_1hive",
    passportMinScore: -1,
    enabled: true,
  },
  {
    id: 2,
    title: "Blockscout Merits",
    by: "Blockscout",
    address: "0xFD4B87a83acde1f54A1AC986b33BE20154cDDf70",
    description: "Sign up and Redeem Gyralis offer in Blockscout Merits.",
    token: "0x012270Fc0c65bE86FC87d9C0D5C8860b0103BA55",
    eligibilityLogoUrl: "/blockscout-logo.png",
    shieldScore: "Passport Score +15",
    eligibility: "Gyralis Offer Redemption",
    chainBadgeColor: "bg-custom-green",
    shieldAccount: "0xtt...453",
    shieldValue: "26",
    super: false,
    chainId: 100,
    chainName: "Gnosis",
    eligibilityProvider: "blockscout",
    passportMinScore: -1,
    enabled: true,
  },
  {
    id: 3,
    title: "1Hive Gardens",
    by: "1Hive",
    address: "0x8995641fb3E452bC1359E79A738a6DE556015696",
    description:
      "Claim HNY tokens by being a member in 1Hive community on Gardnes.",
    token: "0x71850b7E9Ee3f13Ab46d67167341E4bDc905Eef9",
    eligibilityLogoUrl: "/gardens-logo.png",
    shieldScore: "Passport Score +15",
    eligibility: "1Hive Membership",
    chainBadgeColor: "bg-custom-green",
    shieldAccount: "0xtt...453",
    shieldValue: "26",
    super: false,
    chainId: 100,
    chainName: "Gnosis",
    eligibilityProvider: "garden_1hive",
    passportMinScore: -1,
    enabled: true,
  },
  {
    id: 4,
    title: "Blockscout Merits",
    by: "Blockscout",
    address: "0xaB25dBaFD11b1eb606B2455Eecec67e6746E409b",
    description: "Sign up and Redeem Gyralis offer in Blockscout Merits.",
    token: "0x71850b7E9Ee3f13Ab46d67167341E4bDc905Eef9",
    eligibilityLogoUrl: "/blockscout-logo.png",
    shieldScore: "Passport Score +15",
    eligibility: "Gyralis Offer Redemption",
    chainBadgeColor: "bg-custom-green",
    shieldAccount: "0xtt...453",
    shieldValue: "26",
    super: false,
    chainId: 100,
    chainName: "Gnosis",
    eligibilityProvider: "blockscout",
    passportMinScore: -1,
    enabled: true,
  },
]
