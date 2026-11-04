/** Wallet rejection is a cancellation, not a failed onchain transaction. */
export function isWalletRejection(error: unknown): boolean {
  let current = error
  const seen = new Set<unknown>()
  while (current && typeof current === "object" && !seen.has(current)) {
    seen.add(current)
    const candidate = current as {
      code?: unknown
      name?: string
      cause?: unknown
    }
    if (
      candidate.code === 4001 ||
      candidate.name === "UserRejectedRequestError"
    )
      return true
    current = candidate.cause
  }
  return false
}
