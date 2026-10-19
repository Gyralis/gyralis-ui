import { SeasonConfig } from "@/config/seasons"

export interface ValidatedSeasonLoop {
  chainId: number
  loopId: number
  multiplierHundredths: number
}

export interface ValidatedSeason
  extends Omit<SeasonConfig, "startsAt" | "endsAt" | "loops"> {
  startsAt: Date
  endsAt: Date
  loops: readonly ValidatedSeasonLoop[]
}

export interface SeasonEarnedStreakBonus {
  streak: number
  pointsHundredths: number
}

export interface SeasonUserLoopScoringStats {
  seasonId: string
  userAddress: string
  loopId: number
  chainId: number
  totalClaims: number
  claimPointsHundredths: number
  streakBonusPointsHundredths: number
  totalPointsHundredths: number
  currentStreak: number
  longestStreak: number
  lastClaimedPeriod: number | null
  earnedStreakBonuses: SeasonEarnedStreakBonus[]
}

export interface SeasonUserGlobalScoringStats {
  seasonId: string
  userAddress: string
  totalClaims: number
  claimPointsHundredths: number
  streakBonusPointsHundredths: number
  totalPointsHundredths: number
  activeLoopStreaks: number
  longestStreak: number
  loopCount: number
  earnedStreakBonuses: SeasonEarnedStreakBonus[]
}
