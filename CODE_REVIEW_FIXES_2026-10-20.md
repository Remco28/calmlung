# Calmlung fix review — 2026-10-20

**Reviewer:** codex-5257  
**Reviewed commit:** `69b4e5ecdd30db2b9cd6d39c90d7cd74ba806131`  
**Compared with:** `0ac2e49a41f1fc17acb78eb47aed6e859df64229`

## Verdict

All six findings from the original review are resolved. No new actionable defect was found in the reviewed changes. The repository was clean before this follow-up report was added; no application code was changed during review.

## Findings checked

| Original finding | Result | Evidence |
| --- | --- | --- |
| **R1 / P2:** Results autoplay cannot reach the full-plate visibility threshold on small screens | **Resolved** | All four affected exhibits now start when brought into view at 320 × 568, 667 × 375, 1440 × 500, and 1920 × 720. Results advances beyond day zero at both original failing dimensions. An explicit pause survives scrolling away and back. |
| **R2 / P2:** Keyboard depth switching focuses the first placard | **Resolved** | All 48 combinations of eight placards and Right/Left/Up/Down/Home/End preserve focus in the originating group. All eight selections and the saved preference stay synchronized. |
| **R3 / P2:** Day-7 weight is shown as an unqualified day-10 value | **Resolved** | Day 7 shows `72%`; days 8 and 10 show `72% on day 7`. Rewinding to day 7 removes the annotation, and day zero restores `100%`. Retaining the last measurement is now explicit. |
| **R4 / P3:** Rewinding leaves final chart labels visible | **Resolved** | All four series labels have opacity zero after rewinding from the completed chart to day zero. They remain hidden after resizing to a mobile layout. |
| **R5 / P3:** The mobile control branch appears before its turn | **Resolved** | All five branches begin hidden. Replay followed immediately by pause leaves the counter at `0 of 5` and every branch hidden after transitions settle. Resuming shows only branch 1 at `1 of 5`; the control stays hidden. |
| **R6 / P3:** Reduced motion leaves the memory drawing at its starting state | **Resolved** | Reduced-motion initialization selects the trained cell and draws its finished state. Switching trained → untrained → trained immediately updates the selected buttons, `.is-trained` class, and drawing together. |

## Verification

Reviewed the complete six-file fix diff and the surrounding initialization, keyboard, playback, pause, resize, and replay logic. The fixes are focused: they adjust observer triggering, retain the originating tab group, qualify the old measurement, clear label opacity, separate reveal state from control styling, and initialize the reduced-motion memory state through its existing selection handler.

Re-ran the original Chrome reproduction harness, including desktop/mobile layouts, reduced motion, JavaScript-disabled reading, result replay, all 14 measurement chips, and microscope channel switches. All original failure observations changed to the expected results. Normal result replay still reaches day 10 with 100%/0% survival and hides its pause control. Without JavaScript, all 24 depth panels remain readable.

An additional targeted run passed **11 of 11 check groups**, covering the 48 keyboard combinations, 16 exhibit/viewport autoplay cases, explicit pause and observer re-entry, weight annotation while scrubbing in both directions, rewind plus resize, reduced-motion cell toggles, and proof replay/pause/resume. No uncaught JavaScript exceptions were observed in either browser run.

All eight JavaScript files passed `node --check`, and `git diff --check 0ac2e49..69b4e5e` passed.

## Limits

Browser checks used local source in headless Google Chrome 152.0.7977.64. Small-screen checks used mobile emulation; external Google Fonts requests were blocked to exercise fallback fonts. The temporary verification scripts were kept outside the repository. Firefox, WebKit, real touch devices, real screen readers, the deployed site, and the paper's scientific claims were not independently evaluated in this follow-up.
