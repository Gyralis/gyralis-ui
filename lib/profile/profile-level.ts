export function getProfileLevel(totalPoints: number) {
  if (totalPoints >= 250) {
    return {
      level: "LooperX",
      nextLevel: null,
      remainingPoints: 0,
      progress: 100,
      fromLabel: "True Looper",
      toLabel: "LooperX · 250 GP",
    }
  }
  const isTrueLooper = totalPoints >= 50
  return {
    level: isTrueLooper ? "True Looper" : "Looper",
    nextLevel: isTrueLooper ? "LooperX" : "True Looper",
    remainingPoints: (isTrueLooper ? 250 : 50) - totalPoints,
    progress: isTrueLooper
      ? ((totalPoints - 50) / 200) * 100
      : (totalPoints / 50) * 100,
    fromLabel: isTrueLooper ? "True Looper" : "0 GP",
    toLabel: isTrueLooper ? "LooperX · 250 GP" : "True Looper",
  }
}

export interface ProfileSummary {
  address: string
  totalPoints: number
  totalClaims: number
}

export function getProfilePillProgress({
  totalClaims,
  totalPoints,
}: ProfileSummary) {
  const level = getProfileLevel(totalPoints)
  const remainingClaims = Math.max(0, 50 - totalClaims)
  if (remainingClaims > 0) {
    return {
      level: level.level,
      progress: Math.max(0, (totalClaims / 50) * 100),
      description: `${remainingClaims} ${
        remainingClaims === 1 ? "claim" : "claims"
      } to access True Looper loop`,
    }
  }
  return {
    level: level.level,
    progress: level.progress,
    description: level.nextLevel
      ? `${level.remainingPoints} GP to reach ${level.nextLevel}`
      : "LooperX reached · True Looper access unlocked",
  }
}
