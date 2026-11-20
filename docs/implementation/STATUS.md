# Gymrez — current execution status

Production baseline: main/e7e8d02 on https://hamrez95.github.io/Gymrez/ . The current continuation reconciles previous branch source and adds durable private training writes. Production verification of this continuation must be recorded after its CI/deployment.

## Current change

- Recovered T07 program manager, repository, CSS and RPC migration source are preserved. The unfinished manager stays unexposed until catalog/exercise editing produces playable published plans.
- Private user/household/profile IndexedDB cache and atomic outbox cover workout start, set/rest changes, completion, cancellation and manual body readings.
- Stable IDs/revisions, ordered foreground/reconnect retry, backoff, account checks, cancellation tombstones and explicit server/conflict choice preserve local work.
- Save wording distinguishes device storage from server acknowledgement. Logout blocks outstanding writes and clears the completed account's private cache.
- Downloaded profile/program/workout/measurement data can be read during transient private-API failure. Initial download and reauthentication still need connectivity.

## Validation and limits

TypeScript, lint, 17 unit tests and production build pass locally. Chromium launch is denied by this host's Unix socket restriction; synthetic two-device mobile/desktop checks run in CI. T17 acceptance and release verification stay pending until those results and screenshots are reviewed. Complete production app-shell-offline/update behavior belongs to T18; exact comparison against all eight original mockups remains T21.

No personal files, credentials or seed datasets are committed. RLS and private Storage remain in place; avatars are the previously provisioned private files. Preview-only browser archives are not silently moved to a private account.

## Remaining work

See [TASK_AUDIT](TASK_AUDIT.md): 2 of 24 tasks formally closed, 22 open with substantial partial implementation. Continue with full catalog/program editing and published-plan adapter (T08/T09/T07), import preview (T10), remaining history/body/settings/PDF/backup, production PWA verification, final art/motion, exact-reference review and the two-person pilot.
