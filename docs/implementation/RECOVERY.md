# Gymrez recovery and release guide

Production: https://hamrez95.github.io/Gymrez/ . Source: Hamrez95/Gymrez. The Pages workflow builds only main; no paid hosting or extra backend is required by this release.

## Identify the data mode first

A signed-out preview explicitly says its data belongs to this browser. It does not show private shared programs. Use the previously issued private connection file/link on an authorized device to reconnect; do not put that file, its fragment, screenshots of its credentials or an Auth password in Git, an issue or a public message. Once connected, select the intended profile. A profile switch is not account authentication.

## Temporary network or backend failure

1. Keep the same browser/origin. Previously downloaded private training data has its own scoped IndexedDB cache.
2. Workout and manual-measurement actions first save on the device. Wait for the local save to finish before closing/reloading. The sync panel tells whether changes remain unsent.
3. Foreground/resume/reconnect retry automatically; the sync button requests an immediate retry. No background worker is required for data delivery.
4. If Supabase is paused, the owner can resume the existing project from its dashboard; do not provision a replacement project or clear browser storage. Reconnect/retry after service availability returns.
5. If authentication expired or was revoked, reconnect to the same private account. Pending operations remain bound to their original user/household/profile and are not sent as a different account.
6. For a conflict, download the preserved local copy if needed, then explicitly choose/confirm the server version. There is no silent last-writer-wins overwrite. The recovery JSON is not a complete account backup or an automatic restore/import feature.

Never clear site storage, uninstall/reset the browser, change hosting origin or rotate the shared account while unsent work remains without first recovering that work. The ordinary logout button blocks outstanding writes and clears private cached data only when safe.

## Static shell and PWA

The service worker caches only a public allowlist: compiled shell assets, fonts, fictional fallback artwork, icons, manifest and the entry HTML. Private Supabase requests, device credentials and private avatars are excluded. Initial download/installation and a fresh account connection need internet. A previously installed shell can reopen during a temporary full outage. Unsupported browsers without Web Locks preserve the queue but do not automatically send it; use a supported browser for synchronization.

A waiting app update is offered explicitly. Finish the local save before applying it. Do not force-reload mid-input. App updates do not import a new monthly program.

## Verify a release

- Require typecheck/lint/unit/build and the appropriate browser checks. The synthetic PWA browser project uses a separate local production build and never connects to production data.
- Confirm the Pages workflow deploys the expected main commit. Fetch the published HTML and its hashed asset plus sw.js; compare them with that release's build.
- Smoke the chooser, private connection/profile, active plan, workout/history and manual readings on the intended devices. Keep all personal data out of public QA artifacts.
- For a regression, revert the offending source commit through a reviewable change and deploy main. Avoid clearing user storage as a troubleshooting shortcut. Preserve pending operations and immutable workout snapshots.

The full settings/backup/restore interface and the two-person real-device pilot remain T20 and T24.
