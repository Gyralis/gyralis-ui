import { requestPassportScore } from "./passport-score"

export async function GET(
  _req: Request,
  { params }: { params: { address: string } }
) {
  const requestId = `gitcoin-passport:score:${Date.now()}`
  return requestPassportScore(params.address, requestId)
}
