# T17 UI reference review

The original sheet 02 remains the design authority. `reference-comparison.jpg` places its central player crop (left) next to the current synthetic mobile conflict state (right), normalized to a 414-pixel content width. `reference-overlay.jpg` is the 50% overlay. Images are review evidence, not replacement baselines.

Source screenshot: passed mobile/desktop browser run 44830330946, commit c75f802. Full native screenshots for pending/conflict states are in that run's artifact. Subsequent functional changes preserve the same sync-panel layout; production-offline screenshots are emitted separately by the production PWA project. The latest passed functional build is 25ae9fcd / [run 81](https://github.com/Hamrez95/Gymrez/actions/runs/44831414733), with 15 successful browser checks including full internet outage/reload.

Reviewed: dark surface/accent/font tokens; wrapping conflict/recovery actions; narrow/mobile and wide/desktop layouts; absence of decorative heading slash markers; no new horizontal overflow introduced by the status panel. The new conflict state has no complete counterpart in the supplied sheets, so it uses the existing PACE card/button language. It is static; no new motion needs a clip.

Known deviations are explicit: an expanded conflict adds content above the player; the existing player still uses a large hero, stacked inputs and schematic movement art rather than the reference's compact prescription table and photo/video. These pre-existing full-player differences remain T19/T21 acceptance work. The overlay visibly documents them and does not claim exact equivalence or close T21.
