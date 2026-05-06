# Feature Specification: Specialty Coffee Grind Tracker

**Feature Branch**: `001-coffee-grind-tracker`  
**Created**: 2026-05-06  
**Status**: Draft  
**Input**: User description: Personal specialty coffee tracker for managing bags, grind settings, ratings, and brew statistics — no accounts, no social features.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View & Update Active Rotation (Priority: P1)

The user opens the app and immediately sees all bags currently in rotation on the home screen. They tap a bag to view all saved grind settings grouped by grinder and brew method. When they dial in a new setting on a particular grinder/brew method combo, they tap to update it directly from this view.

**Why this priority**: This is the daily-use flow. Every other feature exists to support this moment — the 10-second morning check before grinding.

**Independent Test**: Can be fully tested by adding one bag, marking it active, logging a grind setting, then opening the app and verifying the setting appears on the home screen within two taps.

**Acceptance Scenarios**:

1. **Given** the user has one or more active bags, **When** they open the app, **Then** all active bags are displayed on the home screen with their name and roaster visible.
2. **Given** the user is on the home screen, **When** they tap a bag, **Then** they see all saved grind settings for that bag, grouped by grinder and brew method.
3. **Given** the user is viewing a bag's grind settings, **When** they tap "Log new setting" for a combo, **Then** they can enter a new value and save it, adding an immutable entry at the top of that combo's history.
4. **Given** the user has no bags in active rotation, **When** they open the app, **Then** the home screen shows a prompt to add their first bag.

---

### User Story 2 - Add a New Coffee Bag (Priority: P2)

The user acquires a new bag of coffee. They add it to the app by optionally scanning the barcode, filling in the coffee details (name, origin, variety, processing method, altitude, roast date), picking an existing roaster or creating a new one, and marking the bag as "in rotation."

**Why this priority**: Every other flow (grind settings, ratings, archive) depends on bags existing in the system. Adding bags is the entry point to all value.

**Independent Test**: Can be fully tested by completing the add-bag flow end-to-end and confirming the bag appears on the home screen.

**Acceptance Scenarios**:

1. **Given** the user is on the add-bag screen, **When** they scan a barcode, **Then** the barcode value is pre-filled in the barcode field (no external lookup required).
2. **Given** the user is filling in bag details, **When** they type a roaster name that already exists, **Then** the system suggests the existing roaster; if it doesn't exist, a new roaster record is created.
3. **Given** the user has completed all required fields, **When** they save the bag and mark it "in rotation," **Then** the bag appears on the home screen immediately.
4. **Given** the device camera is unavailable, **When** the user taps the barcode scan button, **Then** they are offered manual text entry as a fallback.
5. **Given** the user fills only required fields, **When** they save the bag, **Then** optional fields (altitude, barcode, website) are saved as blank without blocking creation.

---

### User Story 3 - Log and Track Grind Settings (Priority: P2)

For a given bag, the user selects a grinder and brew method, enters the grind setting value, adds optional notes, and saves. When they return to log another setting for the same combo, they see the history of previous settings for reference so they can track drift over time.

**Why this priority**: Grind tracking is the core differentiator of this app. Without it, the app is just a coffee notebook.

**Independent Test**: Can be fully tested by logging three settings for the same bag/grinder/brew-method combo and confirming the history is shown in order.

**Acceptance Scenarios**:

1. **Given** the user is logging a grind setting, **When** they select a grinder and brew method, **Then** all previously logged settings for that combo are displayed in reverse-chronological order before they save.
2. **Given** the user enters a setting value and optional notes, **When** they save, **Then** the setting is stored with the current date and appears at the top of the history for that combo.
3. **Given** no grinders exist yet, **When** the user tries to log a setting, **Then** they are prompted to add a grinder first.
4. **Given** no brew methods exist yet, **When** the user tries to log a setting, **Then** they are prompted to add a brew method first.

---

### User Story 4 - Archive a Finished Bag (Priority: P3)

When a bag is empty, the user marks it as finished. The bag moves out of the active rotation and into the archive, retaining all its grind settings and ratings. The user can later browse the archive, filter by origin/processing/roaster, and review past settings and ratings for any archived bag.

**Why this priority**: Archiving keeps the home screen clean and enables the "what did I think of that Ethiopian last year?" use case.

**Independent Test**: Can be fully tested by finishing a bag, confirming it disappears from the home screen, then finding it in the archive with all data intact.

**Acceptance Scenarios**:

1. **Given** a bag is in active rotation, **When** the user taps "Mark as Finished," **Then** a star rating prompt is shown; after rating (or skipping), the bag is removed from the home screen and appears in the archive.
2. **Given** the user is viewing the archive, **When** they tap an archived bag, **Then** they see the full bag details including all grind settings, ratings, and the dates added/finished.
3. **Given** the archive contains multiple bags, **When** the user applies a filter (origin, processing, or roaster), **Then** only matching bags are shown.
4. **Given** an archived bag, **When** the user views it, **Then** they cannot accidentally re-activate it without an explicit action.

---

### User Story 5 - Rate a Bag (Priority: P3)

When the user marks a bag as finished, a rating prompt appears asking them to give the bag 1–5 stars. The step is skippable. If skipped or if they change their mind, the star rating can be edited later from the archive entry.

**Why this priority**: Ratings enrich the archive and enable retrospective discovery ("high-rated Ethiopians"), but the app is useful without them.

**Independent Test**: Can be fully tested by finishing a bag, awarding 4 stars in the prompt, then finding the bag in the archive and confirming the 4-star rating is shown.

**Acceptance Scenarios**:

1. **Given** the user taps "Mark as Finished," **When** the archive transition is confirmed, **Then** a rating prompt appears offering a 1–5 star selector before the bag is moved to the archive.
2. **Given** the rating prompt is shown, **When** the user skips it, **Then** the bag is archived with no rating and can be rated later from the archive.
3. **Given** a bag in the archive has a star rating, **When** the user taps to edit it, **Then** they can change the star score and the updated value replaces the previous one.
4. **Given** a bag in the archive has no rating, **When** the user views it, **Then** they can tap to add a star rating at any point after archiving.

---

### User Story 6 - Brew Ratio Calculator (Priority: P3)

The user opens the ratio calculator tab. They enter a dose (coffee weight) and the app shows the water amount based on their saved default ratio (e.g. 1:16). Alternatively, they enter the water amount and the app computes the dose. They can change the default ratio at any time.

**Why this priority**: A standalone convenience tool. Useful but not dependent on any other feature.

**Independent Test**: Can be fully tested by entering a dose value and confirming the computed water output matches the expected ratio arithmetic.

**Acceptance Scenarios**:

1. **Given** the user opens the calculator, **When** they enter a dose value, **Then** the water output is calculated instantly based on their stored default ratio.
2. **Given** the user enters a water value, **When** they switch to "reverse" mode, **Then** the dose is calculated from the water amount and the stored ratio.
3. **Given** the user changes the default ratio, **When** they return to the calculator, **Then** the new ratio is applied to all subsequent calculations and persisted across app restarts.
4. **Given** the user enters a non-numeric value, **When** they attempt a calculation, **Then** the input is rejected with a clear message.

---

### User Story 7 - Browse Stats (Priority: P4)

The user opens the stats screen to see aggregated information across all bags (active and archived): processing method breakdown, origins list with counts, bean varieties tried, altitude distribution, roasters explored, and bags added per month.

**Why this priority**: Delightful and informative, but purely informational — no data entry depends on it.

**Independent Test**: Can be fully tested with 3+ archived bags spanning different origins and processing methods and confirming each stat category reflects the data correctly.

**Acceptance Scenarios**:

1. **Given** the user has logged multiple bags, **When** they open the stats screen, **Then** they see a breakdown of processing methods (washed / natural / honey / anaerobic) with counts.
2. **Given** bags from multiple origins exist, **When** the user views origins stats, **Then** each origin is listed with the number of bags from that origin.
3. **Given** bags added across multiple months, **When** the user views the monthly streak, **Then** each month shows the number of bags added, forming a visual streak.
4. **Given** no bags exist yet, **When** the user opens stats, **Then** empty-state messaging is shown for each category.

---

### Edge Cases

- What happens when the user tries to archive a bag that has no grind settings logged?
- What happens when two bags from the same roaster have the same name?
- How does the calculator handle very large or very small dose values (e.g., 0.1g or 10kg)?
- Deleting a grinder or brew method that has saved settings attached is blocked; the user is shown an explanation and offered renaming as an alternative.
- How are bags without a roast date sorted or displayed?
- What if a barcode scan returns a code with special characters or excessive length?
- What happens when the user archives all bags — does the home screen show an appropriate empty state?

## Requirements *(mandatory)*

### Functional Requirements

**Home Screen**

- **FR-001**: The home screen MUST display all bags currently marked as "in rotation," showing at minimum the bag name and roaster.
- **FR-002**: Tapping a bag on the home screen MUST navigate to a bag detail view showing all saved grind settings grouped by grinder and brew method.
- **FR-003**: The home screen MUST show an empty-state message and add-bag prompt when no bags are in active rotation.

**Bag Management**

- **FR-004**: The user MUST be able to add a new coffee bag with the following fields: name (required), roaster (required), origin (required), processing method (required), variety (optional), altitude (optional), roast date (optional), barcode (optional).
- **FR-005**: Processing method MUST be selectable from a fixed set: Washed, Natural, Honey, Anaerobic.
- **FR-006**: The user MUST be able to scan a barcode using the device camera; the scanned code MUST pre-fill the barcode field without performing any external product lookup.
- **FR-007**: If camera access is unavailable or denied, the user MUST be able to enter the barcode value manually.
- **FR-008**: The user MUST be able to select an existing roaster or create a new roaster inline during bag creation.
- **FR-009**: A roaster record MUST include: name (required), country (optional), website (optional).
- **FR-010**: The user MUST be able to mark a bag as "in rotation" upon creation or at any subsequent time.
- **FR-011**: The user MUST be able to mark an active bag as "finished," which moves it to the archive.
- **FR-012**: Archiving a bag MUST preserve all associated grind settings and ratings in full.
- **FR-013**: The user MUST be able to edit bag details after creation.

**Grind Settings**

- **FR-014**: The user MUST be able to log a grind setting for any active bag by selecting a grinder, selecting a brew method, entering a setting value (alphanumeric), and optionally adding notes. Each log action creates a new immutable record; past entries MUST NOT be editable or replaceable.
- **FR-015**: Each grind setting MUST be stored with the date it was logged.
- **FR-016**: When logging a grind setting, the user MUST see all previous settings for that bag + grinder + brew method combination, displayed in reverse-chronological order. These past entries are read-only; the user tracks drift by adding new entries over time.
- **FR-017**: The user MUST be able to manage a list of grinders, each with a name and type (hand/electric).
- **FR-018**: The user MUST be able to manage a list of brew methods (user-defined, e.g. V60, Hario Switch, Espresso).
- **FR-019**: Deleting a grinder or brew method MUST be blocked if any grind settings reference it. The system MUST display a message explaining why deletion is blocked and suggest renaming as an alternative. Deletion is only permitted when no grind settings reference the item.

**Ratings**

- **FR-020**: When a bag is marked as finished, the system MUST present a star rating prompt (1–5 stars) before completing the archive transition. The prompt MUST be skippable.
- **FR-020a**: A bag in the archive with no rating MUST allow the user to add a star rating at any time. A bag with an existing rating MUST allow the user to edit it from the archive entry.
- **FR-021**: Each bag MUST support at most one star rating; updating a rating replaces the previous one. No tasting notes or free-form text are included.

**Ratio Calculator**

- **FR-022**: The ratio calculator MUST accept a dose input (grams) and output the corresponding water amount based on the user's stored default ratio.
- **FR-023**: The ratio calculator MUST accept a water input and compute the corresponding dose in reverse mode.
- **FR-024**: The user MUST be able to set and save a default brew ratio (e.g., 1:15, 1:16, 1:17); this ratio MUST persist across app restarts.
- **FR-025**: The calculator MUST reject non-numeric inputs and display a clear error message.

**Archive**

- **FR-026**: The archive MUST display all finished bags in a scrollable list, defaulting to reverse-chronological order by finish date.
- **FR-027**: The user MUST be able to filter the archive by origin, processing method, and roaster.
- **FR-028**: Each archive entry MUST show the bag's grind settings, rating, date added to rotation, and date finished.

**Stats**

- **FR-029**: The stats screen MUST aggregate data across all bags (active and archived) and display: processing method breakdown with counts, origins list with counts, bean varieties tried, altitude distribution, roasters explored with counts, and bags added per month.
- **FR-030**: The stats screen MUST display appropriate empty-state content when no bags have been logged.

**Data**

- **FR-031**: All data MUST be stored locally on the device; no network connection is required for any feature.
- **FR-032**: Cloud backup and local export/import are explicitly out of scope for v1. The data model MUST be designed to support a future export/import layer without structural changes. Known gap: data is unrecoverable if the app is uninstalled or the device is reset without a platform-level backup.

### Key Entities

- **Roaster**: Represents a coffee roasting company. Key attributes: name, country, website. Referenced by bags.
- **Bag**: Represents a single purchased bag of coffee. Key attributes: name, roaster (ref), origin, variety, processing method, altitude, roast date, barcode, status (active/archived), date added, date finished. Central entity — everything else hangs off it.
- **Grinder**: Represents a physical grinder owned by the user. Key attributes: name, type (hand/electric). Referenced by grind settings.
- **Brew Method**: User-defined brewing technique (e.g. V60, Espresso). Key attributes: name. Referenced by grind settings.
- **Grind Setting**: A logged grind setting for a specific bag + grinder + brew method combination. Key attributes: setting value, notes, date logged. Belongs to one bag, one grinder, one brew method. Multiple records allowed per combo to track drift over time. Records are immutable once saved — updates are expressed by adding new entries.
- **Rating**: A single star rating attached to one bag. Key attributes: score (1–5 stars). One per bag (replaceable).
- **App Preferences**: User-level settings including default brew ratio for the calculator.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The user can open the app and reach the grind setting for their current bag in 2 taps or fewer from the home screen.
- **SC-002**: Adding a new bag (without barcode scan) takes under 2 minutes from tapping "Add" to the bag appearing on the home screen.
- **SC-003**: The ratio calculator produces a correct result within 1 second of the user entering a value, with no additional interaction required.
- **SC-004**: All app features function fully without a network connection.
- **SC-005**: Archiving a bag and accessing its full grind history in the archive takes under 3 taps.
- **SC-006**: The stats screen loads with correct aggregated data in under 2 seconds, even with 100+ bags in history.
- **SC-007**: 100% of grind settings logged are preserved when a bag is archived — no data loss on status transitions.
- **SC-008**: The user can filter the archive and see matching results in under 1 second.

## Assumptions

- The app targets a single user on a single device; no multi-device sync or account system is in scope.
- The rating is a 1–5 star score (integers). No tasting notes or free-form text are included in the rating.
- The default brew ratio is 1:16; the user can override this in settings.
- Grind setting values are stored as free-text strings (e.g., "15", "3.5", "coarse") to accommodate any grinder scale without enforcing a numeric range.
- Processing method is a fixed four-item list (Washed, Natural, Honey, Anaerobic); user-defined processing methods are out of scope for v1.
- Brew methods are user-defined (the user creates their own list); a set of common defaults (V60, Hario Switch, Espresso, AeroPress, Chemex, French Press) will be pre-populated on first launch.
- Barcode scanning uses the device camera only; no external barcode database is consulted.
- Cloud backup, local export, and import are all deferred to a future version. This is a known gap: data is unrecoverable on uninstall or device reset without a platform-level backup. The data model will be designed with future export/import extensibility in mind.
- No brew logging, timers, shot tracking, or journaling features are in scope.
- The app is a mobile application (the user described tapping and a barcode camera, indicating a smartphone context).

## Clarifications

### Session 2026-05-06

- Q: Can past grind setting entries be edited or deleted? → A: Past entries are read-only; users can only add new entries (editing a setting means logging a new one).
- Q: What does the rating consist of — structured tasting notes, free text, or a simple score? → A: Star rating only (1–5 stars); no tasting notes or free-form text.
- Q: Where does the user trigger adding or editing a bag's star rating? → A: Prompted automatically when marking a bag as finished (skippable); editable from the archive entry afterwards.
- Q: What happens when the user tries to delete a grinder or brew method that has associated grind settings? → A: Deletion is blocked; system explains why and suggests renaming instead.
- Q: Should v1 include a local export/backup feature to protect against data loss on device reset? → A: Out of scope for v1; documented as a known gap. Data model designed to support future export/import without structural changes.
