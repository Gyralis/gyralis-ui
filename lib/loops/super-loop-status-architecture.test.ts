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
const TOKEN_BALANCE_HOOK_PATH = resolve(
  process.cwd(),
  "lib/hooks/app/use-loop-token-balance.ts"
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
    expect(controller).toContain("payoutToken: loop.payoutToken")
    expect(controller).toContain("tokenSymbol: balance.data?.payoutSymbol")
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

  it("keeps duplicate and unused reads out of the SuperLoop balance batch", () => {
    const balanceHook = readFileSync(TOKEN_BALANCE_HOOK_PATH, "utf8")

    expect(balanceHook).toContain('functionName: "decimals"')
    expect(balanceHook).toContain('functionName: "symbol"')
    expect(balanceHook).toContain("payoutToken ?? token ?? zeroAddress")
    expect(balanceHook).toContain("payoutSymbol: payoutSymbol ?? symbol")
    expect(balanceHook).toContain('functionName: "getAccountFlowrate"')
    expect(balanceHook).not.toContain("realtimeAvailableNow")
    expect(balanceHook).not.toContain("getLoopContractMethods")
    expect(balanceHook).not.toContain("getLoopContractAbi")
  })

  it("refreshes SuperLoop data from events instead of polling", () => {
    const controller = readFileSync(CARD_CONTROLLER_PATH, "utf8")
    const statusHook = readFileSync(STATUS_HOOK_PATH, "utf8")
    const participationHook = readFileSync(PARTICIPATION_HOOK_PATH, "utf8")
    const actionRefreshStart = controller.indexOf("const refreshAfterAction")
    const actionRefreshEnd = controller.indexOf(
      "const refreshCardData",
      actionRefreshStart
    )
    const actionRefresh = controller.slice(actionRefreshStart, actionRefreshEnd)

    expect(statusHook).not.toContain("refetchInterval")
    expect(participationHook).not.toContain("refetchInterval")
    expect(actionRefreshStart).toBeGreaterThan(-1)
    expect(actionRefreshEnd).toBeGreaterThan(actionRefreshStart)
    expect(actionRefresh).toContain("refetchParticipation()")
    expect(actionRefresh).toContain("refetchStatus()")
    expect(actionRefresh).not.toContain("refetchSettings()")
    expect(actionRefresh).not.toContain("refetchBalance()")
    expect(controller).toContain("onConfirmed: refreshAfterAction")
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
