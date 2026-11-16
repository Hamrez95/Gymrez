# T05 progress — Supabase schema and RLS

**State:** Core backend work is deployed to the standalone Gymrez project on the confirmed Free plan. PR #29 remains a draft while required UI reference evidence is deferred to the final visual pass.

## Delivered
- Versioned schema for 14 public tables; RLS is enabled on all of them.
- Composite ownership foreign keys, immutable published program snapshots, UTC timestamps, date-only measurements, import/sync idempotency, and one active program per profile.
- Twenty covering indexes for foreign keys flagged by the advisor.
- Private `profile-media` bucket (10 MiB; JPEG/PNG/WebP) with select/insert/update/delete policies requiring a matching household/profile path and current membership.
- Anonymous access revoked from the public app tables; private storage visibility and writes are restricted by Storage RLS.
- Eight generic exercise catalog entries seeded; no user accounts, profiles, measurements, or workouts were added.
- Generated types committed at `src/shared/database.types.ts`.

## Applied migrations
The source filenames match the Supabase migration history:
- `20261116131437_initial_schema.sql`
- `20261116132031_foreign_key_indexes.sql`
- `20261116133034_profile_media_bucket.sql`
- `20261116133100_profile_media_acl_helper.sql`
- `20261116133143_profile_media_select_policy.sql`
- `20261116133157_profile_media_write_policies.sql`
- `20261116133227_public_table_grants.sql`
- `20261116133236_storage_object_grants.sql`
- `20261116133918_exercise_catalog_seed.sql`

## Validation
- All 14 pgTAP assertions passed against the connected project, covering member/non-member/anon access, UPDATE USING/WITH CHECK boundaries, storage path ownership, foreign-key ownership, idempotency, and published-version immutability.
- Test fixtures were rolled back; no synthetic users or test households remain, and pgTAP was not left installed.
- Security and health advisors report no lints. The performance advisor reports no unindexed foreign keys; it currently reports 18 unused-index INFO findings on the new project.

## Still open
- Capture the required mobile/desktop screenshots and compare the T05 screens against the original PACE references during the final visual pass, as requested.
- Keep PR #29 and issue #6 open until that evidence and the remaining issue checks are reviewed.
