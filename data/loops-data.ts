export interface LoopCardData {
  id: number
  title: string
  by: string
  description: string
  balance: string
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
    description: "loop and/or organization description",
    balance: "100 HNY",
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
    super: true,
    chainId: 100,
    chainName: "Gnosis",
    claimAmount: "10 HNY",
    balanceNumeric: 100,
    currency: "HNY",
  },
  {
    id: 2,
    title: "Another Loop",
    by: "DAOStack",
    description:
      "A decentralized autonomous organization for collective decision-making.",
    balance: "500 DAI",
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
    id: 3,
    title: "Community Fund",
    by: "BlockScout",
    description: "Funding initiatives for community growth and development.",
    balance: "250 ETH",
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
    chainId: 137,
    chainName: "Polygon",
    claimAmount: "37.5 ETH",
    balanceNumeric: 250,
    currency: "ETH",
  },
  {
    id: 4,
    title: "Grants Program",
    by: "BrightId",
    description:
      "Supporting public goods and open-source development. This is much longer description to see how it look like so dont worry, be happy",
    balance: "75 GNO",
    periodLength: "14 days",
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
