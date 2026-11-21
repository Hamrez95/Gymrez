# Gymrez — current execution status

Production URL: https://hamrez95.github.io/Gymrez/ . Release source: PR #37, reconciling previous branches and adding durable private training writes. Functional code at 25ae9fcd passed Quality run 81; the Pages workflow records the actual deployed main commit.

## Current change

- Recovered T07 program manager, repository, CSS and RPC migration source are preserved. The unfinished manager stays unexposed until catalog/exercise editing produces playable published plans.
- Private user/household/profile IndexedDB cache and atomic outbox cover workout start, set/rest changes, completion, cancellation and manual body readings.
- Stable IDs/revisions, ordered foreground/reconnect retry, backoff, account checks, cancellation tombstones and explicit server/conflict choice preserve local work.
- Save wording distinguishes device storage from server acknowledgement. Logout blocks outstanding writes and clears the completed account's private cache.
- Downloaded profile/program/workout/measurement data can be read during transient private-API failure. Initial download and reauthentication still need connectivity.

## Validation and limits

TypeScript, lint, 18 unit tests and production build pass locally and in [Quality run 81](https://github.com/Hamrez95/Gymrez/actions/runs/44831414733). All 15 browser checks passed, including two-device mobile/desktop and production PWA full-internet-outage/reload/reconnect. The PWA check found and verified the fix for a public-shell Vary-header cache miss. Authenticated real-database rollback tests passed; no test rows remain. Screenshots and reference overlay were reviewed. The exact-reference visual gate keeps T17 formally open; complete installation/update/pilot coverage remains T18/T24 and all eight mockup comparisons remain T21.

No personal files, credentials or seed datasets are committed. RLS and private Storage remain in place; avatars are the previously provisioned private files. Preview-only browser archives are not silently moved to a private account.

## Remaining work

See [TASK_AUDIT](TASK_AUDIT.md): 2 of 24 tasks formally closed, 22 open with substantial partial implementation. Continue with full catalog/program editing and published-plan adapter (T08/T09/T07), import preview (T10), remaining history/body/settings/PDF/backup, production PWA verification, final art/motion, exact-reference review and the two-person pilot.


## Continuation — T10 archive preview (2026-11-21)

Confirmed previous merge 61dc5a7 is deployed: main Quality run 83 and Pages run 9 succeeded; production returned HTTP 200. The existing private database has both profiles and five program records (read-only count verification).

Archive selection now validates and displays destination profile, storage mode, program/PDF titles, dates, weekly sessions, exercises/sets/reps/rest and measurement count before any writes. Cancel discards preparation. Confirmation imports with stable content IDs; it never activates a plan implicitly. Activation remains a separate existing action. An account change between preview and confirmation is rejected. Cloud batch retries preserve completed items; batch import is not claimed atomic.

TypeScript, ESLint, 21 unit tests and production build passed locally. Local browser execution is blocked at Chromium launch by the host's Unix socket policy; updated mobile/desktop E2E checks and preview screenshots must pass in GitHub CI before merge. This is a scoped T10 improvement; manifest fetching, complete immutable version import, editor/catalog and exact visual acceptance remain open. No roadmap issue is marked complete by this change.
