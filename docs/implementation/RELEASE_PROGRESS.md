# Gymrez release — private training workspace

## Delivered implementation
- Signed-in RLS-scoped programs, body readings, workout sessions and private PDF downloads.
- Shared device access through a private connection link, without a manual login form. A link is a credential and must never be put in Git or shared publicly.
- Personal avatars loaded from private Storage into the chooser, switcher, dashboard, training, progress and profile screens. Public source contains fictional fallbacks only.
- Transactional set logging: each snapshot save atomically records normalized `performed_sets`, rejects stale revisions, preserves previous logged sets and safely accepts an exact retry.
- Deadline-based rest timer, superset ordering, previous exercise performance and weight prefill, session history and successful-save feedback.
- Original SVG motion studies mapped to the supported movement families, with pause/start/end controls; these are explicitly labelled schematic. No commercial exercise videos or uncertain-license imagery were copied.
- Real completed-session totals, lifting volume (timed tasks excluded), primary-muscle set distribution, best logged weights and a navigable Persian monthly workout calendar. Empty history stays empty.
- PACE route transitions, animated active navigation, press/loading feedback, checkmark completion, anatomical highlighting and chart reveals. Reduced motion remains supported.
- Installable manifest/icons and a versioned static-shell service worker. Private API responses, credentials and avatars are never placed in a public cache. App-shell caching is not offline cloud-data synchronization.
- Deployment workflow now publishes only `main`.

## Authorization and private backend
The user explicitly authorized the technical account and personal-file transfer in the current conversation. The account and household membership were provisioned, five supplied PDFs and both personalized avatar files were uploaded to private Storage, and both temporary endpoints were disabled afterward. No credentials, identifiable photos, personal source PDFs or seed data are committed.

## Product research
The interaction choices were informed by these official product pages, without copying their artwork or code:
- Hevy: https://www.hevyapp.com/features/workout-settings/ — superset navigation and rest controls.
- Hevy: https://www.hevyapp.com/features/gym-progress/ — logged-set muscle distribution and progress.
- Strong: https://help.strongapp.io/article/231-rest-timer — readily accessible rest timing.
- Fitbod: https://help.fitbod.me/hc/en-us/sections/360001927994-Getting-Started — exercise-detail guidance.

## Verification and honest limits
TypeScript, ESLint, unit tests and production build run locally. Browser checks run in GitHub CI because local Chromium's Unix socket is denied by this host. CI captures synthetic entry, exercise and progress screens in mobile/desktop viewports; those are validation evidence, not an assertion of exact pixel equivalence to all eight original mockups.

The real private API was checked for profile/program/measurement reads, both avatar downloads, the active PDF, normalized set persistence, stale-revision rejection and idempotent retry. Temporary verification sessions are deleted afterward.

The Supabase advisor reports an Auth warning for disabled compromised-password screening; the technical account uses a newly generated random high-entropy credential, and no user password sign-up UI is offered. No paid feature was enabled.

Remaining roadmap work must stay open: offline write outbox and conflict-resolution UI, migration of browser-only archives to cloud, full plan editor/catalog, shared-file enrichment into new plan versions, richer export/settings, and exact-reference review of all eight sheets. This release does not mark T01–T24 complete.

## Continuation — scoped offline writes

Recovered T07 source/RPC definitions and old branch ancestry are reconciled without exposing the unfinished schedule-only manager. The active archive/player remains the entry point. The new private IndexedDB outbox covers workout start/update/finish/cancel and manual measurements, caches downloaded training data, preserves account/profile boundaries, retries stable IDs and presents explicit conflict recovery. See T17_PROGRESS.md for checks and limits; see TASK_AUDIT.md for all 24 tasks. [Quality run 81](https://github.com/Hamrez95/Gymrez/actions/runs/44831414733) passed all checks: 18 unit tests and 15 browser scenarios, including production full-offline reload/reconnect. The test exposed a public-shell Vary-header cache miss; that fix passed the same scenario. Authenticated real-database rollback verification also passed, and no test rows remain. Native CI screenshots plus the documented reference overlay were reviewed; the full roadmap and its visual/pilot gates remain open. Recovery instructions are in RECOVERY.md.


## Continuation — validated import preview
The archive path now prepares without writing, previews the destination and supplied training contents, and requires confirmation. PDF validation covers the complete bundle before saving. Account changes reject pending previews. Import retries stay idempotent and existing active programs are retained; selecting an active program is a separate explicit operation. Local legacy archives are still not silently transferred to cloud. Main's prior offline release was verified with successful Quality/Pages workflows and production HTTP 200. T10 remains partial until manifest/version import and visual review are complete.
