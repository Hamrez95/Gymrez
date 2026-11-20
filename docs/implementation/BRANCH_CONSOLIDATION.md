# Previous branch reconciliation

The online release reached main through PRs #35 and #36. An audit found one missing feature branch: `feat/t07-programs` / PR #31 contained program-management source and two database RPCs absent from main.

The consolidation preserves its ProgramsPage, repository, stylesheet and migration. The schedule-only manager stays unexposed until exercise editing and the published-plan adapter are completed: activating an empty schedule must not replace the usable current workout plan.

The shared shell/auth/font changes from that branch are older variants. Current main's private device connection, avatar surfaces, archive/player, profile context, deployment-only-from-main and fonts are preserved when resolving those overlaps. The historical guest/foundation/design-system/app-shell branches similarly contain superseded or squash-merged versions, not extra product features; their ancestry is reconciled without rolling back the current app. The SVG fix is already present through squash PR #36.

All old source stays reachable through merge ancestry. No branch is deleted, no credential or personal dataset is added to Git, and task completion is not inferred from a history-only merge.
