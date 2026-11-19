# Gyralis optimization tracker

Last updated: 2026-11-19

One shared working file for agents and contributors. Organize reviews and follow-up work by page; keep shared-component findings with their owning page and cross-reference affected pages.

## How to maintain this file

- Add findings here instead of creating separate optimization files for each page.
- Give each finding a stable ID. Record the observed behavior, evidence, proposed change, and acceptance checks.
- Distinguish confirmed bugs, configuration blockers, preview limitations, and issues that still need browser verification.
- Leave a checkbox open until the fix and relevant verification are complete. Record the completion date and checks when closing it.
- A recorded recommendation is not an approved change to scoring, eligibility, payouts, or game rules.
- Preserve the existing design and agreed behavior when fixing an item. Review-only requests do not authorize implementation.
- Current review preference: code only. Do not claim browser or visual verification without actually performing it.

## Explore — `/discover`

Status: no separate page review completed in this pass.

- The shared Season header is covered by GAMES-006.
- Opening a game from Explore is covered by GAMES-009.
- Add Explore-specific findings here when the page is reviewed.

## Loops — `/loops`

Status: no separate page review completed in this pass.

Season streak layout refinement, 2026-11-19: aligned the daily streak graph and its column heading to the right of their shared column. Extra row space now sits between the left Loop metadata and the graph, instead of after the graph. Loop metadata shows only the logo and title; community and chain text are removed. Streak points remain at the right edge. The existing graph width limit, 20-pill navigation and horizontally scrollable narrow-screen layout are preserved. Presentation-only changes; browser verification remains pending.

Season streak row cleanup, 2026-11-19: removed the visible claim count and period-range text above each pill graph. The meter's accessible description still includes both; column headings and pill navigation remain available.

Season streak visual states, 2026-11-19: removed the visible “Total earned” label while retaining the total SP value and hover breakdown. Pills use only muted gray for unfilled positions and primary green for completed streak claims; removed special milestone and next-claim colors from the graph. Milestone status remains in the points breakdown. Totals are vertically centered in each row; scoring and current-streak calculations are unchanged.

- The mismatch between the active Loop roster and Games fixtures is covered by GAMES-007.
- Live Loop claims versus Games preview progress is covered by GAMES-011.
- Add Loops and My Streaks findings here when those flows are reviewed.

## Games — `/games`

Review date: 2026-11-12.

Scope: all five cards, game details modals, shared Season state, scoring helpers, weekend actions, navigation, and related accessibility code. Source inspection, direct logic checks, and static React rendering were used. Static rendering used mocked supporting UI components; it does not verify browser behavior or layout. No application code was changed during this review.

Suggested order: correct misleading card states and the missing-record crash, make the fixtures consistent and testable, then address date interactions, focus, and motion.

### Half Season In

- [ ] **GAMES-001 — Show when completion is no longer possible.**
  - Classification: confirmed display bug; fix first.
  - Reproduction: on Season period 31 with 13 participating periods, the model returns `No longer achievable`, but the card displays `13 / 15 days` and `2 remaining`.
  - Proposed change: render the model's unavailable/ended state instead of implying that the remaining target is still reachable.
  - Acceptance: impossible runs show an explicit result; achievable runs retain remaining progress; 15 qualifying periods still award +15 SP exactly once.
  - Evidence: [card progress rendering](components/participation/season-game-card.tsx), [gameView](lib/participation/season-games.ts).

### All Season Long

- [ ] **GAMES-002 — Distinguish completed activity from eligible completion.**
  - Classification: confirmed state-display ambiguity.
  - Reproduction: switch the prizes fixture to an unregistered visitor. The card displays `31 / 31 days` and `0 remaining`, while the model returns `Season entry required` and zero earned points.
  - Proposed change: distinguish activity progress, entry eligibility, and an awarded completion. Respect closed registration rather than offering an unavailable entry action.
  - Acceptance: unregistered visitors are not presented as reward-qualified; eligible completion and missed-day states remain clear.
  - Evidence: [gameView status ordering](lib/participation/season-games.ts), [card progress rendering](components/participation/season-game-card.tsx).

Verified: a missed closed period makes the objective unattainable; 30 participating periods do not earn the 31-period reward; full completion earns +30 SP and stacks with Half Season In for +45 SP.

### The Rule of 3

Artwork update, 2026-11-17: applied the selected **Triple-check Loop** concept—one charcoal/forest-green ring with exactly three large green checkmarks. Built-in image generation produced `public/games/rule-of-three.png` (1254 × 1254, alpha preserved). The shared game definition updates the Games card, modal hero and Explore preview. The original `explorer.png` is retained. Generated artwork inspected directly; no browser inspection. [Exact prompt](docs/game-art-rule-of-three-prompt.md).

- [ ] **GAMES-003 — Supply the fixed required Loop roster for completion testing.**
  - Classification: configuration blocker, not an incorrect award calculation.
  - Current behavior: `requiredLoopIds` is `null` in every supplied scenario. The derived target is zero and the game cannot complete or award its +9 SP.
  - Proposed change: establish the fixed required list before using the game as an available objective. A separately identified test fixture can exercise progress while the final roster is pending.
  - Acceptance: the target follows the configured list; each required Loop needs at least three qualifying claims; surplus claims in one Loop cannot replace missing claims in another; an unpublished list never awards points.
  - Decisions still open: final roster and Weekend Loop inclusion. The four-Loop calculation discussed with the user was an example, not a published roster.
  - Preserve: the user explicitly removed the info icon and roster-pending message from the card. Do not automatically restore that message as the fix.
  - Evidence: [preview fixtures](lib/participation/season-preview.ts), [seasonGameProgress and completionBonuses](lib/participation/season-games.ts).

Verified with a supplied roster: three claims in every required Loop awards +9 SP; a combined claim total without per-Loop completion does not. The user subsequently approved **+9 Season Points** on 2026-11-16; both the reward badge and completion scoring now use 9. Missing claims in any required Loop still block the award.

UI update, 2026-11-13: the card now shows three equal-width Loop boxes in one horizontal row, reusing Explore artwork with aligned names and three vertical progress pills per Loop. While the required roster is unpublished, the examples are active 1Hive Gardens, Blockscout Merits, and RWAGMI, using available preview counts (zero when absent from the fixture). This display does not publish a required roster or change scoring. GAMES-003 remains open.

Verification for this UI update: TypeScript, targeted ESLint, formatting, and static-render checks passed. Checks covered the three active boxes, 2/3–3/3–0/3 sample counts, clamping at three, artwork availability, Loop links, inactive Loop exclusion, and unchanged unpublished-roster scoring. Browser layout verification remains pending.

Visual refinement requested on 2026-11-13: make the Loop boxes smaller and squarer. Each column is now capped at 128px and distributed across the full card width with space between; corners, artwork, logos, spacing, and progress pills are more compact. Names and progress rows remain aligned. This CSS-only refinement has not been visually verified in a browser.

Approved refinement, 2026-11-16: replaced the miniature artwork cards with a compact row of three equal-width progress groups. Each group has a 20px logo and short community name (1Hive, Blockscout, RWAGMI), with three pills and a short `2/3` count beneath. Removed the cover images, overlapping logo containers, and repeated visible “claims” text. The row targets 68px height with subtle backgrounds and borders; full Loop names and claim counts remain in accessible labels and hover titles. Main game artwork, rewards, roster decisions, and scoring are unchanged. Browser visual verification remains pending.

Latest layout refinement, 2026-11-16: kept the three Loop mini cards in one row and placed each logo, short title and three progress pills on one horizontal line. Logos stay left, titles use the middle space and pills align right. The pills share the attendance cards' 25px height, 4px gap, rounded shape and responsive width. Removed the repeated visible fraction, including from the native hover title; exact counts remain available to screen readers. Hover shows only the Loop name. Long titles truncate without wrapping. No scoring or roster changes; browser verification remains pending under the code-only preference.

### Weekend Ritual

Preview example, 2026-11-16: the default live fixture now shows December 13 registered and successfully claimed. Its independent weekend clock is set to December 13 at noon UTC, placing the timeline just past that node toward December 20. Only December 13 is checked; December 6 remains unclaimed and later weekends remain upcoming. The +3 extra points are included once in preview scoring. This is sample state, not a live wallet claim; regular Loop fixtures are unchanged.

Timeline refinement, 2026-11-16: confirmed claims use a primary-green check; unclaimed dates show a dash until their Sunday claim window closes, then an X. Missing Saturday registration does not prematurely mark Sunday as elapsed. Unknown claim records retain a dash. Precise status remains in accessible labels and hover text. Removed the claim count and maximum-points labels above the graph. The Rule of 3 reward was revised from 8 to **9 Season Points**, including completion scoring.

Timeline update, 2026-11-16: the card uses four dated stops for December 6, 13, 20 and 27. The line advances with the existing reference clock from first Saturday registration through the last Sunday close; it measures elapsed time, not earned rewards. Only recorded claims get primary-green checkmarks. Current weekend windows are outlined in the secondary blue; unclaimed past weekends stay neutral. Date buttons open the existing details modal and preserve its focus return. The line animates between clock positions and respects both the motion toggle and reduced-motion preference. The existing modal’s “Preview weekend states” selector can exercise each date without inventing claims.

Latest reward decision, 2026-11-16: Weekend Ritual now presents **+3 extra Season Points per claim**, up to 12 extra points across four weekends. This supersedes the previous +4-total presentation. The base claim point remains in internal scoring; no visible 1 + 3 breakdown or repeated card footer is restored. Artwork is unchanged.

Validation for the timeline and reward revision: 18 focused tests in [season-games.test.ts](lib/participation/season-games.test.ts) passed, including reference-date boundaries, time interpolation, independent claim markers, missing timeline records, completed Season state, the Rule of 3’s 9-point reward and idempotent weekend rewards. TypeScript, targeted lint, formatting and whitespace checks passed. Browser verification remains pending under the code-only preference.

Artwork update, 2026-11-16: replaced the abstract recurring-calendar image with a Saturday/Sunday calendar showing Saturday registration checked off and Sunday rewards ready to claim. Built-in image generation produced `public/games/weekend-claim.png` (1254 × 1254, alpha preserved); the original artwork remains available. The shared definition updates Games, details and Explore. Full prompt: [Weekend artwork](docs/game-art-weekend-prompt.md). Inspected the generated asset directly; no browser verification. Existing card layout and scoring remain unchanged.

- [ ] **GAMES-004 — Surface the relevant weekend state on the card.**

  - Classification: confirmed display bug; fix first.
  - Reproduction: after the last weekend, the model returns `Ended`, but the original card displayed `0 / 4 weekend claims` and `Up to 16 total SP` without an ended state. The new timeline exposes per-weekend status through its nodes; the summary now shows `Up to 12 extra SP` but still needs a clear aggregate ended state.
  - Related issue: registration-open, claim-ready, and missed-registration states are only available inside the modal.
  - Proposed change: show current availability and distinguish a historical maximum from points still obtainable.
  - Acceptance: scheduled, registration, registered, claimable, claimed, missed, and ended states are clear. Missing one weekend still permits later weekends.
  - Evidence: [Weekend card rendering](components/participation/season-game-card.tsx), [weekendView](lib/participation/season-games.ts).

- [ ] **GAMES-005 — Handle a missing weekend record without crashing.**
  - Classification: reproduced defensive-hardening issue; fix first. Normal fixtures currently include every record.
  - Reproduction: remove the current weekend's record and evaluate its registration window. `weekendView` throws when reading `registered` from `undefined`.
  - Proposed change: explicitly handle incomplete data; do not invent registration, claim readiness, or earned points.
  - Acceptance: a missing record produces a safe unavailable/loading state, and claim/register actions cannot proceed on missing eligibility data.
  - Evidence: the non-null assertion after `state.weekends.find(...)` in [weekendView](lib/participation/season-games.ts).

Verified: each successful claim adds +1 claim point and +3 game-bonus points; it adds no streak bonus or regular attendance period. Duplicate claims, wrong weekend IDs, missing registration, unregistered visitors, and post-Season claims are rejected. Reference Saturday/Sunday boundaries behaved correctly.

Earlier presentation (superseded by the +3-extra decision above), 2026-11-16: show **+4 Season Points per claim** as the total Weekend Ritual reward. Removed the “Each Sunday claim…” card footer and the visible 1 + 3 breakdown from details, rules, Explore and claim feedback. Internal scoring still separates one claim point and three game points, for exactly four total; other games continue showing their additional points. Existing in-app artwork is retained.

### Claim Race — Gardens Race

Loop identity update, 2026-11-16: Claim Race now has a primary-green goal icon beside its title. Its description presents the configured active racing Loop as an inline badge using the directory’s logo and full name (currently 1Hive Gardens), with a subtle blue border. Shared title/description components keep the game card, Explore teaser and modal consistent. The badge is descriptive and preserves the existing card-to-modal interaction; no nested links or additional join action. The new Base deployment and qualification policy are unchanged.

Artwork refinement, 2026-11-16: replaced the stepping-block scene with a miniature racing track, checkered finish line and racing flag. The generated asset `public/games/race-finish.png` keeps the charcoal/green materials, restrained lighting and transparent background. The original `race.png` is retained. Games, details and Explore share the new image. Generated artwork inspected directly; browser verification remains pending. [Exact prompt](docs/game-art-race-prompt.md).

Approved update, 2026-11-16: renamed Claim Rush to **Claim Race**. The first event is **Gardens Race**: the first 10 Season entrants to reach 10 qualifying claims in the designated Gardens Loop.

- Card, details, Explore and shared rules use the revised objective. Progress counts Gardens only, not the sum of all Loop claims, and the modal links to Gardens in the directory.
- The existing artwork and full-width final-card layout are preserved. No top badge or visible “How it works” footer is added.
- Follow-up approved, 2026-11-16: **No streak required**; gaps are allowed. Each confirmed winner earns **+10 additional Season points**, replacing the earlier +20 allocation. The reward stays reserved until winner confirmation rules are finalized.
- Reaching 10 Gardens claims shows **Qualification pending**; it does not invent a winning place or award race points.
- Winner ordering, tie-breaking, late-entry reconciliation and reward confirmation timing remain undecided.
- The current 1Hive Gardens directory ID is a preview reference. The newly deployed Season Loop on Base must be configured separately.

Validation: TypeScript, targeted ESLint and whitespace checks passed. Eleven focused logic checks passed for Gardens-only progress, other regular/Weekend Loop exclusion, missing Gardens data, duplicate claims, the 9/10 boundary, pending qualification without automatic awards, and Season phase/entry states. Code-only verification; no browser inspection performed.

### Shared Games page and card behavior

Progress pill refinement, 2026-11-17: unfilled attendance and Rule of 3 pills share an opaque muted gray background in cards and modals, preventing card artwork from tinting the empty state. Missed attendance days keep a subtle dashed border, with their status available in accessible labels; completed pills remain primary green. Hover and keyboard-focus outlines are preserved.

Reward badge refinement, 2026-11-17: all game cards and modals show a trophy to the left of the prominent **+X** value, with smaller **Season Points** underneath. The icon, value and label use primary green; the trophy has no separate background and is no longer used as a watermark. Weekend's per-claim qualifier and the race's reserved status remain in hover titles and accessible text, with the rules also retaining those details.

Modal refinement, 2026-11-17: all five game details now use their existing artwork as a full-width hero background with only the title visible. A short **Challenge** introduces the objective; **How to** holds the counting and eligibility details. Cards and modals share one reward badge and one progress renderer, including the 31 day pills, per-Loop Rule of 3 pills, four-stop weekend timeline and Gardens race bar. Modal date pills retain keyboard/date tooltips without reopening the dialog; the initial focus goes to the title. Removed the bottom Loop navigation buttons, repeated explanatory footer and duplicate weekend history grid. Weekend preview registration/claim controls remain available. Reward values, scoring and pending roster/race decisions are unchanged.

Prizes & Rules refinement, 2026-11-17: each full-width section is independently collapsible, with its title and concise summary always visible. Calendar starts open; Prize Pool, How to Earn Season Points and Participation Rules start collapsed. Calendar milestones show dates only. Existing Radix accordion controls provide keyboard support and height animation; the app's reduced-motion rule disables animation. Post-Season prize status stays outside the collapsed sections.

Validation for this pass: all 19 Season Games tests, TypeScript, targeted ESLint and whitespace checks passed. Code-only verification under the current review preference; browser layout and interaction inspection remain pending.

Prizes & Rules layout update, 2026-11-16: all cards stack in one full-width column at every viewport size, within the shared content-width limit. Approved order: Season Calendar, Prize Pool, **How to Earn Season Points**, then Participation Rules. The DOM follows this order for reading and keyboard navigation. Rule content and scoring are unchanged.

Approved UI update, 2026-11-16: removed the visible “How it works” footer and its spacing from every game card. The named native button now covers the card without affecting its height; the hover/focus arrow, keyboard opening, focus outline, and foreground Loop/date controls are preserved. Browser interaction verification remains pending.

- [ ] **GAMES-006 — Make the Season header reflect the current phase.**

  - Classification: confirmed display bug.
  - Current behavior: the header always says `Season Announced`, including during live play, review, and prizes.
  - Proposed change: derive the status from the existing Season phase.
  - Acceptance: each phase has an accurate label on Games and Explore without changing the approved titles or Explore metric layout.
  - Evidence: [SeasonHeader](components/participation/season-panels.tsx).

- [ ] **GAMES-007 — Make sample progress and Loop availability internally consistent.**

  - Classification: confirmed fixture and availability-count issues.
  - Reproduction: the review fixture has 28 participating periods but only 19 regular claims. At least one regular claim is required for every counted period.
  - Related issue: Games fixtures still include inactive True Loopers. The available-claim shortcut counts it because it only checks `claimedToday`.
  - Proposed change: use consistent sample histories and an explicit eligible active roster. Calculate availability from actual period/eligibility data when integrating live data.
  - Acceptance: counted periods never exceed supporting claims; inactive Loops do not create current opportunities; historical earned activity is not silently erased if a Loop later becomes inactive.
  - Evidence: [createSeasonPreview](lib/participation/season-preview.ts), [readyCount](components/participation/games-page.tsx), [Loop roster](data/loops-data.ts).

- [ ] **GAMES-008 — Make individual date inspection usable on touch devices.**

  - Classification: interaction issue identified in source; browser verification required.
  - Current behavior: each date pill opens the whole game modal on click. The tooltip ignores touch hover and closes on click. Thirty-one narrow buttons share one row.
  - Proposed change: provide a reliable touch interaction for inspecting an individual date while retaining the approved pill design and keyboard support.
  - Acceptance: touch users can inspect `Dec. N` and claimed status without immediately opening the unrelated game-details view; keyboard navigation remains usable; inspect at narrow mobile widths.
  - Evidence: [SeasonDayPills](components/participation/season-game-card.tsx), [tooltip wrapper](components/ui/tooltip.tsx), [pill styling](styles/participation.css).

- [ ] **GAMES-009 — Restore focus after closing a directly opened game modal.**

  - Classification: missing focus fallback identified in source; browser verification required.
  - Reproduction path: enter from Explore or load `/games?game=sprint` directly, then close the modal. No originating Games card was saved in `gameTrigger`.
  - Proposed change: use a connected originating control when available; otherwise focus the matching card or a suitable page heading.
  - Acceptance: Escape and close-button actions restore predictable focus for card clicks, Explore links, direct URLs, and cases where filtering removed the original trigger.
  - Evidence: [GamesContent modal and gameTrigger](components/participation/games-page.tsx), [DialogContent](components/ui/dialog.tsx).

- [ ] **GAMES-010 — Respect reduced motion for portaled date tooltips.**

  - Classification: CSS coverage gap identified in source; browser verification required.
  - Current behavior: tooltips render outside `.participation-theme`; their enter/exit animations are not covered by the theme-scoped reduced-motion rule.
  - Proposed change: make tooltip motion obey reduced-motion preferences and the applicable app motion setting.
  - Acceptance: date information remains accessible with OS reduced motion enabled and with app motion disabled; no tooltip entrance/exit animation remains in those states.
  - Evidence: [tooltip portal and animation classes](components/ui/tooltip.tsx), [reduced-motion selectors](styles/participation.css).

- [ ] **GAMES-011 — Make the preview progression path testable without implying live scoring.**

  - Classification: known preview limitation; production scoring integration is separate work.
  - Current behavior: Games uses an in-memory fixture model. Live Loop claims and My Streaks use separate data paths. No UI caller dispatches the regular preview `claim` action, so normal attendance completion cannot be exercised incrementally from this page.
  - Proposed next step: provide explicit test scenarios or a controlled preview progression path. Do not connect mock awards to live payments or silently treat live claims as authoritatively scored.
  - Acceptance: relevant progress and completion states can be tested; sample data is not mistaken for live wallet scoring. Any future live integration distinguishes transaction confirmation from authoritative scoring refresh.
  - Evidence: [SeasonProvider](components/participation/season-context.tsx), [preview reducer](lib/participation/season-preview.ts), [live claim panel](components/participation/loop-claim-panel.tsx), [My Streaks](components/participation/loop-streaks.tsx).

- [ ] **GAMES-012 — Prevent the card arrow from lingering after pointer exit.**
  - Reported: 2026-11-16 on Half Season In.
  - Cause found in source: `:focus-within` kept the arrow visible after pointer-driven focus; a width-only mobile rule also forced visibility on narrow mouse-driven windows. The same 160ms transition applied on entry and exit.
  - Implemented: use hover on fine-pointer devices and `:focus-visible` on the game-opening button; keep the arrow visible on touch devices; use a 120ms entrance and immediate exit. Preserve focus and the existing motion-off/reduced-motion behavior.
  - Acceptance: mouse hover reveals the arrow and pointer exit hides it immediately; a mouse click/modal close does not keep it visible merely because the card retains focus; keyboard focus still reveals the opening action; narrow mouse windows behave like other mouse windows.
  - Verification: source and formatting checks only. Browser interaction verification remains pending, so this item stays open.
  - Evidence: [game arrow selectors](styles/participation.css).

### Security review scope

- No direct script-injection or unsafe-navigation path was identified in the reviewed files.
- Game selection matches configured IDs; game destinations are internal routes. No real payment or wallet-signing operation was found in the Games preview handlers.
- Local preview state is mutable and must never authorize production scoring, entry payments, or prize claims. This is an explicit preview boundary, not evidence of an existing payout exploit.
- A missing weekend record causes a client-side exception, as recorded in GAMES-005. No remote exploit path was established.
- Dependency vulnerability scanning, backend authorization, smart contracts, and deployed transaction security were not reviewed. No whole-app security certification is implied.

### Verification record — 2026-11-12

Passed: TypeScript (`pnpm exec tsc --noEmit`), targeted ESLint, and 13 focused logic checks:

1. All five game views compute for each supplied Season phase.
2. Half Season In awards at 15 distinct periods, including nonconsecutive periods, and not at 14.
3. Duplicate, invalid, out-of-range, and future attendance periods are excluded.
4. Claims in multiple regular Loops in one period count as one attendance period.
5. All Season Long requires 31 periods; its reward stacks with Half Season In to +45 SP.
6. A missed closed period makes All Season Long unattainable.
7. The Rule of 3 requires three claims in each configured Loop, not a combined total.
8. An unpublished required roster cannot award its completion bonus.
9. Weekend registration and claim boundaries switch at their configured times.
10. A weekend claim adds exactly +1 claim point and +3 game-bonus points, without changing regular streaks or attendance.
11. Invalid weekend claims are rejected: missing registration, wrong ID, unregistered visitor, or post-Season phase.
12. Repeated regular claims are idempotent; a seventh consecutive claim awards exactly +6 SP.
13. Claim Rush awards zero points while on hold, even beyond 20 claims.

Additional probes reproduced GAMES-001, GAMES-002, GAMES-004, GAMES-005, and the contradictory review fixture in GAMES-007. The default unresolved state for GAMES-003 was also confirmed. These were ad hoc review checks, not newly committed regression tests. No browser interaction, screenshot, touch-device, or visual verification was performed.

## Milestones — `/milestones`

Status: not reviewed in this pass. Add page-specific findings here.

## Leaderboard — `/leaderboard`

Status: not separately reviewed in this pass. Games score-fixture consistency is covered by GAMES-007. Payout rules and tie-breaking remain subject to the existing approved scope; do not infer policy changes from this tracker.

## Profile — `/profile` and `/profile/[address]`

Status: not reviewed in this pass. Add page-specific findings here.

## Dashboard — `/dashboard`

Status: not reviewed in this pass. Preserve this as the existing analytics destination.

## Shared shell and right side

Season point typography, 2026-11-19: added the shared `SeasonPointsValue` component. Its default output is a paragraph with the formatted value in foreground text and an inline `SP` span in smaller muted text. It accepts `value`, `size` (`xs`, `sm`, `md`, `lg`, `xl`, `hero`) and optional `showPlus`. `as="span"` supports inline prose and buttons without invalid nested paragraphs. Number formatting uses en-US grouping and up to two fractional digits; unknown values display a dash, and negative values never get a double sign.

Migrated the right-side Season total and three source values, expanded Season summary, streak totals and hover milestones, Season Games cards/modals, Explore rewards, Season leaderboard totals/breakdowns/cutoff, Loop preview bonuses, rules and Season-specific milestone help. Game badges now use the same foreground value and muted SP; contextual reserved/per-claim wording remains in accessible labels, hover titles or adjacent copy. All-time GP and token rewards retain their separate presentation. Shared CSS controls the size hierarchy; individual pages no longer override Season values with green text.

Verification: TypeScript, targeted ESLint and formatting checks passed. Static React rendering verified number grouping, fractional values, optional plus, negative/zero/unknown values, all six sizes, paragraph/unit structure and inline contexts. Browser inspection remains pending under the current code-only preference.

Status: not separately reviewed in this pass. Add navigation, right-side, search, and cross-page findings here when reviewed. Existing Games-related shared-header and tooltip issues remain owned by GAMES-006 and GAMES-010 to avoid duplicate tracking.
