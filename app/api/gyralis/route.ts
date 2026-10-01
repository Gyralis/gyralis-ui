import { NextResponse } from "next/server"
import { Chain, createWalletClient, getContract, http, parseAbi } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import * as chains from "viem/chains"

import {
  getLoopContractMethods,
  type LoopContractType,
} from "@/lib/contracts/loop-contracts"
import {
  eligibilityRequestSchema,
  findAllowlistedLoop,
} from "@/lib/loops/eligibility"
import { generateEligibilitySignature } from "@/lib/loops/eligibility-signature"
import { getTrueLooperClaims } from "@/lib/loops/get-true-looper-claims"
import { requestPassportScore } from "@/integrations/gitcoin-passport/api/passport-score"

const TRUSTED_BACKEND_SIGNER_PK = process.env.TRUSTED_BACKEND_SIGNER_PK ?? ""
const THRESHOLD_SCORE = Number(process.env.THRESHOLD_SCORE ?? 0)
const CURRENT_PERIOD_ABI = {
  getCurrentPeriod: "function getCurrentPeriod() public view returns (uint256)",
  getStreamingCurrentPeriod:
    "function getStreamingCurrentPeriod() public view returns (uint256)",
} as const
const ELIGIBILITY_ERROR_CODES = {
  invalidRequest: "INVALID_REQUEST",
  loopNotEnabled: "LOOP_NOT_ENABLED",
  passportScoreRequired: "PASSPORT_SCORE_REQUIRED",
  claimsRequired: "CLAIMS_REQUIRED",
  internalError: "INTERNAL_ERROR",
} as const

function getPassportScoreError(minScore: number) {
  return `Your Human Passport score must be at least ${minScore} to enter this loop. Open GyraHub to improve your score, then try again.`
}

interface PassportScoreResponse {
  score?: number | string
  detail?: string
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
  minScore: number,
  requestId: string
): Promise<number> {
  const response = await requestPassportScore(
    userAddress,
    `${requestId}:passport-score`
  )
  const data = (await response.json()) as PassportScoreResponse

  if (!response.ok) {
    if (response.status === 404) {
      throw new PassportScoreNotSyncedError(minScore)
    }

    throw new Error(
      `Failed to fetch passport score (${response.status}): ${
        data.detail ?? response.statusText
      }`
    )
  }

  const score = Number(data.score)
  if (!Number.isFinite(score)) {
    throw new Error("Human Passport returned an invalid score")
  }

  return score
}

async function fetchNextPeriod(
  chainId: number,
  loopAddress: string,
  contractType: LoopContractType
): Promise<number> {
  const viemChain = getViemChain(chainId)
  const currentPeriodMethod =
    getLoopContractMethods(contractType).getCurrentPeriod
  const walletClient = createWalletClient({
    account: privateKeyToAccount(TRUSTED_BACKEND_SIGNER_PK as `0x${string}`),
    chain: viemChain,
    transport: http(),
  })

  const loopContract = getContract({
    address: loopAddress as `0x${string}`,
    abi: parseAbi([CURRENT_PERIOD_ABI[currentPeriodMethod]]),
    client: walletClient,
  })

  const currentPeriod = await loopContract.read[currentPeriodMethod]()
  return Number(currentPeriod + BigInt(1))
}

export async function POST(req: Request) {
  const requestId = `gyralis:${Date.now()}`
  try {
    console.log(`[${requestId}] Incoming eligibility request`)
    const parsed = eligibilityRequestSchema.safeParse(await req.json())
    if (!parsed.success) {
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
    const allowlistedLoop = findAllowlistedLoop("gyralis", loopAddress, chainId)
    if (!allowlistedLoop) {
      return NextResponse.json(
        {
          success: false,
          code: ELIGIBILITY_ERROR_CODES.loopNotEnabled,
          error: "Loop is not enabled for this eligibility",
        },
        { status: 403 }
      )
    }

    const passportThreshold = THRESHOLD_SCORE
    const passportScore = await fetchPassportScore(
      userAddress,
      passportThreshold,
      requestId
    )
    if (passportScore < passportThreshold) {
      return NextResponse.json(
        {
          success: false,
          code: ELIGIBILITY_ERROR_CODES.passportScoreRequired,
          error: getPassportScoreError(passportThreshold),
        },
        { status: 403 }
      )
    }

    let claims
    try {
      claims = await getTrueLooperClaims(userAddress)
    } catch (error) {
      console.error(`[${requestId}] Claims database unavailable`, error)
      return NextResponse.json(
        {
          success: false,
          code: ELIGIBILITY_ERROR_CODES.internalError,
          error: "Claims are temporarily unavailable",
        },
        { status: 503 }
      )
    }
    if (!claims.requirementMet) {
      return NextResponse.json(
        {
          success: false,
          code: ELIGIBILITY_ERROR_CODES.claimsRequired,
          error: `${claims.claimsRemaining} more ${
            claims.claimsRemaining === 1 ? "claim is" : "claims are"
          } required to enter this SuperLoop.`,
          qualifyingClaims: claims.qualifyingClaims,
          requiredClaims: claims.requiredClaims,
          claimsRemaining: claims.claimsRemaining,
        },
        { status: 403 }
      )
    }

    const nextPeriod = await fetchNextPeriod(
      chainId,
      allowlistedLoop.address,
      allowlistedLoop.contractType
    )
    const backendSignature = await generateEligibilitySignature({
      userAddress: userAddress as `0x${string}`,
      loopAddress: allowlistedLoop.address,
      chainId,
      nextPeriod,
      privateKey: TRUSTED_BACKEND_SIGNER_PK as `0x${string}`,
    })

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
