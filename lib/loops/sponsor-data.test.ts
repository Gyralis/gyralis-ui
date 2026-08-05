import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { LoopCardsData } from "@/data/loops-data"
import { describe, expect, it } from "vitest"

const CARD_SHELL_PATH = resolve(
  process.cwd(),
  "components/loops/loop-card-shell.tsx"
)

describe("Loop sponsor data", () => {
  it("keeps every configured sponsor complete", () => {
    const sponsoredLoops = LoopCardsData.filter(
      (loop) => loop.sponsorName || loop.sponsorLogoUrl || loop.sponsorUrl
    )

    expect(sponsoredLoops.length).toBeGreaterThan(0)
    for (const loop of sponsoredLoops) {
      expect(loop.sponsorName).toBeTruthy()
      expect(loop.sponsorLogoUrl).toMatch(/^\//)
      expect(() => new URL(loop.sponsorUrl ?? "")).not.toThrow()
    }
  })

  it("renders sponsor details from the Loop model", () => {
    const cardShell = readFileSync(CARD_SHELL_PATH, "utf8")

    expect(cardShell).toContain("loop.sponsorName")
    expect(cardShell).toContain("loop.sponsorLogoUrl")
    expect(cardShell).toContain("loop.sponsorUrl")
    expect(cardShell).not.toContain('src="/1Hive-logo.png"')
    expect(cardShell).not.toContain('href="https://1hive.org"')
  })
})
