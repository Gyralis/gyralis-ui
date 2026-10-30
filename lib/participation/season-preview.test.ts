import { describe, expect, it } from "vitest"

import { seasonGameProgress } from "./season-games"
import {
  canEnter,
  canScore,
  createSeasonPreview,
  previewScore,
  previewStandings,
  seasonPreviewReducer,
} from "./season-preview"

describe("Season interaction preview", () => {
  it("starts with reconciled, plausible claim and streak components", () => {
    expect(previewScore(createSeasonPreview())).toEqual({
      claims: 19,
      streaks: 9,
      games: 0,
      total: 28,
    })
    expect(previewScore(createSeasonPreview("registration")).total).toBe(0)
  })
  it("awards the seventh-day bonus with a claim, once", () => {
    const state = createSeasonPreview()
    const next = seasonPreviewReducer(state, { type: "claim", id: 4 })
    expect(previewScore(next).total - previewScore(state).total).toBe(6)
    expect(next.loops[0].streak).toBe(7)
    expect(seasonPreviewReducer(next, { type: "claim", id: 4 })).toBe(next)
    expect(next.loops[1]).toEqual(state.loops[1])
  })
  it("never awards an already-earned milestone after a broken streak", () => {
    const state = createSeasonPreview()
    state.loops[0] = { ...state.loops[0], streak: 2, earned: [3] }
    const next = seasonPreviewReducer(state, { type: "claim", id: 4 })
    expect(previewScore(next).total - previewScore(state).total).toBe(1)
  })
  it("awards +30 at the Season's 28-day milestone", () => {
    const state = createSeasonPreview()
    state.loops[0] = {
      ...state.loops[0],
      claims: 27,
      streak: 27,
      earned: [3, 7, 14],
    }
    const next = seasonPreviewReducer(state, { type: "claim", id: 4 })
    expect(previewScore(next).total - previewScore(state).total).toBe(31)
  })
  it("includes late entrants' historical points without double counting", () => {
    const state = createSeasonPreview("late")
    const before = previewScore(state)
    const next = seasonPreviewReducer(state, {
      type: "registration",
      registered: true,
    })
    expect(next.registered).toBe(true)
    expect(next.earlyBird).toBe(false)
    expect(previewScore(next)).toEqual(before)
    expect(
      seasonPreviewReducer(next, { type: "registration", registered: true })
    ).toBe(next)
  })
  it("allows early refunds and removes Early Bird status", () => {
    const entered = seasonPreviewReducer(createSeasonPreview("registration"), {
      type: "registration",
      registered: true,
    })
    expect(entered.earlyBird).toBe(true)
    const refunded = seasonPreviewReducer(entered, {
      type: "registration",
      registered: false,
    })
    expect(refunded.registered).toBe(false)
    expect(refunded.earlyBird).toBe(false)
  })
  it("rejects entry after closing and refunds after starting", () => {
    const live = createSeasonPreview()
    expect(
      seasonPreviewReducer(live, { type: "registration", registered: false })
    ).toBe(live)
    const visitor = { ...live, registered: false }
    expect(
      seasonPreviewReducer(visitor, { type: "registration", registered: true })
    ).toBe(visitor)
    expect(canEnter("late")).toBe(true)
    expect(canEnter("live")).toBe(false)
  })
  it("credits Day Games as 1 claim +3 bonus with no streak change", () => {
    const state = createSeasonPreview()
    const next = seasonPreviewReducer(state, { type: "day-claim" })
    expect(previewScore(next)).toEqual({
      claims: 20,
      streaks: 9,
      games: 3,
      total: 32,
    })
    expect(next.loops).toEqual(state.loops)
    expect(seasonPreviewReducer(next, { type: "day-claim" })).toBe(next)
  })
  it.each(["registration", "late", "review", "prizes"] as const)(
    "awards no event points in the %s scenario",
    (phase) => {
      const state = { ...createSeasonPreview(phase), registered: true }
      expect(seasonPreviewReducer(state, { type: "day-claim" })).toBe(state)
    }
  )
  it("requires entry for claim scoring and freezes scoring in review", () => {
    const visitor = { ...createSeasonPreview(), registered: false }
    expect(seasonPreviewReducer(visitor, { type: "claim", id: 4 })).toBe(
      visitor
    )
    const review = createSeasonPreview("review")
    expect(canScore(review.phase)).toBe(false)
    expect(seasonPreviewReducer(review, { type: "claim", id: 4 })).toBe(review)
  })
  it("updates game objectives automatically without inventing rewards", () => {
    const state = createSeasonPreview()
    expect(seasonGameProgress("race", state)).toBe(19)
    const next = seasonPreviewReducer(state, { type: "claim", id: 4 })
    expect(seasonGameProgress("race", next)).toBe(20)
    expect(previewScore(next).games).toBe(0)
    expect(seasonGameProgress("sprint", next)).toBe(12)
  })
  it("keeps personal score and leaderboard totals identical", () => {
    const state = seasonPreviewReducer(createSeasonPreview(), {
      type: "day-claim",
    })
    const standings = previewStandings(state)
    expect(standings).toHaveLength(227)
    const current = standings.find((p) => p.current)!
    expect(current.total).toBe(previewScore(state).total)
    expect(current.rank).toBe(
      1 + standings.filter((p) => p.total > current.total).length
    )
    expect(Math.ceil(standings.length * 0.15)).toBe(35)
  })
  it("previews prize completion only after review, once", () => {
    const review = createSeasonPreview("review")
    expect(seasonPreviewReducer(review, { type: "prize" })).toBe(review)
    const next = seasonPreviewReducer(createSeasonPreview("prizes"), {
      type: "prize",
    })
    expect(next.prizeClaimed).toBe(true)
    expect(seasonPreviewReducer(next, { type: "prize" })).toBe(next)
  })
  it("supports visitor previews without changing the closed entry count", () => {
    const visitor = seasonPreviewReducer(createSeasonPreview(), {
      type: "viewer",
      registered: false,
    })
    expect(visitor.registered).toBe(false)
    expect(previewStandings(visitor)).toHaveLength(227)
    expect(
      seasonPreviewReducer(visitor, { type: "registration", registered: true })
    ).toBe(visitor)
  })
  it("does not offer a prize preview outside paid positions", () => {
    const state = seasonPreviewReducer(createSeasonPreview("prizes"), {
      type: "placement",
      winning: false,
    })
    expect(seasonPreviewReducer(state, { type: "prize" })).toBe(state)
  })
})
