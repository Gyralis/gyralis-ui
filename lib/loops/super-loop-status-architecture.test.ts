import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const STATUS_HOOK_PATH = resolve(
  process.cwd(),
  "lib/hooks/loops/super/use-super-loop-status.ts"
)
const CARD_CONTROLLER_PATH = resolve(
  process.cwd(),
  "components/loops/super-loop/use-super-loop-card-controller.ts"
)
const CLAIM_ACTION_LOGIC =
  /\bLoopClaim\b|LoopActionViewModel|useSuperLoopClaim|useWriteContract|useWaitForTransactionReceipt|claimAndRegister|eligibility|\bfetch\s*\(/

describe("SuperLoop read architecture", () => {
  it.each([STATUS_HOOK_PATH, CARD_CONTROLLER_PATH])(
    "keeps claim and transaction actions out of %s",
    (path) => {
      expect(readFileSync(path, "utf8")).not.toMatch(CLAIM_ACTION_LOGIC)
    }
  )

  it("wires the read-only status hook into the card controller", () => {
    expect(readFileSync(CARD_CONTROLLER_PATH, "utf8")).toContain(
      "useSuperLoopStatus"
    )
  })
})
