# Tasks: Specialty Coffee Grind Tracker

**Input**: Design documents from `specs/001-coffee-grind-tracker/`
**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · contracts/ ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Ordered iteration ladder. Each iteration is a vertical slice of user-visible value. Stop at any checkpoint and the app still works.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies within the iteration)
- **[Story]**: User story label (US1–US7) from spec.md
- All file paths relative to repository root

---

## Iteration 1: US1 — View & Update Active Rotation (Priority: P1) 🎯 MVP

**Goal**: Install the app as a PWA, add a coffee bag with required fields, see it on the home screen, and tap through to its detail page. This iteration absorbs all project bootstrap.

**Independent Test**: Add a bag → it appears on the home screen. Tap it → bag detail screen opens. Kill network → app still loads.

**Exit criterion**: User can install the app, add a bag, view the active-rotation list, and open a bag detail screen. Project runs fully offline as a PWA.

### Implementation

- [x] T001 Initialize SvelteKit project with TypeScript, install dependencies (idb-keyval, vite-plugin-pwa, @vite-pwa/sveltekit) per `specs/001-coffee-grind-tracker/quickstart.md`
- [x] T002 [P] Configure `vite.config.ts` with `SvelteKitPWA` plugin (manifest: name, short_name, display: standalone, icons 192/512, Workbox cache-all-assets)
- [x] T003 [P] Configure `svelte.config.js` with `@sveltejs/adapter-static` and `fallback: 'index.html'`
- [x] T004 [P] Define TypeScript entity types `Bag`, `Roaster`, `ProcessingMethod`, `AppPreferences` in `src/lib/types.ts` per `specs/001-coffee-grind-tracker/data-model.md`
- [x] T005 Create six named idb-keyval stores (bags, roasters, grinders, brew-methods, grind-settings, preferences) and export them from `src/lib/db/index.ts`
- [x] T006 [P] Implement bags store helpers (`getBag`, `getAllBags`, `saveBag`, `getActiveBags`) in `src/lib/db/bags.ts`
- [x] T007 [P] Implement roasters store helpers (`getRoaster`, `getAllRoasters`, `saveRoaster`) in `src/lib/db/roasters.ts`
- [x] T008 [P] Implement preferences store helper (`getPreferences`, `savePreferences`) with `defaultRatio: 16` seed on first call in `src/lib/db/preferences.ts`
- [x] T009 [P] [US1] Build bottom tab navigation layout with four tabs (Home, Archive, Calculator, Stats) — all 44×44 dp touch targets — in `src/routes/+layout.svelte`
- [x] T010 [P] [US1] Create stub placeholder screens for Archive, Calculator, and Stats in `src/routes/archive/+page.svelte`, `src/routes/calculator/+page.svelte`, `src/routes/stats/+page.svelte`
- [x] T011 [US1] Build home screen: active bags list (name + roaster), empty-state prompt when no active bags, FAB/button to add a bag in `src/routes/+page.svelte`
- [x] T012 [US1] Build add-bag screen: required fields (name, origin, processingMethod selector from fixed enum, roaster picker with inline-create option), save → status = active → redirect to home in `src/routes/add-bag/+page.svelte`
- [x] T013 [US1] Build bag detail screen: displays bag name, roaster, origin, processing method; grind-settings section with empty-state placeholder in `src/routes/bag/[id]/+page.svelte`
- [x] T014 [US1] Add PWA app icons (192×192 and 512×512 PNG placeholders) to `static/icons/`
- [x] T015 [US1] Provide a brief user-perspective summary of what the user can now do end-to-end. Do not run the project — the user drives verification.

**Checkpoint**: Install app as PWA on Android Chrome or DevTools mobile emulation. Add a bag → it appears on the home screen. Tap it → bag detail screen loads. Kill network → app loads offline.

---

## Iteration 2: US2 — Add a New Coffee Bag (Priority: P2)

**Goal**: Complete the full add-bag experience: all optional fields, barcode scan via device camera, edit bag post-creation, and roaster detail management.

**Independent Test**: Add a bag scanning a barcode → barcode value saved. Edit the bag's origin → change persists after reload. On a browser without BarcodeDetector → manual barcode entry offered.

**Exit criterion**: All five acceptance scenarios for US2 are exercisable. The app still runs end-to-end including Iteration 1.

### Implementation

- [x] T016 [US2] Extend `Bag` type with optional fields (`variety`, `altitude`, `roastDate`, `barcode`) and `Roaster` type with `country`, `website` in `src/lib/types.ts`
- [x] T017 [US2] Implement `BarcodeDetector` wrapper with feature-detect and graceful fallback to manual text entry in `src/lib/utils/barcode.ts`
- [x] T018 [US2] Extend add-bag screen with optional field inputs (variety text, altitude text, roast date picker, barcode field + scan button wired to `barcode.ts`) in `src/routes/add-bag/+page.svelte`
- [x] T019 [US2] Build edit-bag screen (all fields editable post-creation, save overwrites record) in `src/routes/bag/[id]/edit/+page.svelte`
- [x] T020 [P] [US2] Add edit-bag navigation link to bag detail screen in `src/routes/bag/[id]/+page.svelte`
- [x] T021 [P] [US2] Build roaster detail/edit screen (name, country, website) in `src/routes/roaster/[id]/+page.svelte`
- [x] T022 [US2] Provide a brief user-perspective summary of what the user can now do end-to-end. Do not run the project — the user drives verification.

**Checkpoint**: Full bag creation with optional fields works. Barcode scan fills the field. Edit bag and roaster. All changes survive app reload.

---

## Iteration 3: US3 — Log and Track Grind Settings (Priority: P2)

**Goal**: The user can manage their grinders and brew methods, log an immutable grind setting for any active bag, and see the full drift history per grinder/brew-method combination.

**Independent Test**: Add a grinder and a brew method. Log three settings for the same combo on an active bag → all three appear in reverse-chrono order. Try to delete the grinder → deletion blocked with explanation.

**Exit criterion**: Grind-setting history is viewable per bag+combo. Deletion guard works. App still runs end-to-end.

### Implementation

- [x] T023 [P] [US3] Extend `src/lib/types.ts` with `Grinder`, `BrewMethod`, `GrindSetting` types
- [x] T024 [P] [US3] Implement grinders store helpers (`getAllGrinders`, `saveGrinder`, `safeDeleteGrinder` — blocks deletion if settings exist) in `src/lib/db/grinders.ts`
- [x] T025 [P] [US3] Implement brew-methods store helpers (`getAllBrewMethods`, `saveBrewMethod`, `safeDeleteBrewMethod`) + seed 6 default methods (V60, Hario Switch, Espresso, AeroPress, Chemex, French Press) on first launch in `src/lib/db/brew-methods.ts`
- [x] T026 [US3] Implement grind-settings store helpers (`getSettingsForCombo`, `addGrindSetting` — no update/delete exposed) in `src/lib/db/grind-settings.ts`
- [x] T027 [P] [US3] Build grinder management screen: list grinders, add new (name + type), delete with block-guard message and rename suggestion in `src/routes/settings/grinders/+page.svelte`
- [x] T028 [P] [US3] Build brew-method management screen: list methods, add new, delete with block-guard message in `src/routes/settings/brew-methods/+page.svelte`
- [x] T029 [US3] Build "log grind setting" flow: grinder selector → brew method selector → setting value input + optional notes → save (creates immutable record with today's date); show existing history for that combo before saving in `src/routes/bag/[id]/log-setting/+page.svelte`
- [x] T030 [US3] Update bag detail screen to display all grind-setting history grouped by grinder+brew-method (reverse-chrono per group, read-only), with "Log new setting" CTA per group and a top-level "Add first setting" prompt when empty in `src/routes/bag/[id]/+page.svelte`
- [x] T031 [US3] Add settings navigation (gear icon) to bag detail and home screen linking to grinder and brew-method management screens
- [x] T032 [US3] Provide a brief user-perspective summary of what the user can now do end-to-end. Do not run the project — the user drives verification.

**Checkpoint**: Log settings for a bag, see drift history. Add a second entry for same combo → both shown newest-first. Attempt grinder deletion with settings → blocked.

---

## Iteration 4: US4 + US5 — Archive a Finished Bag & Rate a Bag (Priority: P3)

**Goal**: The user marks a bag as finished; a star-rating prompt appears (skippable); the bag moves to the archive with all its history intact. The archive is browsable, filterable, and ratings are editable.

**Note**: US4 (archive) and US5 (rating) are combined because the rating prompt is triggered inside the archive flow. They cannot be independently delivered without a broken UX seam.

**Independent Test**: Finish a bag with 4 stars → disappears from home, appears in archive with 4-star display. Finish another bag, skip rating → archive entry shows no stars; add rating from archive view. Filter archive by processing method → only matching bags shown.

**Exit criterion**: Full archive + rating flow exercisable. Home screen shows empty state when all bags archived. App still runs end-to-end.

### Implementation

- [x] T033 [US4] Extend bags store with `archiveBag(id, ratingScore?)` helper (sets `status = 'archived'`, `dateFinished = today`, writes optional `ratingScore`) in `src/lib/db/bags.ts`
- [x] T034 [US5] Build `StarRating` component: tappable 1–5 star selector (44×44 dp per star, accessible labels) in `src/lib/components/StarRating.svelte`
- [x] T035 [US5] Build `StarRatingPrompt` sheet/modal: shows `StarRating` component + "Skip" action; resolves with score or null in `src/lib/components/StarRatingPrompt.svelte`
- [x] T036 [US4] Add "Mark as Finished" action to active bag detail screen: show confirmation → show `StarRatingPrompt` → call `archiveBag` → navigate to home in `src/routes/bag/[id]/+page.svelte`
- [x] T037 [US4] Update home screen to show empty state ("All bags finished — add a new one") when no active bags remain in `src/routes/+page.svelte`
- [x] T038 [P] [US4] Build archive screen: scrollable list of archived bags (name, roaster, star rating if set, dateFinished), reverse-chrono order, filter bar (origin / processing method / roaster) in `src/routes/archive/+page.svelte`
- [x] T039 [US4] Build archive bag detail screen: full bag info, complete grind-setting history (read-only), star rating display + edit control in `src/routes/archive/[id]/+page.svelte`
- [x] T040 [US5] Wire star rating edit on archive bag detail: tap stars → update `ratingScore` on bag record in `src/routes/archive/[id]/+page.svelte`
- [x] T041 [US4] Provide a brief user-perspective summary of what the user can now do end-to-end. Do not run the project — the user drives verification.

**Checkpoint**: Full finish → rating → archive flow. Filter archive. Edit a rating from archive detail view.

---

## Iteration 5: US6 — Brew Ratio Calculator (Priority: P3)

**Goal**: The standalone calculator tab computes dose↔water based on the user's saved default ratio. The ratio persists across restarts.

**Independent Test**: Enter 20 g dose with 1:16 ratio → 320 g water output. Switch to reverse mode: 320 g water → 20 g dose. Set ratio to 1:15, restart → ratio still 1:15. Enter letters → error message.

**Exit criterion**: Calculator works bidirectionally. Default ratio persists. Input validation works. App still runs end-to-end.

### Implementation

- [x] T042 [US6] Build calculator screen: dose input field, water output display, ratio display and inline edit (integer input), toggle to reverse mode (water → dose) in `src/routes/calculator/+page.svelte`
- [x] T043 [US6] Wire live calculation: on dose input change → compute water = dose × ratio; on water input change (reverse mode) → compute dose = water ÷ ratio; results update immediately without submit in `src/routes/calculator/+page.svelte`
- [x] T044 [US6] Persist default ratio via `savePreferences` when user edits the ratio field; load on mount from `getPreferences` in `src/routes/calculator/+page.svelte`
- [x] T045 [US6] Add input validation: reject non-numeric and zero/negative values with inline error message; clear error on valid input in `src/routes/calculator/+page.svelte`
- [x] T046 [US6] Provide a brief user-perspective summary of what the user can now do end-to-end. Do not run the project — the user drives verification.

**Checkpoint**: Calculator tab fully functional. Default ratio survives page reload.

---

## Iteration 6: US7 — Browse Stats (Priority: P4)

**Goal**: The stats screen shows aggregated insights across the entire collection (active + archived): processing method breakdown, origins, varieties, altitude, roasters, and bags-per-month streak.

**Independent Test**: With 5+ bags across different origins and processing methods, all stat sections reflect the correct counts. Open stats with zero bags → all sections show empty states.

**Exit criterion**: All six stat categories display correctly. Empty states work. App still runs end-to-end.

### Implementation

- [x] T047 [US7] Implement in-memory stats aggregation helpers: `getProcessingBreakdown`, `getOriginsCount`, `getVarietiesList`, `getAltitudeRange`, `getRoastersCount`, `getBagsPerMonth` (all over combined active + archived bags) in `src/lib/db/stats.ts`
- [x] T048 [US7] Build stats screen: six stat sections each with its aggregated display and an empty-state message when no data exists for that category in `src/routes/stats/+page.svelte`
- [x] T049 [US7] Provide a brief user-perspective summary of what the user can now do end-to-end. Do not run the project — the user drives verification.

**Checkpoint**: Stats screen reflects full collection data. Zero-bag empty states shown correctly.

---

## Final Iteration: Polish & Cross-Cutting Concerns

**Purpose**: Quality, accessibility, and PWA hardening across all screens. Run only after all desired user-story iterations are verified.

**Exit criterion**: All accessibility and PWA checks pass. App still runs end-to-end.

- [x] T050 [P] Audit every interactive element across all screens for ≥44×44 dp touch target size; fix any violations
- [x] T051 [P] Verify WCAG AA color contrast on all text and interactive elements; adjust CSS custom properties as needed in `src/app.css`
- [x] T052 [P] Add `app.html` meta tags: `viewport` (device-width, initial-scale=1), `theme-color`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`
- [x] T053 Verify PWA installability end-to-end: valid manifest, service worker registered and caching assets, app loads fully after network kill
- [x] T054 Full offline smoke test: install → kill network → exercise Home, Add Bag, Log Setting, Calculator, Archive, Stats — confirm all work without network
- [x] T055 [P] Review `src/lib/types.ts` for any unused or inconsistent types; clean up
- [x] T056 [P] Review all screens for layout consistency (spacing, typography, colour) at 360×780 dp viewport
- [x] T057 Provide a brief final summary of the complete app capabilities. Do not run the project — the user drives verification.

---

## Dependencies & Execution Order

### Iteration Dependencies

- **Iteration 1 (MVP)**: No prior iteration. Absorbs all bootstrap. Must run end-to-end with US1 exercisable.
- **Iteration 2**: Depends on Iteration 1. Adds full US2 bag-entry experience on top.
- **Iteration 3**: Depends on Iteration 1 (bags must exist to log settings against). Can start after Iteration 1; does not require Iteration 2.
- **Iteration 4**: Depends on Iteration 1 (bags must be active to archive). Benefits from Iteration 3 (grind history shown in archive).
- **Iteration 5**: Depends on Iteration 1 (preferences store). Fully independent of Iterations 2–4.
- **Iteration 6**: Depends on Iteration 1 (bags store). Fully independent of Iterations 2–5.
- **Final**: Depends on all desired user-story iterations being verified.

### Within Each Iteration

- Tasks without [P] are sequential in the order listed
- [P]-marked tasks share no file dependencies within their iteration and can run concurrently
- The final task of every iteration is a user-perspective summary; the agent does not run the app
- Do not advance to the next iteration until the user has exercised the current one

### Parallel Opportunities

#### Iteration 1 — parallel groups
```
Group A (after T001): T002, T003, T004
Group B (after T005): T006, T007, T008
Group C (after T005): T009, T010
```

#### Iteration 3 — parallel groups
```
Group A: T023 (types), T024 (grinders db), T025 (brew-methods db)
Group B (after T026): T027 (grinder mgmt screen), T028 (brew-method mgmt screen)
```

#### Iteration 4 — parallel groups
```
Group A: T034 (StarRating component), T035 (StarRatingPrompt)
Group B (after T036, T033): T038 (archive screen), T039 (archive detail) — different files
```

---

## Implementation Strategy

### MVP First

1. Complete **Iteration 1** — smallest user-visible slice including all bootstrap → PWA installs and active bag list works
2. **STOP and EXERCISE**: user installs the app, confirms home screen and basic bag add work, decides whether to continue

### Incremental Delivery

Each subsequent iteration adds one story on top of a working baseline:

| Iteration | Story | What becomes possible |
|---|---|---|
| 1 | US1 + bootstrap | Install, add bag (required fields), view active rotation |
| 2 | US2 | Full bag entry: optional fields, barcode scan, edit bag, edit roaster |
| 3 | US3 | Log grind settings, view drift history per combo |
| 4 | US4 + US5 | Finish bag, rate it with stars, browse + filter archive |
| 5 | US6 | Brew ratio calculator with persistent default ratio |
| 6 | US7 | Stats screen with full collection insights |
| Final | Polish | Accessibility, PWA hardening, offline smoke test |

Stop at any checkpoint and the app delivers everything up to that iteration.

---

## Notes

- [P] tasks = different files, no shared dependencies within the iteration
- Story labels (US1–US7) map directly to user stories in `specs/001-coffee-grind-tracker/spec.md`
- Every iteration ends with the agent providing a plain-language user-perspective summary — the user, not the agent, verifies the product
- Grind setting records are immutable: `src/lib/db/grind-settings.ts` exposes no update or delete operations
- Deletion guards for grinders and brew methods are enforced in `src/lib/db/grinders.ts` and `src/lib/db/brew-methods.ts` — check `getAllGrindSettings` before allowing `del()`
- Iterations 5 and 6 (Calculator, Stats) are independent of Iterations 2–4 and can be reprioritized without impact
