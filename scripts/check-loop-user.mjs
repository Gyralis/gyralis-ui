#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import {
  createPublicClient,
  getAddress,
  http,
  isAddress,
  parseAbi,
  parseAbiItem,
} from "viem"
import { gnosis } from "viem/chains"

const loops = {
  "1hive": {
    name: "1Hive Gardens",
    provider: "garden_1hive",
    address: "0x8995641fb3E452bC1359E79A738a6DE556015696",
    chain: gnosis,
  },
  blockscout: {
    name: "Blockscout Merits",
    provider: "blockscout",
    address: "0xaB25dBaFD11b1eb606B2455Eecec67e6746E409b",
    chain: gnosis,
  },
}

const loopAbi = parseAbi([
  "function getClaimerStatus(address claimer) view returns (bool isRegistered, bool hasClaimed)",
  "function getCurrentPeriod() view returns (uint256)",
  "function getPeriodIndividualPayout(uint256 periodNumber) view returns (uint256)",
])

const legacyRegisterEvent = parseAbiItem(
  "event Register(address indexed sender, uint256 indexed periodNumber)"
)
const upgradedRegisterEvent = parseAbiItem(
  "event Register(address indexed sender, address indexed token, uint256 indexed periodNumber)"
)

function loadEnvFile(fileName) {
  const filePath = resolve(process.cwd(), fileName)
  if (!existsSync(filePath)) return

  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const equalsIndex = trimmed.indexOf("=")
    if (equalsIndex === -1) continue
    const key = trimmed.slice(0, equalsIndex).trim()
    let value = trimmed.slice(equalsIndex + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = value
  }
}

function parseArgs(argv) {
  const args = { loop: "all", format: "table" }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    const readValue = () => {
      const next = argv[i + 1]
      if (!next || next.startsWith("--")) throw new Error(`Missing value for ${arg}`)
      i += 1
      return next
    }
    if (arg === "--address") args.address = readValue()
    else if (arg === "--loop") args.loop = readValue().toLowerCase()
    else if (arg === "--format") args.format = readValue().toLowerCase()
    else if (arg === "--rpc-url") args.rpcUrl = readValue()
    else throw new Error(`Unknown argument: ${arg}`)
  }
  return args
}

function requireEnv(name) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required env var: ${name}`)
  return value
}

async function fetchPassportScore(userAddress) {
  const scorerId = requireEnv("GITCOIN_PASSPORT_SCORER_ID")
  const apiKey = requireEnv("GITCOIN_PASSPORT_API_KEY")
  const endpoint = `https://api.scorer.gitcoin.co/registry/score/${scorerId}/${userAddress}`
  const response = await fetch(endpoint, { headers: { "X-API-KEY": apiKey } })
  if (!response.ok) {
    const body = await response.text()
    if (response.status === 404 || body.includes("Unable to get score for provided scorer.")) {
      return { score: null, error: "Passport score is not synced for this scorer." }
    }
    throw new Error(`Failed to fetch Passport score (${response.status}): ${body.slice(0, 240)}`)
  }
  const data = await response.json()
  return {
    score: Number(data.score),
    lastScoreTimestamp: data.last_score_timestamp ?? null,
  }
}

async function checkGardenMembership(userAddress) {
  const version = requireEnv("GARDENS_SUBGRAPH_VERSION")
  const endpoint = `https://api.studio.thegraph.com/query/102093/gardens-v2---gnosis/${version}`
  const query = `
    query CheckMembership($userAddress: String!) {
      memberCommunities(
        where: { registryCommunity: "0xe2396fe2169ca026962971d3b2e373ba925b6257", memberAddress: $userAddress }
      ) { memberAddress }
    }
  `
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { userAddress: userAddress.toLowerCase() } }),
  })
  if (!response.ok) throw new Error(`Gardens subgraph error (${response.status})`)
  const json = await response.json()
  return { eligible: json.data?.memberCommunities?.length > 0, detail: "1Hive membership" }
}

async function checkBlockscoutRedemption(userAddress) {
  const addrLower = userAddress.toLowerCase()
  const baseUrl = process.env.BLOCKSCOUT_POINTS_BASE ?? "https://points.k8s-dev.blockscout.com"
  const offerId = process.env.BLOCKSCOUT_OFFER_ID ?? "gyralis-offer"
  const endpoint = `${baseUrl}/api/v1/offers/${offerId}/redemptions`

  async function fetchPage(params) {
    const url = new URL(endpoint)
    for (const [key, value] of Object.entries(params ?? {})) url.searchParams.set(key, value)
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Blockscout redemptions error (${response.status})`)
    return response.json()
  }

  try {
    const filtered = await fetchPage({ address: userAddress })
    if (filtered.items?.some((item) => item.address?.toLowerCase() === addrLower)) {
      return { eligible: true, detail: "Blockscout offer redemption" }
    }
    if (filtered.items && filtered.items.length > 0 && !filtered.next_page_params) {
      return { eligible: false, detail: "Blockscout offer redemption" }
    }
  } catch {
    // Fall back to paginated scan.
  }

  let params
  for (let page = 0; page < 100; page += 1) {
    const data = await fetchPage(params)
    if (data.items?.some((item) => item.address?.toLowerCase() === addrLower)) {
      return { eligible: true, detail: "Blockscout offer redemption" }
    }
    if (!data.next_page_params) break
    params = data.next_page_params
  }
  return { eligible: false, detail: "Blockscout offer redemption" }
}

async function checkExternalEligibility(loop, userAddress) {
  if (loop.provider === "garden_1hive") return checkGardenMembership(userAddress)
  if (loop.provider === "blockscout") return checkBlockscoutRedemption(userAddress)
  throw new Error(`Unsupported loop provider: ${loop.provider}`)
}

async function checkOnchainStatus(loop, userAddress, rpcUrl) {
  const client = createPublicClient({ chain: loop.chain, transport: http(rpcUrl) })
  const [claimerStatus, currentPeriod] = await Promise.all([
    client.readContract({
      address: loop.address,
      abi: loopAbi,
      functionName: "getClaimerStatus",
      args: [userAddress],
    }),
    client.readContract({
      address: loop.address,
      abi: loopAbi,
      functionName: "getCurrentPeriod",
    }),
  ])
  const currentPeriodPayout = await client.readContract({
    address: loop.address,
    abi: loopAbi,
    functionName: "getPeriodIndividualPayout",
    args: [currentPeriod],
  })
  const nextPeriod = currentPeriod + 1n
  const [legacyLogs, upgradedLogs] = await Promise.all([
    client.getLogs({
      address: loop.address,
      event: legacyRegisterEvent,
      args: { sender: userAddress, periodNumber: nextPeriod },
      fromBlock: 0n,
      toBlock: "latest",
    }),
    client.getLogs({
      address: loop.address,
      event: upgradedRegisterEvent,
      args: { sender: userAddress, periodNumber: nextPeriod },
      fromBlock: 0n,
      toBlock: "latest",
    }),
  ])
  const isRegistered = Boolean(claimerStatus[0])
  const hasClaimed = Boolean(claimerStatus[1])
  return {
    currentPeriod: currentPeriod.toString(),
    nextPeriod: nextPeriod.toString(),
    registeredCurrentPeriod: isRegistered,
    claimedCurrentPeriod: hasClaimed,
    currentPeriodPayout: currentPeriodPayout.toString(),
    claimableNow: isRegistered && !hasClaimed && currentPeriodPayout > 0n,
    registeredNextPeriod: legacyLogs.length > 0 || upgradedLogs.length > 0,
  }
}

async function main() {
  loadEnvFile(".env")
  loadEnvFile(".env.local")
  const args = parseArgs(process.argv.slice(2))
  if (!args.address || !isAddress(args.address)) throw new Error("Pass a valid wallet with --address 0x...")
  if (args.loop !== "all" && !loops[args.loop]) throw new Error("--loop must be one of: all, 1hive, blockscout")

  const userAddress = getAddress(args.address)
  const thresholdScore = Number(process.env.THRESHOLD_SCORE ?? 0)
  const passport = await fetchPassportScore(userAddress)
  const loopKeys = args.loop === "all" ? Object.keys(loops) : [args.loop]
  const results = await Promise.all(
    loopKeys.map(async (loopKey) => {
      const loop = loops[loopKey]
      const [externalEligibility, onchain] = await Promise.all([
        checkExternalEligibility(loop, userAddress),
        checkOnchainStatus(loop, userAddress, args.rpcUrl ?? process.env.GNOSIS_RPC_URL),
      ])
      const passesPassport = passport.score != null && passport.score >= thresholdScore
      return {
        address: userAddress,
        loop: loop.name,
        loopKey,
        loopAddress: loop.address,
        chainId: loop.chain.id,
        passportScore: passport.score,
        passportLastScoreTimestamp: passport.lastScoreTimestamp ?? null,
        passportError: passport.error ?? null,
        thresholdScore,
        passesPassport,
        passesExternalEligibility: externalEligibility.eligible,
        externalEligibility: externalEligibility.detail,
        canEnterOrClaim: passesPassport && externalEligibility.eligible,
        onchain,
      }
    })
  )
  console.log(JSON.stringify(results, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
