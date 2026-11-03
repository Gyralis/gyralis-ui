# Latest Claims: event-driven refresh

Implemented for the standard and SuperLoop cards, including the shared right-side component.

## Behavior

- No continuous 60-second poll. Normal reads occur on mount/wallet change, manual refresh, or stale focus/reconnect.
- Successful claim callbacks include the receipt logs already obtained by Wagmi. Known-contract Claim events provide the actual wallet, payout, period, transaction and log index. The row appears immediately, independently of scoring sync. Entry-only and reverted transactions do not add claims.
- Receipt and indexed rows share canonical event identity. A matching indexed event replaces the receipt row only when the indexed watermark covers its block. Old responses cannot erase a newer indexed snapshot or an unindexed receipt.
- One job per wallet and QueryClient combines simultaneous pending claims. It waits 250 ms to coalesce, then retries at additional delays of 2, 4, 8 and 16 seconds, stopping early when indexed. Each request is bounded by a timeout. New receipts arriving during the final request receive another bounded run; no new claims means no further background work.
- Catch-up requests include only affected chain/Loop scopes. A receipt's period is also included so a period-boundary claim can be acknowledged while the shared public schedule is cached. Full requests already in flight are reused.
- Public chain period batches use a shared server cache with 15-second revalidation. Wallet responses remain private/no-store. The subgraph still filters by wallet, Loop and the narrow period window.
- Scoped updates preserve other Loops and previously loaded rows from unavailable chains. Receipt-only/scoped data never prevents the initial full history fetch when the panel opens. Updating one Loop does not reset the full history's freshness clock.
- After the retry budget, the confirmed row remains visible with a delayed-history message. Manual refresh and stale focus can check again. Closing/reopening within the QueryClient lifetime preserves cached rows.

## Code ownership

- `lib/activity/latest-activity-query.ts`: shared query options, bounded reconciliation and receipt cache publication.
- `lib/activity/confirmed-claims.ts`: receipt event decoding using known deployments.
- `lib/activity/activity-data.ts`: validation, event identity, snapshot merging and exact token totals, shared by server/client readers.
- `lib/activity/scope.ts`: normalized, allowlisted scope parsing.
- `lib/activity/get-activity-periods.ts`: cached public schedules.
- `lib/activity/get-latest-activity.ts`: scoped subgraph reads and indexed coverage.
- `lib/hooks/app/use-refresh-latest-activity-after-claim.ts`: card hook adapter. Scoring sync no longer invalidates this unrelated query afterward.

## Verification

Behavioral tests exercise real QueryClient/QueryObserver behavior with mocked network responses: immediate publication, zero idle polls, stale focus refresh, simultaneous claims, an in-flight full request, hidden-rail opening, bounded failure/lag retries, actual receipt wallet ownership, token-indexed event decoding, no duplicate rows, watermark checks, scoped merges, old-response protection, period expiration, response validation and API scope rejection. Server tests check single-chain/single-Loop requests and period-boundary acknowledgement.

Final focused run: **68 tests passed across nine files**. TypeScript, targeted ESLint, formatting and `git diff --check` passed. The broader suite run had 444 passing tests and three failures in concurrent Season Games work and the existing sponsor-link source assertion; those files were not changed by this implementation.

No production transaction or live subgraph benchmark was run. The receipt overlay is held in the browser QueryClient, not a durable cross-reload ledger. Claims made elsewhere appear on a subsequent full refresh. Broader receipt-watcher lifetime and durable scoring-projection work from the original review remain separate tasks.
