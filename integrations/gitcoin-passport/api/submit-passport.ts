import { z } from "zod"

import { requestPassportScore } from "./passport-score"

const submitPassportSchema = z.object({
  address: z.string(),
})

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsedBody = submitPassportSchema.safeParse(body)
  if (!parsedBody.success) {
    return Response.json(
      { detail: "A wallet address is required to refresh the Passport score." },
      { status: 400 }
    )
  }

  return requestPassportScore(
    parsedBody.data.address,
    `gitcoin-passport:refresh-score:${Date.now()}`
  )
}
