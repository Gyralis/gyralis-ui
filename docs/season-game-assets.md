# Illustrated Season Games

Implemented in the existing Games page and linked Explore teasers. The shared header, Season Games / Prizes & Rules tabs, 1080px content geometry and embedded right side are retained. Cards use the same background gradient as the Season Points card: `linear-gradient(145deg, #141f1e 0%, #101516 72%)`.

## Artwork and exact prompts

All five illustrations were generated with built-in image generation, visually inspected as standalone assets and saved as 1254 × 1254 transparent RGBA PNGs. Dark satin green materials and restrained emerald edges match the approved header artwork. No blue halo was requested. The user explicitly selected keeping these images.

| Game            | Saved asset                                                      | Exact generation prompt                                          |
| --------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------- |
| Half Season In  | [sprint.png](../public/games/sprint.png)                         | [Sprint prompt](game-art-sprint-prompt.md)                       |
| All Season Long | [long-game-calendar.png](../public/games/long-game-calendar.png) | [Checked calendar prompt](game-art-long-game-calendar-prompt.md) |
| The Rule of 3   | [explorer.png](../public/games/explorer.png)                     | [Explorer prompt](game-art-explorer-prompt.md)                   |
| Weekend Ritual  | [weekend-claim.png](../public/games/weekend-claim.png)            | [Weekend prompt](game-art-weekend-prompt.md)                     |
| Claim Race      | [race-finish.png](../public/games/race-finish.png)               | [Race prompt](game-art-race-prompt.md)                           |

## Implemented frontend behavior

- Shared card hierarchy: type/status, title, subtitle, available bonus, bonus earned, progress and details action. Artwork is decorative, cropped within the card and faded behind readable text.
- Half Season In shows +15 Season Points for 15 participating periods; gaps are allowed. All Season Long shows +30 Season Points for all 31 periods. Both calendars show December 1–31 with date/status tooltips. Both rewards stack, with separate per-Loop streaks preserved.
- Explorer shows +9 SP and the three-claims-per-required-Loop rule. Its final required roster is not inferred from the existing preview Loops; the card and details explicitly show the pending list and award no completion bonus until a roster is configured.
- Weekend shows +3 extra Season Points per eligible Sunday claim, without the 1 + 3 breakdown or a repeated card footer. Four December Sunday stops replace its progress bar; the line follows reference time and only claimed dates show green checkmarks. Saturday registration and Sunday claiming are separate preview actions, with fresh registration required for each weekend. Internal scoring remains 4 claim SP +12 game-bonus SP across four claims.
- Weekend details include confirmed/missed/ended states, per-weekend history and compact reference-clock controls for testing the flow without changing live contracts or making wallet transactions.
- Claim Race begins with Gardens Race: first 10 entrants to 10 Gardens claims. Only Gardens progress counts; no streak is required. Its 10-SP allocation remains reserved; target completion does not confirm a winner or award points.
- Sample claim scoring and the shared Season summary reconcile the claim, streak and game components. Confirmed completion bonuses are derived once rather than repeatedly accumulated on refresh.
- Explore uses the same game definitions, artwork and approved reward amounts, with no obsolete pending-reward or old Sprint/Long Game objectives.
- Loops directory count reads dynamically as “4 Active Loops · Claim every day” for the current four-Loop roster.

## Validation scope

- 60 focused tests passed across game scoring, reference-window boundaries, preview interactions, card rendering, Season Points and Loop streak presentations.
- TypeScript and targeted lint passed before the final background/copy refinement; those refinements receive focused lint, CSS parsing and whitespace checks.
- Deployed contract period tests are not represented as completed: all weekend timestamps here are reference fixtures, and the new Base contracts remain separate implementation work.
- Browser visual verification is blocked. The sandbox rejected the local server's port binding; the request to run it outside the sandbox was declined. No browser screenshot, responsive rendering or visual comparison pass is claimed.
