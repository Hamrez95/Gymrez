# T05 progress — Supabase schema and RLS

**State:** migration and policy tests drafted in PR #29; do not provision a Supabase project until the owner selects the target organization and confirms the free-plan capacity.

## Included
- Versioned workout schema, immutable published program snapshots, composite ownership foreign keys, UTC timestamps and date-only measurements.
- RLS helper functions derive profile/household access from authenticated membership. Membership writes remain trusted provisioning only.
- Idempotency keys for import and sync; partial unique index limits each profile to one active program.
- pgTAP coverage for member/non-member isolation, cross-profile FK rejection and duplicate import rejection.

## Still required before T05 can close
- Run migration and pgTAP against an isolated Supabase local stack or approved free project.
- Review policies/functions/storage with Supabase advisors; generated TS types and synthetic seed.
- Verify two-user and anon behavior, including UPDATE USING/WITH CHECK and cross-household parent/child references.
- Provision only an independent free Gymrez project; no paid upgrade or changes to other projects.
