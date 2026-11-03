# Shared token amount formatting

`formatTokenAmount` and `TOKEN_AMOUNT_FORMATS` are exported from `lib/utils/token-amount.ts`. Import that module directly in display components. It is a pure shared utility usable in server and client code, with no environment variables, fetching, wallet state or cache.

```ts
import {
  formatTokenAmount,
  TOKEN_AMOUNT_FORMATS,
} from "@/lib/utils/token-amount"

formatTokenAmount(rawAmount, {
  decimals: token.decimals,
  symbol: token.symbol,
  ...TOKEN_AMOUNT_FORMATS.claim,
})

// Decimal strings returned by APIs are already in token units.
formatTokenAmount("1234.56789", {
  symbol: "HNY",
  ...TOKEN_AMOUNT_FORMATS.dailyReward,
})
```

Raw token unit decimals and display precision are different inputs. Always obtain raw unit decimals from the token's metadata. An underlying USDC token and its SuperToken can have different decimals and labels; formatting must not choose the asset or assume 18 decimals.

The shared policies currently retain these display contexts:

| Policy         | Fractional digits | Behavior                                                                |
| -------------- | ----------------- | ----------------------------------------------------------------------- |
| `claim`        | Exactly 3         | Decimal rounding; shared by both claim controllers and activity amounts |
| `dailyReward`  | Up to 6           | Decimal rounding and comma grouping                                     |
| `balance`      | Up to 1           | Truncate                                                                |
| `distribution` | Up to 2           | Truncate                                                                |
| `details`      | Up to 4           | Truncate; includes claim toasts and participant payouts                 |
| `estimate`     | Up to 7           | Truncate; animations can request fixed digits and zero frames           |

All policies use the same decimal-string/bigint implementation. Large amounts never pass through JavaScript `Number`. Unknown values/metadata return an unavailable marker, real zero remains zero, and a nonzero amount below display precision returns a bound such as `<0.001`. Negative flow values use the corresponding negative bound. Precision options are validated. Caller-specific fixed/trimmed digits and grouping remain configurable.

Daily normalization and monthly flow calculations remain domain helpers. They calculate with bigint and delegate display formatting to this utility. Daily normalization retains enough precision to represent fractional estimates even when a token has zero raw fractional digits. Animated zero frames deliberately opt out of the tiny-value bound to keep a stable counter.

The Loop card's Daily rewards metric is the **total Loop pool**, not an individual reward. `formatDailyRewardAmount` accepts either `totalPeriodPayout` with the Loop's `periodLength`, or `flowRatePerSecond` for a streaming Loop. The latter uses the full 24-hour inflow without dividing by participant count and remains available when participant lookup fails. The claim button continues to show the wallet's individual payout. Historical per-wallet card fixtures are explicitly labeled “Daily example / wallet.”

Migrated in the `/loops` pass: standard/SuperLoop claim and reward displays, participant payouts, legacy Loop balance/settings/table/claim displays, animated rewards, daily/monthly display helpers, wallet balance, directory reward examples, shared activity rail and claim toasts. `trimFormattedBalance` remains a deprecated compatibility adapter that delegates to the shared formatter; no Loop component still imports it.

Dashboard table/chart token formatters and the Connext form still require migration in their page/component passes. They are not claimed to be unified yet. Keep Viem `formatUnits` in API/data adapters that serialize full-precision values; those conversions are not presentation formatting. Percentage, score, date and animation-position formatting are also separate concerns.

Regression coverage checks 0/6/18-decimal tokens, large exact values, truncation/rounding and carry, fixed/trimmed digits, zero/tiny/missing values, negative values and animation frames. Full-suite check after the initial migration: 392 passed and the same pre-existing sponsor-link source assertion failed. TypeScript and targeted ESLint passed; browser rendering has not been inspected in this pass.
