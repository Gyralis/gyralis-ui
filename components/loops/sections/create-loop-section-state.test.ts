import { describe, expect, it, vi } from "vitest"

import { createLoopSectionState } from "./create-loop-section-state"

describe("Loop card section state", () => {
  const retry = vi.fn()
  const data = { value: "10 HNY" }

  it("shows loading before the first value arrives", () => {
    expect(
      createLoopSectionState({
        data: undefined,
        error: undefined,
        errorMessage: "Unable to load",
        isFetching: true,
        loadingMessage: "Loading rewards...",
        retry,
      })
    ).toEqual({ status: "loading", message: "Loading rewards..." })
  })

  it("shows a local error with its retry action", () => {
    const state = createLoopSectionState({
      data: undefined,
      error: new Error("RPC unavailable"),
      errorMessage: "Unable to load",
      isFetching: false,
      retry,
    })

    expect(state).toEqual({
      status: "error",
      message: "RPC unavailable",
      retry,
    })
  })

  it("uses the fallback for non-Error failures", () => {
    expect(
      createLoopSectionState({
        data: undefined,
        error: "RPC unavailable",
        errorMessage: "Unable to load",
        isFetching: false,
        retry,
      })
    ).toMatchObject({ status: "error", message: "Unable to load" })
  })

  it("keeps existing data visible during a background refresh", () => {
    expect(
      createLoopSectionState({
        data,
        error: undefined,
        errorMessage: "Unable to load",
        isFetching: true,
        retry,
      })
    ).toEqual({ status: "refreshing", data })
  })

  it("keeps stale data visible when a background refresh fails", () => {
    expect(
      createLoopSectionState({
        data,
        error: new Error("Refresh failed"),
        errorMessage: "Unable to load",
        isFetching: false,
        retry,
      })
    ).toEqual({ status: "ready", data })
  })
})
