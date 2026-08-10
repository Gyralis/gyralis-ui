import { describe, expect, it } from "vitest"

import { formatAnimatedReward } from "./use-period-reward-count-up"

describe("period reward count-up", () => {
  it("keeps stable decimal places while the reward streams", () => {
    expect(formatAnimatedReward(1_234_567_890_000_000n, 18)).toBe("0.0012345")
    expect(formatAnimatedReward(0n, 18)).toBe("0.0000000")
  })

  it("does not display more precision than the token supports", () => {
    expect(formatAnimatedReward(1_234_567n, 6)).toBe("1.234567")
  })
})
