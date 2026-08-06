import { LoopCardsData } from "@/data/loops-data"
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

  it("maps the enabled Blockscout Loop to its eligibility provider", () => {
    expect(
      findAllowlistedLoop(
        "blockscout",
        "0xab25dbafd11b1eb606b2455eecec67e6746e409b",
        100
      )
    ).toMatchObject({
      address: "0xaB25dBaFD11b1eb606B2455Eecec67e6746E409b",
      chainId: 100,
      contractType: "loop",
    })
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

describe("Loop card eligibility links", () => {
  it.each([
    [
      3,
      "https://app.gardens.fund/gardens/100/0xe2396fe2169ca026962971d3b2e373ba925b6257",
    ],
    [4, "https://merits.blockscout.com/?tab=spend"],
    [
      5,
      "https://app.gardens.fund/gardens/8453/0x9a378ebed22610e9fbb941fe27323fe00cdeebc6",
    ],
  ] as const)("maps Loop %s to its eligibility destination", (id, url) => {
    expect(LoopCardsData.find((loop) => loop.id === id)?.eligibilityUrl).toBe(
      url
    )
  })
})
