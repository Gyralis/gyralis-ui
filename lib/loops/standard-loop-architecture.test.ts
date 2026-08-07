import { readdirSync, readFileSync } from "node:fs"
import { extname, join, resolve } from "node:path"
import { describe, expect, it } from "vitest"

const STANDARD_LOOP_DIRECTORIES = [
  "components/loops/standard-loop",
  "lib/hooks/loops/standard",
]
const FORBIDDEN_SUPER_LOOP_LOGIC = /\bsuperLoop\b|\bSuperLoop\b|streaming/i
const PARTICIPATION_HOOK_PATH = resolve(
  process.cwd(),
  "lib/hooks/loops/standard/use-standard-loop-participation.ts"
)
const LOOPERS_MODAL_PATH = resolve(
  process.cwd(),
  "components/loops/loopers-modal.tsx"
)
const CLAIM_HOOK_PATH = resolve(
  process.cwd(),
  "lib/hooks/loops/standard/use-standard-loop-claim.ts"
)

function getSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)

    if (entry.isDirectory()) return getSourceFiles(path)
    return [".ts", ".tsx"].includes(extname(entry.name)) ? [path] : []
  })
}

describe("standard Loop architecture boundary", () => {
  it.each(STANDARD_LOOP_DIRECTORIES)(
    "keeps SuperLoop logic out of %s",
    (relativeDirectory) => {
      const directory = resolve(process.cwd(), relativeDirectory)

      for (const file of getSourceFiles(directory)) {
        expect(readFileSync(file, "utf8"), file).not.toMatch(
          FORBIDDEN_SUPER_LOOP_LOGIC
        )
      }
    }
  )

  it("reads visible participation from the current-period aggregate", () => {
    const participationHook = readFileSync(PARTICIPATION_HOOK_PATH, "utf8")

    expect(participationHook).toContain(
      "loopContractMethods.loop.getCurrentPeriodData"
    )
    expect(participationHook).not.toContain("getLogsChunked")
    expect(participationHook).not.toContain("parseAbiItem")
  })

  it("only enables detailed Looper logs while the modal is open", () => {
    const modal = readFileSync(LOOPERS_MODAL_PATH, "utf8")

    expect(modal).toMatch(/const registeredUsersEnabled\s*=\s*isOpen &&/)
    expect(modal).toMatch(/const claimedUsersEnabled\s*=\s*isOpen &&/)
  })

  it("skips wallet registration logs after the user has claimed", () => {
    const claimHook = readFileSync(CLAIM_HOOK_PATH, "utf8")

    expect(claimHook).toContain("claimerStatus != null &&")
    expect(claimHook).toContain("!hasClaimed")
    expect(claimHook).toContain("enabled: shouldCheckNextPeriodRegistration")
    expect(claimHook).toContain("void refreshAccountState().finally")
  })
})
