# Gyralis profile — compact handoff

Updated 2026-09-21; latest mobile, table, and navigation UI rechecked against the source. This replaces the earlier profile planning document. Code takes precedence over older chat proposals. This is a documentation-only update, not a browser-verified design audit.

## Start here in a new chat

Read this document, then inspect the files relevant to the next request. Continue the existing implementation; do not rebuild the profile or reintroduce removed UI. Preserve unrelated edits. The user favors small, scoped changes using existing Gyralis components.

Stack: Next.js App Router, React, TypeScript, Tailwind, Prisma/MongoDB, wagmi/RainbowKit, TanStack Query, react-icons, Recharts. Use pnpm. No dependency installation without approval. A previous request to install clsx/tailwind-merge was declined.

## Routes and data flow

```text
/profile → waits for connected wallet → /profile/[address]
                                          |
                               getProfilePageData(address)
                                  /                  \
                   getProfileStatsData        cached global rank
                   filtered loop stats        entry + count ahead
                          |
                  metadata + parsed bonuses
                          |
                   ProfilePageView

Navbar connected wallet → React Query → /api/users/[address]/profile-summary
                                          |
                               same cached getProfileStatsData
                                          |
                              {address, totalPoints, totalClaims}
```

- Routes live in `app/(general)/(participation)/profile/`.
- `page.tsx`: wallet hydration/connection bridge; disconnected users see Connect wallet, not search UI.
- `[address]/page.tsx`: public SSR profile, dynamic route, invalid addresses return notFound.
- `[address]/loading.tsx` and `components/profile/profile-page-skeleton.tsx`: shared header/rank, table, and four-achievement skeleton. Also used during wallet resolution.
- `[address]/error.tsx`: retry via router.refresh/reset; Back to loops. Failed fetches must not appear as zero-claim profiles.
- `lib/profile/get-profile-page-data.ts`: validates/normalizes wallet; reads per-loop stats and rank. No unused user-profile/global-stats reads.
- Exclude scoring loop IDs 1 and 2 at the DB query. Header/table/pill totals sum the SAME included loop records, avoiding historical global-stats mismatch.
- Metadata comes from `data/loops-data.ts`, matched by chainId + loopId, not array position. Fields: title, sponsorName (fallback by), contract address, status, logos.
- Logo fallback: communityLogoUrl → eligibilityLogoUrl → sponsorLogoUrl. Unknown metadata becomes Archived loop #ID.
- Rank helper: `lib/db/clients/leaderboard.client.ts`; totalPoints DESC, totalClaims DESC, userAddress ASC. Missing rank → null/—.
- Profile data: address, lastStatsUpdatedAt (ISO|null), loopStats, hasActivity, globalRank.
- Each loop includes claims, claim/streak/total points, current/longest streak, last claimed period, earned milestone bonuses, and metadata.

## Cache and update semantics

- `lib/profile/profile-cache.ts`: 300-second server cache; wallet-specific stats tags and a separate global-rank tag.
- Cold profile load: up to 3 DB queries (loop stats + rank entry/count), down from 5. Summary endpoint only needs cached loop stats, not rank.
- Scoring writes invalidate affected wallet stats and all ranks. Full rebuild invalidates all stats. Hooks are in `lib/scoring/sync.ts` and `lib/scoring/user-claim-sync.ts`.
- Five-minute caching DOES NOT recalculate scoring every five minutes. It reuses database results. A 24-hour cache was discussed but NOT implemented.
- Daily cron: `vercel.json`, /api/scoring/sync at 00:00 UTC. Updated users depend on newly indexed claims; timestamps need not change for every wallet every day. Receipt-based sync can also update stats.
- lastStatsUpdatedAt = latest updatedAt among included loop records, not last fetch time or latest successful global job.
- `profile-updated-time.tsx`: under 60 seconds “a few seconds ago”; under 1 hour whole minutes; under 24 hours whole hours; 24+ hours UTC date. Null/invalid → —. Refreshes at unit boundaries and on tab visibility; server/client initial rendering uses a stable date.

## Levels are NOT loop-access eligibility

Source: `lib/profile/profile-level.ts`.

| Level | Total GP |
| --- | --- |
| Looper | 0–49 |
| True Looper | 50–249 |
| LooperX | 250+ |

- Profile progress: 0→50 GP, then 50→250 GP, then full.
- True Looper LOOP ACCESS separately requires 50 CLAIMS. Bonus GP cannot substitute for claims.
- Pill progress/copy prioritizes remaining claims until 50; afterward shows GP toward next level.
- Wording: “X claims to access True Looper loop” versus “X GP to reach LooperX.”
- Beta levels may change; do not imply season scoring is implemented.
- Claim points: 1 per scored claim. Bonuses from `config/scoring.json`: 3→2 GP, 7→5 GP, 14→12 GP, 30→30 GP. Each awarded once per loop.

## Profile visual system

### Latest responsive UI reference

These are the current implementation values, not proposals. Mobile-specific changes use the base styles; `sm` restores the larger typography. The hero does not become two columns until `lg`, and the full navbar profile pill appears at `2xl`.

| Element | Mobile/base | Larger screens |
| --- | --- | --- |
| Page spacing | 16px horizontal, 32px vertical; 24px between sections | 48px vertical from sm; max-w-6xl container |
| Hero title | 24px | 30px from sm |
| Hero subtitle | 12px | 14px from sm |
| Hero GP value | 36px, normal numeric font | 48px from sm |
| Progress marker | 11px, percentage only | Same size with “completed” from sm |
| Header stats | Best streak then claims side by side; claim-rate gauge below | At xl: best streak, claims, claim-rate gauge in three columns; 16px gap |
| Per-loop card padding | 20px | 32px from sm |
| Per-loop heading | 20px, left | 30px from sm |
| Per-loop total | 24px + muted 12px GP, right, baseline-aligned | 36px + stacked 10px GYRA / POINTS label |
| Per-loop subtitle | 10px, below heading/total | 14px from sm |
| Achievements heading | 18px, left | 30px from sm |
| Achievements badge | 10px, below title; 2px row gap | 12px, same row, right |
| Achievements info icon | Top-right of header grid | Beside title |
| Achievements subtitle | 12px, below the header grid | 14px from sm |
| Explore / empty-state subtitle | 12px | 14px from sm |
| Table values | 14px bold; total column 16px; muted 12px GP suffix | Same sizes; never shrink table values to fit mobile |

Hero and achievements outer cards still use 32px padding on mobile; the per-loop card has the explicit 20px exception. All main section corners remain 24px. Achievement cards themselves use a 92px icon header and 20px content padding, with muted borders and a low-contrast gradient. Do not restore the earlier bright borders or uniform centered-card experiment.

Latest mobile achievements layout:

```text
Your achievements                         (info)
[X of Y bonuses earned]
Subtitle below
```

The superseded “title and badge on one row on mobile” and “info inline after the wrapping title” arrangements are NOT the final layout.

Table scrolling contract:

- Outer card must stay within viewport. Keep `min-w-0`, the parent `grid-cols-1`, and card `max-w-full` constraints.
- The scroll region alone has `w-full max-w-full overflow-x-auto overscroll-x-contain`; it is keyboard-focusable, with an accessible region label and focus ring.
- Only the inner grid has `min-w-[770px]`. Do not move that minimum onto the scroll container or card.
- Row layout remains horizontal with all five columns. No mobile stacked-row replacement, hidden columns, or rounded individual rows.
- Header, every row, and totals use the same column template. Loop identity is left-aligned; numeric columns are right-aligned. Row cells stay vertically centered.
- Logo is 34px in a rounded-xl container, title 14px bold, sponsor line 11px muted. Column headings and All loops are 9px uppercase with tracking.
- Whole-row hover/tap opens milestone details. Those details show green check/+GP for earned bonuses and muted X/+GP for unearned bonuses. Never restore “locked.”
- No visible “Swipe to…” instruction. On mobile Safari, confirm that dragging a row scrolls the table rather than navigating or clipping the page.

Do not infer visual verification from these class values: the shared `cn` caveat below still applies. The skeleton includes the new gauge and 16px stat gaps, but is not pixel-identical to every latest breakpoint.

Main composition: `components/profile/profile-page-view.tsx`.

- Reuse Card, Progress, Badge, Skeleton, ProfileDetails, existing button/link styles, Gyralis primary green and secondary purple.
- Main section radius 24px; default padding 32px. Per-loop card uses 20px padding on mobile, 32px on desktop.
- Section titles foreground; only “Profile” in the hero title is primary.
- Numbers use normal app font with tabular-nums, not Baloo/font-heading or monospace. Table values 14px bold, total column 16px.
- Muted GP suffixes. Claims/streak-bonus row values have +; current streak and totals do NOT.
- No tamagotchi-card hover movement on hero/table.
- No address under hero, copy/explorer/search, joined date, passport, loops-participated/profile-created header metrics, or tier badge beside title.
- X sharing/custom OG work is on hold until seasons; don't add it back from old chat requests.

### Header

- Desktop two cards: flexible progress card + 220px rank card; stacked on mobile.
- Looper Profile title with beta-level info icon. Total GP value baseline-aligned with muted GP.
- Header stats use 16px gaps: Best streak first, Total claims second, claim-rate gauge third at xl; gauge below both on smaller screens. Stat values are 14px, labels 10px.
- `profile-claim-rate.tsx` loads the optional statistic under Suspense with a chart-shaped skeleton. `profile-claim-rate-gauge.tsx` uses a compact 72×36px Recharts semicircular PieChart: primary green fill, muted remaining arc, foreground needle indicating the rate, and 12px percentage below the arc. The info popover contains ONLY X of Y periods claimed (or empty/error status); the counts are no longer visible under the chart. Empty/error values show — and no needle. The rest of the profile still renders if this statistic fails.
- `lib/profile/get-user-claim-rate.ts` caches for 300 seconds, fetches a fresh activity snapshot inside that cache, and reads each standard loop's getCurrentPeriod at the SAME indexed block. Registrations targeting periods before that current period form the denominator; matched claimed periods form the numerator. Sum counts across Gnosis loops 3/4 before dividing; no Base data. Open/current and future periods are excluded. An RPC/subgraph failure rejects the whole optional metric. This is separate from GP level progress and does not use database/global claims.
- Welcome copy for zero GP; remaining-GP message below threshold; completion copy at LooperX.
- Muted progress track; percentage follows filled-bar endpoint. Mobile hides “completed”; desktop retains it.
- Header level bar uses `profile-level-progress.tsx`: a client-side Recharts BarChart with one horizontal Bar, hidden axes, fixed 0–100 domain, 10px height, primary fill, and muted CSS track. ResponsiveContainer fits the available width; accessible progressbar semantics expose the percentage. Animation is disabled so the existing percentage marker stays aligned. Achievement progress bars still use the shared Radix Progress component. This is GP level progress, separate from the claim-rate gauge.
- Right card: ALL TIME RANK, #rank, small muted Updated label, update-schedule info, View leaderboard footer.
- `profile-levels-info.tsx`: three GP tiers, beta explanation, separate 50-claim access rule, divided feedback footer.
- Feedback Discord and both footer Discord links: https://discord.gg/9shxYYHsaT (new tab, external-link icon).

### Your GP per Loop

- CSS grid, NOT HTML table. Identical header/row/totals columns:
  `minmax(0,1fr) 90px 90px 220px 96px`, gap 16px, inner min-width 770px.
- Columns: Loop | Current streak | Claims | Streak points | Total.
- Loop: non-circular logo, title, Sponsored by creator. No chain/loop ID/address/explorer in rows.
- Current streak: primary green flame/value, glow for positive value.
- Streak points: milestone icons beside +value GP; earned primary, unearned muted. Removed “1 of 4” text.
- Whole row opens details, not just bonus cell. Earned milestone = check + green reward; unearned = X + muted reward (NOT lock or “locked”). Tooltip reward values 14px.
- All loops totals label matches uppercase column-header styling; no + on totals.
- Mobile overflow fix: min-w-0 through containing flex/grid/card; grid-cols-1 parent; constrained overflow-x-auto region. Never let the minimum table width expand the card/page.
- Mobile header: smaller title and value side by side, e.g. 122 GP; desktop keeps stacked GYRA / POINTS label. Subtitle below.
- No “Swipe to see all columns” hint (explicitly removed).

### Achievements

- Four milestone bonus cards, NOT an activity feed.
- Counts/progress use ALL active eligible catalog loops, including loops the wallet has never claimed from.
- Current catalog: Gnosis 1Hive #3 and Blockscout #4 enabled. Markee #5 Base disabled and achievementActive:false. True Loopers #6 Base disabled.
- 2 active loops × 4 milestones = 8 possible bonuses, not 4 “unlocked” categories.
- Per-card counter uses earned active loops / all active loops. Historical inactive earnings remain in credited GP and details, not active denominator/logo strip.
- All active loop logos shown at 24px, 4px gaps; unearned muted/grayscale, earned check overlay (NO green background).
- Earned +GP primary if any bonus earned, otherwise muted. No “not yet” or generic Reach X explanation.
- Whole card opens per-loop details on hover/tap. Rounded inner detail rows, equal padding.
- Info icon has color highlight, no hover background.
- Current subtitle in code: “Explore completed streak bonuses and points earned across loops.”
  Earlier approved alternative: “Explore streak bonus points across active loops.” It was overwritten later; do not silently claim it is current.
- Mobile header: title left, badge below it with 2px row gap; info icon right. Desktop: title+icon left, badge right.
- Responsive cards: one column → two at sm → four at xl.
- `profile-explore-loops.tsx`: enabled, unclaimed loops only; Markee excluded.
- Mobile section subtitles reduced by 2px (hero/achievements/explore 12px, per-loop 10px); desktop 14px preserved.

### Shared details and icons

- `profile-details.tsx`: existing Radix popover; hover desktop, tap/click pins open, Enter/Space, Escape/outside dismissal. Mouse leave delay lets pointer enter content.
- Streak/levels info and row/card details use it. Not every legacy tooltip has been converted.
- `components/loops/streak-milestone-icon.tsx`: 3 FaFireFlameCurved; 7 FaFire; 14 GiFlame; 30 GiFlameSpin. Props streak, glowing=false, disabled=false, className, title.
- Claims use bolt icon.
- Streak explanation: consecutive periods within SAME loop; each milestone once per loop; future-season bonus availability described, not implemented.

## Navbar profile pill and navigation

- `components/profile/profile-user-pill.tsx`: connected wallet summary, left of GyraHub. Uses /api/users/[address]/profile-summary.
- TanStack Query keyed by lowercase wallet, staleTime 5 minutes, abort signal, one retry, no prior-wallet placeholder. Missing stats show fallback, not fake zero values. Disconnected → hidden.
- Pill styling matches GyraHub: 40px height, rounded-md, px-3, content width (NO fixed 280px), shared background/hover styles.
- Green circular Recharts ring 24px, smaller than two-line content. Matching loading skeleton.
- First line: level · number + muted GP, 13px. Second line: access/reach description, 10px.
- Full pill: no duplicate tooltip, direct profile link. On ANY /profile route, non-navigating display.
- Compact pill: tap/hover details with Open profile link; link omitted on profile pages.
- Full version at 2xl; compact on narrower navbar widths. No profile pill inside mobile drawer (removed).
- Mobile nav uses one non-wrapping row; compact wallet icon/limited GyraHub content preserve menu-button room. Connected desktop wallet text 12px and pill-like hover.
- Mobile menu trigger is fixed at 40px and cannot shrink. Logo, profile ring, GyraHub, wallet, and menu must stay on one row. Compact wallet text is hidden below sm, with an accessible wallet label; GyraHub hides its text/attention badge on small screens while retaining its trigger and score where available.
- Navbar desktop links truly centered with balanced grid columns; below xl desktop links use a second row. Mobile drawer button must not wrap under controls.
- Participation navigation shared in layout: Loops, Leaderboard, Profile all enabled.
- NEW/Try it badge removed and component deleted.
- Profile WORD has a secondary shimmer every 3 seconds, ONLY when Profile section is inactive. CSS module `components/layout/participation-section-nav.module.css`; reduced-motion/forced-colors fallback.
- Animated USER-PILL BORDER was tried and undone. Do NOT reintroduce it.

## Diagnostics and known caveats

- Reusable fetch: `lib/profile/get-user-registrations-and-claims.ts`, `getUserRegistrationsAndClaims({ userAddress, batchSize?, bypassCache? })`. Subgraph-only, Gnosis 1Hive #3 + Blockscout #4; no Base coverage or DB reads. Returns wallet, scope, indexedBlock, fetchedAt, per-loop raw event counts, unique registered/claimed period strings, and summed unique-period totals. Same period number in different loops counts separately. Cached 300 seconds using normalized address and endpoint. All event streams/pages share one indexed snapshot; errors reject rather than produce partial totals. `includesOpenPeriods: true`: these raw totals are not the rate denominator. The new getUserClaimRate helper filters completed periods and supplies the header gauge; no new API route was needed.
- Shared transport/pagination is now `lib/profile/user-activity-subgraph.ts`; both the new function and existing comparison helper reuse it. Existing comparison output still reports raw registration-event count, while the new fetch's `totalRegistrations` counts unique registered periods. Do not confuse those two fields.

- `get-user-loop-activity-comparison.ts`: read-only DB/subgraph comparison, Gnosis loop IDs 3/4 ONLY. Filters events by wallet and loop, loop_in [3,4], cursor pagination, pinned indexed block. Separate 5-minute cache; bypassCache option. Not part of normal profile page rendering.
- Compares unique claimed periods with indexed DB totalClaims, not raw event count. Registration count is separate; claim rate = claims / registrations.
- Historical sample 2026-09-16 for 0xE9dC34B67006Db0910a9761CB031D4bDE67dCE23:
  Hive registrations94/claims75, Blockscout97/80; DB matched; aggregate155/191 =81.15%. These are historical, NOT live/current.
- Earlier global DB160 vs included155 came from excluded loop1's5 claims; use scoped sums, not global stats for header totals.
- Shared `lib/utils/index.ts:cn` remains defective: groups entire strings by first prefix, not actual Tailwind conflict groups. Font size/color/alignment classes can be lost. Scoped numeric fixes use direct strings; some badge overrides use ! utilities. Do not claim global class-merging was fixed.
- Wallet sync handles connected account A→B, but disconnect→reconnect B may miss redirect because previousAddressRef is cleared. Preserve ability to view other users when addressing this.
- Current-streak table displays persisted scoring value; may look live after time expires without new scoring events. Verified next-bonus hint has separate live checks.
- Rank comes from persisted global leaderboard and can drift from filtered visible totals if projections are stale.
- Shared Progress accessibility value forwarding was flagged previously; verify before claiming resolved.
- User requested removal of locally added test files: get-profile-page-data.test.ts and get-user-loop-activity-comparison.test.ts removed; sync.test.ts edits reverted. Existing unrelated tests remain. Do not recreate tests merely to recover chat history.

## Verification / next-chat checklist

- Several iterations passed tsc and focused ESLint; 102 tests passed BEFORE the user-requested test removals. Do not report 102 as current suite results.
- Inline boundary checks passed for level/access thresholds and relative-time formatting.
- Latest small style edits were generally diff-checked, not visually tested.
- No browser tools available during this work. Mobile Safari screenshots came from the user. No successful visual QA claimed; design-qa.md is an older BLOCKED report, not current UI documentation.
- No live scoring rebuild/database mutation is authorized by a styling request.
- Suggested checks after new edits:
  `pnpm exec tsc --noEmit --pretty false --incremental false`
  and targeted `pnpm exec eslint ... --ext .ts,.tsx`, plus `git diff --check`.
- Browser follow-up: horizontal table scrolling, navbar fit at 320–430px, achievements mobile header, hover-to-popover travel, tap/keyboard dismissal, wallet changes, empty/error/loading states, long values, reduced motion.
