# T10 archive preview — verification and limits

Reference: `docs/mockups/pace/06-profile-programs.png`, viewed at native dimensions. Preview is an additional state using the existing PACE card, font, buttons and color tokens. It is not a claim that the current archive screen reproduces the entire reference's editor/calendar/artwork layout; that larger deviation remains open under T07/T09/T21.

Flow: choose profile → Programs → import JSON → inspect destination, titles, supplied training and measurement count → confirm → explicitly select the active program. Cancel does not save. Partial cloud failures retain the preview with safe retry wording; cloud batch import is not atomic. No measurements or plans are generated for empty profiles.

Tests cover cancel/reload with no saved records, confirmation, duplicate retry, activation, wrong-profile rejection, invalid PDF in a mixed bundle, unsupported schema, account changes, and preserving the previously active program. Quality run 84 passed 21 unit tests and all 15 browser scenarios. The CI artifact includes synthetic desktop/mobile `T10/*-import-preview.png`; the refined capture waits for route animation and expands exercise details.

Still open: manifest discovery, editor-backed immutable version import, exercise IDs/catalog matching, full body-reading detail review, exact-reference comparison and real-user pilot. Existing personal plans and files remain private.
