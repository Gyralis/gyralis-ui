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
const CLAIM_HOOK_PATH = resolve(
  process.cwd(),
  "lib/hooks/loops/super/use-super-loop-claim.ts"
)
const SETTINGS_HOOK_PATH = resolve(
  process.cwd(),
  "lib/hooks/loops/super/use-super-loop-settings.ts"
)
const PARTICIPATION_HOOK_PATH = resolve(
  process.cwd(),
  "lib/hooks/loops/super/use-super-loop-participation.ts"
)
const CARD_PATH = resolve(
  process.cwd(),
  "components/loops/super-loop/super-loop-card.tsx"
)
const CLAIM_ACTION_LOGIC =
  /\bLoopClaim\b|LoopActionViewModel|useSuperLoopClaim|useWriteContract|useWaitForTransactionReceipt|claimAndRegister|eligibility|\bfetch\s*\(/

describe("SuperLoop card architecture", () => {
  it("keeps claim and transaction actions out of the status hook", () => {
    expect(readFileSync(STATUS_HOOK_PATH, "utf8")).not.toMatch(
      CLAIM_ACTION_LOGIC
    )
  })

  it("keeps eligibility and transaction state in the claim hook", () => {
    const claimHook = readFileSync(CLAIM_HOOK_PATH, "utf8")

    expect(claimHook).toContain("useWriteContract")
    expect(claimHook).toContain("useWaitForTransactionReceipt")
    expect(claimHook).toContain(
      "loopContractMethods.superLoop.claimAndRegister"
    )
  })

  it("combines all SuperLoop hooks in the card controller", () => {
    const controller = readFileSync(CARD_CONTROLLER_PATH, "utf8")

    expect(controller).toContain("useSuperLoopStatus")
    expect(controller).toContain("useSuperLoopClaim")
    expect(controller).toContain("useSuperLoopSettings")
    expect(controller).toContain("useSuperLoopParticipation")
    expect(controller).toContain("useLoopTokenBalance")
    expect(controller).toContain("LoopActionViewModel")
  })

  it("keeps settings and participation reads in their dedicated hooks", () => {
    const participationHook = readFileSync(PARTICIPATION_HOOK_PATH, "utf8")

    expect(readFileSync(SETTINGS_HOOK_PATH, "utf8")).toContain(
      "loopContractMethods.superLoop.getDetails"
    )
    expect(participationHook).toContain(
      "loopContractMethods.superLoop.getCurrentPeriodData"
    )
    expect(participationHook).not.toContain("usePeriodLogBlockRange")
    expect(participationHook).not.toContain("useRegisteredUsers")
    expect(participationHook).not.toContain("useClaimedUsers")
  })

  it("refreshes SuperLoop data from events instead of polling", () => {
    const controller = readFileSync(CARD_CONTROLLER_PATH, "utf8")
    const statusHook = readFileSync(STATUS_HOOK_PATH, "utf8")
    const participationHook = readFileSync(PARTICIPATION_HOOK_PATH, "utf8")

    expect(statusHook).not.toContain("refetchInterval")
    expect(participationHook).not.toContain("refetchInterval")
    expect(controller).toContain("onConfirmed: refreshCardData")
    expect(controller).toContain("onCountdownComplete: refreshCardData")
  })

  it("keeps the card as a controller-only renderer", () => {
    const card = readFileSync(CARD_PATH, "utf8")

    expect(card).toContain("useSuperLoopCardController")
    expect(card).toContain("model={controller.action}")
    expect(card).not.toMatch(/<LoopClaim[\s>]/)
    expect(card).not.toMatch(
      /useLoopSettingsDetails|useSuperLoopStatus|useSuperLoopClaim|useSuperLoopParticipation|useMemo/
    )
  })
})
