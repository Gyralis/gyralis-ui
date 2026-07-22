export function normalizeDbAddress(address: string): string {
  return address.toLowerCase()
}

export function userLoopStatsId(input: {
  chainId: number
  loopAddress: string
  userAddress: string
}): string {
  return [
    input.chainId,
    normalizeDbAddress(input.loopAddress),
    normalizeDbAddress(input.userAddress),
  ].join("-")
}

export function globalLeaderboardEntryId(userAddress: string): string {
  return `global-${normalizeDbAddress(userAddress)}`
}

export function loopLeaderboardEntryId(input: {
  chainId: number
  loopAddress: string
  userAddress: string
}): string {
  return `loop-${userLoopStatsId(input)}`
}
