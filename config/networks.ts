// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// Networks
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
import { http } from "wagmi"
import {
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  gnosis,
  gnosisChiado,
  hardhat,
  mainnet,
  optimism,
  optimismSepolia,
  polygon,
  polygonMumbai,
  sepolia,
  soneium,
} from "wagmi/chains"

const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY?.trim()
const mainnetRpcUrl = alchemyApiKey
  ? `https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`
  : undefined
const baseRpcUrl =
  process.env.NEXT_PUBLIC_BASE_RPC_URL?.trim() || "https://mainnet.base.org"

const soneiumWithIcon = {
  ...soneium,
  iconUrl: "/icons/NetworkSoneium.webp",
  iconBackground: "#ffffff",
} as const

export const deployedChains = [base, gnosis, soneiumWithIcon] as const

export const chains = [
  mainnet,
  optimism,
  arbitrum,
  polygon,
  gnosis,
  hardhat,
  base,
  baseSepolia,
  polygonMumbai,
  mainnet,
  sepolia,
  polygonMumbai,
  gnosisChiado,
  optimismSepolia,
  arbitrumSepolia,
  soneiumWithIcon,
] as const

export const transports = {
  [mainnet.id]: http(mainnetRpcUrl),
  [sepolia.id]: http(),
  [polygonMumbai.id]: http(),
  [gnosisChiado.id]: http(),
  [hardhat.id]: http(),
  [optimism.id]: http(),
  [arbitrum.id]: http(),
  [polygon.id]: http(),
  [gnosis.id]: http(),
  [base.id]: http(baseRpcUrl),
  [baseSepolia.id]: http(),
  [optimismSepolia.id]: http(),
  [arbitrumSepolia.id]: http(),
  [soneium.id]: http(),
} as const
