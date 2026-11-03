# Page-by-page data cleanup

## Working agreement

Work through `/loops`, `/discover`, `/profile` and `/profile/[address]`, `/leaderboard`, `/games`, `/milestones`, `/dashboard`, then the landing, eligibility and integration pages. Include shared shell, rail and wallet components when inspecting each page. Preserve existing design work and mock scenarios.

For every page, record fields actually rendered, public vs personal ownership, source, request trigger, cache identity, sharing, server/client boundary, action-driven refresh, failure behavior and verification. Follow the current worktree, since UI work is happening alongside this cleanup.

Use disconnected and connected wallets across every Season phase. Connected users need both registered and unregistered scenarios. Also check wallet reconnect, wrong network, wallet switching, loading, empty results, failure and a confirmed claim before subgraph indexing.

Season registration and Loop registration are separate operations. A Season entry does not satisfy a Loop's eligibility. A Season ending does not end ordinary token claims. Late-entry SP can be backdated under the agreed Season rules without crediting a Season registration transaction as a claim.

## `/loops`: state matrix

| Season state                           | Disconnected                                                               | Connected, not entered in Season                                                                    | Connected, entered in Season                                                    | Data and action requirements                                                                                      |
| -------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| No configured/current Season           | Public directory and connection action; explicit preview remains available | Regular Loop actions follow contract state                                                          | Historical Season results need an explicit Season ID                            | No substitution of all-time GP for missing Season SP                                                              |
| Registration open, before start        | Public Season details; connect before entering                             | Offer Season entry in the shared Season surface                                                     | Show entered state; allow withdrawal/refund before start under the agreed rules | No current-Season claim SP before start; ordinary token claims continue                                           |
| Season started, late registration open | Show public deadlines and connect action                                   | Offer late Season entry; distinguish eligible historical progress from awarded/registered standings | Display eligible Season progress, including valid backdated activity; no refund | Loop token claim status still comes from the wallet's contract state; late registration itself adds no claim      |
| Season started, registration closed    | Public details; connect for personal data                                  | Explain entry closed; ordinary Loop claims remain available                                         | Show current Season streaks/SP and next opportunities                           | Claim/period rollover refreshes the correct wallet/Loop/Season resources                                          |
| Season ended, results under review     | Public provisional results                                                 | No new entry or Season SP                                                                           | Saved score/streak history; results remain provisional                          | No new Season scoring after end; ordinary Loop claims continue                                                    |
| Season ended, results finalized/prizes | Public final results                                                       | No new entry                                                                                        | Prize state follows finalized entitlement and claim status                      | Fetch prize eligibility only where rendered; never infer payout entitlement from a fixture or a full progress bar |

Repeat applicable rows for a wrong network, reconnect, wallet switch, already-claimed Loop, unavailable RPC/subgraph, and a delayed scoring sync. Treat reviewed/finalized as distinct ended states. The current production Season API does not implement the new entry/refund/prize lifecycle; those UI scenarios remain mocks until real contracts and data are available.

## `/loops`: component/resource map

| Component                                 | Useful data                                                                       | Ownership/source                                  | Fetch trigger and sharing                                                                                                     |
| ----------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Directory/search/artwork/access help      | Loop identity, title, chain, logos, eligibility explanation, sponsor              | Curated `LoopCardsData`/Soneium metadata          | Local filtering; no eligibility signature request on browse                                                                   |
| Compact opportunity card                  | Metadata and labeled reward example                                               | Curated metadata and example fixtures             | Should not mount wallet claim reads                                                                                           |
| Large claim card and selected Loop dialog | Period/schedule, token metadata, public count/reward estimate, wallet claim state | Public and wallet contract resources              | Identical public/wallet reads share keys; phase-dependent wallet status must include the Loop period                          |
| Claim action                              | Current connected wallet, network, eligibility signature and submitted receipt    | Wallet + server provider checks + chain           | User action only for signing; a preview Season phase never authorizes a transaction                                           |
| Participant dialog                        | Selected-period registrations, claims, optional payout/token display, ENS         | Public detailed history, currently RPC log hooks  | Detail reads only while open; no connected wallet required; failure distinct from no participants                             |
| Season streaks, preview mode              | Sample SP and milestone states                                                    | Explicit local fixtures                           | No live Season score requests; preserve for UI testing                                                                        |
| Season streaks, live mode                 | Current Season definition, configured roster, wallet Season projection            | `/api/seasons/current`, then Season user endpoint | Connected wallet and live tab only; all-time GP excluded; source failure distinct from no current Season                      |
| Right rail                                | Season preview/entry state, viewed/connected wallet activity                      | Shared Season context; wallet activity query      | Mounted rail only; activity query keyed to the actual wallet; existing post-claim behavior still needs the shared coordinator |

### Shared-data findings

- Keep Loop public state separate from wallet state so disconnected visitors can see counts/rewards without wallet queries.
- The same wallet/chain/contract/period should share contract query snapshots across grid and dialog. Local pending/confirmed mutation state is still duplicated and needs a later shared coordinator.
- The Season definition can be shared by streaks, Games, leaderboard and rail. Current `getSeasonStreaks` fetches it within a wallet-specific query; extract a common definition query when migrating those consumers together.
- Preview Season context and streak-card sample data are separate fixtures today. They should use one explicit scenario adapter when that UI pass starts, keeping preview cache/state isolated from live projections. Preserve both until the scenarios have been migrated.
- Global claim totals, qualifying Gnosis claims, current-period participant counts and Season claims have different scopes and must not share a bare `totalClaims` resource.
- The season phase is not a contract Loop period. Wallet status cache keys must follow Loop periods even when the Season phase does not change.

## First cleanup changes

1. Standard-loop claimer status is now scoped to the resolved Loop period for every eligibility provider. A cached completed claim for one period is not reused as the next period's status.
2. Closed participant dialogs disable token balance/metadata and selected-period payout reads, alongside the existing list/range gates.
3. Participant list and block-range failures now show an unavailable state and Retry action. They no longer present a failed read as an empty list or 0% claim rate. Missing period data stays loading, and missing payout values remain unknown rather than fabricated zero amounts.
4. Retry refreshes both range resolution and the event-list requests. Parent action refreshes also propagate to range resolution.

These changes cover specific live data bugs. They do not claim the whole `/loops` page is finished or that every Season/wallet combination has been tested in a browser.

## Verification and remaining work

Automated regression coverage exercises the real standard claim hook with Wagmi query-key hashing and a QueryClient seeded with previous/current-period wallet snapshots. It checks period rollover, disconnected query gates and wallet isolation. Participant component tests cover closed/open fetch gates, failures from both lists and block-range lookup, unresolved periods and missing payouts. Existing Season fixture tests remain the source of domain-level phase coverage.

Validation for this pass:

- Full Vitest run: 382 passed, one existing failure in `lib/loops/sponsor-data.test.ts:30` (the source assertion expects `loop.sponsorUrl`). All 11 new behavioral regression tests pass.
- `pnpm exec tsc --noEmit --incremental false`: passed.
- Targeted ESLint for both changed source modules and both new test modules: passed.
- `git diff --check`: passed.
- Browser state-matrix and live network verification remain pending.

Remaining `/loops` work:

- Unify public/wallet query factories and card/dialog pending/confirmed mutation state.
- Move submitted receipt watching outside transient card/period state; preserve it through navigation, rollover and wallet changes.
- Repair durable receipt scoring sync, retry/result validation and all affected invalidations from the full review.
- Share period-boundary scheduling and verify sleep/resume/retry behavior with both contract kinds.
- Replace per-instance participant log effects with a shared paginated history query where indexed coverage is available, including historical range completeness and optional ENS caching.
- Migrate Season previews to one shared scenario adapter, then run the full matrix against rendered UI. Keep the 28-claim Season fixture milestone distinct from the existing live scoring configuration until the Season rules migration is implemented.
- Measure browser requests for disconnected/connected directory, search, opening/closing a dialog, switching tabs, claiming and returning from another page. No measured performance reduction is claimed yet.

After these shared Loop foundations are stable, reuse them on Discover rather than introducing a second fetching path.
