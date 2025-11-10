import { NextResponse } from "next/server"
import {
  Chain,
  createWalletClient,
  encodePacked,
  getContract,
  http,
  keccak256,
  parseAbi,
} from "viem"
import { privateKeyToAccount } from "viem/accounts"
import * as chains from "viem/chains"

const TRUSTED_BACKEND_SIGNER_PK = process.env.TRUSTED_BACKEND_SIGNER_PK ?? ""
const GITCOIN_PASSPORT_API_KEY = process.env.GITCOIN_PASSPORT_API_KEY ?? ""
const SCORER_ID = process.env.SCORER_ID ?? ""

/** Blockscout “Merits/Points” API */
const BLOCKSCOUT_POINTS_BASE =
  process.env.BLOCKSCOUT_POINTS_BASE ?? "https://points.k8s-dev.blockscout.com"
const BLOCKSCOUT_OFFER_ID = process.env.BLOCKSCOUT_OFFER_ID ?? "gyralis-offer"

const THRESHOLD = 15

interface PassportScoreResponse {
  score: number
}

interface BlockscoutRedemption {
  offer_id: string
  address: string
  redemption: string
  price: string
  note: string | null
  redeemed_at: string
  secret: string | null
}

interface BlockscoutRedemptionsResponse {
  items: BlockscoutRedemption[]
  next_page_params: Record<string, string> | null
}

function getViemChain(chainId: string | number): Chain {
  for (const chain of Object.values(chains)) {
    if ("id" in chain && chain.id == chainId) return chain
  }
  throw new Error(`Chain with id ${chainId} not found`)
}

async function fetchPassportScore(userAddress: string): Promise<number> {
  if (!GITCOIN_PASSPORT_API_KEY)
    throw new Error("Gitcoin Passport API key missing")

  const endpoint = `https://api.scorer.gitcoin.co/registry/score/${SCORER_ID}/${userAddress}`
  const response = await fetch(endpoint, {
    headers: { "X-API-KEY": GITCOIN_PASSPORT_API_KEY },
  })
  if (!response.ok) throw new Error("Failed to fetch passport score")
  const data = (await response.json()) as PassportScoreResponse
  return data.score
}

async function fetchNextPeriod(
  chainId: number,
  loopAddress: string
): Promise<number> {
  const viemChain = getViemChain(chainId)
  const walletClient = createWalletClient({
    account: privateKeyToAccount(TRUSTED_BACKEND_SIGNER_PK as `0x${string}`),
    chain: viemChain,
    transport: http(),
  })

  const loopContract = getContract({
    address: loopAddress as `0x${string}`,
    abi: parseAbi([
      "function getCurrentPeriod() public view returns (uint256)",
    ]),
    client: walletClient,
  })

  const currentPeriod = await loopContract.read.getCurrentPeriod()
  return Number(currentPeriod + BigInt(1))
}

/** Robust Blockscout redemptions checker
 *  - Tries server-side address filtering (?address=0x..)
 *  - Falls back to paginating with next_page_params if needed
 */
async function hasBlockscoutRedemption(userAddress: string): Promise<boolean> {
  const addrLower = userAddress.toLowerCase()
  const base = `${BLOCKSCOUT_POINTS_BASE}/api/v1/offers/${BLOCKSCOUT_OFFER_ID}/redemptions`

  // Helper to fetch one page (optionally with query params)
  async function fetchPage(
    params?: Record<string, string>
  ): Promise<BlockscoutRedemptionsResponse> {
    const url = new URL(base)
    if (params) {
      for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
    }
    const res = await fetch(url.toString())
    if (!res.ok) throw new Error(`Blockscout API error (${res.status})`)
    return (await res.json()) as BlockscoutRedemptionsResponse
  }

  // 1) Best case: the API supports filtering by address (many APIs do)
  try {
    const first = await fetchPage({ address: userAddress })
    if (first.items?.some((i) => i.address?.toLowerCase() === addrLower))
      return true
    // If filter returns items but none match, we can assume "not eligible"
    if (first.items && first.items.length > 0 && !first.next_page_params)
      return false
  } catch {
    // ignore and fallback to full scan
  }

  // 2) Fallback: walk pages via next_page_params
  let params: Record<string, string> | undefined = undefined
  let safetyPages = 0
  const MAX_PAGES = 100

  while (safetyPages++ < MAX_PAGES) {
    const page = await fetchPage(params)
    if (page.items?.some((i) => i.address?.toLowerCase() === addrLower))
      return true
    if (!page.next_page_params) return false
    params = page.next_page_params
  }

  // If we hit the page cap, treat as not found (or throw if you prefer hard failure)
  return false
}

export async function POST(req: Request) {
  try {
    const { userAddress, loopAddress, chainId } = await req.json()
    if (!userAddress || !loopAddress || !chainId)
      return NextResponse.json(
        { success: false, error: "Missing parameters" },
        { status: 400 }
      )

    // 1) Gitcoin Passport score gate
    const passportScore = await fetchPassportScore(userAddress)
    if (passportScore <= THRESHOLD)
      return NextResponse.json(
        { success: false, error: "Passport score below threshold" },
        { status: 403 }
      )

    // 2) Blockscout Merits / Points gate (replaces the 1Hive membership check)
    const redeemed = await hasBlockscoutRedemption(userAddress)
    if (!redeemed)
      return NextResponse.json(
        { success: false, error: "No valid Blockscout redemption found" },
        { status: 403 }
      )

    // 3) Compute next period from the Loop contract
    const nextPeriod = await fetchNextPeriod(Number(chainId), loopAddress)

    // 4) Eligibility signature: keccak256(encodePacked(user, nextPeriod, loopAddress))
    const eligibilityMessage = encodePacked(
      ["address", "uint256", "address"],
      [userAddress, BigInt(Math.floor(nextPeriod)), loopAddress]
    )
    const eligibilityMessageHash = keccak256(eligibilityMessage)

    const walletClient = createWalletClient({
      account: privateKeyToAccount(TRUSTED_BACKEND_SIGNER_PK as `0x${string}`),
      chain: getViemChain(chainId),
      transport: http(),
    })

    const backendSignature = await walletClient.signMessage({
      account: privateKeyToAccount(TRUSTED_BACKEND_SIGNER_PK as `0x${string}`),
      message: { raw: eligibilityMessageHash },
    })

    return NextResponse.json({
      success: true,
      signature: backendSignature,
      message: "User is eligible and signature has been generated",
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
