# Illustrated Season Games — 2026-11-03

- Current scope: five shared cards and detail views now show the discussed game goals, point rewards, earned game bonuses and appropriate progress states. Each has unique, inspected dark-green 3D artwork. The user explicitly selected keeping this artwork and matching card backgrounds to the Season Points card.
- Latest copy refinement: the Loops count is dynamic and reads “4 Active Loops · Claim every day” for the current roster.
- Approved reference: the user's Layer3 Rewards screenshot informs artwork placement and dark text areas within the existing Gyralis design. This is an incremental implementation in the existing app, not a recreated Layer3 page.
- Scoring checks: 60 focused tests passed. Sprint awards +15 SP for 20 participating periods, Long Game +30 SP for all 30, and the two stack. Weekend claims require their own Saturday registration and credit 1 claim SP +3 bonus SP without a regular streak bonus. Explorer is gated on a published required roster. The held race awards no points.
- Assets: all five transparent PNGs are saved under `public/games/`, with exact built-in image-generation prompts linked in `docs/season-game-assets.md`. Their standalone appearance was inspected. In-page crop and rendering are unverified.
- TypeScript and targeted ESLint passed. Reference-date boundary tests validate the frontend preview, not the as-yet separate new Base deployment.
- Browser evidence: no implementation screenshot was captured. `pnpm dev` failed with sandbox `listen EPERM` for port 3000, and the request to start it outside the sandbox was declined. No further browser execution was attempted after that refusal.
- Outstanding visual checks: desktop/mobile card wrapping, actual image loading/crop, dialog scrolling, focus restoration, right side geometry and motion-disabled behavior. No visual pass is claimed.

final result: blocked

---

# Text-first Season Game cards — 2026-11-03

- Scope: game cards on Games and Explore omit artwork and header/category strips. Titles, descriptions, progress, and existing challenge actions remain. The timed Day Game omits its decorative icon/header and places its status alongside reward/action details. Pending rewards remain explicit in the card caption and challenge details.
- Responsive adjustment: the timed challenge's content column uses an explicit class after removing the decorative icon; Explore cards use the available text width rather than reserving image space.
- Browser visual comparison remains unavailable under the existing browser execution restriction; no rendered visual pass is claimed.

final result: blocked

---

# Season Points summaries — 2026-11-03

- Scope: the user selected both the main Season Points breakdown and the sidebar summary. A single shared SeasonPoints component now presents the full and compact variants, keeping totals and rank consistent across Season leaderboard, profile Seasons, and the participation sidebar. Following the user's navigation feedback, the duplicate main summary is removed from Games: the Season Games tab leads directly to its game catalog, with Loop shortcuts and supporting Season notices below the cards. The sidebar retains the persistent user summary.
- Presentation: dark green surface with 24px corners matching Loop/streak cards, larger semibold SP total, a separate Season rank, green icons, primary/muted text tokens, and linked Claims, Streaks, and Games breakdowns. The full view uses three columns; compact/mobile views use rows. The former formula layout and sidebar elapsed-time bar are removed.
- Data: the existing frontend Season preview model is retained without scoring changes. Both variants explicitly display Preview. Visitor scores are labeled potential, ranks are hidden before scoring or registration, and closed registration does not promise a later entry. SP remains explicitly separate from all-time GP.
- Validation: 27 targeted tests passed, including full/compact consistency, potential scores, rank availability, closed registration, and existing Season preview scoring. TypeScript, targeted ESLint, formatting, and whitespace checks passed.
- Browser visual comparison, responsive rendering, and interactive browser verification remain unavailable under the existing browser execution restriction. No visual pass is claimed.

final result: blocked

---

# Live Loop claim cards — 2026-11-03

- Scope: large cards on the Claim tab show a live per-wallet daily reward estimate on the left, current-period registered Loopers on the right, and a full-width action below. Artwork/title links and the eligibility help remain separate interactive controls. Explore mini cards retain their existing presentation.
- Standard and SuperLoop controllers provide registration, checking, wallet confirmation, transaction confirmation, claimed, and unavailable states. Disconnected cards open the wallet connection modal; connected actions retain existing chain switching. RWAGMI retains its required saved-token control. Period boundaries refresh contract data, with countdown hints for registered/accumulating/claimed states.
- Daily estimates normalize contract period payouts to 24 hours using token decimals; the action uses the wallet's live claimable amount. Loading/error states do not invent zero values, and failed metric loads provide retries. SuperLoop receipt-confirmed claims now also invoke the shared profile/Season/activity refresh hook.
- Action styling initially uses a flat green fill without gradient, glow, sheen, or hover lift, scoped to these cards. Additional subtler visual alternatives are being explored at the user's request; a final treatment has not been selected.
- Validation: 99 targeted tests passed across claim state logic, receipt confirmation, profile sync, daily reward normalization, controller boundaries, and the new claim-panel states. TypeScript, targeted ESLint, formatting, and whitespace checks passed. No wallet transactions were executed.
- Browser visual comparison and end-to-end wallet interaction verification remain unavailable under the existing browser execution restriction.

final result: blocked

---

# Shared Season header — 2026-11-03

- Source: user-supplied `Screenshot 2026-11-03 at 12.36.52 AM.png`, used as layout inspiration. The user explicitly excluded the progress bar.
- Scope: the shared Explore and Games header now places a Gyralis logo tile above the eyebrow, title, description, Season stats, and existing action. Existing Gyralis loop artwork fills the right column. A dark blue surface, 24px outer corners, and the existing primary/muted text tokens retain the app styling. No progress bar was added.
- Responsive implementation: copy and artwork occupy separate desktop grid columns; at mobile widths the artwork occupies the top-right area above the full-width title and copy. Current Season preview values, phase states, and entry actions are preserved.
- Reference-inspired metrics: a person icon sits beside the bold primary-color entry count with muted Entries below; a treasure chest icon sits beside bold $250 with muted GTD below. A calendar icon accompanies the bold December 1, 2026 preview starting date, with Starts · UTC muted below. Season Announced appears as a pill beside SEASON 1 rather than in the bottom metrics.
- Metric values and descriptions are left-aligned with a 1px gap. Values use 18px semibold type (16px on mobile), with tighter spacing and 24px icons.
- Header color accents: matching green person, dollar-sign, and calendar icons, plus a green-tinted Season Announced pill. Metric columns have a 30px gap (24px on mobile). The title and metric values retain primary white; descriptions retain the muted token.
- The Explore header's Your Season / Explore the Season link is removed. The Games page's existing Season entry action remains available.
- The header eyebrow reads SEASON 1, the page title reads Gyralis Games, and the phase badge is removed.
- The title uses the primary white text color throughout. The subtitle reads One participation layer. Many ways to earn. The phase timing caption (including Day 12 of 30 · 18 days left) is removed from the header.
- Validation: TypeScript, targeted ESLint, formatting, and Git whitespace checks passed.
- Browser visual comparison remains unavailable under the existing browser execution restriction. Desktop/mobile rendering and interactive behavior have not been visually verified.

final result: blocked

---

# Explore Loops mini cards — 2026-11-03

- Scope: For You and Loops on Explore use the compact variant. The main Loops directory uses a larger variant with a left-offset curved artwork cutout, the logo on the left, and the title beside it. Daily rewards appear below; the same access-help control and full-card link remain.
- The card shows artwork with a centered circular cutout, a logo seated in that cutout, the Loop name, and Daily rewards with the example amount. Header badges, sponsor byline, eligibility, Season preview streak text, example-date caption, coin icon, and View Loop button are omitted from this variant.
- A full-card link retains keyboard navigation and the existing live Loop dialog destination. A separate question-mark button opens a popover with requirements, network instructions, the configured qualification link when available, and Check eligibility leading to the existing live Loop. The help button is a sibling of the card link, avoiding nested interactive controls. MagicBento's card marker and wrapper remain intact. Reward snapshot provenance is retained in the reward tooltip.
- Static markup checks confirm the compact branch excludes the removed content. Browser visual comparison remains unavailable under the existing browser restrictions, so the image-mask curve and responsive presentation are not visually verified.

final result: blocked

---

# Loop card surface refinement — 2026-11-02

- Approved source: the existing `.p-streak-card` background gradient, border treatment, and 24px rounded corners, combined with the existing shared `LoopOpportunityCard` artwork/body/action layout.
- Changes: matching green-black surface, inset rounded artwork, a single chain-icon + Loop/SuperLoop badge, compact eligibility summary, Daily rewards footer, stronger pill-shaped View Loop link, and a subdued existing Season preview note with explicit SP units.
- Daily reward examples were read from the six visible Loop contracts at 2026-11-03 02:48:15 UTC (November 2 in Uruguay). 1Hive: 0.036414699878409818 HNY; Blockscout: 0.019570059080118519 HNY; RWAGMI: 562.396691539443564128 RWAGMI; True Loopers: 0 USDCx; Soneium Hourly/Daily: 0 MCK/oMCK. Examples are date-stamped snapshots, normalized by period length, not automatic live quotes. Three snapshot tests passed.
- Animation integration: existing `data-magic-bento-card` markers and MagicBento wrappers are preserved. Existing spotlight, border glow, entrance, and click waves remain controlled by the shared motion provider. Additional artwork/arrow hover motion only applies inside an enabled MagicBento container.
- Validation: TypeScript, targeted ESLint, formatting, asset-path checks, and whitespace checks passed. Existing card links and live dialog wiring remain in the shared component.
- Browser screenshot comparison and interactive motion verification remain unavailable under the previously recorded browser execution restriction. No visual pass is claimed.

final result: blocked

---

# Profile streak pill cards — 2026-11-02

- Source: `/Users/mati/Desktop/Screenshot 2026-11-02 at 10.37.42 PM.png`, opened during implementation. The user requested the rounded card and segmented pill-bar idea adapted to real Gyralis profile streaks, rather than reproducing the reference's staking content.
- Implementation: `components/participation/loop-streaks.tsx`, `lib/profile/streak-card-state.ts`, and the `.p-streak*` rules in `styles/participation.css`.
- Scope: design preview is visible by default, including without a wallet or active Season. Four sample cards demonstrate completed, in-progress, and locked milestones, explicitly labeled sample SP with no score writes. The Use live data control switches to real connected-wallet Season projection records, isolated from all-time GP; no active Season in live mode shows an explicit empty state. SP (Season Points) labels and the all-time separation are visible throughout the Season views. Pill card presentation: large current-Season streak value; thirty segmented pills; profile flame icons; completed, in-progress, locked, and reached-but-uncredited milestone states; existing 3/7/14/30 scoring thresholds; logo name on hover/focus. Preview claim controls, readiness labels, live-loop links, and per-claim point calculations were removed from these cards.
- Automated evidence: 44 targeted tests passed, including the existing profile milestone tests, saved-bonus persistence after a streak resets, long streaks beyond the last milestone, RWAGMI's legacy profile identity, disconnected/error states, and absence of the removed preview controls. TypeScript and targeted ESLint passed.
- The implementation screenshot and interactive browser comparison are unavailable. No in-app browser tool is exposed in this session, and prior direct browser execution requests were declined. An HTTP response or server-rendered markup is not a visual comparison. No visual fidelity pass is claimed.
- Remaining visual checks: desktop two-column and mobile single-column layout; pill spacing at narrow widths; logo hover/focus names; readable completed/in-progress/locked colors; milestone tooltips; loading and profile-fetch error states.

final result: blocked

---

# MagicBento motion preview — 2026-10-21

- Source: user-supplied `Pasted text.txt` containing the MagicBento animation component. The existing option-1 layout remains the visual target.
- Implementation: `components/ui/magic-bento.tsx`, `components/participation/card-motion-preview.tsx`, and `styles/magic-bento.css`.
- Scope: decorative border glow, pointer spotlight, cross-card click waves, entrance/replay, only. Tilt, magnetism, and particles have been removed at the user’s request. Existing cards retain their own native actions and responsive layout.
- Preview controls: On (subtle, enabled by default), Off, and Replay entrance on Discover and Milestones. Shared Loop, Game, and Season cards also use the selected mode.
- Milestones hero copy now includes LOOP TOGETHER.
- Motion state is associated with DOM elements rather than array indexes. DOM additions/removals and resizing invalidate measurements. Reduced-motion and pointer-capability changes are observed live. Event listeners, observers, animations, inline properties, and animation frames are cleaned up.
- TypeScript and targeted ESLint passed.
- Browser screenshot, viewport measurements, focused/full comparisons, console inspection, and interaction verification: unavailable.
- The sandbox denied binding port 3000, and the subsequent request to start `pnpm dev --port 3000` outside the sandbox was declined. No alternate server or browser execution was attempted to bypass that decision.
- Remaining checks: hover across neighboring cards; click a milestone and confirm its dialog still opens; use keyboard focus and native actions; compare On/Off; replay entrances; filter/reorder cards; change reduced-motion settings while the app is open; test touch scrolling and resized layouts; inspect console and performance.
- No rendered visual pass is claimed.

final result: blocked

---

# Gyralis participation pages — option 1

Date: 2026-10-20 (America/Montevideo).

## Evidence and state

- Source visual truth: `/Users/mati/.codex/generated_images/01a15b3f-f168-7083-9318-8c701c16d4ee/exec-3c5863ae-0c7d-4e45-a614-2df5646bbec7.png`, selected as option 1. Opened during the design workflow.
- Source pixels: 1487 × 1058. Intended desktop CSS viewport: 1487 × 1058 at device scale factor 1. Mobile target: 390 × 844; tablet target: 834 × 1194.
- Implementation screenshot: unavailable. The local Playwright execution request was declined twice, including a narrower request that only executed the prepared script. No further browser execution was attempted after the second decline.
- Implementation pixel dimensions and density normalization: not measured because no rendered implementation was captured.
- State to compare: Discover / For You / disconnected wallet / explicitly labeled demo progression / dark appearance.
- Full-view comparison evidence: unavailable.
- Focused region comparison evidence: unavailable. Needed for search, navigation, readiness labels, Season information, active Loop cards, and the participation rail.
- Browser console and interaction testing: not performed. HTTP responses and compiler checks are not substitutes for browser verification.

## Findings

- Visual verification is blocked by unavailable browser-rendered evidence. No visual fidelity pass is claimed.
- Fonts/typography: Inter is implemented through the existing app font. Hierarchy, wrapping, and optical weights still need a rendered comparison.
- Spacing/layout: persistent sidebar, central page area, participation rail, responsive bottom navigation, and collapsible inline progression are implemented; viewport proportions, overflow, and actual spacing still need screenshots.
- Colors/tokens: scoped dark Gyralis tokens and emerald accents are implemented. Contrast and rendered color balance remain unverified.
- Image quality: source Gyralis logos and orbit art are reused; garden and Merits thumbnails were generated, opened, and inspected as standalone assets. In-page crop, scale, and image loading remain unverified. No CSS or SVG art substitutes were added.
- Copy/content: all-time and Season metrics are explicitly separated. New Season, Game, milestone, and progression values are labeled as demo data.

## Intentional product constraints

- The current Loop roster is retained. Markee stays hidden and True Loopers is shown instead, as explicitly selected by the user.
- Existing wallet, eligibility, registration, claim, profile, and all-time leaderboard code is reused. Real transactions were not executed.
- Mock Season GP follows the specification. Inconsistent generated bonus values and unconfirmed level thresholds from the mock were not carried into the UI.
- Games provide local demo membership; they do not award live rewards or update from onchain claims.
- Loop details are presented in a dialog around the existing live component. No new detail routes were requested.

## Code and route checks

- TypeScript: passed.
- ESLint for changed participation routes/components and live leaderboard integration: passed.
- Existing Loop state and confirmation tests: 63 passed across 3 files.
- Next.js development compilation / HTTP checks: Discover, Loops, Games, Milestones, Leaderboard, and Profile each returned HTTP 200. These checks do not verify client rendering or interactions.
- Git whitespace validation: passed.

## Comparison history

No rendered comparison was performed. No visual findings or fixes are claimed as verified.
The earlier profile-user-pill report is preserved at `docs/design-qa-profile-user-pill.md`.

## Remaining implementation checklist

1. Capture desktop and mobile rendering when browser execution is authorized.
2. Compare source and rendered Discover together, both at full view and focused regions.
3. Verify navigation, keyboard and touch use, search clearing, Discover tabs, ecosystem selection, Loop filtering and live dialog, Season tabs, demo game joining/leaving and persistence, milestones, leaderboard switching, and profile tabs.
4. Inspect client console errors, focus management, viewport overflow, and loaded imagery.
5. Fix actionable P0/P1/P2 findings and repeat capture/comparison before marking QA passed.

final result: blocked
