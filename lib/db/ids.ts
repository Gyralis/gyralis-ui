export function normalizeDbAddress(address: string): string {
  return address.toLowerCase()
}

export function userLoopStatsId(input: {
  chainId: number
  loopId: number
  userAddress: string
}): string {
  return [
    input.chainId,
    input.loopId,
    normalizeDbAddress(input.userAddress),
  ].join("-")
}

export function globalLeaderboardEntryId(userAddress: string): string {
  return `global-${normalizeDbAddress(userAddress)}`
}

export function loopLeaderboardEntryId(input: {
  chainId: number
  loopId: number
  userAddress: string
}): string {
  return `loop-${userLoopStatsId(input)}`
}

export function processedClaimEventId(input: {
  chainId: number
  txHash: string
  logIndex: number
}): string {
  return [input.chainId, input.txHash.toLowerCase(), input.logIndex].join("-")
}

export function seasonUserLoopStatsId(input: {
  seasonId: string
  chainId: number
  loopId: number
  userAddress: string
}): string {
  return [
    "season-loop",
    input.seasonId,
    input.chainId,
    input.loopId,
    normalizeDbAddress(input.userAddress),
  ].join("-")
}

export function seasonUserGlobalStatsId(input: {
  seasonId: string
  userAddress: string
}): string {
  return [
    "season-global",
    input.seasonId,
    normalizeDbAddress(input.userAddress),
  ].join("-")
}
