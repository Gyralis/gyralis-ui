# Automatic Base loop scoring

The Base subgraph discovers factory-created loops and indexes their claims.
Scoring consumes all of those claims; the UI catalog is not an allowlist.
New loops require no scoring configuration change.

## Stable identities

Existing Base records retain their historical product IDs:

| Loop | Subgraph address | Scoring ID |
| --- | --- | --- |
| Markee | `0x213310e1dbd6991cd488ab247c81fad82cd88e7a` | 1 |
| True Loopers | `0xb7902fae80eb57abac621dc68eb30ffff42f76f0` | 6 |
| RWAGMI | `0xe714bc7f58726490a15d2197bcded598223f5319` | 7 |

These are compatibility aliases, not an enrollment list. Every other Base loop
uses `1_000_000_000 + factoryLoopId`, scoped by chain. This separate namespace
avoids collisions between factory IDs and historical product IDs. IDs must fit
Prisma's signed 32-bit Int. Missing or invalid factory IDs fail the sync page;
they are never silently discarded. History queries reverse this identity using
the subgraph's `loop_.factoryLoopId` filter.

New UI integrations must use this canonical scoring ID for profile and
leaderboard lookups. Receipt sync also resolves identity from the contract
address, preventing UI-assigned IDs from creating duplicate scoring records.
A newly created loop must be indexed before receipt sync can resolve it; if not,
receipt sync fails and the scheduled import will pick up its claims later.

Gnosis keeps its numeric IDs and legacy exclusions. Adding a new factory or chain
still requires subgraph coverage and endpoint configuration. Automatic scoring
does not create UI cards or enroll loops in opt-in seasons.

## Deployment and catch-up

Base now uses `scoring-sync-8453-all-loops-v1`. Its first incremental run starts
at block zero independently of the old cursor, so previously excluded loops
(including inactive loops with no new claims) are replayed. Each bounded page
recomputes affected user/loop projections from complete indexed history and
upserts them, preserving identities and avoiding double-counted points.
The existing scheduled sync continues advancing this cursor. An operator can
accelerate catch-up through the authenticated incremental sync endpoint until
`hasMore` is false. Do not use `full` for this migration: it clears projections.
Global statistics may be partially caught up while the replay is in progress.

Verify the reported wallet's Base loop 7 against its complete indexed claim
history after deployment. Confirm both streaks and claim counts, then confirm a
new uncatalogued factory loop appears in lifetime scoring. Production data is
not changed by tests or by building this patch.
