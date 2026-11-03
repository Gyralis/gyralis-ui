import { describe, expect, it } from "vitest"

import {
  completionBonuses,
  gameView,
  participatingPeriods,
  seasonGameProgress,
  seasonGames,
  weekendSchedule,
  weekendView,
} from "./season-games"
import {
  createSeasonPreview,
  previewScore,
  seasonPreviewReducer,
} from "./season-preview"

const game = (id: string) => seasonGames.find((item) => item.id === id)!

describe("agreed Season Games", () => {
  it("counts a shared period only once across regular Loops", () => {
    const first = seasonPreviewReducer(createSeasonPreview(), {
      type: "claim",
      id: 4,
    })
    const second = seasonPreviewReducer(first, { type: "claim", id: 6 })
    expect(seasonGameProgress("sprint", first)).toBe(12)
    expect(seasonGameProgress("sprint", second)).toBe(12)
  })

  it("awards Sprint for 20 nonconsecutive periods, exactly once", () => {
    const state = createSeasonPreview()
    state.period = 21
    state.participationPeriods = Array.from(
      { length: 20 },
      (_, i) => i + 1
    ).filter((period) => period !== 7)
    const next = seasonPreviewReducer(state, { type: "claim", id: 4 })
    expect(completionBonuses(next)).toEqual({
      sprint: 15,
      marathon: 0,
      explorer: 0,
    })
    expect(previewScore(next).total - previewScore(state).total).toBe(21)
    expect(next.message).toContain("+15 game bonus")
    const anotherLoop = seasonPreviewReducer(next, { type: "claim", id: 6 })
    expect(completionBonuses(anotherLoop).sprint).toBe(15)
    expect(previewScore(anotherLoop).games).toBe(15)
    expect(gameView(game("marathon"), next).status).toBe("No longer achievable")
  })

  it("stacks Sprint and Long Game for 45 bonus SP", () => {
    const state = createSeasonPreview()
    state.period = 30
    state.participationPeriods = Array.from({ length: 29 }, (_, i) => i + 1)
    const next = seasonPreviewReducer(state, { type: "claim", id: 4 })
    expect(completionBonuses(next)).toEqual({
      sprint: 15,
      marathon: 30,
      explorer: 0,
    })
    expect(previewScore(next).games).toBe(45)
    expect(next.message).toContain("+30 game bonus")
  })

  it("does not count duplicate, invalid or future attendance periods", () => {
    const state = createSeasonPreview()
    state.participationPeriods = [0, 1, 1, 2, 31, 13, 1.5]
    expect(participatingPeriods(state)).toEqual([1, 2])
  })

  it("only makes Sprint unattainable when fewer than 20 periods can still be reached", () => {
    const state = createSeasonPreview()
    state.period = 27
    state.participationPeriods = Array.from({ length: 15 }, (_, i) => i + 1)
    expect(gameView(game("sprint"), state).status).toBe("No longer achievable")
    state.participationPeriods.push(16)
    expect(gameView(game("sprint"), state).status).toBe("In progress")
  })

  it("requires a published roster and three claims in every required Loop", () => {
    const state = createSeasonPreview()
    state.loops = state.loops.map((loop) => ({ ...loop, claims: 3 }))
    expect(completionBonuses(state).explorer).toBe(0)
    expect(gameView(game("explorer"), state).status).toBe("Loop list pending")
    state.requiredLoopIds = [4, 6, 3]
    state.loops[2].claims = 2
    expect(seasonGameProgress("explorer", state)).toBe(2)
    expect(completionBonuses(state).explorer).toBe(0)
    const next = seasonPreviewReducer(state, { type: "claim", id: 3 })
    expect(completionBonuses(next).explorer).toBe(15)
    state.requiredLoopIds.push(999)
    expect(completionBonuses(state).explorer).toBe(0)
  })

  it("never awards the held race, even after its old target is reached", () => {
    const state = createSeasonPreview()
    state.loops[0].claims = 100
    expect(gameView(game("race"), state)).toMatchObject({
      status: "On hold",
      earned: 0,
    })
    expect(previewScore(state).games).toBe(0)
  })

  it("does not award completion bonuses to an unregistered visitor", () => {
    const state = { ...createSeasonPreview("prizes"), registered: false }
    expect(completionBonuses(state)).toEqual({
      sprint: 0,
      marathon: 0,
      explorer: 0,
    })
  })
})

describe("dedicated Weekend Loop", () => {
  it("requires Saturday registration before the Sunday claim", () => {
    const saturday = createSeasonPreview()
    expect(weekendView(saturday).stage).toBe("registration")
    const registered = seasonPreviewReducer(saturday, {
      type: "weekend-register",
      id: 2,
    })
    expect(previewScore(registered)).toEqual(previewScore(saturday))
    expect(weekendView(registered).stage).toBe("registered")
    const sunday = seasonPreviewReducer(registered, {
      type: "weekend-clock",
      time: "2026-12-13T00:00:00Z",
    })
    const claimed = seasonPreviewReducer(sunday, {
      type: "weekend-claim",
      id: 2,
    })
    expect(previewScore(claimed).total - previewScore(sunday).total).toBe(4)
    expect(previewScore(claimed).games).toBe(3)
    expect(claimed.participationPeriods).toEqual(saturday.participationPeriods)
    expect(seasonGameProgress("race", claimed)).toBe(
      seasonGameProgress("race", saturday)
    )
    expect(claimed.loops).toEqual(saturday.loops)
    expect(
      seasonPreviewReducer(claimed, { type: "weekend-claim", id: 2 })
    ).toBe(claimed)
  })

  it.each([
    ["2026-12-11T23:59:59Z", false],
    ["2026-12-12T00:00:00Z", true],
    ["2026-12-12T23:59:59Z", true],
    ["2026-12-13T00:00:00Z", false],
  ])("enforces Saturday registration at %s", (time, allowed) => {
    const state = { ...createSeasonPreview(), weekendTime: time }
    const next = seasonPreviewReducer(state, {
      type: "weekend-register",
      id: 2,
    })
    expect(next !== state).toBe(allowed)
  })

  it.each([
    ["2026-12-12T23:59:59Z", false],
    ["2026-12-13T00:00:00Z", true],
    ["2026-12-13T23:59:59Z", true],
    ["2026-12-14T00:00:00Z", false],
  ])("enforces Sunday claims at %s", (time, allowed) => {
    const registered = seasonPreviewReducer(createSeasonPreview(), {
      type: "weekend-register",
      id: 2,
    })
    const state = { ...registered, weekendTime: time }
    const next = seasonPreviewReducer(state, { type: "weekend-claim", id: 2 })
    expect(next !== state).toBe(allowed)
  })

  it("rejects Sunday late registration and does not reuse another weekend's registration", () => {
    const first = seasonPreviewReducer(createSeasonPreview(), {
      type: "weekend-register",
      id: 2,
    })
    const sunday = { ...first, weekendTime: "2026-12-20T12:00:00Z" }
    expect(weekendView(sunday).stage).toBe("missed")
    expect(
      seasonPreviewReducer(sunday, { type: "weekend-register", id: 3 })
    ).toBe(sunday)
    expect(seasonPreviewReducer(sunday, { type: "weekend-claim", id: 3 })).toBe(
      sunday
    )
  })

  it("credits four independent weekends as 4 claim +12 bonus points", () => {
    let state = createSeasonPreview()
    const before = previewScore(state)
    for (const weekend of weekendSchedule) {
      state = seasonPreviewReducer(state, {
        type: "weekend-clock",
        time: weekend.registerAt,
      })
      state = seasonPreviewReducer(state, {
        type: "weekend-register",
        id: weekend.id,
      })
      state = seasonPreviewReducer(state, {
        type: "weekend-clock",
        time: weekend.claimAt,
      })
      state = seasonPreviewReducer(state, {
        type: "weekend-claim",
        id: weekend.id,
      })
    }
    expect(previewScore(state)).toEqual({
      claims: before.claims + 4,
      streaks: before.streaks,
      games: 12,
      total: before.total + 16,
    })
    expect(seasonGameProgress("weekend", state)).toBe(4)
  })

  it("requires Season entry without adding extra eligibility gates", () => {
    const visitor = { ...createSeasonPreview(), registered: false }
    expect(
      seasonPreviewReducer(visitor, { type: "weekend-register", id: 2 })
    ).toBe(visitor)
    const entrant = { ...visitor, registered: true }
    expect(
      seasonPreviewReducer(entrant, { type: "weekend-register", id: 2 })
        .weekends[1].registered
    ).toBe(true)
  })
})
