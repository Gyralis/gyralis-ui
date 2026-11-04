# Illustrated Season Games

Implemented in the existing Games page and linked Explore teasers. The shared header, Season Games / Prizes & Rules tabs, 1080px content geometry and embedded right side are retained. Cards use the same background gradient as the Season Points card: `linear-gradient(145deg, #141f1e 0%, #101516 72%)`.

## Artwork and exact prompts

All five illustrations were generated with built-in image generation, visually inspected as standalone assets and saved as 1254 × 1254 transparent RGBA PNGs. Dark satin green materials and restrained emerald edges match the approved header artwork. No blue halo was requested. The user explicitly selected keeping these images.

| Game | Saved asset | Exact generation prompt |
| --- | --- | --- |
| 20 Days In | [sprint.png](../public/games/sprint.png) | [Sprint prompt](game-art-sprint-prompt.md) |
| All Season Long | [long-game.png](../public/games/long-game.png) | [Long Game prompt](game-art-long-game-prompt.md) |
| Complete the Circuit | [explorer.png](../public/games/explorer.png) | [Explorer prompt](game-art-explorer-prompt.md) |
| Weekend Ritual | [weekend.png](../public/games/weekend.png) | [Weekend prompt](game-art-weekend-prompt.md) |
| Claim Rush | [race.png](../public/games/race.png) | [Race prompt](game-art-race-prompt.md) |

## Implemented frontend behavior

- Shared card hierarchy: type/status, title, subtitle, available bonus, bonus earned, progress and details action. Artwork is decorative, cropped within the card and faded behind readable text.
- Sprint shows +15 bonus SP for 20 participating periods; gaps are allowed. Long Game shows +30 SP for all 30 periods. Both bonuses stack, with separate per-Loop streaks preserved.
- Explorer shows +15 SP and the three-claims-per-required-Loop rule. Its final required roster is not inferred from the existing preview Loops; the card and details explicitly show the pending list and award no completion bonus until a roster is configured.
- Weekend shows +3 bonus SP per eligible Sunday claim, with the separate +1 claim point and 4-SP total explained. Saturday registration and Sunday claiming are separate preview actions, with fresh registration required for each weekend. Four claims contribute 4 claim SP +12 game-bonus SP.
- Weekend details include confirmed/missed/ended states, per-weekend history and compact reference-clock controls for testing the flow without changing live contracts or making wallet transactions.
- The race remains on hold. Its 20-SP allocation is displayed as reserved and contributes no awarded points.
- Sample claim scoring and the shared Season summary reconcile the claim, streak and game components. Confirmed completion bonuses are derived once rather than repeatedly accumulated on refresh.
- Explore uses the same game definitions, artwork and approved reward amounts, with no obsolete pending-reward or old Sprint/Long Game objectives.
- Loops directory count reads dynamically as “4 Active Loops · Claim every day” for the current four-Loop roster.

## Validation scope

- 60 focused tests passed across game scoring, reference-window boundaries, preview interactions, card rendering, Season Points and Loop streak presentations.
- TypeScript and targeted lint passed before the final background/copy refinement; those refinements receive focused lint, CSS parsing and whitespace checks.
- Deployed contract period tests are not represented as completed: all weekend timestamps here are reference fixtures, and the new Base contracts remain separate implementation work.
- Browser visual verification is blocked. The sandbox rejected the local server's port binding; the request to run it outside the sandbox was declined. No browser screenshot, responsive rendering or visual comparison pass is claimed.
