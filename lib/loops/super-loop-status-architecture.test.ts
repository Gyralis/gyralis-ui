import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const STATUS_HOOK_PATH = resolve(
  process.cwd(),
  "lib/hooks/loops/super/use-super-loop-status.ts"
)
const CLAIM_ACTION_LOGIC =
  /useWriteContract|useWaitForTransactionReceipt|claimAndRegister|eligibility|\bfetch\s*\(/

describe("SuperLoop status hook architecture", () => {
  it("keeps claim and transaction actions out of the read hook", () => {
    expect(readFileSync(STATUS_HOOK_PATH, "utf8")).not.toMatch(
      CLAIM_ACTION_LOGIC
    )
  })
})
