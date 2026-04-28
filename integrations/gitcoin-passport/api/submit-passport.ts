import { env } from "@/env.mjs"
import { z } from "zod"

import { PASSPORT_STAMPS_API_BASE_URL } from "../utils/constants"

const submitPassportSchema = z.object({
  address: z.string(),
})

export async function POST(req: Request) {
  if (!env.GITCOIN_PASSPORT_API_KEY) {
    console.error("[gitcoin-passport] submit-passport missing API key")
    return new Response(
      JSON.stringify({ detail: "Gitcoin passport api key not provided." }),
      {
        status: 400,
      }
    )
  }

  if (!env.GITCOIN_PASSPORT_SCORER_ID) {
    console.error("[gitcoin-passport] submit-passport missing scorer id")
    return new Response(
      JSON.stringify({
        detail: "Gitcoin passport scorer (community) id not provided.",
      }),
      {
        status: 400,
      }
    )
  }

  const { address } = submitPassportSchema.parse(await req.json())

  const response = await fetch(
    `${PASSPORT_STAMPS_API_BASE_URL}/${env.GITCOIN_PASSPORT_SCORER_ID}/score/${address}`,
    {
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": env.GITCOIN_PASSPORT_API_KEY,
      },
    }
  )

  if (!response.ok) {
    const responseBody = await response.clone().text()
    console.error("[gitcoin-passport] refresh passport score failed", {
      status: response.status,
      statusText: response.statusText,
      body: responseBody,
      address,
      scorerId: env.GITCOIN_PASSPORT_SCORER_ID,
    })
  }

  return response
}
