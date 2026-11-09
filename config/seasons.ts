export interface SeasonLoopConfig {
  chainId: number
  loopId: number
  multiplier?: number
}

export interface SeasonConfig {
  id: string
  name: string
  startsAt: string
  endsAt: string
  loops: readonly SeasonLoopConfig[]
}

export const seasons: readonly SeasonConfig[] = [
  {
    id: "test-2026-08-10-oct-10",
    name: "August 10 - October 10 Test Season",
    startsAt: "2026-08-10T00:00:00.000Z",
    // Season ranges are [startsAt, endsAt), so this includes all of October 10.
    endsAt: "2026-10-11T00:00:00.000Z",
    loops: [
      { chainId: 8453, loopId: 1 },
      { chainId: 8453, loopId: 6 },
    ],
  },
  {
    id: "test-2026-11-01-nov-06",
    name: "November 1 - November 6 Test Season",
    startsAt: "2026-11-01T00:00:00.000Z",
    // Exclusive end includes all of November 6 (UTC).
    endsAt: "2026-11-07T00:00:00.000Z",
    loops: [
      { chainId: 100, loopId: 3 },
      { chainId: 100, loopId: 4 },
      { chainId: 8453, loopId: 9 },
    ],
  },
]

// Season 1 example (commented out intentionally; it does not activate a season):
// {
//   id: "season-1",
//   name: "Season 1",
//   startsAt: "2026-11-01T00:00:00.000Z",
//   endsAt: "2027-02-01T00:00:00.000Z",
//   loops: [
//     { chainId: 8453, loopId: 1 },
//     { chainId: 8453, loopId: 6, multiplier: 1.25 },
//   ],
// },
