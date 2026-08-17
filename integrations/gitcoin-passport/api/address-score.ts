import { NextResponse } from "next/server"

import { env } from "@/env.mjs"

import { GITCOIN_API_BASE_URL } from "../utils/constants"

export async function GET(
  req: Request,
  { params }: { params: { address: string } }
) {
  const requestId = `gitcoin-passport:score:${Date.now()}`

  if (!env.GITCOIN_PASSPORT_API_KEY)
    return NextResponse.json(
      { detail: "Gitcoin passport api key not provided." },
      { status: 400 }
    )

  if (!env.GITCOIN_PASSPORT_SCORER_ID)
    return NextResponse.json(
      {
        detail: "Gitcoin passport scorer (community) id not provided.",
      },
      { status: 400 }
    )

  const address = params.address.trim().toLowerCase()

  try {
    const response = await fetch(
      `${GITCOIN_API_BASE_URL}/score/${env.GITCOIN_PASSPORT_SCORER_ID}/${address}`,
      {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": env.GITCOIN_PASSPORT_API_KEY,
        },
      }
    )

    if (!response.ok) {
      const body = await response.clone().text()
      console.error(`[${requestId}] Gitcoin score request failed`, {
        status: response.status,
        statusText: response.statusText,
        body: body.slice(0, 500),
        address,
        scorerId: env.GITCOIN_PASSPORT_SCORER_ID,
      })

      return NextResponse.json(
        {
          detail:
            body ||
            "Gitcoin Passport score request failed. Check the server logs for details.",
          upstreamStatus: response.status,
          upstreamStatusText: response.statusText,
        },
        { status: response.status }
      )
    }

    return response
  } catch (error) {
    console.error(`[${requestId}] Gitcoin score request threw`, {
      address,
      scorerId: env.GITCOIN_PASSPORT_SCORER_ID,
      error,
    })

    return NextResponse.json(
      {
        detail:
          "Unable to reach Gitcoin Passport right now. Please try again shortly.",
      },
      { status: 502 }
    )
  }
}
