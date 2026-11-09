export interface ScoringLoopRegistryEntry {
  chainId: number
  loopId: number
  factoryLoopId?: number
  address: `0x${string}`
}

export const scoringLoopRegistry = [
  {
    chainId: 100,
    loopId: 3,
    address: "0x8995641fb3E452bC1359E79A738a6DE556015696",
  },
  {
    chainId: 100,
    loopId: 4,
    address: "0xaB25dBaFD11b1eb606B2455Eecec67e6746E409b",
  },
  {
    chainId: 8453,
    loopId: 9,
    address: "0xe714bc7F58726490a15d2197BCded598223f5319",
  },
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
