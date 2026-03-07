import { Address } from "viem"

import { ELIGIBILITY_REGISTRY, EligibilityKey } from "@/lib/eligibility"

interface CheckEligibilityArgs {
  loopAddress: Address
  userAddress: Address
  chainId: number
  eligibility: EligibilityKey
}

export async function checkEligibility({
  loopAddress,
  userAddress,
  chainId,
  eligibility,
}: CheckEligibilityArgs): Promise<{ signature: `0x${string}` }> {
  const config = ELIGIBILITY_REGISTRY[eligibility]
  if (!config) throw new Error("Unknown eligibility type")

  console.log("config.apiPath ", config.apiPath)

  const res = await fetch(config.apiPath, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userAddress,
      loopAddress,
      chainId,
    }),
  })

  const data = await res.json()

  console.log("DATA ", data)

  if (!res.ok || !data.success) {
    throw new Error(data?.error ?? "Eligibility failed")
  }

  return { signature: data.signature }
}
