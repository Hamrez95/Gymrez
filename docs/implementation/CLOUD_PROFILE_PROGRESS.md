# Cloud persistence and profile avatars — review candidate

The deployed guest build previously ignored Supabase entirely. The active implementation was on `feat/t06-invite-auth`, while `main` still contained the foundation. This change builds on that active implementation.

Implemented:
- Signed-in sessions now use their RLS-scoped profiles even when guest preview is enabled.
- Dashboard, archive, body measurements, workout player and history use the same repository. Signed-in writes reach PostgreSQL; guest writes remain explicitly local.
- PDF imports use private Storage; imports and active-program selection use transactional, invoker-rights RPCs. Published archive metadata and versions remain immutable.
- Session edits use revision comparisons; a conflict or failed write is reported as failure.
- Profile avatars appear in the chooser, switcher, dashboard and profile. Personalized faces are fetched through expiring signed URLs from private Storage; only fictional fallback artwork is committed.
- Decorative slashes were removed from page headings.
- A private connection-link handler can establish a persistent device session without a login form. It removes its credential fragment before submitting the sign-in request. No credential is committed.

Private backend records were imported from the supplied archive outside Git. Personal source files and seed SQL were not committed.

## Explicitly incomplete
- Automatic approval review rejected creating the technical Auth account and uploading personal PDFs/face avatars through a temporary service endpoint. No Auth user or Storage object was created; both temporary endpoints have been disabled (JWT required, HTTP 410).
- The user must explicitly authorize those actions before private device access, file transfer and authenticated end-to-end checks can proceed. Do not retry or replace the blocked actions indirectly.
- No deployment or completed-feature claim is made for this candidate.
- Offline outbox, local-to-cloud migration and full visual comparison remain open. Cloud operations currently require connectivity.
- Existing PDF content hashes are immutable. Enriching an already-imported cloud PDF with a newly structured plan needs a separate version/import workflow; it is not supported by this first cloud import endpoint.

## Verification
- TypeScript, ESLint, unit checks and production build run locally; see CI for the final commit results.
- Supabase security advisor returned no findings after the cloud schema migration.
- SQL checked anonymous grants and RLS, and verified that published archive metadata rejects edits.
- Local Playwright execution could not launch Chromium: the host denied its Unix socket (`Operation not permitted`). Browser assertions were not executed locally; CI is the remaining browser validation.
- Public evidence contains synthetic fixtures only; personalized likeness assets and private measurements must stay outside this repository.
