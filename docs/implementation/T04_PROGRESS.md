# T04 progress — responsive shell and entry flow

## Implemented in this change

- Added a shared RTL shell with a compact header, profile selector, theme control, desktop navigation, and mobile bottom navigation.
- Added a desktop side navigation for progress/profile sections, with shared route labels and browser back behavior.
- Added a sample profile chooser, dashboard preview, disabled authentication preview, and an explicit unknown-route state.
- Added responsive layouts, minimum 44px controls, bottom safe-area padding, and viewport checks at 360, 390, 430, 768, and 1440 CSS pixels.
- Demo profiles and dashboard values remain synthetic. Profile selection is not authentication and no account or workout data is sent or saved.

## Deferred by user direction

Generated/extracted imagery, final logo/icon artwork, diagonal decoration, and animation are reserved for the final sol6.1 visual pass. The dashboard's image area is deliberately identified as a placeholder. Supabase authentication and private profile membership belong to T05/T06.

## Still required before closing T04

- Review desktop/mobile browser screenshots against the original panel crops and make any layout corrections.
- Revisit artwork-dependent dimensions and profile imagery after T19. Keep this issue open until the shell is checked against the exact references.
- No Supabase project is provisioned and no real sign-in is active.
