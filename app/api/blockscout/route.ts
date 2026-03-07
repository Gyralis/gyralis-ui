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
const SCORER_ID = process.env.GITCOIN_PASSPORT_SCORER_ID ?? ""

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
  console.log("[blockscout] getViemChain input:", chainId)

  for (const chain of Object.values(chains)) {
    if ("id" in chain && chain.id == chainId) {
      console.log("[blockscout] matched viem chain:", {
        id: chain.id,
        name: chain.name,
      })
      return chain
    }
  }

  console.error("[blockscout] chain not found:", chainId)
  throw new Error(`Chain with id ${chainId} not found`)
}

async function fetchPassportScore(userAddress: string): Promise<number> {
  console.log("[blockscout] fetchPassportScore start:", {
    userAddress,
    hasApiKey: Boolean(GITCOIN_PASSPORT_API_KEY),
    scorerId: SCORER_ID,
  })

  if (!GITCOIN_PASSPORT_API_KEY) {
    console.error("[blockscout] missing GITCOIN_PASSPORT_API_KEY")
    throw new Error("Gitcoin Passport API key missing")
  }

  const endpoint = `https://api.scorer.gitcoin.co/registry/score/${SCORER_ID}/${userAddress}`
  console.log("[blockscout] passport endpoint:", endpoint)

  const response = await fetch(endpoint, {
    headers: { "X-API-KEY": GITCOIN_PASSPORT_API_KEY },
  })

  console.log("[blockscout] passport response status:", response.status)

  if (!response.ok) {
    const text = await response.text()
    console.error("[blockscout] passport fetch failed:", text)
    throw new Error("Failed to fetch passport score")
  }

  const data = (await response.json()) as PassportScoreResponse
  console.log("[blockscout] passport score result:", data)

  return data.score
}

async function fetchNextPeriod(
  chainId: number,
  loopAddress: string
): Promise<number> {
  console.log("[blockscout] fetchNextPeriod start:", { chainId, loopAddress })

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
      "function getStreamingCurrentPeriod() public view returns (uint256)",
    ]),
    client: walletClient,
  })

  let currentPeriod: bigint

  try {
    console.log("[blockscout] trying getStreamingCurrentPeriod()")
    currentPeriod = await loopContract.read.getStreamingCurrentPeriod()
    console.log(
      "[blockscout] streaming current period:",
      currentPeriod.toString()
    )
  } catch (streamingError) {
    console.warn(
      "[blockscout] getStreamingCurrentPeriod failed, falling back to getCurrentPeriod:",
      streamingError
    )

    console.log("[blockscout] trying getCurrentPeriod()")
    currentPeriod = await loopContract.read.getCurrentPeriod()
    console.log(
      "[blockscout] regular current period:",
      currentPeriod.toString()
    )
  }

  const nextPeriod = Number(currentPeriod + 1n)
  console.log("[blockscout] computed nextPeriod:", nextPeriod)

  return nextPeriod
}

/** Robust Blockscout redemptions checker
 *  - Tries server-side address filtering (?address=0x..)
 *  - Falls back to paginating with next_page_params if needed
 */
async function hasBlockscoutRedemption(userAddress: string): Promise<boolean> {
  const addrLower = userAddress.toLowerCase()
  const base = `${BLOCKSCOUT_POINTS_BASE}/api/v1/offers/${BLOCKSCOUT_OFFER_ID}/redemptions`

  console.log("[blockscout] hasBlockscoutRedemption start:", {
    userAddress,
    base,
    offerId: BLOCKSCOUT_OFFER_ID,
  })

  // Helper to fetch one page (optionally with query params)
  async function fetchPage(
    params?: Record<string, string>
  ): Promise<BlockscoutRedemptionsResponse> {
    const url = new URL(base)
    if (params) {
      for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
    }

    console.log("[blockscout] fetching redemptions page:", url.toString())

    const res = await fetch(url.toString())
    console.log("[blockscout] redemptions page status:", res.status)

    if (!res.ok) {
      const text = await res.text()
      console.error("[blockscout] redemptions page failed:", {
        status: res.status,
        body: text,
      })
      throw new Error(`Blockscout API error (${res.status})`)
    }

    const json = (await res.json()) as BlockscoutRedemptionsResponse
    console.log("[blockscout] redemptions page result:", {
      itemsCount: json.items?.length ?? 0,
      nextPageParams: json.next_page_params,
    })

    return json
  }

  // 1) Best case: the API supports filtering by address
  try {
    console.log("[blockscout] trying filtered lookup by address")
    const first = await fetchPage({ address: userAddress })

    const foundFiltered = first.items?.some(
      (i) => i.address?.toLowerCase() === addrLower
    )

    console.log("[blockscout] filtered lookup result:", {
      foundFiltered,
      itemsCount: first.items?.length ?? 0,
      nextPageParams: first.next_page_params,
    })

    if (foundFiltered) return true

    if (first.items && first.items.length > 0 && !first.next_page_params) {
      console.log(
        "[blockscout] filtered lookup returned items but no matching address"
      )
      return false
    }
  } catch (err) {
    console.warn(
      "[blockscout] filtered lookup failed, falling back to scan:",
      err
    )
  }

  // 2) Fallback: walk pages via next_page_params
  let params: Record<string, string> | undefined = undefined
  let safetyPages = 0
  const MAX_PAGES = 100

  while (safetyPages++ < MAX_PAGES) {
    console.log("[blockscout] scanning page number:", safetyPages)

    const page = await fetchPage(params)

    const found = page.items?.some(
      (i) => i.address?.toLowerCase() === addrLower
    )

    console.log("[blockscout] scan page result:", {
      found,
      itemsCount: page.items?.length ?? 0,
      nextPageParams: page.next_page_params,
    })

    if (found) return true
    if (!page.next_page_params) return false

    params = page.next_page_params
  }

  console.warn("[blockscout] reached MAX_PAGES without match:", MAX_PAGES)
  return false
}

export async function POST(req: Request) {
  try {
    console.log("[blockscout] POST /api/blockscout hit")

    const { userAddress, loopAddress, chainId } = await req.json()
    console.log("[blockscout] request body:", {
      userAddress,
      loopAddress,
      chainId,
      hasSignerPk: Boolean(TRUSTED_BACKEND_SIGNER_PK),
      hasPassportApiKey: Boolean(GITCOIN_PASSPORT_API_KEY),
      scorerId: SCORER_ID,
      pointsBase: BLOCKSCOUT_POINTS_BASE,
      offerId: BLOCKSCOUT_OFFER_ID,
    })

    if (!userAddress || !loopAddress || !chainId) {
      console.error("[blockscout] missing parameters")
      return NextResponse.json(
        { success: false, error: "Missing parameters" },
        { status: 400 }
      )
    }

    // 1) Gitcoin Passport score gate
    // console.log("[blockscout] step 1: checking passport score")
    // const passportScore = await fetchPassportScore(userAddress)
    // console.log("[blockscout] passportScore:", passportScore)

    // if (passportScore <= THRESHOLD) {
    //   console.warn("[blockscout] passport score below threshold:", {
    //     passportScore,
    //     threshold: THRESHOLD,
    //   })
    //   return NextResponse.json(
    //     { success: false, error: "Passport score below threshold" },
    //     { status: 403 }
    //   )
    // }

    // 2) Blockscout Merits / Points gate
    console.log("[blockscout] step 2: checking blockscout redemption")
    const redeemed = await hasBlockscoutRedemption(
      /*userAddress*/ "0xa25211b64d041f690c0c818183e32f28ba9647dd"
    ) //fake address to test
    console.log("[blockscout] redeemed result:", redeemed)

    if (!redeemed) {
      console.warn("[blockscout] no redemption found for user")
      return NextResponse.json(
        { success: false, error: "No valid Blockscout redemption found" },
        { status: 403 }
      )
    }

    // 3) Compute next period from the Loop contract
    console.log("[blockscout] step 3: fetching next period")
    const nextPeriod = await fetchNextPeriod(Number(chainId), loopAddress)
    console.log("[blockscout] nextPeriod:", nextPeriod)

    // 4) Eligibility signature
    console.log("[blockscout] step 4: building eligibility message")
    const eligibilityMessage = encodePacked(
      ["address", "uint256", "address"],
      [userAddress, BigInt(Math.floor(nextPeriod)), loopAddress]
    )
    const eligibilityMessageHash = keccak256(eligibilityMessage)

    console.log(
      "[blockscout] eligibility message hash:",
      eligibilityMessageHash
    )

    const walletClient = createWalletClient({
      account: privateKeyToAccount(TRUSTED_BACKEND_SIGNER_PK as `0x${string}`),
      chain: getViemChain(chainId),
      transport: http(),
    })

    console.log("[blockscout] step 5: signing message")
    const backendSignature = await walletClient.signMessage({
      account: privateKeyToAccount(TRUSTED_BACKEND_SIGNER_PK as `0x${string}`),
      message: { raw: eligibilityMessageHash },
    })

    console.log("[blockscout] signature generated successfully")

    return NextResponse.json({
      success: true,
      signature: backendSignature,
      message: "User is eligible and signature has been generated",
    })
  } catch (error) {
    console.error("[blockscout] API Error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
