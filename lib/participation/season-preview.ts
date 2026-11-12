// Frontend-only fixtures. Never use this model to authorize payments or claims.
import {
  completionBonuses,
  seasonDayCount,
  weekendSchedule,
  weekendView,
} from "./season-games"

export const seasonMilestones = [
  { streak: 3, points: 2 },
  { streak: 7, points: 5 },
  { streak: 14, points: 12 },
  { streak: 28, points: 30 },
] as const

export type SeasonPhase = "registration" | "late" | "live" | "review" | "prizes"
export const seasonPhases: Record<
  SeasonPhase,
  { label: string; date: string; timing: string; day: number }
> = {
  registration: {
    label: "Registration open",
    date: "2026-11-27T12:00:00Z",
    timing: "Starts in 4 days",
    day: 0,
  },
  late: {
    label: "Late registration",
    date: "2026-12-02T12:00:00Z",
    timing: "Entry closes Dec 4 · 00:00 UTC",
    day: 2,
  },
  live: {
    label: "Season live",
    date: "2026-12-12T12:00:00Z",
    timing: `Day 12 of ${seasonDayCount} · ${seasonDayCount - 12} days left`,
    day: 12,
  },
  review: {
    label: "Results under review",
    date: "2027-01-01T12:00:00Z",
    timing: "Scoring ended Jan 1 · 00:00 UTC",
    day: seasonDayCount,
  },
  prizes: {
    label: "Prize experience",
    date: "2027-01-04T12:00:00Z",
    timing: "Post-Season · payout setup pending",
    day: seasonDayCount,
  },
}
export interface PreviewLoop {
  id: number
  name: string
  logo: string
  claims: number
  streak: number
  earned: number[]
  claimedToday: boolean
  lastAward: number
}
export interface PreviewState {
  phase: SeasonPhase
  registered: boolean
  earlyBird: boolean
  loops: PreviewLoop[]
  period: number
  participationPeriods: number[]
  requiredLoopIds: number[] | null
  weekendTime: string
  weekends: { id: number; registered: boolean; claimed: boolean }[]
  prizeClaimed: boolean
  message: string
}
export function createSeasonPreview(phase: SeasonPhase = "live"): PreviewState {
  const counts =
    phase === "registration"
      ? [0, 0, 0]
      : phase === "late"
      ? [1, 1, 0]
      : phase === "prizes"
      ? [28, 28, 28]
      : [6, 11, 2]
  return {
    phase,
    registered: !["registration", "late"].includes(phase),
    earlyBird: !["registration", "late"].includes(phase),
    loops: [
      { id: 4, name: "Blockscout Merits", logo: "/blockscout-logo.png" },
      { id: 6, name: "True Loopers", logo: "/gyralis-logo.svg" },
      { id: 3, name: "1Hive Gardens", logo: "/1Hive-logo.png" },
    ].map((loop, i) => ({
      ...loop,
      claims: counts[i],
      streak: counts[i],
      earned: seasonMilestones
        .filter((m) => counts[i] >= m.streak)
        .map((m) => m.streak),
      claimedToday: false,
      lastAward: 0,
    })),
    period: seasonPhases[phase].day,
    participationPeriods: Array.from(
      {
        length:
          phase === "registration"
            ? 0
            : phase === "late"
            ? 1
            : phase === "prizes"
            ? seasonDayCount
            : phase === "review"
            ? 28
            : 11,
      },
      (_, i) => i + 1
    ),
    // Publish the required roster before this game can award points.
    requiredLoopIds: null,
    weekendTime: seasonPhases[phase].date,
    weekends: weekendSchedule.map(({ id }) => ({
      id,
      registered: phase === "prizes",
      claimed: phase === "prizes",
    })),
    prizeClaimed: false,
    message: "",
  }
}
export const canEnter = (phase: SeasonPhase) =>
  phase === "registration" || phase === "late"
export const canScore = (phase: SeasonPhase) =>
  phase === "late" || phase === "live"

export function previewNextClaimPoints(
  loop: Pick<PreviewLoop, "streak" | "earned">
) {
  const streakBonus = seasonMilestones
    .filter(
      (milestone) =>
        loop.streak + 1 >= milestone.streak &&
        !loop.earned.includes(milestone.streak)
    )
    .reduce((total, milestone) => total + milestone.points, 0)
  return { claimPoints: 1, streakBonus, total: 1 + streakBonus }
}

export function previewScore(state: PreviewState) {
  const claims =
    state.loops.reduce((sum, loop) => sum + loop.claims, 0) +
    state.weekends.filter((weekend) => weekend.claimed).length
  const streaks = state.loops.reduce(
    (sum, loop) =>
      sum +
      seasonMilestones
        .filter((m) => loop.earned.includes(m.streak))
        .reduce((total, m) => total + m.points, 0),
    0
  )
  const awards = completionBonuses(state)
  const games =
    awards.sprint +
    awards.marathon +
    awards.explorer +
    state.weekends.filter((weekend) => weekend.claimed).length * 3
  return { claims, streaks, games, total: claims + streaks + games }
}
export type PreviewAction =
  | { type: "scenario"; phase: SeasonPhase }
  | { type: "registration"; registered: boolean }
  | { type: "viewer"; registered: boolean }
  | { type: "placement"; winning: boolean }
  | { type: "claim"; id: number }
  | { type: "weekend-register"; id: number }
  | { type: "weekend-claim"; id: number }
  | { type: "weekend-clock"; time: string }
  | { type: "prize" }
  | { type: "message"; message: string }
export function seasonPreviewReducer(
  state: PreviewState,
  action: PreviewAction
): PreviewState {
  switch (action.type) {
    case "scenario":
      return createSeasonPreview(action.phase)
    case "placement": {
      if (state.phase !== "prizes") return state
      const fixture = createSeasonPreview(action.winning ? "prizes" : "live")
      return {
        ...state,
        loops: fixture.loops,
        period: fixture.period,
        participationPeriods: fixture.participationPeriods,
        weekends: fixture.weekends,
        prizeClaimed: false,
        message: "",
      }
    }
    case "viewer":
      if (canEnter(state.phase)) return state
      return {
        ...state,
        registered: action.registered,
        earlyBird: action.registered,
        message: "",
      }
    case "message":
      return { ...state, message: action.message }
    case "weekend-clock":
      if (!Number.isFinite(Date.parse(action.time))) return state
      return { ...state, weekendTime: action.time, message: "" }
    case "registration": {
      if (
        action.registered
          ? !canEnter(state.phase) || state.registered
          : state.phase !== "registration" || !state.registered
      )
        return state
      return {
        ...state,
        registered: action.registered,
        earlyBird: action.registered && state.phase === "registration",
        message: action.registered
          ? state.phase === "late"
            ? `Entry preview confirmed. ${
                previewScore(state).total
              } backdated SP included.`
            : "Entry preview confirmed. Your Early Bird badge is ready."
          : "Withdrawal preview complete. 1 USDC entry fee refunded; network fees excluded.",
      }
    }
    case "claim": {
      if (!state.registered || !canScore(state.phase)) return state
      const loop = state.loops.find((loop) => loop.id === action.id)
      if (!loop || loop.claimedToday) return state
      const nextStreak = loop.streak + 1
      const newMilestones = seasonMilestones.filter(
        (m) => nextStreak >= m.streak && !loop.earned.includes(m.streak)
      )
      const bonus = newMilestones.reduce((sum, m) => sum + m.points, 0)
      const next: PreviewState = {
        ...state,
        loops: state.loops.map((item) =>
          item.id === action.id
            ? {
                ...item,
                claims: item.claims + 1,
                streak: nextStreak,
                claimedToday: true,
                lastAward: 1 + bonus,
                earned: [...item.earned, ...newMilestones.map((m) => m.streak)],
              }
            : item
        ),
        participationPeriods: state.participationPeriods.includes(state.period)
          ? state.participationPeriods
          : [...state.participationPeriods, state.period],
      }
      const gameBonus = previewScore(next).games - previewScore(state).games
      const total = 1 + bonus + gameBonus
      return {
        ...next,
        loops: next.loops.map((item) =>
          item.id === action.id ? { ...item, lastAward: total } : item
        ),
        message: `${loop.name}: +${total} SP · +1 claim${
          bonus ? ` +${bonus} streak bonus` : ""
        }${
          gameBonus ? ` +${gameBonus} game bonus` : ""
        }. Claim preview only; no tokens moved.`,
      }
    }
    case "weekend-register": {
      const view = weekendView(state)
      if (
        !state.registered ||
        !canScore(state.phase) ||
        view.stage !== "registration" ||
        view.weekend?.id !== action.id
      )
        return state
      return {
        ...state,
        weekends: state.weekends.map((weekend) =>
          weekend.id === action.id ? { ...weekend, registered: true } : weekend
        ),
        message:
          "Weekend registration preview confirmed. Return Sunday to claim. No funds moved.",
      }
    }
    case "weekend-claim": {
      const view = weekendView(state)
      if (
        !state.registered ||
        !canScore(state.phase) ||
        view.stage !== "claim" ||
        view.weekend?.id !== action.id
      )
        return state
      return {
        ...state,
        weekends: state.weekends.map((weekend) =>
          weekend.id === action.id ? { ...weekend, claimed: true } : weekend
        ),
        message:
          "Weekend Ritual: +4 SP · +1 claim +3 game bonus. No streak bonus. Claim preview only; no tokens moved.",
      }
    }
    case "prize":
      if (
        !state.registered ||
        state.phase !== "prizes" ||
        state.prizeClaimed ||
        (previewStandings(state).find((player) => player.current)?.rank ??
          Infinity) > 35
      )
        return state
      return {
        ...state,
        prizeClaimed: true,
        message:
          "Prize claim preview complete. No funds moved; the final payout table and prize asset remain pending.",
      }
  }
}
export function previewStandings(state: PreviewState) {
  const others = Array.from(
    { length: canEnter(state.phase) || state.registered ? 226 : 227 },
    (_, i) => ({
      name:
        i === 0
          ? "orbit.eth"
          : i === 1
          ? "garden.eth"
          : i === 2
          ? "return.eth"
          : `looper${String(i + 1).padStart(3, "0")}.eth`,
      claims:
        state.phase === "registration"
          ? 0
          : state.phase === "late"
          ? Math.max(0, 6 - Math.floor(i / 30))
          : Math.max(0, 35 - Math.floor(i / 4)),
      streaks:
        state.phase === "registration" || state.phase === "late"
          ? 0
          : [21, 16, 14, 11, 9, 7, 6, 4, 2, 0][Math.min(9, Math.floor(i / 8))],
      games: 0,
      current: false,
    })
  )
  const score = previewScore(state)
  const players = state.registered
    ? [...others, { name: "Mati0x", ...score, current: true }]
    : others
  const sorted = players
    .map((p) => ({ ...p, total: p.claims + p.streaks + p.games }))
    .sort((a, b) => b.total - a.total)
  return sorted.map((player) => ({
    ...player,
    rank: 1 + sorted.filter((other) => other.total > player.total).length,
  }))
}
