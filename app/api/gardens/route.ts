import { NextResponse } from "next/server"
import type { GardensCommunityKey } from "@/data/loops-data"
import { env } from "@/env.mjs"
import { Chain, createWalletClient, getContract, http, parseAbi } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import * as chains from "viem/chains"

import {
  eligibilityRequestSchema,
  findAllowlistedLoop,
} from "@/lib/loops/eligibility"
import { generateEligibilitySignature } from "@/lib/loops/eligibility-signature"
import { checkGardensMembership } from "@/lib/loops/gardens-membership"

const TRUSTED_BACKEND_SIGNER_PK = process.env.TRUSTED_BACKEND_SIGNER_PK ?? ""
const GITCOIN_PASSPORT_API_KEY = env.GITCOIN_PASSPORT_API_KEY ?? ""
const SCORER_ID = env.GITCOIN_PASSPORT_SCORER_ID ?? ""
const THRESHOLD_SCORE = Number(process.env.THRESHOLD_SCORE ?? 0)
const HAS_NOT_SUBMITTED_PASSPORT_YET_ERROR =
  "Unable to get score for provided scorer."
const GARDENS_COMMUNITIES = {
  "1hive": {
    address: "0xe2396fe2169ca026962971d3b2e373ba925b6257",
    subgraphEndpoint: env.GARDENS_1HIVE_SUBGRAPH_ENDPOINT,
  },
  markee: {
    address: "0x9a378ebed22610e9fbb941fe27323fe00cdeebc6",
    subgraphEndpoint: env.GARDENS_MARKEE_SUBGRAPH_ENDPOINT,
  },
} as const
const ELIGIBILITY_ERROR_CODES = {
  invalidRequest: "INVALID_REQUEST",
  loopNotEnabled: "LOOP_NOT_ENABLED",
  passportScoreRequired: "PASSPORT_SCORE_REQUIRED",
  providerEligibilityRequired: "PROVIDER_ELIGIBILITY_REQUIRED",
  internalError: "INTERNAL_ERROR",
} as const

function getPassportScoreError(minScore: number) {
  return `Your Human Passport score must be at least ${minScore} to enter this loop. Open GyraHub to improve your score, then try again.`
}

interface PassportScoreResponse {
  score: number
}

class PassportScoreNotSyncedError extends Error {
  constructor(minScore: number) {
    super(getPassportScoreError(minScore))
    this.name = "PassportScoreNotSyncedError"
  }
}

function getViemChain(chainId: string | number): Chain {
  for (const chain of Object.values(chains)) {
    if ("id" in chain && chain.id == chainId) return chain
  }
  throw new Error(`Chain with id ${chainId} not found`)
}

async function fetchPassportScore(
  userAddress: string,
  minScore: number
): Promise<number> {
  if (!GITCOIN_PASSPORT_API_KEY)
    throw new Error("Gitcoin Passport API key missing")
  if (!SCORER_ID) throw new Error("Gitcoin Passport scorer id missing")

  const endpoint = `https://api.scorer.gitcoin.co/registry/score/${SCORER_ID}/${userAddress}`
  const response = await fetch(endpoint, {
    headers: { "X-API-KEY": GITCOIN_PASSPORT_API_KEY },
  })
  if (!response.ok) {
    const body = await response.text()
    if (
      response.status === 404 ||
      body.includes(HAS_NOT_SUBMITTED_PASSPORT_YET_ERROR)
    ) {
      throw new PassportScoreNotSyncedError(minScore)
    }

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

async function checkMembership(
  userAddress: string,
  communityKey: GardensCommunityKey
) {
  const community = GARDENS_COMMUNITIES[communityKey]
  return checkGardensMembership({
    subgraphEndpoint: community.subgraphEndpoint,
    communityAddress: community.address,
    userAddress,
  })
}

export async function POST(req: Request) {
  const requestId = `gardens:${Date.now()}`
  try {
    console.log(`[${requestId}] Incoming eligibility request`)
    const parsed = eligibilityRequestSchema.safeParse(await req.json())
    if (!parsed.success) {
      console.warn(`[${requestId}] Invalid payload`, parsed.error.flatten())
      return NextResponse.json(
        {
          success: false,
          code: ELIGIBILITY_ERROR_CODES.invalidRequest,
          error: "Invalid request payload",
        },
        { status: 400 }
      )
    }

    const { userAddress, loopAddress, chainId } = parsed.data
    console.log(`[${requestId}] Payload parsed`, {
      userAddress,
      loopAddress,
      chainId,
    })

    const allowlistedLoop = findAllowlistedLoop("gardens", loopAddress, chainId)
    if (!allowlistedLoop) {
      console.warn(`[${requestId}] Loop not allowlisted`, {
        loopAddress,
        chainId,
      })
      return NextResponse.json(
        {
          success: false,
          code: ELIGIBILITY_ERROR_CODES.loopNotEnabled,
          error: "Loop is not enabled for this eligibility",
        },
        { status: 403 }
      )
    }
    console.log(`[${requestId}] Allowlist check passed`, allowlistedLoop)

    // Passport score
    const passportThreshold = THRESHOLD_SCORE
    const passportScore = await fetchPassportScore(
      userAddress,
      passportThreshold
    )
    console.log(`[${requestId}] Passport score fetched`, {
      score: passportScore,
      threshold: passportThreshold,
    })
    if (passportScore < passportThreshold)
      return NextResponse.json(
        {
          success: false,
          code: ELIGIBILITY_ERROR_CODES.passportScoreRequired,
          error: getPassportScoreError(passportThreshold),
        },
        { status: 403 }
      )

    // Membership check
    if (!allowlistedLoop.gardensCommunity) {
      throw new Error("Gardens community is not configured for this loop")
    }
    const isMember = await checkMembership(
      userAddress,
      allowlistedLoop.gardensCommunity
    )
    console.log(`[${requestId}] Membership check result`, { isMember })
    if (!isMember)
      return NextResponse.json(
        {
          success: false,
          code: ELIGIBILITY_ERROR_CODES.providerEligibilityRequired,
          error:
            "You are not eligible yet. Open the Eligibility tab to see how to enter this loop.",
        },
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
    if (error instanceof PassportScoreNotSyncedError) {
      return NextResponse.json(
        {
          success: false,
          code: ELIGIBILITY_ERROR_CODES.passportScoreRequired,
          error: error.message,
        },
        { status: 403 }
      )
    }

    console.error(`[${requestId}] API Error`, error)
    return NextResponse.json(
      {
        success: false,
        code: ELIGIBILITY_ERROR_CODES.internalError,
        error: "Internal server error",
      },
      { status: 500 }
    )
  }
}
