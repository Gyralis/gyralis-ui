import { describe, expect, it } from "vitest"

import { parseLeaderboardQuery } from "./leaderboard-query"

describe("parseLeaderboardQuery", () => {
  it("defaults pagination and leaderboard order", () => {
    expect(
      parseLeaderboardQuery("http://localhost/api/leaderboards/global")
    ).toEqual({
      limit: 1000,
      offset: 0,
      sortBy: "totalPoints",
      sortOrder: "desc",
      filters: {},
    })
  })

  it("keeps valid sorting parameters", () => {
    expect(
      parseLeaderboardQuery(
        "http://localhost/api/leaderboards/global?sortBy=totalClaims&sortOrder=asc"
      )
    ).toMatchObject({
      sortBy: "totalClaims",
      sortOrder: "asc",
    })
  })

  it("uses ascending order by default for address sorting", () => {
    expect(
      parseLeaderboardQuery(
        "http://localhost/api/leaderboards/global?sortBy=userAddress"
      )
    ).toMatchObject({
      sortBy: "userAddress",
      sortOrder: "asc",
    })
  })

  it("ignores invalid sorting parameters", () => {
    expect(
      parseLeaderboardQuery(
        "http://localhost/api/leaderboards/global?sortBy=bad&sortOrder=bad"
      )
    ).toMatchObject({
      sortBy: "totalPoints",
      sortOrder: "desc",
    })
  })

  it("parses supported filters", () => {
    expect(
      parseLeaderboardQuery(
        "http://localhost/api/leaderboards/global?userAddress=0xABC&minTotalPoints=10&maxTotalClaims=25&minCurrentStreak=bad"
      )
    ).toMatchObject({
      filters: {
        userAddress: "0xabc",
        minTotalPoints: 10,
        maxTotalClaims: 25,
      },
    })
  })
})
