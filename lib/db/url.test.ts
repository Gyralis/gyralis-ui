import { describe, expect, it } from "vitest"

import { withMongoConnectionTimeouts } from "./url"

describe("MongoDB URL defaults", () => {
  it("adds fail-fast timeout defaults to MongoDB URLs", () => {
    expect(
      withMongoConnectionTimeouts(
        "mongodb+srv://user:pass@example.mongodb.net/gyralis?retryWrites=true"
      )
    ).toBe(
      "mongodb+srv://user:pass@example.mongodb.net/gyralis?retryWrites=true&serverSelectionTimeoutMS=5000&connectTimeoutMS=5000"
    )
  })

  it("preserves explicit MongoDB timeout settings", () => {
    expect(
      withMongoConnectionTimeouts(
        "mongodb://localhost:27017/gyralis?serverSelectionTimeoutMS=1000&connectTimeoutMS=2000"
      )
    ).toBe(
      "mongodb://localhost:27017/gyralis?serverSelectionTimeoutMS=1000&connectTimeoutMS=2000"
    )
  })

  it("leaves non-MongoDB URLs unchanged", () => {
    expect(withMongoConnectionTimeouts("postgres://localhost/db")).toBe(
      "postgres://localhost/db"
    )
  })
})
