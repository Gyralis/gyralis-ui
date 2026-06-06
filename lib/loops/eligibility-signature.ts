import { createWalletClient, http } from "viem"
import { privateKeyToAccount } from "viem/accounts"

import { getSupportedServerChain } from "@/lib/web3/supported-server-chains"

interface GenerateEligibilitySignatureParams {
  userAddress: `0x${string}`
  loopAddress: `0x${string}`
  chainId: number
  nextPeriod: number
  privateKey: `0x${string}`
}

export async function generateEligibilitySignature({
  userAddress,
  loopAddress,
  chainId,
  nextPeriod,
  privateKey,
}: GenerateEligibilitySignatureParams): Promise<`0x${string}`> {
  const account = privateKeyToAccount(privateKey)
  const chain = getSupportedServerChain(chainId)
  const rpcUrl = chain.rpcUrls.default.http[0]
  if (!rpcUrl) {
    throw new Error(`No RPC URL configured for chain ${chainId}`)
  }

  const walletClient = createWalletClient({
    account,
    chain,
    transport: http(rpcUrl),
  })

  const domain = {
    name: "Loop Ecosystem",
    version: "1",
    chainId: BigInt(chainId),
    verifyingContract: loopAddress,
  } as const

  const types = {
    Eligibility: [
      { name: "user", type: "address" },
      { name: "nextPeriod", type: "uint256" },
    ],
  } as const

  return walletClient.signTypedData({
    domain,
    types,
    primaryType: "Eligibility",
    message: {
      user: userAddress,
      nextPeriod: BigInt(nextPeriod),
    },
  })
}
