import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const TRANSACTION_PATHS = [
  "lib/hooks/loops/super/use-super-loop-claim.ts",
  "lib/hooks/loops/standard/use-standard-loop-claim.ts",
  "components/loops/loop-claim.tsx",
]

describe("Loop transaction outcome notifications", () => {
  it.each(TRANSACTION_PATHS)(
    "distinguishes reverted receipts from confirmation errors in %s",
    (path) => {
      const source = readFileSync(resolve(process.cwd(), path), "utf8")

      expect(source).toMatch(
        /(?:receiptStatus|transactionReceipt\.status) === "reverted"/
      )
      expect(source).toContain("getRevertedTransactionToast")
      expect(source).toContain("getConfirmationDelayedToast")
    }
  )
})
