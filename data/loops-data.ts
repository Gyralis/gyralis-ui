import { Address } from "viem"

export interface LoopCardData {
  id: number
  title: string
  by: string
  address?: Address
  description: string
  token: Address
  periodLength: string
  periodDistribution: string
  nextDistributionIn: string
  shieldScore: string
  eligibility: string
  chainBadgeColor: string
  shieldAccount?: string
  shieldValue?: string
  registeredAddresses?: { address: string; claimed: boolean }[]
  super?: boolean
  chainId: number
  chainName: string
  claimAmount: string // New: Amount user can claim
  balanceNumeric: number // New: Numeric balance for calculations
  currency: string // New: Currency symbol
}

export const LoopCardsData: LoopCardData[] = [
  {
    id: 1,
    title: "Title",
    by: "1Hive",
    address: "0x788F1E4a99fa704Edb43fAE71946cFFDDcC16ccB",
    description: "loop and/or organization description",
    token: "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82",
    periodLength: "24 hours",
    periodDistribution: "10%",
    nextDistributionIn: "02h 10min 25s",
    shieldScore: "Human Passport Score 15",
    eligibility: "1Hive member Gardensv2",
    chainBadgeColor: "bg-custom-green",
    shieldAccount: "0xtt...453",
    shieldValue: "26",
    registeredAddresses: [
      { address: "0xabc...123", claimed: true },
      { address: "0xdef...456", claimed: false },
      { address: "0xghi...789", claimed: true },
      { address: "0xjkl...012", claimed: false },
      { address: "0xmnp...345", claimed: true },
      { address: "0xqrst...678", claimed: false },
      { address: "0xuvw...901", claimed: true },
      { address: "0xxyz...234", claimed: false },
    ],
    super: false,
    chainId: 31337,
    chainName: "Gnosis",
    claimAmount: "10 HNY",
    balanceNumeric: 100,
    currency: "HNY",
  },
  {
    id: 2,
    title: "Community Fund",
    address: "0x88577731Cc84560fE297792ab784b600A54728E2",
    by: "BlockScout",
    description: "Funding initiatives for community growth and development.",
    token: "0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE",

    periodLength: "30 days",
    periodDistribution: "15%",
    nextDistributionIn: "10h 05min 40s",
    shieldScore: "BrightID Verified",
    eligibility: "Aragon DAO member",
    chainBadgeColor: "bg-purple-500",
    registeredAddresses: [
      { address: "0x444...ddd", claimed: false },
      { address: "0x555...eee", claimed: true },
    ],
    chainId: 31337,
    chainName: "Polygon",
    claimAmount: "37.5 ETH",
    balanceNumeric: 250,
    currency: "ETH",
    super: true,
  },
  {
    id: 3,
    title: "Another Loop",
    by: "DAOStack",
    description:
      "A decentralized autonomous organization for collective decision-making.",
    token: "0x71850b7E9Ee3f13Ab46d67167341E4bDc905Eef9",

    periodLength: "7 days",
    periodDistribution: "5%",
    nextDistributionIn: "05h 30min 10s",
    shieldScore: "Gitcoin Passport Score 20",
    eligibility: "DAOStack contributor",
    chainBadgeColor: "bg-blue-500",
    registeredAddresses: [
      { address: "0x111...aaa", claimed: true },
      { address: "0x222...bbb", claimed: false },
      { address: "0x333...ccc", claimed: true },
    ],
    super: false,
    chainId: 1,
    chainName: "Ethereum",
    claimAmount: "25 DAI",
    balanceNumeric: 500,
    currency: "DAI",
  },
  {
    id: 4,
    title: "Grants Program",
    by: "BrightId",
    description:
      "Supporting public goods and open-source development. This is much longer description to see how it look like so dont worry, be happy",
    periodLength: "14 days",
    token: "0x71850b7E9Ee3f13Ab46d67167341E4bDc905Eef9",

    periodDistribution: "8%",
    nextDistributionIn: "01h 45min 00s",
    shieldScore: "Kleros Curated",
    eligibility: "MolochDAO summoner",
    chainBadgeColor: "bg-yellow-500",
    registeredAddresses: [
      { address: "0x666...fff", claimed: true },
      { address: "0x777...ggg", claimed: false },
      { address: "0x888...hhh", claimed: true },
      { address: "0x999...iii", claimed: false },
    ],
    chainId: 42161,
    chainName: "Arbitrum",
    claimAmount: "6 GNO",
    balanceNumeric: 75,
    currency: "GNO",
  },
]
