import { NextResponse } from "next/server"
import { env } from "@/env.mjs"

import { PASSPORT_STAMPS_API_BASE_URL } from "../utils/constants"

export async function requestPassportScore(
  rawAddress: string,
  requestId: string
): Promise<Response> {
  if (!env.GITCOIN_PASSPORT_API_KEY) {
    console.error(`[${requestId}] Gitcoin Passport API key is missing`)
    return NextResponse.json(
      { detail: "Gitcoin Passport API key not provided." },
      { status: 500 }
    )
  }

  if (!env.GITCOIN_PASSPORT_SCORER_ID) {
    console.error(`[${requestId}] Gitcoin Passport scorer ID is missing`)
    return NextResponse.json(
      { detail: "Gitcoin Passport scorer (community) ID not provided." },
      { status: 500 }
    )
  }

  const address = rawAddress.trim().toLowerCase()
  const endpoint = `${PASSPORT_STAMPS_API_BASE_URL}/${env.GITCOIN_PASSPORT_SCORER_ID}/score/${address}`

  try {
    const response = await fetch(endpoint, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": env.GITCOIN_PASSPORT_API_KEY,
      },
    })

    if (!response.ok) {
      const body = await response.clone().text()
      console.error(`[${requestId}] Gitcoin Passport score request failed`, {
        status: response.status,
        statusText: response.statusText,
        body: body.slice(0, 500),
        address,
        scorerId: env.GITCOIN_PASSPORT_SCORER_ID,
      })

      let detail = body
      try {
        const parsedBody = JSON.parse(body) as { detail?: unknown }
        if (typeof parsedBody.detail === "string") detail = parsedBody.detail
      } catch {
        // Keep the upstream text when it is not JSON.
      }

      return NextResponse.json(
        {
          detail:
            detail ||
            "Human Passport score request failed. Check the server logs for details.",
          upstreamStatus: response.status,
          upstreamStatusText: response.statusText,
        },
        { status: response.status }
      )
    }

    return response
  } catch (error) {
    console.error(`[${requestId}] Gitcoin Passport score request threw`, {
      address,
      scorerId: env.GITCOIN_PASSPORT_SCORER_ID,
      error,
    })

    return NextResponse.json(
      {
        detail:
          "Unable to reach Human Passport right now. Please try again shortly.",
      },
      { status: 502 }
    )
  }
}
