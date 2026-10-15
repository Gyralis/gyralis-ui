# RWAGMI creator eligibility

## API

`POST /api/rwagmi` accepts:

```json
{
  "userAddress": "0x1111111111111111111111111111111111111111",
  "tokenAddress": "0xb200000000000000000000Bf0548AB2ebD00bA5e"
}
```

Both addresses are required, trimmed, and validated. RWAGMI token lookups always
use Base (`8453`). This standalone check needs no Loop address, RPC or signing
key and generates no registration signature. It verifies the supplied wallet;
HTTP caller ownership is not authenticated. Registration rechecks
eligibility and binds approval to the wallet, Loop and next period.

Success (`200`):

```json
{
  "success": true,
  "eligible": true,
  "checks": { "passport": "passed", "creator": "passed" }
}
```

Failures include `success: false`, `eligible: false`, `code`, a human-readable
`error`, and `checks`. Each check is `passed`, `failed`, `not_checked`, or
`unavailable`. Unavailable checks are never described as creator mismatch.

| Status | Code                          | Meaning                                                         |
| ------ | ----------------------------- | --------------------------------------------------------------- |
| 400    | INVALID_REQUEST               | Missing or invalid address, or malformed JSON.                  |
| 403    | PASSPORT_SCORE_REQUIRED       | Missing or insufficient Passport score; creator is not checked. |
| 403    | PROVIDER_ELIGIBILITY_REQUIRED | Connected wallet did not create this token.                     |
| 404    | TOKEN_NOT_FOUND               | Token has not been indexed; new launches may need a minute.     |
| 503    | PASSPORT_UNAVAILABLE          | Passport network or response error.                    |
| 503    | RWAGMI_RATE_LIMITED           | RWAGMI is busy; honor Retry-After.                              |
| 503    | RWAGMI_DATA_STALE             | Indexer is unconfigured, errored, or stale beyond five minutes. |
| 503    | RWAGMI_UNAVAILABLE            | Network, timeout, invalid response or lookup capacity error.    |
| 500    | INTERNAL_ERROR                | Invalid server threshold configuration.                         |

Configure the existing `GITCOIN_PASSPORT_API_KEY`,
`GITCOIN_PASSPORT_SCORER_ID`, and `THRESHOLD_SCORE`. Threshold defaults to zero,
matching the existing APIs; an actual valid Passport score is still required.
Null, empty, missing, negative and nonnumeric scores cannot pass.

## Backend optimization

Passport is checked freshly first using the unchanged shared helper, just like
the other Loops. Only when it
passes does the server fetch
`https://rwagmi.com/api/launches?chainId=8453&token=<address>`, with a descriptive
User-Agent and eight-second timeout. It compares `creator`, not `tokenAdmin`,
and confirms the returned token matches the request, ignoring address case.

Validated launch data is cached for 60 seconds; missing launches for 30 seconds.
Expiry also respects the five-minute indexer freshness window. Errors are not
cached. Concurrent lookups share a request per lowercase token; cache and
in-flight maps are each bounded at 256 entries per server instance. This is not
a distributed cache or global rate limiter. All API responses are private/no-store.

## UX

Token setup is inline beside the existing Eligibility row on Loop cards whose
provider is `rwagmi`. Add token and Change token open the dialog; there is no
separate token section below the row. The eligibility link opens
`https://rwagmi.com/launch`. The development roster includes the standard Base test Loop
`0xe714bc7F58726490a15d2197BCded598223f5319`. Its token is RWAGMI
(`0xb200000000000000000000Bf0548AB2ebD00bA5e`), with 86,400-second (daily) periods
and 10% per-period distribution, verified by contract reads. It is omitted
from production and achievements and has no indexed dashboard history. Registration
uses `POST /api/rwagmi/register` for this allowlisted standard Loop in development.
Production excludes the test Loop and rejects registration requests for it.
SuperLoop registration remains disabled.

Users connect a wallet, select Add token, and enter the address in a dialog.
Save and check persists a valid address before checking. Changing uses a draft;
Cancel preserves the existing token/result. Remove token clears the address and
result but does not affect onchain registration. Save and check sends no wallet
transaction; the Loop card’s entry/claim action asks the user to sign one.

Only addresses are stored under
`gyralis:rwagmi-token:v1:8453:<lowercase wallet>`. Browser storage failures fall
back to session memory with an explanation. Reload restores an address without
approval or an automatic check. Wallet changes discard the old controller;
superseded requests are aborted and late responses ignored.

The card and dialog show Passport and creator outcomes separately. All errors
are inline with retry or corrective actions, including a Retry-After countdown.
Checks happen on explicit submission only; there is no typing fetch or polling.

## Registration testing

Run the app in development (`pnpm dev`) and open `/loops`. Connect the creator
wallet, save its RWAGMI launch token address on the RWAGMI (Test) card, then use
the card's entry or claim action. The supplied Loop contract is distinct from the
user's launch token address. The token the Loop pays is RWAGMI.

`POST /api/rwagmi/register` accepts the standalone payload plus
`loopAddress: "0xe714bc7F58726490a15d2197BCded598223f5319"` and `chainId: 8453`.
It validates the enabled provider/chain/contract allowlist, reruns Passport and
creator checks, reads the current period, and returns an EIP-712 `signature` and
`nextPeriod`. It does not send a transaction. The browser calls `claimAndRegister`
with the signature for the original wallet, and refuses to use it if the saved
token changed while checking.

Configure `TRUSTED_BACKEND_SIGNER_PK` to match the Loop's trusted backend signer.
An absent/invalid key returns `INTERNAL_ERROR`; RPC failures return
`LOOP_UNAVAILABLE`. Eligibility errors retain their statuses and retry headers.
Signatures are never cached. Daily periods can roll over while the wallet
prompt is open; retry to obtain an approval for the new period if necessary.
