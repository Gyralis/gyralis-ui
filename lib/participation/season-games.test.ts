import { describe, expect, it } from "vitest"

import { completionBonuses, seasonGames, weekendTimeline } from "./season-games"
import {
  createSeasonPreview,
  previewScore,
  seasonPreviewReducer,
} from "./season-preview"

function at(time: string) {
  const state = createSeasonPreview("live")
  return {
    ...state,
    weekendTime: time,
    weekends: state.weekends.map(({ id }) => ({
      id,
      registered: false,
      claimed: false,
    })),
  }
}

describe("Weekend Ritual timeline", () => {
  it("starts the visual preview with Dec 13 claimed and its reward credited once", () => {
    const state = createSeasonPreview("live")
    const timeline = weekendTimeline(state)
    expect(state.weekendTime).toBe("2026-12-13T12:00:00Z")
    expect(timeline.stops.map((stop) => stop.status)).toEqual([
      "missed",
      "claimed",
      "upcoming",
      "upcoming",
    ])
    expect(state.weekends[1].registered).toBe(true)
    expect(timeline.progress).toBeGreaterThan(timeline.stops[1].position)
    expect(timeline.progress).toBeLessThan(timeline.stops[2].position)
    expect(
      previewScore(state).games - previewScore(at(state.weekendTime)).games
    ).toBe(3)
    expect(seasonPreviewReducer(state, { type: "weekend-claim", id: 2 })).toBe(
      state
    )
  })

  it("has the four December Sunday claim dates in chronological order", () => {
    const timeline = weekendTimeline(at("2026-12-12T12:00:00Z"))
    expect(timeline.stops.map((stop) => stop.claimAt.slice(0, 10))).toEqual([
      "2026-12-06",
      "2026-12-13",
      "2026-12-20",
      "2026-12-27",
    ])
    expect(timeline.stops.map((stop) => stop.position)).toEqual(
      [...timeline.stops.map((stop) => stop.position)].sort((a, b) => a - b)
    )
  })

  it.each([
    ["2026-11-27T12:00:00Z", 0],
    ["2026-12-05T00:00:00Z", 0],
    ["2026-12-16T12:00:00Z", 50],
    ["2026-12-28T00:00:00Z", 100],
    ["2027-01-10T00:00:00Z", 100],
  ])("tracks elapsed time at %s without inventing claims", (time, progress) => {
    const timeline = weekendTimeline(at(time))
    expect(timeline.progress).toBe(progress)
    expect(timeline.stops.some((stop) => stop.status === "claimed")).toBe(false)
  })

  it("moves toward a weekend before its claim window opens", () => {
    const earlier = weekendTimeline(at("2026-12-10T00:00:00Z"))
    const later = weekendTimeline(at("2026-12-12T12:00:00Z"))
    expect(later.progress).toBeGreaterThan(earlier.progress)
    expect(later.progress).toBeLessThan(later.stops[1].position)
  })

  it.each([
    ["2026-12-11T23:59:59Z", "upcoming", false, false],
    ["2026-12-12T00:00:00Z", "registered", true, false],
    ["2026-12-13T00:00:00Z", "claim", true, false],
    ["2026-12-13T23:59:59Z", "claim", true, false],
    ["2026-12-14T00:00:00Z", "missed", false, true],
  ])(
    "respects registration and claim boundaries at %s",
    (time, status, current, closed) => {
      const state = at(time)
      state.weekends[1].registered = true
      const stop = weekendTimeline(state).stops[1]
      expect(stop.status).toBe(status)
      expect(stop.current).toBe(current)
      expect(stop.closed).toBe(closed)
    }
  )

  it("distinguishes registration, Season entry and a missed Saturday", () => {
    expect(weekendTimeline(at("2026-12-12T00:00:00Z")).stops[1].status).toBe(
      "registration"
    )
    const visitor = { ...at("2026-12-12T00:00:00Z"), registered: false }
    expect(weekendTimeline(visitor).stops[1].status).toBe("entry-required")
    expect(weekendTimeline(at("2026-12-13T00:00:00Z")).stops[1].status).toBe(
      "missed"
    )
    // Missing Saturday registration must not mark Sunday as already elapsed.
    expect(weekendTimeline(at("2026-12-13T00:00:00Z")).stops[1].closed).toBe(
      false
    )
  })

  it("checks only recorded claims and keeps calendar progress independent", () => {
    const state = at("2026-12-14T00:00:00Z")
    const before = weekendTimeline(state)
    state.weekends[1] = { id: 2, registered: true, claimed: true }
    const after = weekendTimeline(state)
    expect(after.progress).toBe(before.progress)
    expect(
      after.stops
        .filter((stop) => stop.status === "claimed")
        .map((stop) => stop.id)
    ).toEqual([2])
    expect(after.stops[1].label).toBe("Claimed · +3 extra Season points")
  })

  it("handles invalid time and missing records without a claim-ready promise", () => {
    const invalid = weekendTimeline(at("invalid"))
    expect(invalid.progress).toBe(0)
    expect(invalid.stops.every((stop) => stop.status === "unavailable")).toBe(
      true
    )
    const state = at("2026-12-13T00:00:00Z")
    state.weekends = []
    expect(weekendTimeline(state).stops[1].status).toBe("unavailable")
  })

  it("finishes the calendar in review without turning missed claims into successes", () => {
    const timeline = weekendTimeline(createSeasonPreview("review"))
    expect(timeline.progress).toBe(100)
    expect(timeline.stops.every((stop) => stop.status === "missed")).toBe(true)
  })
})

describe("Revised game rewards", () => {
  it("awards Rule of 3 exactly nine points only when every required Loop qualifies", () => {
    const state = createSeasonPreview()
    state.requiredLoopIds = [3, 4]
    state.loops = state.loops.map((loop) => ({
      ...loop,
      claims: loop.id === 3 ? 2 : 20,
    }))
    expect(completionBonuses(state).explorer).toBe(0)
    state.loops = state.loops.map((loop) => ({ ...loop, claims: 3 }))
    expect(completionBonuses(state).explorer).toBe(9)
    expect(completionBonuses({ ...state, registered: false }).explorer).toBe(0)
    expect(
      completionBonuses({ ...state, requiredLoopIds: null }).explorer
    ).toBe(0)
    expect(seasonGames.find((game) => game.id === "explorer")?.bonus).toBe(9)
  })

  it("keeps a Sunday claim at three extra points, credits it once and updates its timeline stop", () => {
    let state = at("2026-12-12T12:00:00Z")
    state = seasonPreviewReducer(state, { type: "weekend-register", id: 2 })
    state = { ...state, weekendTime: "2026-12-13T12:00:00Z" }
    const before = previewScore(state)
    const claimed = seasonPreviewReducer(state, {
      type: "weekend-claim",
      id: 2,
    })
    const after = previewScore(claimed)
    expect(after.games - before.games).toBe(3)
    expect(after.claims - before.claims).toBe(1)
    expect(after.total - before.total).toBe(4)
    expect(weekendTimeline(claimed).stops[1].status).toBe("claimed")
    expect(
      seasonPreviewReducer(claimed, { type: "weekend-claim", id: 2 })
    ).toBe(claimed)
    expect(seasonGames.find((game) => game.id === "weekend")?.bonus).toBe(3)
  })
})
