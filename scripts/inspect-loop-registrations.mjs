#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"
import {
  createPublicClient,
  formatUnits,
  getAddress,
  http,
  parseAbi,
  parseAbiItem,
} from "viem"
import { base, gnosis } from "viem/chains"

const loops = {
  "1hive": {
    name: "1Hive Gardens",
    address: "0x8995641fb3E452bC1359E79A738a6DE556015696",
    chain: gnosis,
    contractType: "loop",
  },
  blockscout: {
    name: "Blockscout Merits",
    address: "0xaB25dBaFD11b1eb606B2455Eecec67e6746E409b",
    chain: gnosis,
    contractType: "loop",
  },
  "test-superloops": {
    name: "TEST SUPERLOOPS",
    address: "0x42664386739EFdD277Fa1eB05658b562c3b804c0",
    chain: base,
    contractType: "superLoop",
  },
}

const loopAbi = parseAbi(["function getCurrentPeriod() view returns (uint256)"])
const superLoopAbi = parseAbi([
  "function getStreamingCurrentPeriod() view returns (uint256)",
])
const loopDetailsAbi = parseAbi([
  "function getLoopDetails() view returns (address token, uint256 periodLength, uint256 percentPerPeriod, uint256 firstPeriodStart)",
])
const superLoopDetailsAbi = parseAbi([
  "function getStreamingLoopDetails() view returns (address token, uint256 periodLength, uint256 percentPerPeriod, uint256 firstPeriodStart)",
])
const periodPayoutAbi = parseAbi([
  "function getPeriodIndividualPayout(uint256 periodNumber) view returns (uint256)",
])
const erc20MetadataAbi = parseAbi([
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address account) view returns (uint256)",
])

const legacyRegisterEvent = parseAbiItem(
  "event Register(address indexed sender, uint256 indexed periodNumber)"
)
const upgradedRegisterEvent = parseAbiItem(
  "event Register(address indexed sender, address indexed token, uint256 indexed periodNumber)"
)
const legacyClaimEvent = parseAbiItem(
  "event Claim(address indexed claimer, uint256 periodNumber, uint256 payout)"
)
const upgradedClaimEvent = parseAbiItem(
  "event Claim(address indexed claimer, address indexed token, uint256 indexed periodNumber, uint256 payout)"
)

const DEFAULT_CACHE_FILE = "data/loop-registration-cache.json"
const DEFAULT_HISTORY_FILE = "data/history/loop-stats-history.json"

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
  const args = {
    loop: "all",
    format: "json",
    cacheFile: DEFAULT_CACHE_FILE,
    historyFile: DEFAULT_HISTORY_FILE,
  }

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    const readValue = () => {
      const next = argv[i + 1]
      if (!next || next.startsWith("--")) throw new Error(`Missing value for ${arg}`)
      i += 1
      return next
    }

    if (arg === "--loop") args.loop = readValue().toLowerCase()
    else if (arg === "--format") args.format = readValue().toLowerCase()
    else if (arg === "--rpc-url") args.rpcUrl = readValue()
    else if (arg === "--up-to-period") args.upToPeriod = readValue()
    else if (arg === "--cache-file") args.cacheFile = readValue()
    else if (arg === "--history-file") args.historyFile = readValue()
    else if (arg === "--refresh-all") args.refreshAll = true
    else if (arg === "--skip-history") args.skipHistory = true
    else throw new Error(`Unknown argument: ${arg}`)
  }

  return args
}

function parsePeriod(value, flagName) {
  if (!/^\d+$/.test(value)) throw new Error(`${flagName} must be a non-negative integer`)
  return BigInt(value)
}

function getLoopKeys(loopArg) {
  if (loopArg === "all") return Object.keys(loops)
  if (!loops[loopArg]) {
    throw new Error(
      `--loop must be one of: all, ${Object.keys(loops).join(", ")}`
    )
  }
  return [loopArg]
}

async function fetchCurrentPeriod(client, loop) {
  if (loop.contractType === "superLoop") {
    return client.readContract({
      address: loop.address,
      abi: superLoopAbi,
      functionName: "getStreamingCurrentPeriod",
    })
  }

  return client.readContract({
    address: loop.address,
    abi: loopAbi,
    functionName: "getCurrentPeriod",
  })
}

async function fetchLoopSchedule(client, loop) {
  if (loop.contractType === "superLoop") {
    const [token, periodLength, , firstPeriodStart] = await client.readContract({
      address: loop.address,
      abi: superLoopDetailsAbi,
      functionName: "getStreamingLoopDetails",
    })
    return { token, periodLength, firstPeriodStart }
  }

  const [token, periodLength, , firstPeriodStart] = await client.readContract({
    address: loop.address,
    abi: loopDetailsAbi,
    functionName: "getLoopDetails",
  })
  return { token, periodLength, firstPeriodStart }
}

async function fetchRegisterLogs(client, loopAddress) {
  const [legacyLogs, upgradedLogs] = await Promise.all([
    client.getLogs({
      address: loopAddress,
      event: legacyRegisterEvent,
      fromBlock: 0n,
      toBlock: "latest",
    }),
    client.getLogs({
      address: loopAddress,
      event: upgradedRegisterEvent,
      fromBlock: 0n,
      toBlock: "latest",
    }),
  ])

  return [...legacyLogs, ...upgradedLogs]
}

async function fetchClaimLogs(client, loopAddress) {
  const [legacyLogs, upgradedLogs] = await Promise.all([
    client.getLogs({
      address: loopAddress,
      event: legacyClaimEvent,
      fromBlock: 0n,
      toBlock: "latest",
    }),
    client.getLogs({
      address: loopAddress,
      event: upgradedClaimEvent,
      fromBlock: 0n,
      toBlock: "latest",
    }),
  ])

  return [...legacyLogs, ...upgradedLogs]
}

async function fetchRegisterLogsForPeriod(client, loopAddress, periodNumber) {
  const [legacyLogs, upgradedLogs] = await Promise.all([
    client.getLogs({
      address: loopAddress,
      event: legacyRegisterEvent,
      args: { periodNumber },
      fromBlock: 0n,
      toBlock: "latest",
    }),
    client.getLogs({
      address: loopAddress,
      event: upgradedRegisterEvent,
      args: { periodNumber },
      fromBlock: 0n,
      toBlock: "latest",
    }),
  ])

  return [...legacyLogs, ...upgradedLogs]
}

async function fetchTokenInfo(client, tokenAddress) {
  const [symbolResult, decimalsResult] = await Promise.allSettled([
    client.readContract({
      address: tokenAddress,
      abi: erc20MetadataAbi,
      functionName: "symbol",
    }),
    client.readContract({
      address: tokenAddress,
      abi: erc20MetadataAbi,
      functionName: "decimals",
    }),
  ])

  return {
    address: tokenAddress,
    symbol: symbolResult.status === "fulfilled" ? symbolResult.value : null,
    decimals: decimalsResult.status === "fulfilled" ? Number(decimalsResult.value) : 18,
  }
}

async function findBlockNumberAtOrAfterTimestamp(client, targetTimestamp) {
  const latestBlock = await client.getBlock({ blockTag: "latest" })
  if (latestBlock.timestamp <= targetTimestamp) return latestBlock.number

  let low = 0n
  let high = latestBlock.number

  while (low < high) {
    const mid = (low + high) / 2n
    const block = await client.getBlock({ blockNumber: mid })

    if (block.timestamp < targetTimestamp) low = mid + 1n
    else high = mid
  }

  return low
}

async function fetchLoopTokenBalanceSnapshot(
  client,
  tokenAddress,
  loopAddress,
  decimals,
  periodNumber,
  schedule
) {
  const snapshotTimestamp =
    schedule.firstPeriodStart + BigInt(periodNumber) * schedule.periodLength
  const blockNumber = await findBlockNumberAtOrAfterTimestamp(client, snapshotTimestamp)
  const balance = await client.readContract({
    address: tokenAddress,
    abi: erc20MetadataAbi,
    functionName: "balanceOf",
    args: [loopAddress],
    blockNumber,
  })

  return {
    periodNumber: periodNumber.toString(),
    blockNumber: blockNumber.toString(),
    raw: balance.toString(),
    formatted: formatTokenAmount(balance, decimals),
  }
}

async function fetchLoopTokenSnapshots(
  client,
  loop,
  schedule,
  tokenInfo,
  lastProcessedPeriod
) {
  if (lastProcessedPeriod < 1n) return null

  const periodNumbers = [1n]
  if (lastProcessedPeriod >= 2n) periodNumbers.push(2n)
  if (lastProcessedPeriod > 2n) periodNumbers.push(lastProcessedPeriod)

  const snapshots = await Promise.all(
    periodNumbers.map((periodNumber) =>
      fetchLoopTokenBalanceSnapshot(
        client,
        schedule.token,
        loop.address,
        tokenInfo.decimals,
        periodNumber,
        schedule
      )
    )
  )

  return {
    balanceAtPeriod1: snapshots[0],
    balanceAtPeriod2: lastProcessedPeriod >= 2n ? snapshots[1] : null,
    balanceAtLastProcessedPeriod:
      periodNumbers.length === 1 ? snapshots[0] : snapshots[snapshots.length - 1],
  }
}

async function fetchPayoutsByPeriod(client, loop, lastEndedPeriod) {
  const payoutsByPeriod = new Map()
  if (loop.contractType !== "loop" || lastEndedPeriod < 1n) return payoutsByPeriod

  const periods = []
  for (let period = 1n; period <= lastEndedPeriod; period += 1n) periods.push(period)

  const payouts = await Promise.all(
    periods.map((periodNumber) =>
      client.readContract({
        address: loop.address,
        abi: periodPayoutAbi,
        functionName: "getPeriodIndividualPayout",
        args: [periodNumber],
      })
    )
  )

  periods.forEach((periodNumber, index) => {
    payoutsByPeriod.set(periodNumber.toString(), payouts[index])
  })

  return payoutsByPeriod
}

function buildPeriodUserMap(logs) {
  const byPeriod = new Map()

  for (const log of logs) {
    const sender = log.args.sender
    const periodNumber = log.args.periodNumber
    if (!sender || periodNumber == null) continue

    const periodKey = periodNumber.toString()
    const users = byPeriod.get(periodKey) ?? new Set()
    users.add(getAddress(sender))
    byPeriod.set(periodKey, users)
  }

  return byPeriod
}

function buildClaimStatsByPeriod(logs) {
  const byPeriod = new Map()

  for (const log of logs) {
    const claimer = log.args.claimer
    const periodNumber = log.args.periodNumber
    const payout = log.args.payout
    if (!claimer || periodNumber == null || payout == null) continue

    const periodKey = periodNumber.toString()
    const existing =
      byPeriod.get(periodKey) ??
      {
        claimers: new Set(),
        claimEventCount: 0,
        claimedAmount: 0n,
      }

    existing.claimers.add(getAddress(claimer))
    existing.claimEventCount += 1
    existing.claimedAmount += payout
    byPeriod.set(periodKey, existing)
  }

  return byPeriod
}

function formatTimestamp(timestampSeconds) {
  const timestampMs = Number(timestampSeconds) * 1000
  const date = new Date(timestampMs)

  return {
    unix: timestampSeconds.toString(),
    utc: date.toUTCString(),
  }
}

function getPeriodWindow(periodNumber, firstPeriodStart, periodLength) {
  const start = firstPeriodStart + (periodNumber - 1n) * periodLength
  const endExclusive = start + periodLength

  return {
    periodStart: formatTimestamp(start),
    periodEndExclusive: formatTimestamp(endExclusive),
  }
}

function formatTokenAmount(amount, decimals) {
  return formatUnits(amount, decimals)
}

function formatPercent(numerator, denominator) {
  if (denominator === 0) return "0.00"
  return ((numerator / denominator) * 100).toFixed(2)
}

function buildStoredPeriods(usersByPeriod, schedule) {
  const storedPeriods = {}

  for (const [periodKey, users] of usersByPeriod.entries()) {
    const periodWindow = getPeriodWindow(
      BigInt(periodKey),
      schedule.firstPeriodStart,
      schedule.periodLength
    )
    storedPeriods[periodKey] = {
      ...periodWindow,
      registeredUsers: Array.from(users).sort(),
    }
  }

  return storedPeriods
}

function pruneStoredPeriods(storedPeriods, maxPeriod) {
  const prunedPeriods = {}

  for (const [periodKey, periodData] of Object.entries(storedPeriods ?? {})) {
    if (BigInt(periodKey) <= maxPeriod) prunedPeriods[periodKey] = periodData
  }

  return prunedPeriods
}

function buildSummary(
  loop,
  currentPeriod,
  lastEndedPeriod,
  storedPeriods,
  schedule,
  tokenInfo,
  tokenSnapshots,
  claimStatsByPeriod,
  payoutsByPeriod
) {
  const allUniqueUsers = new Set()
  const allUniqueClaimers = new Set()
  const periods = []
  let totalRegistrationsCount = 0
  let totalClaimsCount = 0
  let totalRegisteredAmount = 0n
  let totalClaimedAmount = 0n

  for (let period = 1n; period <= lastEndedPeriod; period += 1n) {
    const periodUsers = [...(storedPeriods[period.toString()]?.registeredUsers ?? [])].sort()
    const newUsers = periodUsers.filter((address) => !allUniqueUsers.has(address))
    const periodWindow = getPeriodWindow(
      period,
      schedule.firstPeriodStart,
      schedule.periodLength
    )
    const claimStats = claimStatsByPeriod.get(period.toString()) ?? {
      claimers: new Set(),
      claimEventCount: 0,
      claimedAmount: 0n,
    }
    const periodClaimers = Array.from(claimStats.claimers).sort()
    const payoutPerUser = payoutsByPeriod.get(period.toString()) ?? null
    const totalRegisteredPeriodAmount =
      payoutPerUser == null ? null : payoutPerUser * BigInt(periodUsers.length)
    const unclaimedAmount =
      totalRegisteredPeriodAmount == null
        ? null
        : totalRegisteredPeriodAmount - claimStats.claimedAmount

    for (const address of periodUsers) allUniqueUsers.add(address)
    for (const address of periodClaimers) allUniqueClaimers.add(address)

    totalRegistrationsCount += periodUsers.length
    totalClaimsCount += claimStats.claimEventCount
    totalClaimedAmount += claimStats.claimedAmount
    if (totalRegisteredPeriodAmount != null) totalRegisteredAmount += totalRegisteredPeriodAmount

    periods.push({
      periodNumber: period.toString(),
      ...periodWindow,
      registeredUsers: periodUsers,
      registeredUserCount: periodUsers.length,
      claimUsers: periodClaimers,
      claimUserCount: periodClaimers.length,
      claimEventCount: claimStats.claimEventCount,
      payoutPerUserRaw: payoutPerUser?.toString() ?? null,
      payoutPerUserFormatted:
        payoutPerUser == null ? null : formatTokenAmount(payoutPerUser, tokenInfo.decimals),
      claimedAmountRaw: claimStats.claimedAmount.toString(),
      claimedAmountFormatted: formatTokenAmount(claimStats.claimedAmount, tokenInfo.decimals),
      totalRegisteredAmountRaw: totalRegisteredPeriodAmount?.toString() ?? null,
      totalRegisteredAmountFormatted:
        totalRegisteredPeriodAmount == null
          ? null
          : formatTokenAmount(totalRegisteredPeriodAmount, tokenInfo.decimals),
      unclaimedAmountRaw: unclaimedAmount?.toString() ?? null,
      unclaimedAmountFormatted:
        unclaimedAmount == null ? null : formatTokenAmount(unclaimedAmount, tokenInfo.decimals),
      claimRatePercent: formatPercent(claimStats.claimEventCount, periodUsers.length),
      newUsers,
      newUserCount: newUsers.length,
      cumulativeUniqueUserCount: allUniqueUsers.size,
    })
  }

  return {
    loopKey: loop.key,
    loopName: loop.name,
    loopAddress: loop.address,
    chainId: loop.chain.id,
    contractType: loop.contractType,
    token: {
      ...tokenInfo,
      snapshots: tokenSnapshots,
    },
    firstPeriodStart: formatTimestamp(schedule.firstPeriodStart),
    periodLengthSeconds: schedule.periodLength.toString(),
    currentPeriod: currentPeriod.toString(),
    lastEndedPeriod: lastEndedPeriod.toString(),
    uniqueUsers: Array.from(allUniqueUsers).sort(),
    uniqueUserCount: allUniqueUsers.size,
    uniqueClaimUsers: Array.from(allUniqueClaimers).sort(),
    uniqueClaimUserCount: allUniqueClaimers.size,
    stats: {
      totalRegistrationsCount,
      totalClaimsCount,
      totalRegisteredAmountRaw: totalRegisteredAmount.toString(),
      totalRegisteredAmountFormatted: formatTokenAmount(totalRegisteredAmount, tokenInfo.decimals),
      totalClaimedAmountRaw: totalClaimedAmount.toString(),
      totalClaimedAmountFormatted: formatTokenAmount(totalClaimedAmount, tokenInfo.decimals),
      totalUnclaimedAmountRaw: (totalRegisteredAmount - totalClaimedAmount).toString(),
      totalUnclaimedAmountFormatted: formatTokenAmount(
        totalRegisteredAmount - totalClaimedAmount,
        tokenInfo.decimals
      ),
      claimRatePercent: formatPercent(totalClaimsCount, totalRegistrationsCount),
    },
    periods,
  }
}

function getCacheFilePath(cacheFile) {
  return resolve(process.cwd(), cacheFile)
}

function loadCache(cacheFile) {
  const cachePath = getCacheFilePath(cacheFile)
  if (!existsSync(cachePath)) {
    return { version: 1, loops: {}, global: null }
  }

  const parsed = JSON.parse(readFileSync(cachePath, "utf8"))
  return {
    version: parsed.version ?? 1,
    loops: parsed.loops ?? {},
    global: parsed.global ?? null,
  }
}

function saveCache(cacheFile, cache) {
  const cachePath = getCacheFilePath(cacheFile)
  mkdirSync(resolve(cachePath, ".."), { recursive: true })
  writeFileSync(cachePath, `${JSON.stringify(cache, null, 2)}\n`)
}

function getHistoryFilePath(historyFile) {
  return resolve(process.cwd(), historyFile)
}

function loadHistory(historyFile) {
  const historyPath = getHistoryFilePath(historyFile)
  if (!existsSync(historyPath)) {
    return {
      version: 1,
      generatedFromCacheFile: DEFAULT_CACHE_FILE,
      snapshots: [],
    }
  }

  const parsed = JSON.parse(readFileSync(historyPath, "utf8"))
  return {
    version: parsed.version ?? 1,
    generatedFromCacheFile:
      parsed.generatedFromCacheFile ?? DEFAULT_CACHE_FILE,
    snapshots: Array.isArray(parsed.snapshots) ? parsed.snapshots : [],
  }
}

function saveHistory(historyFile, history) {
  const historyPath = getHistoryFilePath(historyFile)
  mkdirSync(resolve(historyPath, ".."), { recursive: true })
  writeFileSync(historyPath, `${JSON.stringify(history, null, 2)}\n`)
}

function getSnapshotDate(recordedAt) {
  return recordedAt.slice(0, 10)
}

function getSingleTokenTotal(tokenTotals) {
  if (!Array.isArray(tokenTotals) || tokenTotals.length !== 1) return null
  return tokenTotals[0]
}

function buildLoopHistorySnapshot(loopKey, loopEntry) {
  return {
    loopKey,
    loopName: loopEntry.loopName ?? loopKey,
    updatedAt: loopEntry.updatedAt ?? null,
    lastProcessedPeriod: loopEntry.lastProcessedPeriod ?? null,
    uniqueUserCount: loopEntry.uniqueUserCount ?? 0,
    uniqueClaimUserCount: loopEntry.uniqueClaimUserCount ?? 0,
    totalRegistrationsCount: loopEntry.stats?.totalRegistrationsCount ?? 0,
    totalClaimsCount: loopEntry.stats?.totalClaimsCount ?? 0,
    totalDistributedAmountRaw: loopEntry.stats?.totalRegisteredAmountRaw ?? "0",
    totalDistributedAmountFormatted:
      loopEntry.stats?.totalRegisteredAmountFormatted ?? "0",
    tokenSymbol: loopEntry.token?.symbol ?? null,
  }
}

function buildGlobalHistorySnapshot(globalCache) {
  const primaryTokenTotal = getSingleTokenTotal(globalCache?.tokenTotals)

  return {
    updatedAt: globalCache?.updatedAt ?? null,
    loopsIncluded: globalCache?.loopsIncluded ?? [],
    uniqueUserCount: globalCache?.uniqueUserCount ?? 0,
    uniqueClaimUserCount: globalCache?.uniqueClaimUserCount ?? 0,
    totalRegistrationsCount: globalCache?.stats?.totalRegistrationsCount ?? 0,
    totalClaimsCount: globalCache?.stats?.totalClaimsCount ?? 0,
    totalDistributedAmountRaw:
      primaryTokenTotal?.totalRegisteredAmountRaw ?? null,
    totalDistributedAmountFormatted:
      primaryTokenTotal?.totalRegisteredAmountFormatted ?? null,
    tokenSymbol: primaryTokenTotal?.tokenSymbol ?? null,
    tokenTotals: (globalCache?.tokenTotals ?? []).map((tokenTotal) => ({
      tokenAddress: tokenTotal.tokenAddress ?? null,
      tokenSymbol: tokenTotal.tokenSymbol ?? null,
      tokenDecimals: tokenTotal.tokenDecimals ?? null,
      totalDistributedAmountRaw: tokenTotal.totalRegisteredAmountRaw ?? "0",
      totalDistributedAmountFormatted:
        tokenTotal.totalRegisteredAmountFormatted ?? "0",
      totalClaimedAmountRaw: tokenTotal.totalClaimedAmountRaw ?? "0",
      totalClaimedAmountFormatted:
        tokenTotal.totalClaimedAmountFormatted ?? "0",
      totalUnclaimedAmountRaw: tokenTotal.totalUnclaimedAmountRaw ?? "0",
      totalUnclaimedAmountFormatted:
        tokenTotal.totalUnclaimedAmountFormatted ?? "0",
    })),
  }
}

function upsertHistorySnapshot(history, cache, cacheFile, recordedAt) {
  const snapshotDate = getSnapshotDate(recordedAt)
  const loopsSnapshot = {}

  for (const [loopKey, loopEntry] of Object.entries(cache.loops ?? {})) {
    if (loopEntry == null) continue
    loopsSnapshot[loopKey] = buildLoopHistorySnapshot(loopKey, loopEntry)
  }

  const snapshotEntry = {
    date: snapshotDate,
    recordedAt,
    cacheFile,
    cacheUpdatedAt: cache.global?.updatedAt ?? recordedAt,
    loops: loopsSnapshot,
    global: buildGlobalHistorySnapshot(cache.global),
  }

  const existingSnapshotIndex = history.snapshots.findIndex(
    (snapshot) => snapshot?.date === snapshotDate
  )

  if (existingSnapshotIndex === -1) history.snapshots.push(snapshotEntry)
  else history.snapshots[existingSnapshotIndex] = snapshotEntry

  history.snapshots.sort((a, b) => a.date.localeCompare(b.date))
}

function getCachedLoopEntry(cache, loop) {
  const cachedLoop = cache.loops[loop.key]
  if (!cachedLoop) return null

  const isCompatible =
    cachedLoop.loopAddress?.toLowerCase() === loop.address.toLowerCase() &&
    cachedLoop.chainId === loop.chain.id &&
    cachedLoop.contractType === loop.contractType

  return isCompatible ? cachedLoop : null
}

function mergeStoredPeriods(existingPeriods, updates) {
  return {
    ...(existingPeriods ?? {}),
    ...updates,
  }
}

function buildCacheLoopEntry(
  loop,
  currentPeriod,
  lastEndedPeriod,
  storedPeriods,
  summary,
  updatedAt
) {
  return {
    loopName: loop.name,
    loopAddress: loop.address,
    chainId: loop.chain.id,
    contractType: loop.contractType,
    token: summary.token,
    firstPeriodStart: summary.firstPeriodStart,
    periodLengthSeconds: summary.periodLengthSeconds,
    currentPeriod: currentPeriod.toString(),
    lastProcessedPeriod: lastEndedPeriod.toString(),
    uniqueUsers: summary.uniqueUsers,
    uniqueUserCount: summary.uniqueUserCount,
    uniqueClaimUsers: summary.uniqueClaimUsers,
    uniqueClaimUserCount: summary.uniqueClaimUserCount,
    stats: summary.stats,
    periods: storedPeriods,
    updatedAt,
  }
}

function buildCachedPeriods(storedPeriods, summaryPeriods) {
  const summaryByPeriod = new Map(summaryPeriods.map((period) => [period.periodNumber, period]))
  const cachedPeriods = {}

  for (const [periodKey, periodData] of Object.entries(storedPeriods)) {
    cachedPeriods[periodKey] = summaryByPeriod.get(periodKey) ?? periodData
  }

  return cachedPeriods
}

function rebuildGlobalCache(cache, updatedAt) {
  const loopEntries = Object.entries(cache.loops ?? {}).filter(([, value]) => value != null)
  const globalUsers = new Set()
  const globalClaimUsers = new Set()
  let totalRegistrationsCount = 0
  let totalClaimsCount = 0
  const tokenTotals = new Map()

  for (const [, loopEntry] of loopEntries) {
    for (const address of loopEntry.uniqueUsers ?? []) globalUsers.add(address)
    for (const address of loopEntry.uniqueClaimUsers ?? []) globalClaimUsers.add(address)
    totalRegistrationsCount += loopEntry.stats?.totalRegistrationsCount ?? 0
    totalClaimsCount += loopEntry.stats?.totalClaimsCount ?? 0

    const tokenAddress = loopEntry.token?.address
    if (tokenAddress) {
      const existing =
        tokenTotals.get(tokenAddress) ??
        {
          tokenAddress,
          tokenSymbol: loopEntry.token?.symbol ?? null,
          tokenDecimals: loopEntry.token?.decimals ?? 18,
          totalRegisteredAmount: 0n,
          totalClaimedAmount: 0n,
          totalUnclaimedAmount: 0n,
        }

      existing.totalRegisteredAmount += BigInt(
        loopEntry.stats?.totalRegisteredAmountRaw ?? "0"
      )
      existing.totalClaimedAmount += BigInt(loopEntry.stats?.totalClaimedAmountRaw ?? "0")
      existing.totalUnclaimedAmount += BigInt(
        loopEntry.stats?.totalUnclaimedAmountRaw ?? "0"
      )
      tokenTotals.set(tokenAddress, existing)
    }
  }

  cache.global = {
    loopsIncluded: loopEntries.map(([loopKey]) => loopKey).sort(),
    uniqueUsers: Array.from(globalUsers).sort(),
    uniqueUserCount: globalUsers.size,
    uniqueClaimUsers: Array.from(globalClaimUsers).sort(),
    uniqueClaimUserCount: globalClaimUsers.size,
    stats: {
      totalRegistrationsCount,
      totalClaimsCount,
      claimRatePercent: formatPercent(totalClaimsCount, totalRegistrationsCount),
    },
    tokenTotals: Array.from(tokenTotals.values())
      .map((entry) => ({
        tokenAddress: entry.tokenAddress,
        tokenSymbol: entry.tokenSymbol,
        tokenDecimals: entry.tokenDecimals,
        totalRegisteredAmountRaw: entry.totalRegisteredAmount.toString(),
        totalRegisteredAmountFormatted: formatTokenAmount(
          entry.totalRegisteredAmount,
          entry.tokenDecimals
        ),
        totalClaimedAmountRaw: entry.totalClaimedAmount.toString(),
        totalClaimedAmountFormatted: formatTokenAmount(
          entry.totalClaimedAmount,
          entry.tokenDecimals
        ),
        totalUnclaimedAmountRaw: entry.totalUnclaimedAmount.toString(),
        totalUnclaimedAmountFormatted: formatTokenAmount(
          entry.totalUnclaimedAmount,
          entry.tokenDecimals
        ),
      }))
      .sort((a, b) => a.tokenAddress.localeCompare(b.tokenAddress)),
    updatedAt,
  }
}

function printTable(results) {
  for (const result of results) {
    console.log(
      `\n${result.loopName} (${result.loopKey})\ncurrentPeriod=${result.currentPeriod} lastEndedPeriod=${result.lastEndedPeriod} uniqueUsers=${result.uniqueUserCount}`
    )
    console.table(
      result.periods.map((period) => ({
        period: period.periodNumber,
        registered: period.registeredUserCount,
        claims: period.claimEventCount,
        claimedAmount: period.claimedAmountFormatted,
        new: period.newUserCount,
        cumulativeUnique: period.cumulativeUniqueUserCount,
      }))
    )
    console.log("Unique users:")
    console.log(JSON.stringify(result.uniqueUsers, null, 2))
  }
}

async function inspectLoop(loop, args, cache, runTimestamp) {
  const chainRpcEnvName = loop.chain.id === base.id ? "BASE_RPC_URL" : "GNOSIS_RPC_URL"
  const rpcUrl = args.rpcUrl ?? process.env[chainRpcEnvName]
  const client = createPublicClient({
    chain: loop.chain,
    transport: http(rpcUrl),
  })

  const [currentPeriod, schedule] = await Promise.all([
    fetchCurrentPeriod(client, loop),
    fetchLoopSchedule(client, loop),
  ])
  const tokenInfo = await fetchTokenInfo(client, schedule.token)
  const configuredUpperBound =
    args.upToPeriod == null ? null : parsePeriod(args.upToPeriod, "--up-to-period")

  // getCurrentPeriod returns the latest completed period. The app APIs add one
  // to this value when they need the next claim period.
  const discoveredLastPeriod = currentPeriod
  const lastEndedPeriod =
    configuredUpperBound == null
      ? discoveredLastPeriod
      : configuredUpperBound < discoveredLastPeriod
        ? configuredUpperBound
        : discoveredLastPeriod

  const cachedLoop = args.refreshAll ? null : getCachedLoopEntry(cache, loop)
  let storedPeriods = { ...(cachedLoop?.periods ?? {}) }
  const cachedLastProcessedPeriod = cachedLoop
    ? parsePeriod(cachedLoop.lastProcessedPeriod ?? "0", "cached lastProcessedPeriod")
    : 0n
  let fetchedIncrementally = false
  let periodsFetchedThisRun = []

  if (args.refreshAll || !cachedLoop) {
    const logs = await fetchRegisterLogs(client, loop.address)
    storedPeriods = pruneStoredPeriods(
      buildStoredPeriods(buildPeriodUserMap(logs), schedule),
      lastEndedPeriod
    )
    periodsFetchedThisRun = ["full-scan"]
  } else {
    const missingPeriods = []

    for (
      let period = cachedLastProcessedPeriod + 1n;
      period <= lastEndedPeriod;
      period += 1n
    ) {
      missingPeriods.push(period)
    }

    if (missingPeriods.length > 0) {
      fetchedIncrementally = true
      for (const period of missingPeriods) {
        const logs = await fetchRegisterLogsForPeriod(client, loop.address, period)
        const periodUsers = Array.from(
          new Set(
            logs
              .map((log) => log.args.sender)
              .filter(Boolean)
              .map((address) => getAddress(address))
          )
        ).sort()
        storedPeriods[period.toString()] = {
          ...getPeriodWindow(period, schedule.firstPeriodStart, schedule.periodLength),
          registeredUsers: periodUsers,
        }
      }
      periodsFetchedThisRun = missingPeriods.map((period) => period.toString())
    }
  }

  storedPeriods = pruneStoredPeriods(storedPeriods, lastEndedPeriod)

  const [claimLogs, payoutsByPeriod, tokenSnapshots] = await Promise.all([
    fetchClaimLogs(client, loop.address),
    fetchPayoutsByPeriod(client, loop, lastEndedPeriod),
    fetchLoopTokenSnapshots(client, loop, schedule, tokenInfo, lastEndedPeriod),
  ])
  const claimStatsByPeriod = buildClaimStatsByPeriod(claimLogs)

  const summary = buildSummary(
    { ...loop, key: loop.key },
    currentPeriod,
    lastEndedPeriod,
    storedPeriods,
    schedule,
    tokenInfo,
    tokenSnapshots,
    claimStatsByPeriod,
    payoutsByPeriod
  )

  const cacheHighWaterMark =
    args.refreshAll || !cachedLoop || lastEndedPeriod > cachedLastProcessedPeriod
      ? lastEndedPeriod
      : cachedLastProcessedPeriod
  const cacheSummary = buildSummary(
    { ...loop, key: loop.key },
    currentPeriod,
    cacheHighWaterMark,
    storedPeriods,
    schedule,
    tokenInfo,
    tokenSnapshots,
    claimStatsByPeriod,
    payoutsByPeriod
  )

  if (args.upToPeriod == null) {
    cache.loops[loop.key] = buildCacheLoopEntry(
      loop,
      currentPeriod,
      cacheHighWaterMark,
      buildCachedPeriods(
        pruneStoredPeriods(mergeStoredPeriods(cachedLoop?.periods, storedPeriods), cacheHighWaterMark),
        cacheSummary.periods
      ),
      cacheSummary,
      runTimestamp
    )
    rebuildGlobalCache(cache, runTimestamp)
  }

  return {
    ...summary,
    cacheLastProcessedPeriod: cacheHighWaterMark.toString(),
    cacheFile: getCacheFilePath(args.cacheFile),
    globalUniqueUserCount: cache.global?.uniqueUserCount ?? 0,
    globalLoopsIncluded: cache.global?.loopsIncluded ?? [],
    cacheMode: args.refreshAll || !cachedLoop ? "full-scan" : "incremental",
    fetchedIncrementally,
    periodsFetchedThisRun,
  }
}

async function main() {
  loadEnvFile(".env")
  loadEnvFile(".env.local")

  const args = parseArgs(process.argv.slice(2))
  if (!["json", "table"].includes(args.format)) {
    throw new Error("--format must be one of: json, table")
  }

  const loopKeys = getLoopKeys(args.loop)
  const cache = loadCache(args.cacheFile)
  const runTimestamp = new Date().toISOString()
  const results = []

  for (const loopKey of loopKeys) {
    const result = await inspectLoop(
      { ...loops[loopKey], key: loopKey },
      args,
      cache,
      runTimestamp
    )
    results.push(result)
  }

  rebuildGlobalCache(cache, runTimestamp)
  saveCache(args.cacheFile, cache)
  if (args.upToPeriod == null && !args.skipHistory) {
    const history = loadHistory(args.historyFile)
    history.generatedFromCacheFile = args.cacheFile
    upsertHistorySnapshot(history, cache, args.cacheFile, runTimestamp)
    saveHistory(args.historyFile, history)
  }

  if (args.format === "table") {
    printTable(results)
    return
  }

  if (args.loop === "all") {
    console.log(
      JSON.stringify(
        {
          loops: results,
          global: cache.global,
        },
        null,
        2
      )
    )
    return
  }

  console.log(JSON.stringify(results, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
