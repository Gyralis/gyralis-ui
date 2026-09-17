# User Profile Context and UI Data

This document captures the current user profile work, the known data shape, and the latest UI decisions so we can plan the profile UX/UI without re-discovering the whole cave system every time.

## Current goal

Build a public user profile page for Gyralis loop participation.

The profile should support:

- A connected-wallet profile entry point at `/profile`.
- A public SSR profile URL at `/profile/[address]`.
- Direct sharing of any wallet profile by putting the wallet address in the URL.
- A useful holding state when there is no connected wallet.
- A clean activity dashboard for loop claims, points, streaks, and achievements.

## Routes

### `/profile`

Client-side wallet bridge route.

File:

- `app/(general)/(participation)/profile/page.tsx`

Behavior:

- Uses RainbowKit / Wagmi to check the connected wallet.
- Waits until wallet connection state is resolved.
- If wallet is connected, redirects to `/profile/${address}`.
- While connection state is still loading, renders a skeleton loading state.
- If no wallet is connected, renders a connect-wallet card.
- Search-by-address UI was intentionally removed.

### `/profile/[address]`

Server-rendered public profile page.

File:

- `app/(general)/(participation)/profile/[address]/page.tsx`

Behavior:

- `dynamic = "force-dynamic"`.
- Calls `getProfilePageData(params.address)` server-side.
- If the address is invalid, returns `notFound()`.
- If valid, renders `ProfilePageView`.

### API routes

Profile API:

- `GET /api/users/[address]/profile`
- File: `app/api/users/[address]/profile/route.ts`
- Returns `profile` and `globalStats`.
- Returns 404 when both are missing.

Scoring API:

- `GET /api/users/[address]/scoring`
- File: `app/api/users/[address]/scoring/route.ts`
- Returns `globalStats` and `loopStats`.
- Parses `earnedStreakBonuses` into a clean array.

## Shared participation navigation

The Loops / Leaderboard / Profile pill nav is shared in the participation layout, not duplicated in each page.

Files:

- `app/(general)/(participation)/layout.tsx`
- `components/layout/participation-section-nav.tsx`

Links:

- `/loops`
- `/leaderboard`
- `/profile`

Active-state logic:

- `/loops*` activates Loops.
- `/leaderboard*` activates Leaderboard.
- `/profile*` activates Profile.

## Data fetch plan

The SSR profile page fetches all data through the server helper:

- `lib/profile/get-profile-page-data.ts`

Main function:

```ts
getProfilePageData(rawAddress: string): Promise<ProfilePageData | null>
```

Flow:

1. Validate the URL address with `isAddress`.
2. Normalize address with `normalizeDbAddress`.
3. Fetch these records in parallel:
   - `getUserProfile(address)`
   - `getUserGlobalStats(address)`
   - `getUserLoopStatsForUser(address)`
4. Parse `earnedStreakBonuses`.
5. Enrich each loop stat with metadata from `LoopCardsData`.
6. Sort loop stats by:
   - highest `totalPoints`
   - then highest `totalClaims`
   - then lowest `loopId`
7. Return `ProfilePageData`.

## Profile page data shape

```ts
interface ProfilePageData {
  address: string
  profile: ProfileRecord
  globalStats: GlobalStatsRecord | null
  loopStats: ProfileLoopStats[]
  hasActivity: boolean
}
```

### `ProfileLoopStats`

```ts
interface ProfileLoopStats {
  id: string
  userAddress: string
  loopId: number
  chainId: number
  totalClaims: number
  claimPoints: number
  streakBonusPoints: number
  totalPoints: number
  currentStreak: number
  longestStreak: number
  lastClaimedPeriod: number | null
  earnedStreakBonuses: EarnedStreakBonus[]
  metadata: ProfileLoopMetadata
}
```

### `ProfileLoopMetadata`

```ts
interface ProfileLoopMetadata {
  id: number
  title: string
  by: string
  address: string | null
  chainId: number
  chainName: string
  contractType: LoopContractType | "archived"
  communityLogoUrl?: string
  eligibilityLogoUrl?: string
  sponsorLogoUrl?: string
  enabled: boolean
  archived: boolean
}
```

### `EarnedStreakBonus`

```ts
interface EarnedStreakBonus {
  streak: number
  points: number
}
```

## Scoring rules

Source:

- `config/scoring.json`
- `lib/scoring/rules.ts`
- `lib/scoring/aggregate.ts`

Current scoring config:

```json
{
  "claimPoints": 1,
  "streakBonuses": [
    { "streak": 3, "points": 2 },
    { "streak": 7, "points": 5 },
    { "streak": 14, "points": 12 },
    { "streak": 30, "points": 30 }
  ]
}
```

Loop-level scoring:

- Each claim adds `1` claim point.
- `currentStreak` increases only when the new `periodNumber` is exactly `lastClaimedPeriod + 1`.
- If a claim skips a period, `currentStreak` resets to `1`.
- `longestStreak` stores the best loop streak ever reached.
- Each streak bonus can be earned once per loop.
- `totalPoints = claimPoints + streakBonusPoints`.

Global scoring:

- `totalClaims` is the sum of all loop claims.
- `claimPoints` is the sum of all loop claim points.
- `streakBonusPoints` is the sum of all loop streak bonus points.
- `totalPoints` is the sum of all loop total points.
- `activeLoopStreaks` counts loops where `currentStreak > 0`.
- `longestStreak` is the max `longestStreak` across loops.
- `earnedStreakBonuses` is merged across loops by streak threshold and points are summed.

Important interpretation:

- A global `earnedStreakBonuses` entry like `{ "streak": 3, "points": 4 }` means the 3-claim milestone was earned across loops for a total of 4 bonus points.
- It is not tied to one single loop unless viewed inside `loopStats`.

## Known loops metadata

Source:

- `data/loops-data.ts`

| ID | Title | By | Chain | Chain ID | Address | Status |
| --- | --- | --- | --- | --- | --- | --- |
| 5 | Markee | Markee cooperative | Base | 8453 | `0x213310e1dbD6991cD488AB247c81faD82CD88E7A` | Enabled |
| 3 | 1Hive Gardens | 1Hive | Gnosis | 100 | `0x8995641fb3E452bC1359E79A738a6DE556015696` | Enabled |
| 4 | Blockscout Merits | Blockscout | Gnosis | 100 | `0xaB25dBaFD11b1eb606B2455Eecec67e6746E409b` | Enabled |
| 6 | True Loopers | Gyralis | Base | 8453 | `0x5034003B12c05dE5D85bC58AD17360c77d13ae36` | Disabled / preparing |

Fallback metadata:

- If a scored `loopId` does not exist in `LoopCardsData`, the profile page labels it as `Archived loop #${loopId}`.
- Fallback `by` value is `Gyralis`.
- Fallback loop address is `null`.
- Fallback status is archived / disabled.

Observed during this profile/scoring work:

- DB/scoring loop IDs seen: `1`, `3`, `4`.
- `loopId = 1` appeared in scoring data but does not currently have matching metadata in `LoopCardsData`.
- Current metadata-backed loop IDs are `3`, `4`, `5`, and `6`.

## Sample addresses used while testing

```txt
0xE9dC34B67006Db0910a9761CB031D4bDE67dCE23
0xa25211B64D041F690C0c818183E32f28ba9647Dd
```

Example public profile URL:

```txt
/profile/0xa25211B64D041F690C0c818183E32f28ba9647Dd
```

Example scoring API URL:

```txt
/api/users/0xa25211B64D041F690C0c818183E32f28ba9647Dd/scoring
```

## Current profile UI structure

File:

- `components/profile/profile-page-view.tsx`

### 1. Header

Current title:

- `Looper Profile`

Shows:

- Full user address.
- Left progress card:
  - current level/tier badge
  - total points displayed as `GP`
  - `GP` has a hover/focus tooltip: `GyraPoints`
  - progress toward `True Looper` or `LooperX`
  - `Total claims`
  - `Best streak`
- Right rank card:
  - global leaderboard rank
  - lower `View leaderboard` CTA section

Removed from header:

- Copy address UI.
- Explorer UI.
- Search another wallet UI.
- Human passport.
- Loops participated.
- Profile created.
- Joined date UI.

Wallet behavior:

- `/profile` still opens the connected wallet profile.
- `/profile/[address]` is public and can display any address.
- If the connected wallet account changes while viewing a profile page, the URL dynamically updates to the newly connected wallet profile.

### 2. No-activity state

Shown when `hasActivity` is false.

Copy:

- `No loop activity yet`
- Explains that no scored claims exist yet.
- Includes an `Explore loops` link to `/loops`.

### 3. Loop activity

Current section label:

- `Loop activity`

Current heading:

- `Per-loop proof`

Current layout:

- Uses the same Gyralis table shell/grid pattern as the old Loops page table view.
- Uses a horizontal overflow wrapper for smaller screens.
- Does not use the older generic `TableCore`, because that component includes pagination/sorting behavior that is unnecessary here.

Current columns:

| Column | Data |
| --- | --- |
| Loop | Logo, loop title, sponsor/community `by`, archived badge when needed |
| Claims | `loop.totalClaims` |
| Streak Pts | `loop.streakBonusPoints` |
| Total GP | `loop.totalPoints` displayed as GyraPoints |

Intentionally removed from loop activity rows:

- Chain text like `Gnosis`.
- Text like `Loop #3`.
- Loop contract address.
- Explorer link.

Reason:

- This section should read as user activity, not contract debugging metadata.
- Deep technical identifiers can come later in a details drawer/modal if needed.

### 4. Achievements

Current section label:

- `Achievements`

Current heading:

- `Streak bonuses`

Position:

- Final full-width section after Loop activity.

Current cards:

- `3-claim streak`
- `7-claim streak`
- `14-claim streak`
- `30-claim streak`

Each card shows:

- Earned vs not reached state.
- Bonus points from `globalStats.earnedStreakBonuses`.

## Current UX direction

The profile is leaning toward this narrative:

1. Who is this wallet?
2. What has it achieved overall?
3. Where has it participated?
4. What streak milestones has it earned?

Recommended next UI refinements:

- Rename `Current` and `Best` table columns to `Current streak` and `Best streak` if horizontal space allows.
- Consider a mobile card layout below `sm` instead of only horizontal scroll.
- Add a detail drawer later for contract-level metadata:
  - chain
  - loop ID
  - contract address
  - explorer link
  - history key
- Add empty achievements copy when there are claims but no bonuses.
- Consider adding rank/leaderboard position once leaderboard profile lookup is available.
- Consider showing `claimPoints` and `streakBonusPoints` as a points breakdown in the header or achievements section.

## Example UI payload shape

This is not live data; it is a representative shape for design work.

```json
{
  "address": "0xa25211b64d041f690c0c818183e32f28ba9647dd",
  "profile": {
    "userAddress": "0xa25211b64d041f690c0c818183e32f28ba9647dd",
    "ensName": null,
    "ensAvatar": null
  },
  "globalStats": {
    "userAddress": "0xa25211b64d041f690c0c818183e32f28ba9647dd",
    "totalClaims": 42,
    "claimPoints": 42,
    "streakBonusPoints": 19,
    "totalPoints": 61,
    "activeLoopStreaks": 2,
    "longestStreak": 14,
    "loopCount": 3,
    "earnedStreakBonuses": [
      { "streak": 3, "points": 6 },
      { "streak": 7, "points": 10 },
      { "streak": 14, "points": 12 }
    ]
  },
  "loopStats": [
    {
      "id": "100:3:0xa25211b64d041f690c0c818183e32f28ba9647dd",
      "userAddress": "0xa25211b64d041f690c0c818183e32f28ba9647dd",
      "loopId": 3,
      "chainId": 100,
      "totalClaims": 18,
      "claimPoints": 18,
      "streakBonusPoints": 7,
      "totalPoints": 25,
      "currentStreak": 5,
      "longestStreak": 7,
      "lastClaimedPeriod": 82,
      "earnedStreakBonuses": [
        { "streak": 3, "points": 2 },
        { "streak": 7, "points": 5 }
      ],
      "metadata": {
        "id": 3,
        "title": "1Hive Gardens",
        "by": "1Hive",
        "address": "0x8995641fb3E452bC1359E79A738a6DE556015696",
        "chainId": 100,
        "chainName": "Gnosis",
        "contractType": "loop",
        "communityLogoUrl": "/1Hive-logo.png",
        "eligibilityLogoUrl": "/gardens-logo.png",
        "sponsorLogoUrl": "/1Hive-logo.png",
        "enabled": true,
        "archived": false
      }
    }
  ],
  "hasActivity": true
}
```

## Notes for visual design handoff

If sending this to a design assistant, the strongest brief is:

> Design a public wallet profile dashboard for Gyralis. Keep the hero/header as a compact identity summary with total claims, longest streak, and all-time points. Make Loop Activity the main content using a clean table, focused on human-readable loop names and participation metrics. Do not show chain names, loop IDs, contract addresses, or explorer links in the activity table. Place Achievements as the final section with streak milestone cards for 3, 7, 14, and 30 claims.

Tone:

- Playful, optimistic, crypto-native but not explorer-heavy.
- More “participation identity” than “blockchain debugger.”
- Friendly dashboard, not admin analytics.
