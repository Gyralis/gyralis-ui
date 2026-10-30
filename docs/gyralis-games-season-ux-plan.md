# Gyralis Games: Goals and Season UX Plan

Date: October 29, 2026  
Status: Agreed UX direction; outstanding business approvals listed below  
Target Season: December 1–30, 2026

This document records the product goals, confirmed decisions, proposed user experience, implementation requirements, and outstanding decisions. It is a planning specification, not a claim that registration, payments, bonus scoring, or prize settlement have been implemented.

## 1. Product goal

Each Gyralis Games Season is a month-long claiming competition. Daily Loop claims and independent per-Loop streaks form the main routine. Season Games challenges add earning opportunities to the same Season leaderboard.

The experience should help a player understand:

- What the Season is, when it runs, and how to register.
- Which Loops they can claim from today and what eligibility they require.
- How claims, streaks, and games contribute to their Season score.
- What to do next to earn points or reach a streak milestone.
- Their rank, the payout cutoff, and when prizes become final and claimable.
- The difference between rewards received from claiming and prizes awarded for Season placement.

Page subtitle: **One participation layer. Many ways to earn**

### Naming and hierarchy

- **Gyralis Games:** the overall participation experience.
- **Season 01:** the month-long competition and its single leaderboard.
- **Season Games:** the collection of bonus-earning challenges.
- **Challenge types:** consistency, race, exploration and timed.
- **Day Game:** a timed challenge inside Season Games, not a separate category.

All challenges contribute to the same Season score. Their different mechanics do not introduce separate entry fees, leaderboards or scoring currencies.

### Core explanation

**Season points = claim points + Loop streak bonuses + game bonuses.**

Daily participation must remain the main activity. Season Games challenges should enrich that routine without making players learn every game before they can participate.

### Success criteria

- A new visitor can identify the entry fee, dates, guarantee, registration deadline, and earning model before paying.
- A registered player can immediately find their next available claim and next streak bonus.
- Every displayed Season total reconciles with its claim, streak, and game components.
- Players understand that live standings and paid positions can change until results are finalized.
- Players outside paid positions understand that they retain rewards already earned through Loop claims.
- Essential actions remain available when the right side component is hidden.

## 2. Confirmed Season rules

### Calendar

Use UTC boundaries as the source of truth. Offer local-time equivalents in the interface and make the UTC reference available. Write dates with month names to avoid ambiguity.

| Event | UTC boundary | Meaning |
| --- | --- | --- |
| Registration opens | November 24, 2026, 00:00 | One week of registration before the start |
| Season starts | December 1, 2026, 00:00 | Scoring starts; withdrawals and refunds stop |
| Late registration closes | December 4, 2026, 00:00 | Late entry is available throughout December 1–3 |
| Scoring ends | December 31, 2026, 00:00 | Includes all of December 30 |
| Review begins | Immediately after scoring ends | Results remain provisional |
| Prize claims open | After approved review | No fixed opening date has been committed |

Treat scoring and event windows as start-inclusive and end-exclusive.

### Registration

- Entry costs **1 USDC on Base**.
- Before the Season starts, a player can unregister and receive the full entry fee back.
- Once the Season starts, entries cannot be withdrawn or refunded.
- Late entrants receive eligible activity backdated to December 1, including claims, streak progression, and game progress.
- Registration does not grant eligibility for individual Loops.
- Early registration earns an **Early Bird badge**, without additional leaderboard points.
- Badge eligibility requires a valid registration retained at Season start.

### Regular scoring Loops

- Use a confirmed roster of daily Loops on Base.
- A regular eligible claim earns **1 Season point**.
- Every regular Loop has its own independent Season streak.
- Season streaks start fresh and remain separate from existing all-time Loop streaks.
- A streak follows consecutive eligible daily Loop periods, rather than elapsed hours since a previous claim.

| Consecutive daily claims in one Loop | Additional Season points |
| --- | --- |
| 3 | +2 |
| 7 | +5 |
| 14 | +12 |
| 28 | +30 |

Award each milestone once per Loop per Season. Missing a period resets that Loop's current streak, but previously earned points remain. Rebuilding a streak does not award an already-earned milestone again in the same Loop and Season.

All-time scoring remains unchanged. The Season's 28-claim milestone does not replace the existing all-time milestone configuration.

### Season Games challenges

- Registered Season players automatically progress in applicable games.
- Do not require a separate join action for each game.
- Each game visibly specifies its objective, reward, applicable Loops, time window, and completion rules.
- A qualifying action can advance multiple games.
- Each completed game awards its configured reward once, subject to its published qualification rules.
- Game bonus points contribute to the Season only; they do not alter all-time GP.
- Exact objectives and point amounts will be balanced and approved separately.

The current concepts are templates, not final approved game definitions:

| Concept | Intended player behavior |
| --- | --- |
| 30-Day Sprint | Return consistently across the Season |
| First 50 to 20 claims | Reach a claim target before other players |
| Find your next Loop | Participate across different Loops |
| The long game | Maintain participation across many active days |

Do not publish a game as active until its objective, reward, dates, and qualification rules are approved. Limited-place games need provisional qualification while late registration can introduce backdated activity. Final qualification also depends on the approved tie policy.

### Day Games

A Day Game is a timed challenge within Season Games. It uses a designated standard Loop with a configured scoring window; it is not a separate game category or competition.

- An eligible claim during the window earns **4 total Season points**.
- Display this as **1 claim point + 3 Day Game bonus points**.
- Claims outside that window earn **zero Season points from that Day Game Loop**.
- Day Game Loops do not award regular Season streak bonuses.
- Ordinary Season Loops continue earning 1 point per eligible claim.
- Day Game availability is scheduled, rather than permanently active.
- Underlying Loop rewards and claim availability remain distinct from the event's Season scoring window.

Show Scheduled, Active, and Ended states. Active cards explain the eligible Loop, exact window, countdown, and 4-point reward. After the event ends, retain its result and point history without implying that further claims earn event points.

### Prize pool and paid positions

- Guaranteed prize pool: **$250**.
- Pool value equals the larger of **$250 or total retained entry fees**.
- Examples: 180 entries produces a $250 pool; 320 entries produces a $320 pool.
- Paid positions equal **15% of final entries, rounded up**.
- Example: 227 entries produces 35 paid positions.
- The entire pool is distributed across those positions using the approved payout structure.
- Final entries, the pool, and the payout table are published after late registration closes.
- The exact payout percentages and entry-count bands have not yet been supplied.
- The prize payment asset remains an approval item; the confirmed entry asset is Base USDC.

Season placement prizes and rewards received from Loop claims must be presented separately. Players who finish outside paid positions retain rewards earned through their Loop claims.

## 3. Information architecture

Preserve the existing design, navigation, 1080px content limit, and embedded right side behavior. Do not introduce a drawer or narrow the center content when the right side opens.

| Page | Main responsibility |
| --- | --- |
| Explore | Introduce the Season and surface the next useful action |
| Games | Main Season dashboard: daily claims, streaks, games, and prizes |
| Loops | Individual Loop requirements, eligibility, claim availability, and streaks |
| Leaderboard | Full Season standings, point breakdowns, and payout cutoff |
| Profile | Personal history, all-time progression, and Season badges |
| Milestones | Collective participation goals, distinct from personal Season scoring |

### Games navigation

Use three tabs:

1. **Overview**
2. **Season Games**
3. **Prizes & Rules**

Keep the full leaderboard on the existing Leaderboard page. Link to its Season context from Games and Explore.

## 4. Main player journeys

### Before registration

The Season header presents the dates, phase, countdown, entry fee, guarantee, and registration action.

Before payment, explain:

- The 1 USDC entry fee, with any network fee identified separately.
- The registration, refund, and scoring deadlines.
- The guarantee and top-15% payout method.
- That individual Loop requirements still apply.
- Where to inspect eligible Loops before entering.

Support wallet connection, network switching, insufficient funds, payment pending, confirmed entry, rejected payment, and retry states. A submitted transaction alone must not mark the player registered.

Before the Season starts, registered players see their entry confirmation, Early Bird status, start countdown, and the option to unregister for an entry-fee refund.

### During late registration

Unregistered visitors see eligible historical activity as **Potential Season points**. Clearly state that registering includes eligible activity since December 1.

After registration confirms, reconcile that activity into their score. Show a reconciliation state while this is pending rather than presenting an incomplete score as final.

Limited-place game results remain provisional while late registration is open.

### After registration closes

Registered players continue claiming and progressing in games. The final entry count, pool, paid-place count, and payout table become available.

Unregistered visitors can still explore and use available Loop functionality, but cannot enter this Season or earn a Season payout. Keep that distinction clear without blocking ordinary Loop participation.

### Daily routine: Overview

Present sections in this order:

1. **Season header:** dates, phase, countdown, registration status, pool, and primary action.
2. **Your Season score:** total, rank, and Claims + Streak bonuses + Game bonuses.
3. **Today's Loops:** claimable Loops first, followed by upcoming windows.
4. **Next streak bonuses:** progress toward the next milestone for each regular Loop.
5. **Bonus opportunities:** active Day Games and other games close to completion.

Each regular Loop row shows:

- Loop identity and eligibility state.
- Current claim availability or next window.
- Its independent Season streak.
- The next milestone and reward.
- A View Loop action, or Claim after eligibility and availability are verified.

Keep eligibility messaging actionable. Do not imply that paying the Season entry makes a player eligible for a Loop.

### Claim result

Separate the underlying token reward from the Season points earned. Explain the point increment at the moment of earning it.

Example for the seventh consecutive regular Loop claim:

> Season points earned: +6  
> +1 claim point · +5 for your 7-day Loop streak

Example for a Day Game:

> Season points earned: +4  
> +1 claim point · +3 Day Game bonus points

If a claim also completes a bonus game, show that additional award separately and include it in the resulting total. Avoid awarding or displaying the same event twice during retries or refreshes.

### Season Games

Each card shows the objective, configured reward, progress, applicable Loops, time window, and status. Use View game or a relevant claiming action instead of Join game.

The detail view explains what counts, what remains, and whether qualification is provisional. Group all challenges under Season Games. Use consistency, race, exploration and timed labels to explain their mechanics. Day Games are timed challenges in that same collection, sharing the same game-bonus total.

### Right side component

Keep a compact Season summary and activity feed. Activities identify claim points, streak awards, and game awards separately.

Essential registration actions, daily claims, score explanations, and prize access must not depend on this component being visible. Preserve its existing top-nav toggle and entrance/exit motion.

## 5. Leaderboard and prizes

### During play

The Season leaderboard shows rank, player, total points, and an expandable breakdown of the three point sources. Highlight the current player and the payout cutoff.

Use **Currently in a paid position** rather than implying that a personal prize is guaranteed. Rank and payout position can change while scoring continues.

Before late registration closes, show the current pool, guarantee, and provisional paid-place count. After closing, publish the fixed entry count, pool, and rank-to-prize table.

### After scoring ends

Move the Season into **Results under review**. Stop adding new Season scoring events at the cutoff, while allowing normal Loop activity to continue independently.

Standings remain provisional until review is approved. Do not promise a fixed prize-opening date or enable prize claims during review.

Once approved, publish final results and enable eligible prize claims. Support these player-facing states:

- Under review.
- Prize available.
- Claim pending.
- Claimed.
- Not in a paid position.
- Claim failed, with a safe retry path.

Do not invent a claim-expiry deadline. If one is introduced, it requires an explicit decision and prominent disclosure.

### Tie policy

The exact rule remains pending approval before launch. The last qualifying claim has been proposed as a deciding factor, but neither earlier nor later last-claim priority has been selected.

Do not silently implement an address sort, arbitrary order, or unapproved timestamp rule as a prize-deciding policy. Publish the approved rule in Prizes & Rules before paid registration launches.

## 6. Implementation requirements

### Shared Season state

Use one shared Season view model across Explore, Games, the right side, Profile, and Leaderboard. It supplies:

- Lifecycle boundaries and current phase.
- Registration and reconciliation status.
- Claim, streak, game, and total Season points.
- Per-Loop availability, streaks, and earned milestones.
- Game definitions, windows, progress, and award status.
- Entry counts, pool, payout-publication status, and player prize state.

Components must not independently hardcode conflicting dates, point totals, or registration phases.

### Scoring and compatibility

- Extend the existing Season model for paid registration eligibility, retroactive reconciliation, game awards, and timed Day Game windows.
- Keep Season scoring independent from all-time scoring.
- Preserve separate point components so every total can be explained.
- Evaluate claim eligibility and event windows using the qualifying activity timestamp, not the time the activity was indexed.
- Make awards and reconciliation idempotent.
- Do not use the current season-wide Loop multiplier directly for Day Games: it also multiplies streak bonuses, which conflicts with the approved event rule.
- Treat the Base Loop roster and deployment or migration work as explicit rollout dependencies, rather than assuming the current multichain roster already satisfies the Season rules.

### Interface behavior

- Reuse existing components, styles, responsive behavior, and navigation.
- Preserve the existing center width and right side positioning behavior.
- Keep the Games subtitle exactly as agreed.
- Keep internal fixture or prototype terminology out of visible product labels.
- Ensure loading, unavailable data, pending transactions, and failed transactions cannot be mistaken for confirmed registration, awarded points, or claimable prizes.

## 7. Acceptance scenarios

### Registration and lifecycle

- Early registration confirms only after payment confirmation.
- Unregistering before December 1 refunds the full entry fee; re-registration is supported.
- Refund and withdrawal actions are unavailable from the Season start onward.
- Late registration includes eligible activity since December 1 exactly once.
- Registration closes at December 4, 00:00 UTC.
- Claims at December 31, 00:00 UTC or later do not earn this Season's points.
- Boundary behavior is consistent across local-time displays.
- Rejected, failed, and repeated payment actions do not produce duplicate entries.

### Claims, streaks, and games

- A regular eligible claim adds one claim point.
- Each Loop tracks its own streak independently.
- A missed daily period resets only the affected current streak, preserving earned points.
- Milestones award +2, +5, +12, and +30 at 3, 7, 14, and 28 consecutive claims.
- Rebuilding a streak cannot repeat a previously earned milestone in the same Loop and Season.
- Day Game claims before, during, and after the window earn 0, 4, and 0 Season points respectively.
- Day Game Loops never award regular Season streak bonuses.
- Automatic game progress supports overlapping objectives without duplicate completion awards.
- Late entrants can change provisional limited-place game qualification before registration closes.
- Score components reconcile to the same total on every page.

### Leaderboard, prizes, and layout

- The payout cutoff reflects the rounded-up 15% rule and final entry count.
- Live paid-position messaging does not imply a guaranteed prize.
- Review keeps standings provisional and prize claiming disabled.
- Approved publication changes results and prize actions together.
- Failed prize claims can be retried without duplicate settlement.
- Non-winning players retain clear access to their Loop reward history.
- Mobile navigation supports all essential actions.
- Hiding the right side does not hide essential Season information or actions.

## 8. Assumptions and outstanding approvals

### Proposed defaults

These are implementation defaults from the plan, rather than separately confirmed business decisions:

- One retained Season entry per wallet, with no additional re-entry purchases.
- An Early Bird badge is retained only for a valid entry present at Season start.
- All entry-fee refunds exclude network fees already paid to execute transactions; the interface identifies network fees separately.
- No fixed review duration and no prize-claim expiry until explicitly configured and approved.

### Required before launch

| Item | Required outcome |
| --- | --- |
| Payout structure | Supply percentages and entry-count bands that distribute the full pool across the paid positions |
| Tie policy | Approve and publish the exact prize-deciding and limited-place qualification rule |
| Bonus games | Approve exact objectives, rewards, applicable Loops, windows, and qualification rules |
| Prize payment asset | Confirm the asset and network used for Season prize settlement |
| Regular Loop roster | Confirm eligible daily Base Loops, their periods, requirements, and readiness |
| Day Game schedule | Configure each event Loop and scoring window before publication |
| Registration and settlement | Confirm payment, refund, reconciliation, review, and prize-claim mechanisms |
| Low-entry cases | Define cancellation or distribution behavior for exceptional participation counts, including zero entries |

These dependencies must not be filled with invented payout amounts, game rewards, or prize outcomes. UX fixtures may exercise the required states internally, while production publication waits for approved rules and complete data.

## 9. Interactive frontend preview

The first implementation is a frontend-only UX preview using shared sample Season state. It does not activate a real Season, change production scoring, authorize eligibility, or send payments.

- Games provides Overview, Season Games, and Prizes & Rules tabs.
- Preview controls switch between registration, late entry, live play, review, and prize interactions. Each stage loads its own fixture; reset reloads that stage. State is retained between participation-page navigations and resets on a full reload.
- Registration, wallet/network/funding steps, entry-fee refunds, failures, retries, and prize confirmations are simulated and labeled in their dialogs.
- Regular claim previews update independent Loop streaks and the shared score. Day Game previews credit 1 claim point and 3 game bonus points without streak bonuses.
- Explore, the right side, the Season leaderboard, Loop cards, and the Profile Season view consume the shared state.
- Consistency, race and exploration challenges update their example objectives automatically, but their rewards remain pending rather than crediting invented amounts. Day Games are timed challenges in the same Season Games collection, with their approved 4-point claim rule.
- The payout table, prize asset, final tie policy, deployment roster, and live registration/settlement integration remain outstanding.
- Live Loop links retain the existing claim flow and network/eligibility behavior.

Review entry point: `/games`. Start the local application with `pnpm dev`, then use Preview controls to inspect each phase. The default stage is a registered player on December 12; it is an example date, not the actual current Season state.
