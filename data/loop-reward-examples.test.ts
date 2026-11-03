import {
  LoopCardsData,
  rwagmiTestLoop,
  SoneiumLoopCardsData,
} from "@/data/loops-data"
import { describe, expect, it } from "vitest"

import { getLoopRewardExample } from "./loop-reward-examples"

describe("verified Loop reward examples", () => {
  it("provides a contract snapshot for every currently visible Loop", () => {
    for (const loop of [...LoopCardsData, ...SoneiumLoopCardsData].filter(
      (loop) => loop.enabled
    )) {
      expect(getLoopRewardExample(loop), loop.title).toBeDefined()
    }
  })

  it("preserves current payout precision and correctly labels SuperToken units", () => {
    expect(getLoopRewardExample(rwagmiTestLoop)).toMatchObject({
      dailyAmount: "562.396691539443564128",
      symbol: "RWAGMI",
      period: 21,
    })
    const hive = LoopCardsData.find(
      (loop) => loop.chainId === 100 && loop.id === 3
    )!
    expect(getLoopRewardExample(hive)?.dailyAmount).toBe("0.036414699878409818")
    const trueLoop = LoopCardsData.find(
      (loop) => loop.contractType === "superLoop"
    )!
    expect(getLoopRewardExample(trueLoop)).toMatchObject({
      dailyAmount: "0",
      symbol: "USDCx",
      decimals: 18,
    })
  })

  it("resolves by chain and contract independently of UI loop ID or address case", () => {
    expect(
      getLoopRewardExample({
        ...rwagmiTestLoop,
        address: rwagmiTestLoop.address!.toLowerCase() as `0x${string}`,
      })
    ).toEqual(getLoopRewardExample(rwagmiTestLoop))
    expect(
      getLoopRewardExample({ ...rwagmiTestLoop, chainId: 100 })
    ).toBeUndefined()
    expect(getLoopRewardExample({ chainId: 8453 })).toBeUndefined()
  })
})
