import { describe, expect, it } from "vitest"

import { findAllowlistedLoop } from "./eligibility"

describe("findAllowlistedLoop Gardens community mapping", () => {
  it("maps the enabled 1Hive loop to the 1Hive Gardens community", () => {
    expect(
      findAllowlistedLoop(
        "gardens",
        "0x8995641fb3e452bc1359e79a738a6de556015696",
        100
      )
    ).toMatchObject({
      address: "0x8995641fb3E452bC1359E79A738a6DE556015696",
      chainId: 100,
      gardensCommunity: "1hive",
    })
  })

  it("maps the enabled Markee SuperLoop to the Markee Gardens community", () => {
    expect(
      findAllowlistedLoop(
        "gardens",
        "0x3a5972524cc121d6d8a9a7e79d6f49dbfe71857b",
        8453
      )
    ).toMatchObject({
      address: "0x3a5972524cc121D6d8A9a7e79d6F49dbfe71857b",
      chainId: 8453,
      contractType: "superLoop",
      gardensCommunity: "markee",
    })
  })

  it("does not allow a Gardens loop on the wrong chain", () => {
    expect(
      findAllowlistedLoop(
        "gardens",
        "0x8995641fb3E452bC1359E79A738a6DE556015696",
        8453
      )
    ).toBeUndefined()
  })

  it("does not allow the loop through a different provider", () => {
    expect(
      findAllowlistedLoop(
        "blockscout",
        "0x8995641fb3E452bC1359E79A738a6DE556015696",
        100
      )
    ).toBeUndefined()
  })
})
