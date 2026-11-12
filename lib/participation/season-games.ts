import type { PreviewState } from "./season-preview"

export const seasonDayCount = 31

export const seasonGames = [
  {
    id: "sprint",
    title: "Half Season In",
    type: "Participation",
    description:
      "Claim at least once on 15 different days this Season. Gaps are allowed.",
    target: 15,
    unit: "days",
    bonus: 15,
    art: "/games/sprint.png",
    how: "Claim from any regular Season Loop in 15 shared daily periods. Several Loops in the same period count as one participating period. The periods do not need to be consecutive.",
    win: "Reach 15 participating periods before the Season ends.",
    rules: [
      "Regular Season Loops only; Weekend Loop claims do not count.",
      "Switching Loops between periods is allowed. Each Loop keeps its own independent streak.",
      "Earn +15 bonus SP once after confirmed completion. This stacks with All Season Long’s +30 SP.",
    ],
  },
  {
    id: "marathon",
    title: "All Season Long",
    type: "Full-Season participation",
    description: "Claim at least once every day this Season. Don’t miss a day.",
    target: seasonDayCount,
    unit: "days",
    bonus: 30,
    art: "/games/long-game-calendar.png",
    how: "Claim from at least one regular Season Loop in every shared daily period. You can switch Loops, but you cannot miss a period.",
    win: "Cover every daily period in the Season’s configured schedule.",
    rules: [
      "Regular Season Loops only; Weekend Loop claims do not replace a regular claim.",
      "Missing a closed period makes this objective unattainable. Your other points and Half Season In progress stay yours.",
      "Earn +30 bonus SP once. Together with Half Season In, full participation earns +45 bonus SP.",
    ],
  },
  {
    id: "explorer",
    title: "The Rule of 3",
    type: "Exploration",
    description:
      "Claim at least 3 times from each Season Loop. No streak required.",
    target: 5,
    unit: "Loops completed",
    bonus: 15,
    art: "/games/explorer.png",
    how: "Make three qualifying claims in each required Loop during the Season. They do not need to be consecutive. Extra claims in one Loop cannot replace claims in another.",
    win: "Every required Loop reaches at least 3 / 3 qualifying claims.",
    rules: [
      "The required Loop list is fixed and published before the Season starts.",
      "The final list is not published in this preview. Weekend Loop inclusion remains undecided.",
      "Earn +15 bonus SP once after confirmed completion.",
    ],
  },
  {
    id: "weekend",
    title: "Weekend Ritual",
    type: "Weekend participation",
    description:
      "Register Saturday. Claim Sunday. A dedicated Loop, every Season weekend.",
    target: 4,
    unit: "weekend claims",
    bonus: 3,
    art: "/games/weekend.png",
    how: "Register in the dedicated Weekend Loop each Saturday, then claim from that Loop on Sunday. Register again for every weekend you want to join.",
    win: "Each eligible Sunday claim earns 4 total SP: 1 claim point + 3 game-bonus points.",
    rules: [
      "Every Season entrant is eligible, with no additional requirements.",
      "Register Saturday 00:00–Sunday 00:00 UTC. Claim Sunday 00:00–Monday 00:00 UTC. Reference fixtures only: deployed Loop periods drive live windows.",
      "Four opportunities: up to 16 total SP, including 12 bonus SP. No regular streak bonus or extra completion award.",
      "Miss Saturday registration and you cannot claim that Sunday. Missing one weekend does not block later weekends or remove earlier points.",
    ],
  },
  {
    id: "race",
    title: "Claim Rush",
    type: "Race · on hold",
    description:
      "The claim race is on hold while its final format and qualification rules are defined.",
    target: 20,
    unit: "claims",
    bonus: 20,
    art: "/games/race.png",
    how: "The previous concept rewards the first 50 players to reach 20 eligible regular Loop claims. Claims in different regular Loops in the same period each count once.",
    win: "Qualification, ordering and tie-breaking are on hold. Reaching 20 claims is not a confirmed win.",
    rules: [
      "Regular Season Loop claims only. Weekend Loop claims do not count.",
      "20 bonus SP is reserved in the planning budget. No race points are awarded in this preview.",
      "The final objective, winner selection, late-entry treatment and award timing will follow the completed rules.",
    ],
  },
] as const

export type SeasonGame = (typeof seasonGames)[number]
export type SeasonGameId = SeasonGame["id"]

export const weekendSchedule = [
  {
    id: 1,
    registerAt: "2026-12-05T00:00:00Z",
    claimAt: "2026-12-06T00:00:00Z",
    closeAt: "2026-12-07T00:00:00Z",
  },
  {
    id: 2,
    registerAt: "2026-12-12T00:00:00Z",
    claimAt: "2026-12-13T00:00:00Z",
    closeAt: "2026-12-14T00:00:00Z",
  },
  {
    id: 3,
    registerAt: "2026-12-19T00:00:00Z",
    claimAt: "2026-12-20T00:00:00Z",
    closeAt: "2026-12-21T00:00:00Z",
  },
  {
    id: 4,
    registerAt: "2026-12-26T00:00:00Z",
    claimAt: "2026-12-27T00:00:00Z",
    closeAt: "2026-12-28T00:00:00Z",
  },
] as const

export function participatingPeriods(state: PreviewState) {
  return [
    ...new Set(
      state.participationPeriods.filter(
        (period) =>
          Number.isInteger(period) &&
          period >= 1 &&
          period <= seasonDayCount &&
          period <= state.period
      )
    ),
  ]
}

export function seasonGameProgress(id: string, state: PreviewState) {
  if (id === "race")
    return state.loops.reduce((sum, loop) => sum + loop.claims, 0)
  if (id === "weekend")
    return state.weekends.filter((weekend) => weekend.claimed).length
  if (id === "explorer")
    return (state.requiredLoopIds ?? []).filter((id) =>
      state.loops.some((loop) => loop.id === id && loop.claims >= 3)
    ).length
  return participatingPeriods(state).length
}

export function completionBonuses(state: PreviewState) {
  const periods = participatingPeriods(state)
  const roster = state.requiredLoopIds
  return {
    sprint: state.registered && periods.length >= 15 ? 15 : 0,
    marathon: state.registered && periods.length === seasonDayCount ? 30 : 0,
    explorer:
      state.registered &&
      roster != null &&
      roster.length > 0 &&
      roster.every((id) =>
        state.loops.some((loop) => loop.id === id && loop.claims >= 3)
      )
        ? 15
        : 0,
  }
}

export function weekendView(state: PreviewState) {
  const now = Date.parse(state.weekendTime)
  const current = weekendSchedule.find(
    (weekend) => now < Date.parse(weekend.closeAt)
  )
  if (!current || state.phase === "review" || state.phase === "prizes")
    return { stage: "ended" as const, weekend: null }
  const record = state.weekends.find((weekend) => weekend.id === current.id)!
  if (now < Date.parse(current.registerAt))
    return { stage: "scheduled" as const, weekend: current }
  if (now < Date.parse(current.claimAt))
    return {
      stage: record.registered
        ? ("registered" as const)
        : ("registration" as const),
      weekend: current,
    }
  return {
    stage: record.claimed
      ? ("claimed" as const)
      : record.registered
      ? ("claim" as const)
      : ("missed" as const),
    weekend: current,
  }
}

export function gameView(game: SeasonGame, state: PreviewState) {
  const progress = seasonGameProgress(game.id, state)
  const awards = completionBonuses(state)
  const target =
    game.id === "explorer" ? state.requiredLoopIds?.length ?? 0 : game.target
  const earned =
    game.id === "weekend"
      ? progress * 3
      : game.id === "race"
      ? 0
      : awards[game.id]
  const closedPeriods =
    state.phase === "review" || state.phase === "prizes"
      ? seasonDayCount
      : Math.max(0, state.period - 1)
  const missed =
    game.id === "marathon" &&
    Array.from({ length: closedPeriods }, (_, i) => i + 1).some(
      (period) => !state.participationPeriods.includes(period)
    )
  const remaining =
    state.phase === "review" || state.phase === "prizes"
      ? 0
      : Math.max(
          0,
          seasonDayCount -
            state.period +
            Number(
              state.period > 0 &&
                !state.participationPeriods.includes(state.period)
            )
        )
  let status = "In progress"
  if (game.id === "race") status = "On hold"
  else if (game.id === "explorer" && !state.requiredLoopIds?.length)
    status = "Loop list pending"
  else if (state.phase === "registration") status = "Scheduled"
  else if (!state.registered) status = "Season entry required"
  else if (game.id === "weekend")
    status = {
      scheduled: "Scheduled",
      registration: "Registration open",
      registered: "Registered for Sunday",
      claim: "Ready to claim",
      claimed: "Claimed this weekend",
      missed: "Registration missed",
      ended: "Ended",
    }[weekendView(state).stage]
  else if (earned > 0) status = "Completed"
  else if (missed || (game.id === "sprint" && progress + remaining < target))
    status = "No longer achievable"
  else if (state.phase === "review" || state.phase === "prizes")
    status = "Ended"
  return { progress, target, earned, status }
}
