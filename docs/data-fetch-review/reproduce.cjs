const fs = require("node:fs")
const vm = require("node:vm")
const assert = require("node:assert/strict")
const path = require("node:path")
const { createRequire } = require("node:module")
const req = createRequire(path.join(process.cwd(), "package.json"))
const ts = req("typescript")
const viem = req("viem")
function moduleFrom(file, mocks) {
  const source = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText
  const exports = {}
  vm.runInNewContext(
    source,
    {
      exports,
      require(name) {
        if (name in mocks) return mocks[name]
        return req(name)
      },
      console: { error() {}, warn() {} },
      fetch: (...args) => global.fetch(...args),
      Response,
      Map,
      Set,
      Date,
      Promise,
      BigInt,
      Number,
      Object,
      String,
      Error,
    },
    { filename: file }
  )
  return exports
}
;(async () => {
  const wallet = "0x1111111111111111111111111111111111111111"
  const contract = "0x2222222222222222222222222222222222222222"
  let requests = 0
  const invalidated = []
  const hooks = moduleFrom("lib/hooks/app/use-sync-profile-after-claim.ts", {
    react: { useCallback: (f) => f },
    wagmi: { useAccount: () => ({ address: wallet }) },
    "@tanstack/react-query": {
      useQueryClient: () => ({
        invalidateQueries: async (q) => invalidated.push(q.queryKey),
      }),
    },
  })
  global.fetch = async () => {
    requests++
    return Response.json({ error: "Unavailable" }, { status: 503 })
  }
  const sync = hooks.useSyncProfileAfterClaim({
    contractAddress: contract,
    loopId: 3,
    periodNumber: 10n,
  })
  const confirmation = {
    action: "claim",
    chainId: 100,
    transactionHash: "0x" + "a".repeat(64),
    blockNumber: 100n,
  }
  await sync(confirmation)
  await sync(confirmation)
  if (requests !== 1) throw Error("Unexpected retry result")
  console.log(
    JSON.stringify({
      case: "same receipt retried after failed sync",
      attempts: requests,
      invalidated,
    })
  )
  invalidated.length = 0
  global.fetch = async () =>
    Response.json({
      success: true,
      result: { claimed: false, alreadySynced: false },
    })
  await sync({ ...confirmation, transactionHash: "0x" + "b".repeat(64) })
  assert.equal(invalidated.length, 3)
  console.log(
    JSON.stringify({ case: "HTTP 200 with claimed:false", invalidated })
  )
  const event = viem.parseAbiItem(
    "event Claim(address indexed claimer,uint256 periodNumber,uint256 payout)"
  )
  const statsWrites = []
  const suppliedPeriods = []
  const rules = moduleFrom("lib/scoring/rules.ts", {})
  const server = moduleFrom("lib/scoring/user-claim-sync.ts", {
    "@/env.mjs": {
      env: { GYRALIS_SUBGRAPH_CHAIN_ID: 100, SCORING_SYNC_BATCH_SIZE: 1000 },
    },
    viem: {
      ...viem,
      createPublicClient: () => ({
        getTransactionReceipt: async ({ hash }) => ({
          status: "success",
          blockNumber: 100n,
          logs: [
            {
              address: contract,
              topics: viem.encodeEventTopics({
                abi: [event],
                eventName: "Claim",
                args: { claimer: wallet },
              }),
              data: viem.encodeAbiParameters(
                [{ type: "uint256" }, { type: "uint256" }],
                [hash.endsWith("a") ? 10n : 11n, 100n]
              ),
              logIndex: 0,
            },
          ],
        }),
        getBlock: async () => ({ timestamp: 1000n }),
      }),
    },
    "@/lib/db/clients/global-stats.client": {
      getUserGlobalStats: async () => null,
      upsertUserGlobalStats: async () => {},
    },
    "@/lib/db/clients/leaderboard.client": {
      upsertGlobalLeaderboardEntry: async () => {},
      upsertLoopLeaderboardEntry: async () => {},
    },
    "@/lib/db/clients/loop-stats.client": {
      getUserLoopStatsForUser: async () => [],
      upsertUserLoopStats: async (stats) => statsWrites.push(stats),
    },
    "@/lib/db/clients/processed-claim-events.client": {
      getProcessedClaimEvent: async () => null,
      markProcessedClaimEvents: async () => {},
    },
    "@/lib/db/clients/user-profile.client": {
      ensureUserProfile: async () => {},
    },
    "@/lib/profile/profile-cache": { invalidateProfilePageData() {} },
    "./aggregate": { computeGlobalStatsFromLoops: () => ({}) },
    "./config": { scoringConfig: req("./config/scoring.json") },
    "./db-mappers": { mapDbUserLoopStatsToScoringStats: (x) => x },
    "./loop-filters": { isIgnoredScoringLoopId: () => false },
    "./rules": {
      ...rules,
      computeLoopStatsFromClaims: (events, ...args) => {
        suppliedPeriods.push(events.map((e) => e.periodNumber))
        return rules.computeLoopStatsFromClaims(events, ...args)
      },
    },
    "./season-projections": { seasonProjectionsAreReady: async () => false },
    "./subgraph-client": {
      getScoringSubgraphSource: () => ({}),
      fetchAllClaimEventsForUserLoop: async () => [],
    },
  })
  const base = {
    userAddress: wallet,
    loopId: 3,
    chainId: 100,
    contractAddress: contract,
  }
  await server.syncUserClaimFromReceipt({
    ...base,
    txHash: "0x" + "a".repeat(64),
  })
  await server.syncUserClaimFromReceipt({
    ...base,
    txHash: "0x" + "b".repeat(64),
  })
  console.log(
    JSON.stringify({
      case: "two sequential confirmed claims while subgraph returns neither",
      suppliedPeriods,
      statsWrites,
    })
  )
  assert.deepEqual(JSON.parse(JSON.stringify(suppliedPeriods)), [[10], [11]])
  assert.equal(statsWrites[1].totalClaims, 1)
  assert.equal(statsWrites[1].currentStreak, 1)
  const relabeled = server.extractClaimEventsFromReceiptLogs({
    logs: [
      {
        address: contract,
        topics: viem.encodeEventTopics({
          abi: [event],
          eventName: "Claim",
          args: { claimer: wallet },
        }),
        data: viem.encodeAbiParameters(
          [{ type: "uint256" }, { type: "uint256" }],
          [10n, 100n]
        ),
        logIndex: 0,
      },
    ],
    txHash: "0x" + "c".repeat(64),
    blockNumber: 100,
    userAddress: wallet,
    loopId: 999,
    chainId: 100,
    contractAddress: contract,
  })
  assert.equal(relabeled[0].loopId, 999)
  console.log(
    JSON.stringify({
      case: "legacy receipt assigned caller-supplied loop ID",
      loopId: relabeled[0].loopId,
    })
  )
})().catch((e) => {
  console.error(e)
  process.exitCode = 1
})
