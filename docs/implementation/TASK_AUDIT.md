# Gymrez task audit — 2026-11-21

Authoritative roadmap: GitHub issue #1 and T01–T24. Only T01 and T02 are formally closed: **2 complete, 22 open**. Open does not mean unimplemented: the released app already has private profiles/programs/avatars, workouts/rest/history, body measurements/charts and an installable shell. Conversely, a deployed subset does not satisfy every acceptance criterion. A percentage of remaining engineering effort cannot be derived from the issue count.

| Task | Existing behavior | Remaining acceptance/work |
| --- | --- | --- |
| T01 | Reference audit | Closed |
| T02 | Build, structure, CI | Closed |
| T03 | Tokens, fonts, base components | Complete assets and exact comparison |
| T04 | Responsive shell and profile switching | All reference states and final comparison |
| T05 | Independent Supabase, RLS, migrations | Reconcile current schema tests and acceptance evidence |
| T06 | Private device connection and shared profiles | Final reconnect/recovery and identity-isolation acceptance |
| T07 | Private archives and recovered manager source | Expose complete management only with playable published plans |
| T08 | Eight catalog entries, schematic movement/muscles | Complete searchable catalog and safe replacement |
| T09 | Schedule draft manager source | Exercise-level editor, validation, publish/version adapter |
| T10 | Private archive JSON import | Preview/confirmation, manifest updates and complete version import |
| T11 | Dashboard and Persian calendar | All reference dashboard states |
| T12 | Snapshot player and transactional set logging | Full offline/reload acceptance and remaining player states |
| T13 | Deadline rest timer, supersets, schematic motion | Remaining reference controls and final motion review |
| T14 | Completion, history and set details | Filters, session metadata and richer reference layout |
| T15 | Private body readings and BMI/history | Remaining measurements/profile editing and reference panels |
| T16 | Real history/volume/muscle charts/calendar | Full period filters, records and comparison |
| T17 | Durable scoped outbox added in this continuation | CI/two-device/screenshot review and production pilot |
| T18 | Manifest, install UI, static-shell service worker | Production offline/reload/update and device-install acceptance |
| T19 | Route/navigation/chart motion, avatars | Complete final artwork/motion pass |
| T20 | Original PDFs and conflict recovery JSON | Printable program/history PDF, settings and tested backup/restore |
| T21 | References preserved, some screenshots | All eight reference overlays and correction of major differences |
| T22 | Unit, RLS and E2E checks already exist | Full final security/accessibility/performance matrix |
| T23 | Main-only GitHub Pages deployment | Final recovery documentation and release validation |
| T24 | App available for intermediate use | Hamidreza/Reyhaneh real-device pilot and 1.0 acceptance |

## Priority order

1. Verify and release the recovered source and T17 outbox.
2. Complete the catalog, exercise editor, immutable publishing and import preview (T07–T10).
3. Finish history/body/progress/settings/PDF/backup acceptance (T11–T16/T20).
4. Finish PWA recovery, installation/update and identity/offline acceptance (T06/T17/T18/T23).
5. Final art/motion and all eight exact-reference comparisons (T03/T04/T19/T21).
6. Final quality matrix and two-person real-device pilot (T22/T24).

Reyhaneh's new training program stays deferred as requested; the existing profile is retained. No personal body reading, workout history or training plan is invented to populate empty views.
