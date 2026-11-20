# T17 — durable private training writes

## Implementation in this continuation

Workout start, set/rest updates, completion, empty-session cancellation and manual body readings commit atomically to user/household/profile-scoped IndexedDB cache plus an outbox. Preview archives remain in their separate local database. Reads cache the downloaded program metadata, workouts and measurements; transient service failure falls back only to that authenticated identity's cache. Initial downloads still require a connection.

Every queued action has a stable UUID, an ordered timestamp and a stable entity UUID. Workout updates retain the original expected revision and exact snapshot for retry; the existing transactional RPC rejects concurrent changes and recognizes an identical retry. Measurements retain their insert UUID. Cancellation uses an `abandoned` tombstone rather than an ambiguous delete.

Foreground, online, visibility/resume and explicit retry drain the queue under a Web Lock. Identity is checked before every request. Transient errors back off to 60 seconds; permanent errors require explicit retry, and conflicts block later actions for that entity. Other entities can proceed. Expired/revoked authentication requires reconnection; it does not discard the queue. Browsers without Web Locks retain writes but do not auto-send them.

The shared status panel distinguishes device storage, pending sends, conflicts and no outstanding writes. Conflicting local copies remain exportable; selecting the server version requires a second explicit confirmation and a successful fetch before removal. This intentionally offers a server choice plus recovery export, not an unsafe overwrite/automatic merge of logged sets. Logout is blocked while the account has pending writes, including other profiles; once safe, its private cache is cleared.

## Validation

- TypeScript, ESLint, production build and 17 unit tests pass locally.
- Six new tests exercise actual IndexedDB via fake-indexeddb: reopen durability/order; ambiguous insert retry; conflict with blocked descendants and separate measurement delivery; stale local write/account switch isolation; cancellation/measurement retry; and stale fetch versus a new local write.
- The synthetic two-device browser scenario tests API outage, reload, conflict/server selection, resumed offline completion and measurement delivery. Mobile/desktop screenshots are captured by CI under `evidence/T17`.
- Authenticated real-database rollback verification passed revision checks, duplicate snapshot/finish retry, exactly one normalized set, stale conflict rejection, cancellation tombstone and stable measurement insert. Fixtures were rolled back. The security advisor reports only the previously documented disabled compromised-password screening warning.
- Local Chromium cannot launch because the host denies its Unix socket. Browser validation and screenshot review must be recorded from CI before release acceptance.

## Scope and remaining acceptance

T17 remains open until CI and the associated screenshots are reviewed. A complete offline app-shell reload is T18's production service-worker scenario; the new browser scenario deliberately keeps the app host reachable while the private API is disconnected. No public service-worker cache contains private API responses or avatars. Browser-only preview archives are not silently migrated to a private profile. Full exact-reference comparison remains T21; the new sync states do not exist as complete panels in the original sheets and use the current PACE tokens.
