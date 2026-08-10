import { describe, expect, it } from "vitest"

import {
  BLOCKSCOUT_TRANSACTION_LABEL,
  getBlockscoutTransactionUrl,
} from "./blockscout"

describe("Blockscout transaction links", () => {
  it.each([
    [100, "https://gnosis.blockscout.com/tx/0x123"],
    [10200, "https://gnosis-chiado.blockscout.com/tx/0x123"],
    [8453, "https://base.blockscout.com/tx/0x123"],
  ])("maps chain %s to its Blockscout instance", (chainId, expected) => {
    expect(getBlockscoutTransactionUrl(chainId, "0x123")).toBe(expected)
  })

  it("omits links for unsupported chains", () => {
    expect(getBlockscoutTransactionUrl(1, "0x123")).toBeUndefined()
  })

  it("uses an explicit Blockscout action label", () => {
    expect(BLOCKSCOUT_TRANSACTION_LABEL).toBe("View on Blockscout")
  })
})
