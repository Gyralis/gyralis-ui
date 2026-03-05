import { Address } from "viem"

export type LoopEligibilityProvider = "garden_1hive" | "blockscout"

export interface LoopCardData {
  id: number
  title: string
  by: string
  address?: Address
  description: string
  token: Address

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
  // {
  //   id: 1,
  //   title: "Title",
  //   by: "1Hive",
  //   address: "0x67BBeDE3F4D1ae743dB4Fe11287eE425a8CD3216",
  //   description: "loop and/or organization description",
  //   token: "0x71850b7E9Ee3f13Ab46d67167341E4bDc905Eef9",
  //   shieldScore: "Human Passport Score 15",
  //   eligibility: "1Hive member Gardensv2",
  //   chainBadgeColor: "bg-custom-green",

  //   super: false,
  //   chainId: 100,
  //   chainName: "Gnosis",
  //   eligibilityProvider: "garden_1hive",
  //   passportMinScore: 15,
  //   enabled: true,
  // },
  // {
  //   id: 2,
  //   title: "Blockscout Merits Program",
  //   by: "Blockscout",
  //   address: "0x67BBeDE3F4D1ae743dB4Fe11287eE425a8CD3216",
  //   description: "loop and/or organization description",
  //   token: "0x71850b7E9Ee3f13Ab46d67167341E4bDc905Eef9",
  //   shieldScore: "Human Passport Score 15",
  //   eligibility: "1 Merit Redemption",
  //   chainBadgeColor: "bg-custom-green",
  //   super: false,
  //   chainId: 100,
  //   chainName: "Gnosis",
  //   eligibilityProvider: "blockscout",
  //   passportMinScore: 15,
  //   enabled: true,
  // },
  {
    id: 3,
    title: "Test Blockscout Merits Program",
    by: "Blockscout",
    address: "0xFD4B87a83acde1f54A1AC986b33BE20154cDDf70",
    description: "loop and/or organization description",
    token: "0x012270Fc0c65bE86FC87d9C0D5C8860b0103BA55",
    shieldScore: "Human Passport Score 15",
    eligibility: "1 Merit Redemption",
    chainBadgeColor: "bg-custom-green",
    shieldAccount: "0xtt...453",
    shieldValue: "26",
    super: false,
    chainId: 100,
    chainName: "Gnosis",
    eligibilityProvider: "blockscout",
    passportMinScore: 15,
    enabled: true,
  },
  {
    id: 4,
    title: "Test 1hive Gardens",
    by: "Blockscout",
    address: "0xB29018e60Cbdc1938C77d02c588c74c1B060C6B3",
    description: "loop and/or organization description",
    token: "0x012270Fc0c65bE86FC87d9C0D5C8860b0103BA55",
    shieldScore: "Human Passport Score 15",
    eligibility: "1 Merit Redemption",
    chainBadgeColor: "bg-custom-green",
    shieldAccount: "0xtt...453",
    shieldValue: "26",
    super: false,
    chainId: 100,
    chainName: "Gnosis",
    eligibilityProvider: "garden_1hive",
    passportMinScore: 15,
    enabled: true,
  },
]
