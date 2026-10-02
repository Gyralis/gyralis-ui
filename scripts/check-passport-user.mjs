#!/usr/bin/env node

import { existsSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { loadEnvFile } from "node:process"

const usage = "Usage: node scripts/check-passport-user.mjs --address 0x..."

async function main() {
  const args = process.argv.slice(2)
  if (args.length === 1 && args[0] === "--help") {
    console.log(usage)
    return
  }
  if (
    args.length !== 2 ||
    args[0] !== "--address" ||
    !/^0x[0-9a-fA-F]{40}$/.test(args[1])
  ) {
    throw new Error(usage)
  }

  // Existing environment variables win; .env.local takes precedence over .env.
  for (const name of [".env.local", ".env"]) {
    const path = fileURLToPath(new URL(`../${name}`, import.meta.url))
    if (existsSync(path)) loadEnvFile(path)
  }
  const apiKey = process.env.GITCOIN_PASSPORT_API_KEY
  const scorerId = process.env.GITCOIN_PASSPORT_SCORER_ID
  if (!apiKey || !scorerId) {
    throw new Error(
      "Set GITCOIN_PASSPORT_API_KEY and GITCOIN_PASSPORT_SCORER_ID in .env.local or the environment."
    )
  }

  const address = args[1].toLowerCase()
  const endpoint = `https://api.passport.xyz/v2/stamps/${encodeURIComponent(scorerId)}/score/${address}`
  const response = await fetch(endpoint, {
    headers: { "X-API-KEY": apiKey },
    signal: AbortSignal.timeout(60_000),
    redirect: "error",
  })
  if (!response.ok) {
    throw new Error(`Human Passport request failed (HTTP ${response.status}).`)
  }
  // Includes overall score, timestamps, passing status, and per-stamp scores,
  // deduplication flags, and expiration dates as returned by Passport.
  const passport = await response.json()
  console.log(JSON.stringify(passport, null, 2))
  if (passport.error) process.exitCode = 1
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Passport check failed")
  process.exitCode = 1
})
