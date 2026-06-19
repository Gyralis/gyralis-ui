import { describe, expect, it } from "vitest"

import { parsePagination } from "./pagination"

describe("parsePagination", () => {
  it("defaults to a 1000 item page", () => {
    expect(parsePagination("http://localhost/api/leaderboards/global")).toEqual(
      {
        limit: 1000,
        offset: 0,
      }
    )
  })

  it("caps requested page size at 1000", () => {
    expect(
      parsePagination("http://localhost/api/leaderboards/global?limit=5000")
    ).toEqual({
      limit: 1000,
      offset: 0,
    })
  })

  it("keeps valid custom pagination parameters", () => {
    expect(
      parsePagination(
        "http://localhost/api/leaderboards/global?limit=250&offset=500"
      )
    ).toEqual({
      limit: 250,
      offset: 500,
    })
  })

  it("falls back for invalid pagination parameters", () => {
    expect(
      parsePagination(
        "http://localhost/api/leaderboards/global?limit=bad&offset=bad"
      )
    ).toEqual({
      limit: 1000,
      offset: 0,
    })
  })
})
