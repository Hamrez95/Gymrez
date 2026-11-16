# T05 progress — Supabase schema and RLS

**State:** schema migrations are applied to the connected standalone Gymrez Supabase project. PR #29 remains a draft while behavioral RLS and storage checks are pending.

## Included
- Versioned workout schema, immutable published program snapshots, composite ownership foreign keys, UTC timestamps and date-only measurements.
- RLS helper functions derive profile/household access from authenticated membership. Membership writes remain trusted provisioning only.
- Idempotency keys for import and sync; a partial unique index limits each profile to one active program.
- pgTAP coverage is drafted for membership isolation, cross-profile FK rejection and duplicate import rejection.
- Twenty covering indexes for the foreign keys reported by the Supabase performance advisor.
- Generated Supabase TypeScript definitions in `src/shared/database.types.ts`.

## Applied and reviewed
- `20261116120000_initial_schema.sql` and `20261116140000_foreign_key_indexes.sql` applied successfully.
- All 14 public tables have RLS enabled.
- Security and health advisors report no lints.
- The performance advisor no longer reports unindexed foreign keys. It reports 21 unused indexes, expected on this new empty project before application queries run.
- No personal records or seed data were added.

## Still required before T05 can close
- pgTAP is not installed in the connected project, so the drafted database test has not been run.
- Verify anon and two-user behavior with synthetic accounts, including UPDATE USING/WITH CHECK and cross-household parent/child references.
- Review storage requirements and add scoped bucket policies if the app will store user uploads.
- Keep PR #29 in draft until these checks are complete.
