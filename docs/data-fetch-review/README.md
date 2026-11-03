# Data fetching review and proposed architecture

Reviewed November 3, 2026. Review only; application code and database state were not changed.

Subsequent implementation work is tracked in [the page-by-page state matrix and cleanup log](page-by-page.md). The findings below retain the original review snapshot; that log identifies fixes and remaining verification.

## Decision

Keep the current Next.js App Router, TanStack Query, Wagmi, Prisma, and subgraphs. Unify resource identity, query definitions, source adapters, and claim reconciliation. Give each page only the resources it renders. A single endpoint that fetches everything for every page would increase unnecessary work and tie unrelated failures together.

Use `data/loops-data.ts` for curated metadata, chain reads and confirmed receipt logs for current executable state, subgraphs for indexed activity/history, and database projections for application scoring and ranking. Subgraph indexing delay must not delay confirmation of a user's successful claim.

The first implementation priority should be receipt-sync correctness, followed by shared post-claim refresh, then page-specific loading and backend cost reductions. Wire the preview sections only after their production data and action contracts are defined.

## Scope and evidence

- Inventoried all **14 app pages**, **140 component modules**, and **29 API route files**. The wider inventory covers **370 TypeScript source modules** across `app`, `components`, `lib`, `services`, `integrations`, `data`, and `config`, excluding generated code and tests.
- [inventory.csv](inventory.csv) records each module's declared client/server directive, conservative page import reachability, data/hook calls, query keys, fetch arguments, and local imports. All source files were parsed; data-bearing paths described below were inspected in detail.
- Import reachability includes ancestor layouts, loading/error modules, and local imports. It is **not** evidence that every imported export renders or that a request runs. Conditional JSX, disabled hooks, shared files with legacy exports, and API calls need the interpretation below. API route files normally have no page import edge because pages call them over HTTP.
- Existing participation UI edits and image assets were present before this review and were preserved. This is a worktree review, not a review of a clean commit or deployed build.
- `pnpm exec vitest run`: **48 files passed, 1 failed; 371 tests passed, 1 failed**. The existing failure is `lib/loops/sponsor-data.test.ts:30`, expecting the card shell source to contain `loop.sponsorUrl`.
- [reproduce.cjs](reproduce.cjs) exercises actual transpiled claim-sync functions with mocked React, network, and database dependencies. Run `node docs/data-fetch-review/reproduce.cjs` from the repository root. It demonstrates four issues below without calling an external service or writing a database. It uses the actual scoring rules/configuration and captures the event set supplied to recomputation; network, database, and projection readiness are mocked.
- No production request counts, latency measurements, deployed subgraph schemas, RPC availability, database records/indexes, or browser behavior were measured. Performance findings below identify code paths and scaling costs, not measured timings.

## Findings, in recommended order

### F1 — High: receipt sync trusts caller-selected loop identity

`app/api/scoring/[user]/route.ts` validates payload shape but does not bind `chainId`, `loopId`, and `contractAddress` to an allowed deployment. `lib/scoring/user-claim-sync.ts:134` compares log addresses against the **caller-provided** contract. For legacy/token claim event shapes, `loopId` is absent from the log, so the extractor assigns the requested ID. `config/scoring-loops.ts` exists but this endpoint does not use it.

The reproduction passes a correctly shaped legacy claim log and a requested loop ID of `999`; the extracted scoring event uses `999`. This establishes a missing server validation boundary. It does not claim that a production exploit was executed.

Resolve the deployment from a canonical server registry before any receipt or history fetch. Reject mismatched chain/address/loop combinations. Derive the claiming wallet, period, token, transaction hash, and log index from receipt data. A public receipt-sync endpoint can remain public when it only applies verified events from known contracts; trusting request identity is the problem here.

### F2 — High: a later sync can discard an earlier receipt that is still unindexed

`lib/scoring/user-claim-sync.ts:174` merges **the current receipt only** with subgraph history, recomputes the whole loop projection, and overwrites it. It never merges earlier receipt events from durable storage. `ProcessedClaimEvent` stores identity/period markers but this path only asks whether the current event was processed; it does not reload prior pending receipts.

Reproduced sequence: receipt A is period 10, receipt B is period 11, and the subgraph returns neither. A supplies `[10]` to recomputation; B supplies `[11]`. B overwrites the result instead of preserving `[10,11]`. Retrying an older receipt can similarly replace a newer projection. Concurrent loop syncs can also race while computing global/season projections because the writes span multiple independent upserts.

Persist verified events before projecting them. Merge the indexed snapshot with **all** verified events not covered by that snapshot. Serialize or transactionally version writes for each wallet/loop and the wallet-wide projection. Keep replay idempotent by `(chainId, txHash, logIndex)`. Correctness must allow legitimate reorg reconciliation; simply taking the maximum claim count would hide errors and cannot repair streaks.

### F3 — High: failed claim sync is remembered permanently in browser memory

`lib/hooks/app/use-sync-profile-after-claim.ts:60–91` keeps each promise in a module-level `syncRequests` map, catches errors, and never deletes the entry. Replaying the same confirmation after a 503 produces **one fetch total**, as the reproduction confirms. There is no status or retry control for the failed scoring update. The map is keyed only by transaction hash, rather than chain and transaction.

Deduplicate only in-flight work, clear entries in `finally`, use a chain-scoped identity, and retain explicit retryable reconciliation state separately. A confirmed claim remains successful even when scoring sync needs a retry.

### F4 — High: an HTTP 200 does not prove scoring was applied

`requestProfileClaimSync` checks only `response.ok`. The server can return `{ success: true, result: { claimed: false } }`, including when the supplied period excludes the actual receipt event. The browser then invalidates score/streak queries as though synchronization succeeded. The reproduction confirms this behavior.

Parse a typed result with separate states such as `applied`, `already-applied`, `pending-index`, and `unsupported`. Do not label `claimed:false` as applied. Prefer the receipt's period to the UI period captured before the transaction; a period boundary can occur while the wallet/receipt is pending.

### F5 — High: post-claim refresh does not cover the full UI or indexing delay

The controllers already invoke receipt scoring sync and total-claim reconciliation. Preserve that foundation. However:

- The hook invalidates `profile-summary`, `season-streaks`, and finally `latest-activity`; it never invalidates `leaderboard` or `leaderboard-summary`.
- `invalidateProfilePageData` correctly revalidates server profile/rank/leaderboard tags, but this does not refresh TanStack's separate browser cache or an already displayed server profile payload.
- Activity invalidation happens **after** the scoring request settles. Activity still reads the subgraph and can return the old events. It has no confirmed-receipt overlay or indexed-block acknowledgement; its next regular poll is 60 seconds later while mounted.
- `useRefreshTotalClaimsAfterClaim` has bounded polling and an indexed-block watermark, but its resource deliberately covers Gnosis only. It must remain distinct from a cross-chain dashboard total or the 50-claim eligibility count.
- The loop grid and selected-loop dialog instantiate separate controllers. Some identical reads share query cache entries, but pending actions, confirmed overrides, and modal refresh counters are local to each controller. A successful action in one surface is not a shared mutation record for the other.

Publish one verified claim event to a shared coordinator. Update all visible consumers immediately where the receipt provides proof, invalidate scoring/rank resources after durable scoring succeeds, and reconcile indexed activity until its chain watermark covers the receipt. Refresh the active RSC profile only when it displays the affected wallet. Keep failed follow-up work retryable without asking the user to submit the transaction again.

### F6 — High: standard-loop period rollover can retain the previous claimer status

`lib/hooks/loops/standard/use-standard-loop-claim.ts:123` adds a period scope only for RWAGMI. For other standard loops, `getClaimerStatus(user)` keeps the same query key across periods, disables focus refetch, and has no rollover refetch effect. The effect at line 262 resets local action state, not the queried claimer status.

The new claim panel's boundary callback invokes the controller's `refreshCardData`, which refetches settings, balance, and participation, but **not** the claim hook's account state. The new participation period can therefore coexist with last period's claimed boolean. This is a code-path finding; a browser rollover scenario still needs integration coverage.

Scope all period-dependent wallet reads to the resolved period and refresh them after resolving the new public period. Use one scheduler per loop identity; duplicate cards should not own competing boundary refreshes. Retry a failed boundary refresh instead of marking that boundary handled forever.

### F7 — High: chain-specific scoring exclusions are applied globally in some readers

`ignoredScoringLoopIds = [1,2]`. The sync code applies those exclusions to the configured primary chain, but `getUserLoopStatsForUser({ excludedLoopIds })` and `getGlobalLeaderboardSummary` filter bare `loopId` across **all chains**. Base Markee is scoring loop ID `1` in `config/scoring-loops.ts` and `lib/scoring/subgraph-client.ts`.

As a result, Base Markee can contribute to global projections/rank while being omitted from profile totals and the leaderboard summary. Its commented-out UI metadata also leaves it displayed as an archived unknown loop when included through another path. Make exclusion rules use `(chainId, loopId)` and maintain historical metadata independently of current directory visibility. Add a parity test between profile totals, global projection, and leaderboard summary.

### F8 — Medium: RWAGMI and Soneium have incomplete scoring coverage

The live UI includes RWAGMI `(8453,9)`, but the Base scoring source maps only Markee and True Loopers. Bulk fetching restricts Base history to those mapped addresses. Single-user history for ID `9` falls back to subgraph ID `"9"` even though the Base index uses contract addresses. A current receipt may be applied while historical RWAGMI claims are omitted; subsequent recomputation cannot reliably preserve its full history.

Soneium has claimable standard loops but no scoring subgraph source in `getScoringSubgraphSources`. Its receipt sync throws when resolving a source. If these loops intentionally do not score, encode `scoringSupported: false` rather than sending a sync request that is expected to fail. If they should score, supply an explicit indexed or durable receipt-ingestion source. No UI fallback should silently convert unsupported history into an authoritative zero.

### F9 — Medium: most server-fetched pages are hidden until client mount

`components/providers/root-provider.tsx:30` permits server rendering only for `/leaderboard`; other routes return `null` until mounted and use a dynamically imported wallet provider with `ssr:false`. Server profile/dashboard fetches still run, but their surrounding provider suppresses initial HTML. Switching across the leaderboard boundary also changes the provider component type, risking provider/query-client remount and cache loss; measure this in a browser before assigning a request count.

Use a stable, SSR-compatible provider tree across routes. Keep wallet connector/browser initialization safe, but allow public content and server-fetched sections to render before wallet hydration. Do not solve this by creating a process-wide server QueryClient, which could share private wallet data across requests.

### F10 — Medium: dashboard/landing summary work grows with all historical events

`lib/dashboard/get-dashboard-data.ts:208` fetches every registration and claim page per configured loop to compute unique users and period participation. `/api/loops/history/summary` calls the entire dashboard loader to return a small summary; the landing page makes that call on mount. Each cold load combines paginated history and schedule/token RPC reads.

Further correctness/consistency issues:

- Nested `periods(first:1000, orderDirection:asc)` has no continuation. Once a loop exceeds 1000 indexed periods, later periods can disappear from charts and calculations. This is a scaling limit, not a measured claim that a current loop has crossed it.
- Event pages are not pinned to the `_meta` block, while page-level totals and live schedules are fetched separately. `hasIndexingErrors` is carried into output without rejecting/marking affected totals. Use one indexed block per chain for a coherent historical snapshot.
- Missing configured endpoints are silently filtered from requested sources. Totals can look global while omitting a chain. Return explicit coverage and unavailable sources.
- Both inner GraphQL fetches and the outer result use 300-second cache settings. The outer cache has no tag used by claim sync. Revalidating only an outer result would still allow inner stale data; choose one authoritative cache layer or invalidate every relevant layer.

Give landing a lightweight public summary reader. Use subgraph aggregate entities where they provide the required semantics; otherwise maintain cursor-driven aggregate projections outside request rendering. Fetch only the chart period window, and paginate long-lived historical tables separately. Do not sum per-loop unique users to obtain cross-loop unique users.

### F11 — Medium: related UI sections mix preview and live data

`SeasonProvider` is a local preview reducer. `SeasonPoints`, Games actions/standings, season leaderboard, milestone details, and parts of Discover/Profile read it or demo fixtures. `LoopStreaks` instead loads current-season API data. The labels generally disclose previews; the problem is incomplete production wiring, not hidden successful transactions.

On the review date, the only configured season ended October 11, 2026 UTC. The Season 1 example is commented out. `/api/seasons/current` should therefore return no active season, while the preview can still display Season 01. Do not activate a season, invent prize contracts, or replace absent season data with all-time GP as part of a fetching refactor.

Keep preview fixtures behind an explicit preview mode. Production widgets should share the same current-season definition and user-season snapshot. Registration/refund/prize actions currently simulated by a timeout require real action contracts before wiring.

### F12 — Medium: unnecessary modal reads and masked list failures

`LoopersModal` gates event-list hooks on `isOpen`, but its balance and selected-period payout reads do not include that condition. Standard card shells keep this modal mounted while closed. The log hooks use local effects rather than shared keyed queries; their errors clear the lists, and the modal ignores those error fields, displaying an empty list/zero metrics instead of an unavailable state.

Use a lazy, paginated participation resource keyed by chain, deployment, period, and cursor. Prefer indexed lists; use bounded RPC fallback near the unindexed head or on supported source failures. A 100,000-block lookback is not complete arbitrary historical coverage. Preserve error distinctions and previous successful rows. Resolve ENS only for rendered rows through a shared cache; the current modal stores successful lookups locally and can repeat unresolved lookups.

SuperLoop cards currently disable the loopers modal, so these modal findings primarily affect the standard cards in active routes. Do not budget every legacy/SuperLoop modal code path as an active network request.

### F13 — Medium: Passport stamp hook duplicates work and stamp groups

`integrations/gitcoin-passport/hooks/use-get-address-stamps.ts` automatically runs its query and also calls `refetch` in an address effect, has no `enabled:Boolean(address)` guard, and does not pass an AbortSignal. During disconnect/races it can run an unnecessary failed query. It appends an item even after finding and updating an existing provider group, producing duplicate groups for repeated providers.

Make one normalized wallet query, group each provider exactly once, and use cancellation. Capture the mutation wallet when submitting Passport; `useSubmitPassport` currently writes the result under the hook's `address` rather than an explicit mutation variable. Test a wallet switch while submission is pending. Cache stamp catalog separately from wallet score/stamps. These resources do not need refreshing for every loop claim.

### F14 — Lower priority: stale fallback presentation and redundant reads

- Landing initializes hardcoded June 29 statistics and silently keeps them on fetch failure while presenting live/on-chain language. Label a retained snapshot as stale or show unavailable. The summary's token symbol is taken from the first sorted token summary even when the aggregate amount is null for mixed tokens; return a typed mixed-token result.
- `useLoopTokenBalance` groups immutable token metadata and changing flow rate into one query. Refetching flow also rereads symbol/decimals. Standard settings similarly combine schedule configuration and current period. Split by update lifetime where this reduces real reads; do not assume separate Wagmi hooks are automatically duplicate requests.
- Activity repeats per-chain current-period RPC reads for each wallet poll. Share a short-lived public schedule snapshot; keep each wallet's activity result separate. One failed loop in an `allowFailure:false` multicall currently marks that whole chain unavailable.
- Leaderboard `initialData` has no actual server fetch time, so an aged server snapshot gains a new browser freshness window. Hydrate with `dataUpdatedAt`/`initialDataUpdatedAt` from source fetch time, separate from the timestamp of the latest scoring event.
- `services/user.service.ts:getUserInfo` fetches profile and scoring separately although both read global stats. It has no current page consumer; consolidate if/when used, not as a claimed live-route saving.
- `app/api/app/user/route.ts` and the Etherscan transactions route contain commented-out handlers. `useUser` and wallet-event handling are legacy/unmounted in the active provider. They should not become dependencies of a new data layer without implementing a real session contract.

## Every page: current data and recommended loading

All seven participation routes inherit the shell/right rail. When open, `LatestActivity` fetches the explicitly viewed profile wallet on `/profile/[address]`, otherwise the connected wallet. `SeasonPoints` uses preview state. Hiding the rail unmounts its queries after the exit animation; CSS stacking alone does not make it a different resource.

| Page                                        | Current page data and actions                                                                                                                    | Proposed resource use                                                                                                                                        |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/`                                         | Client landing; hardcoded initial summary, mount fetch to history summary; local interactions                                                    | Server public summary; optional shared client refresh; no wallet loop reads                                                                                  |
| `/discover`                                 | Metadata filters, example rewards and preview season status; `LoopOpportunityCard` paths; live actions only where a live claim panel is rendered | Server metadata/public loop summaries; wallet status only for actionable visible cards; same keys as `/loops`                                                |
| `/loops`                                    | Metadata directory; live standard/SuperLoop controllers per large card; selected legacy-style card dialog; season streaks tab                    | Shared public snapshots + wallet-loop snapshots; dialog reuses them; participants fetched only on open; season queries only on streaks tab                   |
| `/games`                                    | Season/game definitions and local preview scoring, goal/prize actions                                                                            | Server catalog plus shared current-season/user-season data; production action adapters required                                                              |
| `/milestones`                               | Demo milestones and local selected detail/tab                                                                                                    | Public scoped progress resource plus wallet reward eligibility only on detail/action; no real source currently wired                                         |
| `/leaderboard`                              | Server DB page + summary; browser paginated/search queries; all-time live, season tab preview                                                    | Same server/browser query contracts and source time; distinct global/season/filter/page keys; receipt sync invalidates affected rankings                     |
| `/profile`                                  | Wallet bootstrap and redirect, disconnected preview                                                                                              | Client wallet routing; avoid fetching full profile until target wallet is resolved                                                                           |
| `/profile/[address]`                        | Server cached DB loop stats/rank; optional streamed Gnosis claim rate and verified bonus RPC; preview season panels                              | Server profile/all-time projection; optional resources stream independently; explicit viewed-wallet context; refresh active RSC after its projection changes |
| `/dashboard`                                | Server cached subgraph analytics + live schedules/token metadata; charts consume props                                                           | Server paginated/aggregated historical snapshot; public summary and chart window split; source coverage/block/time visible                                   |
| `/eligibilities`                            | Static eligibility descriptions and local modal; shared header wallet/profile/identity consumers                                                 | Static server content; fetch identity only for relevant wallet display/action                                                                                |
| `/integration/gitcoin-passport`             | Wallet-conditional `ListStamps`: catalog, wallet stamps, score, submit action                                                                    | Shared catalog and wallet queries; submit updates only relevant identity resources                                                                           |
| `/integration/gitcoin-passport/score-gated` | Two score gates consuming the same score resource                                                                                                | One wallet score cache entry; different thresholds are local selectors                                                                                       |
| `/integration/gitcoin-passport/stamp-gated` | Two stamp gates and nested stamp UI                                                                                                              | One wallet stamps resource plus catalog; no refetch effect per consumer                                                                                      |
| `/integration/gitcoin-passport/dev-guide`   | Static Markdown and integration layout/header                                                                                                    | Static server content; no page-specific data request                                                                                                         |

## Source ownership and resource sharing

| Resource/fields                                                                 | Best authoritative source                                                                          | Share between                                                    | Keep separate                                                                                    |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Loop title, logos, sponsor, explanatory eligibility, visibility, deployment IDs | Canonical curated loop registry derived from `loopData`                                            | Discover, directory, claim dialog, profile/history labels        | Visibility vs historical inclusion vs scoring eligibility                                        |
| Token decimals/symbol and token relationship                                    | Chain token metadata, cached by chain/token; curated fallback explicitly marked                    | Reward displays, balances, activity formatting, dashboard        | SuperToken indexed units vs underlying payout asset; no blanket 18-decimal rule for future loops |
| Current period, schedule, counts, flow/balance estimate                         | Chain reads; batch public reads per chain/deployment                                               | Public loop card/grid/dialog/countdown/reward selectors          | Wallet-specific phase, balance, allowance, eligibility                                           |
| Claimable payout, claimer phase/status                                          | Chain contract using the actual wallet/account                                                     | All action surfaces for the same wallet/loop/period              | Different wallet, chain, deployment, period or account-dependent payout                          |
| Successful claim/automatic next registration                                    | Successful receipt and decoded known-contract logs                                                 | Claim button, activity overlay, reconciliation coordinator       | Entry receipt is not a claim; request intent is not emitted claim proof                          |
| Indexed history and participant lists                                           | Subgraph, stable indexed block/cursor                                                              | Activity/history widgets and analytics adapters                  | Current/previous activity window vs all-time counts vs period list                               |
| All-time GP, streak bonuses and rank                                            | DB projections of verified canonical claim events and scoring rules                                | Profile, user pill, leaderboard summary/rows                     | Subgraph raw event count and chain eligibility conditions                                        |
| Season SP, streaks, standings                                                   | Season DB projections + explicit configured season/rules                                           | Season rail, streaks, games, season leaderboard                  | All-time GP; different seasons/config revisions                                                  |
| True Looper 50-claim requirement                                                | Server DB projection of Gnosis loops 3/4, reconciled after verified claims                         | User pill and Gyralis eligibility signing                        | Global milestone total, Base claims, Soneium test claims                                         |
| Community milestone progress                                                    | Indexed aggregate with explicit loop/chain scope                                                   | Milestone banner/page/detail with same scope                     | Existing Gnosis total vs cross-chain dashboard totals                                            |
| Passport score/stamps, Gardens membership, Merits offer, RWAGMI creator         | Respective provider through server adapters; signatures generated server-side after current checks | Identity UI/checks using exactly the same wallet/provider inputs | Different provider, token, community, wallet; signing response vs reusable display check         |
| Preview season/games/prizes                                                     | Explicit local fixtures                                                                            | Preview mode only                                                | Every production query and confirmed claim state                                                 |

## API surface review

Keep server functions as the implementation boundary. Server pages call those functions directly; browser routes adapt the same typed functions to HTTP. Do not make server components call their own HTTP routes.

| Existing route family                                                                | Source and current role                                    | Direction                                                                                                                     |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `/api/loops/history/summary`, `/api/loops/history/[loopKey]`                         | Full dashboard loader                                      | Split lightweight summary and bounded per-loop history; preserve legacy adapters during migration                             |
| `/api/loops/claims-total`                                                            | Validated Gnosis subgraph aggregate; no-store              | Preserve explicit Gnosis scope and monotonic indexed block reconciliation                                                     |
| `/api/loops/registration-status`                                                     | Positive DB cache, then subgraph, RPC on failure           | Preserve provenance; negative indexed result is not proof against a newer receipt; not currently used by standard claim hook  |
| `/api/users/[address]/activity`                                                      | Chain periods + subgraph events                            | Add schema validation and per-chain watermark, merge recent confirmed events, short-lived shared public schedules             |
| `/api/users/[address]/profile-summary`                                               | Tagged cached DB stats                                     | Share canonical wallet-scoring data/selectors and timestamps                                                                  |
| `/api/users/[address]/profile`, `/scoring`                                           | Separate direct DB readers                                 | Retain distinct views if needed; avoid duplicate global reads in combined consumption                                         |
| `/api/leaderboards/global`, `/global/summary`, `/loops/[chainId]/[loopId]`           | DB projections; global readers cached                      | Shared normalized query contracts; chain-aware scope; invalidate both server and client resources                             |
| `/api/seasons`, `/current`, `/[seasonId]/users/[address]`, `/[seasonId]/leaderboard` | Season config and readiness-gated DB projections           | Shared catalog/current-season query; preserve no-current-season and rebuild-required states                                   |
| `/api/scoring/[user]`                                                                | Receipt + subgraph history + DB writes                     | Repair F1–F4; return explicit applied revision/receipt event IDs                                                              |
| `/api/scoring/sync`                                                                  | Authorized bulk/rebuild sync                               | Same event identity and projection correctness as receipt sync; do not expose its authorization through browser configuration |
| `/api/gardens`, `/blockscout`, `/gyralis`, `/rwagmi/register`                        | Eligibility/provider/DB/chain verification then signatures | Action-only server checks; no speculative signature fetching for every card                                                   |
| `/api/rwagmi`                                                                        | Creator/token eligibility display check                    | Key by wallet/chain/token; share display state across card/dialog if needed                                                   |
| Five `/api/gitcoin-passport/*` files                                                 | Provider proxy score/stamps/catalog/message/submit         | Shared transport/error/timeout policy; catalog cached separately; wallet submit updates matching keys                         |
| `/api/app/user`, `/api/etherscan/account/transactions`                               | Commented handlers                                         | Treat as inactive files, not working endpoints                                                                                |

## Proposed implementation contracts

### Registry and adapters

Build one immutable deployment registry containing `chainId`, normalized contract address, UI key, scoring loop ID, factory ID where applicable, subgraph entity ID, contract kind, indexed/payout token relationship, directory visibility, historical visibility, scoring support, and achievement inclusion. Keep curated presentation metadata in `loopData`; other readers derive mappings rather than copy addresses. Archived deployments remain addressable.

Provide server adapters for indexed history, database scoring, RPC public state, and eligibility providers. Each returns typed data plus provenance. A public loop multicall should group compatible reads per chain at a known block; account-dependent calls must preserve the actual account and must not be put in a generic account-free multicall.

### Queries and page composition

Use shared query-option factories with normalized keys. Suggested identities:

```text
['loop', chainId, contract, 'public']
['loop', chainId, contract, 'wallet', wallet, period]
['loop', chainId, contract, 'participants', period, cursor]
['token', chainId, token, 'metadata']
['wallet', wallet, 'scoring', rulesVersion]
['wallet', wallet, 'activity', activityScope]
['season', seasonId, configHash, 'wallet', wallet]
['season', 'current']
['leaderboard', scope, seasonIdOrAllTime, normalizedFilters, page]
['leaderboard-summary', scope, seasonIdOrAllTime]
['community-progress', explicitScope]
['identity', provider, chainId, wallet, providerInputs]
```

A page composes these resources; components select fields instead of fetching overlapping variants independently. A compact metadata card should not mount the full claim controller. A selected dialog should share the public and wallet read snapshots with its card, plus a shared pending/confirmed action record. Keep UI expansion/filter state local.

Create an explicit `viewedWallet` for profile content and a separate `connectedWallet` for signing. Never infer signing authority from the viewed profile address. Keep historical/all-time data separate from current-season data and current/previous-period activity.

### Server/client boundary and caches

Render metadata, public summaries, initial leaderboard, and address-based profile reads on the server. Stream optional claim-rate/bonus sections so a slow subgraph does not gate the core profile. Client code handles wallet connection/signing, live status, local filtering, and claim reconciliation. Reuse a stable browser QueryClient and a request-scoped server client when hydration is needed.

Give snapshots separate fields for `fetchedAt`, `indexedBlock` per chain, `rpcBlock`, `projectionRevision` or processed event IDs, `scope`, and unavailable sources. A source's latest event time is not its fetch time. Serialize uint256 values as strings and format money using token-specific units.

Suggested initial policies, to validate with request/latency measurements:

| Resource                               | Normal freshness                                                 | Mandatory refresh trigger                                                                |
| -------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Curated metadata                       | Build/deployment lifetime                                        | Registry revision                                                                        |
| Token metadata                         | 24 hours                                                         | Token/deployment change or explicit correction                                           |
| Public loop state                      | 10–30 seconds while visible                                      | Claim/entry, resolved period boundary, reconnect/focus when stale                        |
| Wallet action state                    | 5–10 seconds while actionable; no blanket background polling     | Receipt, wallet/chain/period change; refresh before signing                              |
| Score/profile/season projections       | 30–60 seconds for active wallet views; longer for public history | Verified scoring revision after claim                                                    |
| Activity                               | 30 seconds, optional 60-second visible poll                      | Receipt overlay immediately; bounded catch-up until indexed                              |
| Leaderboard                            | 60 seconds for visible data, or 300 if explicitly acceptable     | Successful scoring sync, filters/page/season change                                      |
| Analytics summary/charts               | 300 seconds                                                      | Optional delayed receipt-driven revalidation; never reread all history per wallet action |
| Finalized historical participant pages | Long cache with reorg policy                                     | Scope/cursor change, detected reorg                                                      |
| Identity/provider display              | Provider-specific short cache                                    | Wallet/token/community change, Passport submit                                           |
| Eligibility signature                  | No shared response cache                                         | Explicit register/claim action only                                                      |

TanStack client invalidation, Next Data Cache invalidation, and refreshing an active server payload are separate operations. This proposal follows the documented [Next.js 14 cache boundaries](https://nextjs.org/docs/14/app/building-your-application/caching), [TanStack targeted query invalidation](https://tanstack.com/query/v5/docs/framework/react/guides/query-invalidation), and [server hydration guidance](https://tanstack.com/query/v5/docs/framework/react/guides/advanced-ssr). Keep source timestamps when hydrating and avoid separately owned server/client copies of the same live value.

### Claim reconciliation sequence

1. Capture submitting chain, wallet, deployment, and intended action. Keep watching the submitted receipt even if the user navigates or switches wallets. Do not apply its result to the newly connected wallet.
2. Require a successful receipt and decode allowlisted logs. Publish actual claim/register events, not an increment inferred from the button label. Event identity is `(chainId, txHash, logIndex)`; transaction-level identity only deduplicates the transport job.
3. Immediately mark that wallet/loop action confirmed across card/dialog and display a receipt-backed activity item. Refresh affected chain/public/wallet state without waiting for subgraph history or scoring.
4. Persist verified events and update all-time/season projections consistently. Return the projection revision, applied event IDs, changed scopes, and an explicit sync result. Retry failed follow-up work independently of the successful transaction.
5. Invalidate wallet score/profile, current-season data, all affected leaderboard rows/summaries/ranks, and qualifying claim requirements. Server invalidation happens after writes; browser invalidation follows the applied response. Refresh an active affected server profile payload.
6. Reconcile each chain's indexed activity/progress using a returned watermark that covers the receipt. Merge by canonical event identity; remove the receipt overlay only when covered and semantically represented. Keep the Gnosis milestone and cross-chain analytics separate.
7. Retry with bounded backoff, stop routine polling when caught up, preserve confirmed data on failure, and expose a follow-up retry. Remount/navigation must not discard unacknowledged receipts. Recover missed claims through the bulk indexer as well.

## Implementation stages for review

1. **Correctness:** canonical registry and chain-aware filters; bind receipt identity; durable verified-event merge; atomic/versioned projections; explicit sync result; retryable in-flight coordination. Decide whether RWAGMI/Soneium should score and encode that policy.
2. **Claim freshness:** shared confirmation coordinator and wallet/public query factories; all affected invalidations; immediate activity overlay; indexed watermark reconciliation; shared card/dialog mutation state; reliable period rollover.
3. **Page composition:** stable SSR provider, server seeds with real timestamps, resource selectors and lazy participants, optional streamed profile sections. Preserve current page behaviors while migrating each live route.
4. **Backend cost:** lightweight landing summary, bounded/pinned analytics pagination, aggregate projections for expensive uniqueness, shared schedules/token metadata, database query/index profiling. Measure before and after under the same dataset and cache state.
5. **Production wiring:** current-season catalog and user-season resource shared everywhere, explicit preview isolation, real Games/milestone action contracts when available, remaining Passport/legacy cleanup.

No architecture implementation, migration, season activation, external write, or deployment has been performed. These stages are proposed for review first, as requested.

## Acceptance checks for implementation

- A successful claim updates every mounted action surface and personal activity immediately from verified evidence. Score/streak/rank updates follow a confirmed projection revision without waiting for the next minute poll.
- Reverted and entry-only receipts do not increment claims. Wrong contract/chain/loop combinations are rejected. UI period drift does not discard a valid receipt event.
- Two consecutive receipts before indexing, two concurrent loop claims, an older receipt retry, duplicate logs, and background bulk sync preserve canonical event sets and correct scores. Reorg handling is explicit.
- A failed sync can retry the same receipt; a successful transport with `claimed:false` does not acknowledge application. Wallet switches/navigation during submission retain the original wallet identity and receipt watcher.
- Grid + selected dialog share read snapshots and mutation state. Closed participant dialogs produce no participant/balance/payout requests. Duplicate score gates share one wallet score resource.
- A standard/SuperLoop rollover refreshes public period and wallet state in order, including after a failed boundary read and tab sleep/resume.
- Base loop ID 1 remains included when Gnosis loop ID 1 is excluded. Profile totals, leaderboard rows/summary, and global projections agree on scope. RWAGMI/Soneium either have complete scoring sources or explicitly opt out.
- Missing subgraph/RPC/provider/database data renders unavailable/partial coverage, never a fabricated authoritative zero. Activity remains usable when one source is down.
- Analytics supports more than 1000 periods and more than one event page, pins pages to a known snapshot, and reports chain coverage. Landing does not traverse all event history.
- No-current-season and rebuilding-season states remain distinct from empty scores. Preview actions never appear as production receipt-backed state.
- Verify SSR HTML for public sections, stable query cache across leaderboard navigation, browser request counts per route/open-dialog/claim action, and database/subgraph/RPC latency before claiming performance gains.
- Re-run the suite and resolve or explicitly review the baseline sponsor test separately; add behavioral coverage for the missing receipt-sync, rollover, and cache-boundary scenarios rather than relying only on source-string architecture assertions.
