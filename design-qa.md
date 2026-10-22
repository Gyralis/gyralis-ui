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
