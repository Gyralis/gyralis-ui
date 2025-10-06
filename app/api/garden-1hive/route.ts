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
const SUBGRAPH_URL =
  "https://api.studio.thegraph.com/query/102093/gardens-v2---gnosis/0.1.23"

const THRESHOLD = 15

interface PassportScoreResponse {
  score: number
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

async function checkMembership(userAddress: string) {
  const query = `
    query CheckMembership($userAddress: String!) {
      memberCommunities(
        where: { registryCommunity: "0xe2396fe2169ca026962971d3b2e373ba925b6257", memberAddress: $userAddress }
      ) {
        memberAddress
      }
    }
  `

  const response = await fetch(SUBGRAPH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      variables: { userAddress: userAddress.toLowerCase() },
    }),
  })

  const json = await response.json()
  return json.data?.memberCommunities?.length > 0
}

export async function POST(req: Request) {
  try {
    const { userAddress, loopAddress, chainId } = await req.json()
    if (!userAddress || !loopAddress || !chainId)
      return NextResponse.json(
        { success: false, error: "Missing parameters" },
        { status: 400 }
      )

    // Passport score
    const passportScore = await fetchPassportScore(userAddress)
    if (passportScore <= THRESHOLD)
      return NextResponse.json(
        { success: false, error: "Passport score below threshold" },
        { status: 403 }
      )

    // Membership check
    const isMember = await checkMembership(userAddress)
    if (!isMember)
      return NextResponse.json(
        { success: false, error: "Not a member of the community" },
        { status: 403 }
      )

    // Next period
    const nextPeriod = await fetchNextPeriod(chainId, loopAddress)

    // Eligibility signature
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
