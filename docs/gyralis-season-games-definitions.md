# Season Games definition workshop

Status: planning in progress. This document separates current UI examples, approved rules and questions awaiting a product decision. It does not activate games or change scoring.

## Outcome

For every game, a player should be able to explain:

1. What is the goal?
2. Which actions and Loops count, and during what window?
3. How much progress remains?
4. What completes the game or qualifies a winner?
5. Exactly how many additional Season points are awarded, and when?
6. What happens after a missed day, late entry, tie or event ending?

Game completion bonuses and Season placement prizes are different rewards. Completing a game does not guarantee a paid Season leaderboard position.

## Deployment and timing reference

The user confirmed that new Loops will be deployed on Base for the Season, with their period configuration known. Use those configured Loop periods as the authoritative timing input during implementation. The existing live directory is not a substitute for that new Season deployment configuration.

Retain the current December 2026 Season and weekend dates as reference fixtures for planning, examples and later tests. Do not spend further planning rounds reconfirming these dates. Validate the configured contract periods and registration/claim boundary behavior in implementation tests, then reconcile any fixture dates as needed. The current focus remains clear game goals, qualifying actions and points.

## Existing decisions

- Season Games are challenges within the overall Season, including the timed Day Game.
- Registered entrants progress automatically; games require no separate join action.
- Regular eligible claims earn 1 Season point and can earn separate per-Loop streak bonuses.
- Game bonuses add to Season points only, separate from all-time GP.
- A qualifying action can advance more than one applicable game. Each completion bonus is awarded once under the game's final rules.
- Sprint and Long Game bonuses stack: a qualifying player earns 15 SP at Sprint completion and 30 additional SP at Long Game completion, for 45 SP total in attendance-game bonuses.
- Eligible activity since the Season start is included for late entrants. How that affects limited-place qualification still needs a precise rule.
- All regular Season Loops share one daily period schedule, as confirmed by the user. Attendance games count these shared periods rather than assuming separate UTC calendar days. Claims from several regular Loops in the same shared period produce one attendance unit.
- Unlimited completion-game bonuses enter the live Season score after confirmed completion. Standings remain provisional until final review. Limited-place race qualification can follow a separate confirmation rule.
- Unapproved rewards remain unpublished and contribute no promised bonus points.

## Current concepts and decisions needed

| Game | Current UI example, not a final approved objective | Bonus | Main decisions still open |
| --- | --- | --- | --- |
| 20-Day Sprint | Confirmed: participate in at least 20 shared daily Season periods; periods need not be consecutive | 15 SP, confirmed for planning; stacks with Long Game | Actual published roster and period calendar |
| First 50 to 20 claims | On hold at the user's request; regular Season Loop claims are the agreed qualifying source | 20 SP reserved in the working budget; final game remains on hold | User's later suggestions; objective revisions, ordering, ties, late-entry reconciliation and award timing |
| Find your next Loop | Confirmed revised goal: claim in every required Season Loop at least three times; required roster is fixed before the Season | 15 SP, agreed for planning | Publish the actual required Loop list; weekend inclusion is unresolved and deferred while focusing on Weekend Loop |
| The long game | Confirmed: at least one qualifying regular Loop claim in every shared daily Season period | 30 SP, confirmed for planning; stacks with Sprint | Actual published roster and period calendar |
| Weekend Loop (formerly Day Game) | Confirmed: each Saturday register for that Sunday's dedicated Loop claim, using full UTC-day windows. Every Season entrant is eligible without extra requirements. | 4 total SP per eligible Sunday claim: 1 claim SP + 3 game-bonus SP; four opportunities, maximum 16 SP | Publish actual Loop identity and verify its configured registration/claim boundaries before implementation |

The user has proposed five regular Loops as a working Season 01 estimate. Loop identities and final availability are not yet confirmed. The current preview still contains only three regular Loop examples; it does not yet represent the required all-Loops, three-claims-each exploration objective. The user confirmed that the required exploration roster must be fixed and published before the Season. Do not assume a six-Loop/18-claim target: Weekend Loop inclusion in that roster has not been settled, and its clarification is deferred while the user focuses on Weekend Loop's own mechanics.

## 1. 20-Day Sprint: current discussion

Confirmed revised goal: participate in at least 20 different daily Loop periods across the Season, with gaps allowed.

Confirmed by the user:

- One qualifying claim from any regular Season Loop completes a participating period. Dedicated Day Game claims do not satisfy Sprint's attendance requirement.
- At least 20 participating periods are required during the Season. These periods do not need to be consecutive. This replaces the previous perfect-attendance 30-day Sprint rule.
- Missing a period does not erase prior Sprint progress. An individual Loop streak can still reset independently when its own period is missed.
- All regular Loops use the same daily period schedule. Count one attendance unit per shared period, regardless of how many different regular Loops were claimed in that period. Raw period numbers from different contracts must be mapped to the shared Season schedule rather than assumed identical.
- Credit the one-time bonus after confirmed completion; live standings remain provisional until final review.

The user confirmed a 15-SP one-time Sprint bonus and a 30-SP Long Game bonus, with both bonuses stacking for a total of 45 SP. The 80-SP combined completion-game budget includes a 20-SP allocation reserved for the race, whose remaining design is now on hold.

The objective, counting policy, amount, overlap with Long Game and unlimited-game credit timing are agreed for planning. Publish the actual qualifying roster and aligned period calendar before launch. Extra claims within a counted participation period must not be confused with additional participation periods.

### Player-facing definition

- Goal: "Claim in 20 different daily periods during the Season."
- How: at least one qualifying claim from any regular Season Loop in each counted period. Gaps are allowed; Day Game-only participation does not count.
- Win: reach 20 distinct participating Season periods before the Season's qualifying period window ends.
- Reward: "+15 bonus SP", once, after confirmed completion.
- Example progress: "12 / 20 periods · 8 more to complete."
- Next action: open qualifying regular Loops to find an available claim. Do not promise a ready claim when availability or eligibility is unknown.

### Worked examples to validate after approval

- Claiming from three different regular Loops in the same shared participation period adds one Sprint unit, not three. All three eligible claims still receive their ordinary claim points and independent Loop progression.
- Missing one period still permits completion. For example, after 12 fully closed periods, 11 participating periods plus 18 future periods can still reach 20.
- After 26 of 30 periods have fully closed, 15 participating periods plus four remaining periods cannot reach 20. That is when the game becomes no longer achievable, rather than at the first missed period.
- A late entrant receives progress for eligible earlier claims under the backdating rule. Paying entry does not manufacture claims in missed periods.
- Twenty claims in one shared participation period do not complete a 20-period attendance objective.
- Twenty consecutive qualifying claims in a single regular Loop earn 20 claim SP and 19 streak-bonus SP (2 + 5 + 12), plus the separate 15-SP Sprint bonus: 54 SP before other applicable games. Nonconsecutive participation can complete Sprint with fewer streak bonuses; Sprint does not require a 20-claim streak.

This is an attendance objective across qualifying Loops, not a new combined personal streak. Independent Loop streaks remain separate.

## Scoring ceiling before selecting bonuses

The user requested this budgeting step before approving game reward amounts.

### Per-player regular participation maximum

For a regular Loop with 30 eligible Season claim periods, a player completing all of them earns:

- Claims: 30 × 1 = 30 SP.
- Streak bonuses, once each: 2 + 5 + 12 + 30 = 49 SP.
- Total: 79 SP for that Loop, before Season Games.

| Regular Loops, each offering 30 eligible periods | Claim SP | Streak-bonus SP | Regular-participation ceiling per player |
| --- | --- | --- | --- |
| 1 | 30 | 49 | 79 |
| 3 | 90 | 147 | 237 |
| 4 | 120 | 196 | 316 |
| 5 | 150 | 245 | 395 |

Use five regular Loops as the current planning estimate, not a finalized production roster. This yields a working regular-participation ceiling of 395 SP: 150 claim SP + 245 streak-bonus SP. The exact ceiling must use the actual eligible period count and achievable streak milestones of each Loop. A nominal 30-day date range alone does not prove exactly 30 eligible claim opportunities, particularly when Loop periods and Season boundaries differ. Eligibility restrictions can give an individual player a lower achievable maximum.

### Include timed events and completion bonuses without double counting

Let E be the number of eligible Day Game claim opportunities available to one player across the published event schedule. With dedicated event Loops excluded from the regular roster above:

**Per-player ceiling = regular-participation ceiling + 4 × E + maximum jointly achievable completion bonuses.**

- The 4 × E already includes each event claim's 1 base point and 3 game-bonus points. Do not add another ordinary claim point or a regular streak bonus for the same event claim.
- Completion bonuses can be summed only when the objectives are achievable together and their rules permit both rewards. Sprint and Long Game are explicitly allowed to stack.
- For the race, include its bonus in a player's personal ceiling only if they could qualify for a winning place.
- The regular roster, event opportunities and game reward rules are still needed before this becomes a final numerical Season cap.

### What total entries changes

Entry count does not multiply one player's scoring ceiling. It affects aggregate points awarded across participants, limited-place reward counts and Season prize distribution.

For an illustrative upper bound, assume N entrants can all achieve the same regular and event maximum R, all can complete mutually compatible unlimited games worth U additional SP, and the only limited-place game pays a fixed B SP to at most 50 winners:

**Aggregate upper bound = N × (R + U) + min(N, 50) × B.**

This is a conditional upper bound, not a prediction of actual issuance. Different eligibility, attendance, available periods and final qualification can reduce the total. Additional limited-place games require their own terms.

### User's 250-entrant planning scenario

The user confirmed that 250 entrants is a planning estimate, not a registration cap. Registration remains uncapped, and the entry-funded prize pool can grow above its $250 guarantee under the existing rules.

At 250 retained entries paying 1 USDC each, the existing prize-pool formula produces a $250 USD-value pool. Under the approved top-15% rule, the planned paid-position count is ceil(250 × 0.15) = 38. The payout curve and treatment of tied cutoff groups remain separate unresolved decisions.

Assuming each regular Loop offers 30 eligible claim periods and every entrant is eligible and completes every period:

| Regular Loops | Regular maximum per player | Aggregate regular-points upper bound for 250 entrants |
| --- | --- | --- |
| 3 | 237 SP | 59,250 SP |
| 4 | 316 SP | 79,000 SP |
| 5 | 395 SP | 98,750 SP |

These totals exclude Weekend Loop claims and all completion bonuses. The $250 cash pool is not a cap on Season points, and Season points have no fixed dollar conversion. A final launch ceiling still requires the actual regular Loop roster and eligible period counts, plus resolution of the remaining game definitions; the four Weekend Loop claim opportunities and UTC windows are now agreed.

### Completion-game budget selected for planning

The user selected the following allocation for planning. With five regular Loops providing a 395-SP regular ceiling, an 80-SP maximum in completion bonuses makes those games about 16.8% of a 475-SP personal ceiling before Day Games. This keeps a larger share of the maximum score in regular claims and independent Loop streaks. Detailed qualification, overlapping rewards and final publication readiness are still unresolved:

| Game | One-time bonus selected for planning | Intended behavior |
| --- | --- | --- |
| 20-Day Sprint | 15 SP | Participate in 20 different shared daily Season periods; gaps allowed |
| First 50 to 20 claims | 20 SP reserved; game design on hold | Limited-place race concept awaiting the user's later suggestions |
| Find your next Loop | 15 SP | Participation across the required distinct Loops |
| The long game | 30 SP | Participate in every shared daily Season period |
| Maximum combined completion bonuses, including the reserved race allocation | 80 SP | Sprint and Long Game stack; the race and exploration qualification rules still need completing |

The user selected four eligible Weekend Loop claim opportunities per player across the Season: Sunday December 6, 13, 20 and 27, with Saturday registration and full UTC-day windows. The actual deployed Loop identity and contract period mapping remain implementation work. Under the 4-SP event claim rule, these four opportunities add 16 SP. A player who can earn all four completion bonuses, including the on-hold race's reserved allocation, would have an illustrative maximum of **491 SP**.

| Point source | Maximum SP per player in the working scenario |
| --- | --- |
| Regular claims | 150 |
| Day Game base claim points | 4 |
| Independent regular Loop streak bonuses | 245 |
| Completion-game bonuses | 80 |
| Day Game bonuses | 12 |
| Total, conditional on all four completion bonuses being jointly achievable | 491 |

The four Day Game base claim points belong to claims; the 12 event-bonus points belong to game bonuses. Total game bonuses in this scenario are 92 SP (80 + 12), about 18.7% of the 491-SP maximum. Do not count the event base points twice. Sprint and Long Game stack as confirmed by the user.

The race is now on hold, so 491 SP is a planning ceiling that includes its reserved 20-SP bonus, not a finalized launch maximum. Excluding that race allocation, the other planned games give a 471-SP personal ceiling (395 regular + 45 attendance + 15 exploration + 16 Day Game). With the same perfect-participation assumptions, 250 entrants would receive at most 117,750 SP without the race. Explorer qualification and actual Loop/event calendars still need completing.

At the 250-entrant estimate, if all entrants could complete the regular participation, unlimited completion games and four event claims, but only 50 could receive the selected 20-SP race reward, the aggregate upper bound would be 250 × (395 + 15 + 15 + 30 + 16) + 50 × 20 = 118,750 SP. This remains a conditional planning example, not predicted participation or an approved points issuance target.

The working reward allocation and weekend schedule are now agreed. Remaining work is to publish the regular and required exploration rosters, verify actual eligible contract periods and return to the race only when the user resumes that discussion. Do not make an individual's bonus change with registrations unless that is an explicitly approved game mechanic.

## 2. First 50 to 20 claims: on hold

The user requested holding this game's planning because they have suggestions to discuss later. Do not finalize its ordering, tie-breaking, late-entry qualification or bonus-confirmation timing, and do not continue its interview until the user returns to it.

The user confirmed that regular Season Loop claims alone count toward this race. Claims from multiple regular Loops within the same shared period can each add one eligible claim. Day Game claims and streak/game bonus points do not add race claims.

The prior concept is first 50 entrants to 20 claims, with a 20-SP bonus reserved per winner. That target, winner count and reward remain a working allocation subject to the user's later revisions. Reaching 20 alone must not be represented as a confirmed winning place.

### Questions for its discussion

1. What changes does the user want to the target, winner count or other race mechanics?
2. Are the first 50 determined by the qualifying claim's chain order, with late entrants reconciled under the approved backdating rule?
3. When should the 20-SP reward become confirmed, given provisional late-entry qualification and unresolved ties?

### Worked examples

- At 19 eligible claims, one additional qualifying claim reaches the claim target. Receiving a streak bonus on that claim does not turn it into multiple claims.
- A Day Game claim does not advance this race under the confirmed regular-Loops-only scope, regardless of the event's 4-SP reward.
- A player can have 20 claims without being among the first 50. Keep "Target reached" separate from "Winning place confirmed."
- While late entries or ties can affect qualification, show an unconfirmed place as provisional and do not represent the game bonus as awarded.

## 3. Find your next Loop: next discussion

Confirmed revised goal: claim in every required Season Loop at least three times during the Season. This replaces the earlier once-per-Loop discovery target. "Every Loop counts" means the completion check must cover each required Loop separately; excess claims in one Loop cannot fill another Loop's missing claims.

The selected planning reward remains a one-time 15-SP completion bonus, credited after confirmed completion under the agreed unlimited-game policy. No requirement for consecutive claims has been added. A qualifying claim follows the existing Season counting rule: count each eligible Loop period once, rather than counting repeated attempts or additional within-period transactions as fresh participation.

The user confirmed that Day Game becomes a dedicated Weekend Loop, with Saturday registration and Sunday claiming. This does not make arbitrary claims from other Loops into weekend claims. The user requested focusing only on Weekend Loop questions for now. Exploration inclusion remains unresolved and should not be reopened until that discussion resumes.

### Roster policy and deferred details

- Confirmed: fix and publish the required Loop list before the Season begins. Adding another Loop later does not silently change an entrant's completion requirement.
- Deferred: identify each required Loop and settle Weekend Loop inclusion when the user returns to this objective.
- The required list must support three eligible claims from every listed Loop. Its target is not inferred from all Loops visible in the app.

### Draft player-facing definition

- Goal: "Claim at least three times in every required Season Loop."
- How: complete three qualifying claim periods in each required Loop during the Season. Claims do not need to be consecutive. Standard claim availability and eligibility still apply.
- Win: every required Loop reaches at least 3 / 3 qualifying claims.
- Reward: "+15 bonus SP", once, after confirmed completion.
- Progress: show the number of Loops that have reached 3 / 3 and each Loop's remaining claims. A total claim count alone is insufficient.
- Next action: open a required Loop that is still below three claims, prioritizing a known available claim. If the weekend Loop is required, expose its next registration and claim windows separately.

### Worked examples

- A Loop at 2 / 3 needs one more qualifying claim period. A Loop at 3 / 3 is complete for this game; further ordinary claims retain their regular rewards but cannot substitute for another required Loop.
- With N required Loop identities, the minimum is 3 × N eligible claims, and all N per-Loop counters must reach 3 / 3. The final N comes from the published required list, not an unapproved assumed Weekend Loop inclusion.
- If any required Loop cannot offer three eligible claims during the Season, revise the roster or rules before publication rather than leaving an unattainable objective.

## 4. The long game

Confirmed goal: make at least one qualifying claim in every shared daily Season period. The planned 30-day Season has 30 daily participation periods; the published period calendar must confirm their exact boundaries. The earlier 25-day objective is replaced.

All regular Loops share one daily period schedule. A player may switch which qualifying regular Loop they claim between periods. Multiple claims in the same shared period count once for attendance, while retaining their separate ordinary claim points and independent Loop progression. Dedicated Day Game-only participation does not replace a required regular Loop claim.

Confirmed reward: a one-time 30-SP bonus, credited after confirmed completion. Standings remain provisional until final review.

### Player-facing definition

- Goal: "Make a qualifying claim in every daily period of the Season."
- How: claim from at least one regular Season Loop in each shared period. No periods may be missed.
- Win: cover every qualifying period in the published Season calendar.
- Reward: "+30 bonus SP", once, after confirmed completion.
- Example progress: "12 / 30 periods · No periods missed."
- If a required period closes without a qualifying claim, show that this objective is no longer achievable. Keep Sprint progress and previously earned points intact.
- Late entry includes actual eligible earlier claims under the existing backdating policy; it cannot fill periods in which no qualifying claim occurred.

### Confirmed bonus overlap

A player can earn both the 15-SP Sprint bonus and the 30-SP Long Game bonus. Sprint is credited once its 20-period objective is confirmed; Long Game adds 30 SP once full-Season participation is confirmed. The Long Game reward does not replace, subtract or re-award Sprint's 15 SP.

### Worked examples

- Missing one fully closed qualifying Season period makes Long Game unattainable, while Sprint can remain achievable.
- Switching qualifying regular Loops between periods can preserve attendance even if individual Loop streaks differ. Multiple claims in one shared period still count as one attendance unit.
- Completing all 30 qualifying periods also meets Sprint's 20-period target, awarding 45 SP in attendance bonuses across the two confirmed completions.

## 5. Weekend Loop (formerly Day Game): agreed definition

Existing approved scoring: 1 claim SP + 3 game-bonus SP = 4 total Season points for an eligible event claim. No regular Season streak bonuses. Claims from that designated event Loop outside the window earn zero Season points from the event.

The user confirmed that Day Game becomes the Weekend Loop: a dedicated Loop to register for on Saturday and claim from on Sunday, every Season weekend. It is its own Loop, not an any-Loop participation objective. Only a qualifying claim in that designated Weekend Loop can earn its event points. Regular Loop claims and registrations do not substitute for the required Weekend Loop action.

Confirmed by the user:

- The player must register again each Saturday for that Sunday's claim. One registration does not cover the remaining Season weekends.
- Registration window: Saturday 00:00 UTC up to, but not including, Sunday 00:00 UTC.
- Claim window: Sunday 00:00 UTC up to, but not including, Monday 00:00 UTC.
- Configure and read these windows from the dedicated Loop's actual period setup; a browser timer alone does not establish eligibility.
- Every valid Season entrant may register. No additional Weekend Loop eligibility requirement is imposed.
- There are four eligible Sunday claim opportunities per player during this Season, one per weekend.
- Each confirmed eligible claim awards 4 SP: 1 claim SP + 3 game-bonus SP. Four claims award at most 16 SP: 4 claim SP + 12 game-bonus SP.
- No regular Season streak bonuses apply. Missing a weekend does not erase previous Weekend Loop points or prevent participation in a later weekend.

Each weekend is its own earning opportunity. There is no additional four-weekend completion bonus in the agreed reward schedule. A player's successful Saturday registration earns no claim points on its own; the eligible Sunday claim is the scoring action.

The flow must distinguish Season entry from Weekend Loop registration. The existing Season late-entry cutoff is December 4, before the first planned weekend, so Saturday registration must not be presented as a way to enter the Season after its deadline.

### Calendar check for the December 1–30, 2026 Season

| Weekend | Saturday registration date | Sunday claim date |
| --- | --- | --- |
| 1 | December 5 | December 6 |
| 2 | December 12 | December 13 |
| 3 | December 19 | December 20 |
| 4 | December 26 | December 27 |

All listed Saturdays use the agreed reference 00:00–00:00 UTC registration window; their following Sundays use the agreed reference 00:00–00:00 UTC claim window. Keep these dates for reference and later tests. During implementation, use the new Base Loop's known configured periods and test their boundary behavior. The four-weekend calendar matches the four eligible claim opportunities selected for planning. The old December 12–13 UI window remains a separate old fixture and does not implement these new rules.

### Player-facing definition

- Goal: "Register Saturday. Claim Sunday."
- How: register in this dedicated Weekend Loop during Saturday's window, then make its eligible claim during Sunday's window. Repeat the registration step for each weekend you want to participate in.
- Eligibility: "Open to all Season entrants."
- Earn: "+4 SP per Sunday claim", explained as "+1 claim SP +3 game-bonus SP."
- Season progress: "2 / 4 weekend claims · 8 SP earned", based only on confirmed eligible claims.
- Maximum: "Up to 16 SP this Season."
- Timing: show the next relevant registration or claim deadline, explicitly in UTC. A local-time helper may be supplementary, not a replacement for the published window.

### Weekend states and next action

| State | What the player needs to know | Next action |
| --- | --- | --- |
| Wallet or Season entry not verified | Personal eligibility and registration are not yet known | Check wallet/Season entry; do not promise a ready claim |
| Before Saturday | Exact next Saturday opening time | View the Weekend Loop and its upcoming registration window |
| Saturday, not yet registered | Register for the following Sunday before Sunday 00:00 UTC | Register for Sunday |
| Saturday, registration confirmed | Registration is complete for this weekend only; Sunday opening time | Show Registered and the claim-opening countdown |
| Sunday, registration confirmed, not claimed | Eligible dedicated Loop claim is available until Monday 00:00 UTC | Claim +4 SP |
| Sunday, no qualifying Saturday registration | This weekend's registration window was missed | Show the next weekend's registration window; do not offer this Sunday's claim as eligible |
| Sunday, claim confirmed | Credit +1 claim SP and +3 bonus SP once | Preserve the confirmation and show the next weekend window |
| Claim transaction confirmed but scoring not refreshed | Token transaction success and Season scoring confirmation are distinct | Show Points updating; do not invent another credit or rank change |
| Sunday window ended without an eligible claim | No Weekend Loop SP was earned for that weekend | Show next registration, without removing previous weekend points |
| Final Sunday window ended | All Season weekend opportunities have ended | Show confirmed weekend history and total points |

Missing Saturday registration means no eligible claim for that Sunday. Missing the Sunday window means that weekend's Season points cannot be made up by a claim outside its event window. Underlying token rewards, if any, still follow the actual Loop rules; do not invent token forfeiture or token carryover behavior in the Season explanation.

### Worked examples

- One eligible event claim earns 4 total Season SP: 1 claim SP + 3 game-bonus SP. It does not earn 4 SP plus another claim point.
- The event claim receives no regular Season streak bonus, even if an ordinary Loop would otherwise be at a milestone.
- A token claim outside the designated window can still follow its underlying Loop's reward rules, but contributes zero Season SP from this event Loop.
- If the event covers a single claimable period and the player has already claimed it, show "Claimed" and the credited breakdown. Do not leave an enabled claim action or imply another event reward is available.

### Acceptance cases for later implementation

- Saturday 00:00 UTC opens this weekend's registration; Sunday 00:00 UTC closes it and opens claiming; Monday 00:00 UTC closes the claim window.
- A valid Season entrant needs no extra human-score, community-membership or special Weekend Loop eligibility check.
- A player registered for weekend 1 must register again for weekend 2. Weekend 1 registration alone does not authorize weekend 2's claim.
- Saturday registration without an eligible Sunday claim earns no Weekend Loop SP.
- One confirmed eligible Sunday claim credits exactly 4 SP, split 1 claim + 3 game bonus, with no regular Season streak award.
- Failed registrations do not produce a confirmed registration state. Failed claims do not produce a success receipt or points.
- Retrying, refreshing or receiving the same confirmed claim twice does not duplicate the weekend credit. Count one eligible claim per player per weekend.
- A regular Loop claim on Sunday does not satisfy this dedicated Weekend Loop claim.
- Missing one weekend leaves prior earned points intact and later weekends available under their own registration rules.
- Four successful weekend claims produce 16 SP, split 4 claim + 12 game bonus. There is no extra fifth point, regular streak bonus or additional completion prize.
- Publish and verify the actual Loop/contract period schedule before presenting these planned windows as a live claim promise.
- Use the reference dates as test fixtures, then check them against the new Base deployment's known period configuration. Verify transitions immediately before, at and after registration opening, registration closing/claim opening, and claim closing; do not derive live availability from hardcoded example dates.

## Timing and presentation decisions shared by all games

The following includes confirmed policies and remaining questions:

- Attendance counting uses a shared daily period schedule across all regular Season Loops. Publish the actual first/last Season participation periods and exact boundaries. Independent raw Loop period numbers cannot be assumed equivalent across different contracts; use the shared period schedule for attendance attribution.
- Unlimited completion bonuses appear after confirmed completion; standings stay provisional until final review. Limited-place race qualification still needs a separate confirmation rule.
- Late entry: count eligible historical actions without counting the registration transaction as a claim or active day.
- Game overlap: disclose which objectives one claim can advance and which completion bonuses can coexist.
- The required exploration roster is fixed and published before the Season begins; later additions do not silently change that completion target. Actual roster identities and Weekend Loop inclusion are still unresolved.
- Progress and awarded points are distinct: a full progress bar must not imply an unpublished or unconfirmed reward was credited.

## Shared card contract after rules are agreed

- Goal in one short sentence.
- Explicit progress and remaining qualifying actions.
- Exact bonus identified separately from ordinary claim and streak points.
- Eligible Loops and time boundaries available in details.
- A next action that leads to the relevant claim opportunity.
- Appropriate states: scheduled, in progress, completed, no longer achievable, ended and qualification under review where applicable.
- Award status that distinguishes objective completion from a confirmed bonus credit.

Final copy, examples and acceptance cases will be recorded for each game as decisions are confirmed. Artwork and frontend changes follow those definitions.
