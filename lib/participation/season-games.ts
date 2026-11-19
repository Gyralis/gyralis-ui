import type { PreviewState } from "./season-preview"

export const seasonDayCount = 31

// The Gardens directory ID is a preview reference, not the new Base deployment.
export const claimRace = {
  name: "Gardens Race",
  loopId: 3,
  target: 10,
  winners: 10,
} as const

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
    how: "Claim from any regular Season Loop. Each shared daily period counts as one day, even if you claim from several Loops.",
    win: "Reach 15 participating periods before the Season ends.",
    rules: [
      "You can switch Loops and skip days. Weekend Loop claims do not count.",
      "The reward is credited after confirmed completion.",
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
    how: "Make a regular Season Loop claim in each of the 31 shared daily periods. Multiple claims in one period still count as one day.",
    win: "Cover every daily period in the Season’s configured schedule.",
    rules: [
      "You can switch Loops. Weekend Loop claims do not count.",
      "Miss a period and this game cannot be completed. Your other points and Half Season In progress stay yours.",
      "The reward is credited after confirmed completion and stacks with Half Season In for 45 extra Season points in total.",
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
    bonus: 9,
    art: "/games/rule-of-three.png",
    how: "Make three qualifying claims in each required Loop, in separate claim periods. Gaps are allowed; extra claims in one Loop cannot replace another Loop’s claims.",
    win: "Every required Loop reaches at least 3 / 3 qualifying claims.",
    rules: [
      "The required roster is fixed before the Season. The displayed Loops are examples until that list is published; Weekend Loop inclusion is still pending.",
      "The reward is credited after every required Loop reaches three confirmed claims.",
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
    art: "/games/weekend-claim.png",
    how: "Register again each Saturday for that Sunday’s claim. Only the dedicated Weekend Loop counts.",
    win: "Each eligible Sunday claim earns 3 extra Season points.",
    rules: [
      "Every Season entrant is eligible. Each registration and claim window lasts one full day in UTC; live windows follow the Loop’s configured periods.",
      "Miss Saturday registration and you miss that Sunday’s claim. You can still join later weekends.",
      "Four weekends offer up to 12 extra Season points. No streak or additional completion reward.",
    ],
  },
  {
    id: "race",
    title: "Claim Race",
    type: claimRace.name,
    description:
      "Be one of the first 10 to reach 10 claims in the Gardens Loop. No streak required.",
    target: claimRace.target,
    unit: "claims",
    bonus: 10,
    art: "/games/race-finish.png",
    how: "For Gardens Race, each eligible Gardens Loop period counts once. Claims from other Loops and streak bonuses do not advance the race.",
    win: "Be among the first 10 Season entrants to reach 10 qualifying Gardens claims. Reaching the target alone does not confirm a winning place.",
    rules: [
      "The first 10 qualifying Season entrants win. Reaching 10 claims alone does not confirm a winning place.",
      "Winner ordering, ties, late entries and reward timing are still pending. The reward stays reserved; no race points are credited in this preview.",
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
    return state.loops.find((loop) => loop.id === claimRace.loopId)?.claims ?? 0
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
        ? 9
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

export function weekendTimeline(state: PreviewState) {
  const start = Date.parse(weekendSchedule[0].registerAt)
  const end = Date.parse(weekendSchedule[weekendSchedule.length - 1].closeAt)
  const referenceTime = Date.parse(state.weekendTime)
  const ended = state.phase === "review" || state.phase === "prizes"
  const now = ended ? end : referenceTime
  const position = (time: number) =>
    Math.max(0, Math.min(100, ((time - start) / (end - start)) * 100))

  return {
    // Calendar progress is independent of earned rewards and claim completion.
    progress: Number.isFinite(now) ? position(now) : 0,
    stops: weekendSchedule.map((weekend) => {
      const record = state.weekends.find((item) => item.id === weekend.id)
      const registerAt = Date.parse(weekend.registerAt)
      const claimAt = Date.parse(weekend.claimAt)
      const closeAt = Date.parse(weekend.closeAt)
      const status = record?.claimed
        ? "claimed"
        : !Number.isFinite(now) || !record
        ? "unavailable"
        : now >= closeAt
        ? "missed"
        : now < registerAt
        ? "upcoming"
        : !state.registered
        ? "entry-required"
        : now < claimAt
        ? record.registered
          ? "registered"
          : "registration"
        : record.registered
        ? "claim"
        : "missed"
      const label = {
        claimed: "Claimed · +3 extra Season points",
        unavailable: "Claim status unavailable",
        missed: "Not claimed",
        upcoming: "Upcoming",
        "entry-required": "Season entry required",
        registered: "Registered · claim Sunday",
        registration: "Saturday registration open",
        claim: "Ready to claim",
      }[status]

      return {
        ...weekend,
        position: position(claimAt),
        status,
        label,
        closed: Number.isFinite(now) && now >= closeAt,
        current: Number.isFinite(now) && now >= registerAt && now < closeAt,
      }
    }),
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
  if (game.id === "explorer" && !state.requiredLoopIds?.length)
    status = "Loop list pending"
  else if (state.phase === "registration") status = "Scheduled"
  else if (!state.registered) status = "Season entry required"
  else if (game.id === "race")
    status =
      progress >= target
        ? "Qualification pending"
        : state.phase === "review" || state.phase === "prizes"
        ? "Ended"
        : "In progress"
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
