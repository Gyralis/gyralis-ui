# All-time leaderboard release check

The read-only consistency check compared 205 eligible per-loop records (excluding loop IDs 1 and 2) with 169 persisted global leaderboard entries. Eight global entries disagreed. No database records were changed.

**Release prerequisite:** reconcile these projections and rerun `node scripts/inspect-leaderboard-consistency.mjs` before claiming consistency with profile totals. The page intentionally uses the existing global projection; this implementation does not run a scoring rebuild.

| Wallet                                       | Eligible GP / stored GP | Eligible claims / stored claims | Eligible best streak / stored streak |
| -------------------------------------------- | ----------------------- | ------------------------------- | ------------------------------------ |
| `0x809c9f8dd8ca93a41c3adca4972fa234c28f7714` | 0 / 10                  | 0 / 10                          | 0 / 2                                |
| `0x8de7bb14218d4e1bf210a6eca81b0b8d9e82a0e4` | 0 / 48                  | 0 / 29                          | 0 / 29                               |
| `0x2e1bce43302218d12ce9ff20d404f7e7eefc27dd` | 2 / 99                  | 2 / 50                          | 2 / 33                               |
| `0x07ad02e0c1fa0b09fc945ff197e18e9c256838c6` | 16 / 28                 | 14 / 24                         | 3 / 4                                |
| `0x39fd1d5394e3d4d91a7524dd5ee969218ff4ef9e` | 8 / 49                  | 6 / 28                          | 4 / 16                               |
| `0xdf8f53b9f83e611e1154402992c6f6cb7daf246c` | 0 / 6                   | 0 / 4                           | 0 / 3                                |
| `0xacd59e854adf632d2322404198624f757c868c97` | 1 / 2                   | 1 / 2                           | 1 / 1                                |
| `0x625236038836cecc532664915bd0399647e7826b` | 0 / 3                   | 0 / 3                           | 0 / 2                                |

In this sample, global totals exceed eligible-loop totals by 218 GP and 127 claims, with four extra positive-claim wallets. This was a comparison of stored records, not an on-chain scoring audit or an atomic snapshot. Rerun after any reconciliation or concurrent scoring activity.

Browser acceptance remains: mobile widths 320–430px, horizontal table dragging, keyboard search/clear/pagination, rapid search changes, history restoration, profile links, and empty/error/loading states. No browser automation dependency was added.

## Implementation checks

- 20 focused tests passed, including query parsing, service cancellation, canonical rank, aggregate response handling, and scoring-cache invalidation.
- TypeScript, targeted ESLint, and diff checks passed.
- Local HTTP smoke checks returned 200 for both APIs and the page route. A filtered result retained global rank 58 while legacy filtered rank remained 1; a requested limit of 1000 was capped at 25 with global ranks enabled.

The initial HTML check revealed the existing root-provider mount gate suppressed page content. `/leaderboard` now bypasses that gate using the existing SSR-configured wallet provider; other routes retain their mount gate. Query clients are created per provider instance. TypeScript and targeted ESLint passed after this change. The final HTTP content recheck was not run because permission was declined; server-rendered content and browser hydration still need verification.

Page size and the optional global-rank request cap were subsequently reduced to 15. Page 1 remains implicit in `/leaderboard`; pagination adds `?page=2` onward. The HTTP checks above describe the earlier 25-row configuration.

The summary endpoint now aggregates `UserLoopStats` excluding loop IDs 1 and 2, groups by wallet, and includes only wallets with positive eligible claims. Its cache key was bumped. The row/rank projection still requires the reconciliation above; summary totals and row population can differ until then.

Verified the updated summary over HTTP: 13,280 GP, 9,090 claims, 165 loopers, longest streak 129. All 11 focused leaderboard/service tests passed after the summary change.
