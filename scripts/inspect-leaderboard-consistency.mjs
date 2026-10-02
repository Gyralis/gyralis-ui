// Read-only: compares stored global leaderboard entries with eligible loop stats.
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { PrismaClient } from "@prisma/client"

const require = createRequire(import.meta.url)
const nextRequire = createRequire(require.resolve("next/package.json"))
nextRequire("@next/env").loadEnvConfig(process.cwd())
const filterSource = readFileSync(
  new URL("../lib/scoring/loop-filters.ts", import.meta.url),
  "utf8"
)
const excluded = JSON.parse(
  filterSource.match(/ignoredScoringLoopIds = (\[[\d,\s]+\])/)[1]
)
const url = new URL(process.env.DATABASE_URL)
url.searchParams.set("serverSelectionTimeoutMS", "5000")
url.searchParams.set("connectTimeoutMS", "5000")
const db = new PrismaClient({ datasources: { db: { url: url.toString() } } })
try {
  const [loops, entries] = await Promise.all([
    db.userLoopStats.findMany({
      where: { loopId: { notIn: excluded } },
      select: {
        userAddress: true,
        totalPoints: true,
        totalClaims: true,
        longestStreak: true,
      },
    }),
    db.leaderboardEntry.findMany({
      where: { scope: "global" },
      select: {
        userAddress: true,
        totalPoints: true,
        totalClaims: true,
        longestStreak: true,
      },
    }),
  ])
  const expected = new Map()
  for (const loop of loops) {
    const address = loop.userAddress.toLowerCase()
    const total = expected.get(address) ?? {
      totalPoints: 0,
      totalClaims: 0,
      longestStreak: 0,
    }
    total.totalPoints += loop.totalPoints
    total.totalClaims += loop.totalClaims
    total.longestStreak = Math.max(total.longestStreak, loop.longestStreak)
    expected.set(address, total)
  }
  const seen = new Set()
  const discrepancies = []
  for (const entry of entries) {
    const address = entry.userAddress.toLowerCase()
    const total = expected.get(address) ?? {
      totalPoints: 0,
      totalClaims: 0,
      longestStreak: 0,
    }
    if (seen.has(address))
      discrepancies.push({ address, issue: "duplicate global wallet" })
    seen.add(address)
    if (
      ["totalPoints", "totalClaims", "longestStreak"].some(
        (key) => entry[key] !== total[key]
      )
    ) {
      discrepancies.push({ address, expected: total, actual: entry })
    }
  }
  for (const [address, total] of expected) {
    if (total.totalClaims > 0 && !seen.has(address))
      discrepancies.push({
        address,
        issue: "missing global entry",
        expected: total,
      })
  }
  console.log(
    JSON.stringify(
      {
        excludedLoopIds: excluded,
        loopRecords: loops.length,
        globalEntries: entries.length,
        discrepancyCount: discrepancies.length,
        discrepancies: discrepancies.slice(0, 20),
      },
      null,
      2
    )
  )
  if (discrepancies.length) process.exitCode = 1
} catch (error) {
  // Do not print connection strings or credentials from database errors.
  console.error(
    "Read-only comparison failed:",
    error.name,
    error.code ?? "database connection unavailable"
  )
  process.exitCode = 2
} finally {
  await db.$disconnect()
}
