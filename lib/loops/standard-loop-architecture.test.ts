import { readdirSync, readFileSync } from "node:fs"
import { extname, join, resolve } from "node:path"
import { describe, expect, it } from "vitest"

const STANDARD_LOOP_DIRECTORIES = [
  "components/loops/standard-loop",
  "lib/hooks/loops/standard",
]
const FORBIDDEN_SUPER_LOOP_LOGIC = /\bsuperLoop\b|\bSuperLoop\b|streaming/i

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
})
