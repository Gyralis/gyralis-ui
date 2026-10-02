# Road to 10K banner review

Reference: user-provided two-panel fundraising banner, adapted to community claims.

Implemented:
- Existing dashboard-header.png background, rounded outer banner.
- Milestone badge and requested True Looper headline.
- Two-thirds claims panel and one-third reward panel on desktop, stacked on mobile.
- Navbar glass treatment: background/75, backdrop-blur-xl, matching shadow.
- Wider progress track, moving count callout, no intermediate milestones or Refresh button.
- Unlock Reward: $50 USDC; claims remaining and last successful fetch time.
- Existing optimistic updates, animations, reconciliation, and reduced-motion support retained.

Validation: formatting and ESLint pass. TypeScript reports the existing error in components/providers/rainbow-kit.tsx:30.

Browser verification is blocked: Playwright's local cache was incomplete; the requested temporary package download was declined. No new desktop/mobile screenshot or visual comparison was completed for this revision.

final result: blocked
