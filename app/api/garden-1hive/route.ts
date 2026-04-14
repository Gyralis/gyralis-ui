import { NextResponse } from "next/server"
import { env } from "@/env.mjs"
import { Chain, createWalletClient, getContract, http, parseAbi } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import * as chains from "viem/chains"

import {
  eligibilityRequestSchema,
  findAllowlistedLoop,
} from "@/lib/loops/eligibility"
import { generateEligibilitySignature } from "@/lib/loops/eligibility-signature"

const TRUSTED_BACKEND_SIGNER_PK = process.env.TRUSTED_BACKEND_SIGNER_PK ?? ""
const GITCOIN_PASSPORT_API_KEY = env.GITCOIN_PASSPORT_API_KEY ?? ""
const SCORER_ID = env.GITCOIN_PASSPORT_SCORER_ID ?? ""
const GARDENS_SUBGRAPH_VERSION: string = env.GARDENS_SUBGRAPH_VERSION ?? ""
const SUBGRAPH_URL = `https://api.studio.thegraph.com/query/102093/gardens-v2---gnosis/${GARDENS_SUBGRAPH_VERSION}`

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
  if (!SCORER_ID) throw new Error("Gitcoin Passport scorer id missing")

  const endpoint = `https://api.scorer.gitcoin.co/registry/score/${SCORER_ID}/${userAddress}`
  const response = await fetch(endpoint, {
    headers: { "X-API-KEY": GITCOIN_PASSPORT_API_KEY },
  })
  if (!response.ok) {
    const body = await response.text()
    throw new Error(
      `Failed to fetch passport score (${response.status}): ${body.slice(
        0,
        240
      )}`
    )
  }
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
  const requestId = `garden-1hive:${Date.now()}`
  try {
    console.log(`[${requestId}] Incoming eligibility request`)
    const parsed = eligibilityRequestSchema.safeParse(await req.json())
    if (!parsed.success) {
      console.warn(`[${requestId}] Invalid payload`, parsed.error.flatten())
      return NextResponse.json(
        { success: false, error: "Invalid request payload" },
        { status: 400 }
      )
    }

    const { userAddress, loopAddress, chainId } = parsed.data
    console.log(`[${requestId}] Payload parsed`, {
      userAddress,
      loopAddress,
      chainId,
    })

    const allowlistedLoop = findAllowlistedLoop(
      "garden_1hive",
      loopAddress,
      chainId
    )
    if (!allowlistedLoop) {
      console.warn(`[${requestId}] Loop not allowlisted`, {
        loopAddress,
        chainId,
      })
      return NextResponse.json(
        { success: false, error: "Loop is not enabled for this eligibility" },
        { status: 403 }
      )
    }
    console.log(`[${requestId}] Allowlist check passed`, allowlistedLoop)

    // Passport score
    const passportScore = await fetchPassportScore(userAddress)
    console.log(`[${requestId}] Passport score fetched`, {
      score: passportScore,
      threshold: allowlistedLoop.passportMinScore,
    })
    if (passportScore < allowlistedLoop.passportMinScore)
      return NextResponse.json(
        { success: false, error: "Passport score below threshold" },
        { status: 403 }
      )

    // Membership check
    const isMember = await checkMembership(userAddress)
    console.log(`[${requestId}] Membership check result`, { isMember })
    if (!isMember)
      return NextResponse.json(
        { success: false, error: "Not a member of the community" },
        { status: 403 }
      )

    // Next period
    const nextPeriod = await fetchNextPeriod(chainId, allowlistedLoop.address)
    console.log(`[${requestId}] Next period fetched`, { nextPeriod })

    // Eligibility signature (EIP-712 typed data)
    const backendSignature = await generateEligibilitySignature({
      userAddress: userAddress as `0x${string}`,
      loopAddress: allowlistedLoop.address,
      chainId,
      nextPeriod,
      privateKey: TRUSTED_BACKEND_SIGNER_PK as `0x${string}`,
    })
    console.log(`[${requestId}] Signature generated`)

    return NextResponse.json({
      success: true,
      signature: backendSignature,
      message: "User is eligible and signature has been generated",
    })
  } catch (error) {
    console.error(`[${requestId}] API Error`, error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
