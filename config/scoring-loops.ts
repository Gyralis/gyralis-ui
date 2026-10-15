export interface ScoringLoopRegistryEntry {
  chainId: number
  loopId: number
  factoryLoopId: number
  address: `0x${string}`
}

export const scoringLoopRegistry = [
  {
    chainId: 8453,
    loopId: 1,
    factoryLoopId: 20,
    address: "0x213310e1dbD6991cD488AB247c81faD82CD88E7A",
  },
  {
    chainId: 8453,
    loopId: 6,
    factoryLoopId: 24,
    address: "0xb7902fAE80EB57aBac621dc68eb30FFff42F76F0",
  },
] as const satisfies readonly ScoringLoopRegistryEntry[]
