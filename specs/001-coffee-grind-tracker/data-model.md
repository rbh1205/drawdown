# Data Model: Specialty Coffee Grind Tracker

**Phase**: 1 | **Date**: 2026-05-06 | **Plan**: [plan.md](plan.md)

All entities are stored in IndexedDB via `idb-keyval` using per-entity named stores. Schemas are flat (no nested objects) per the constitution. IDs are UUIDs (`crypto.randomUUID()`). Dates are ISO 8601 strings (`YYYY-MM-DD`).

---

## Entities

### Bag

Primary entity. Everything else (grind settings, ratings) hangs off a bag.

```typescript
interface Bag {
  id: string;                  // uuid — primary key
  name: string;                // required
  roasterId: string;           // foreign key → Roaster.id
  origin: string;              // required, e.g. "Ethiopia"
  processingMethod: ProcessingMethod; // required
  variety?: string;            // optional, e.g. "Heirloom"
  altitude?: string;           // optional free text, e.g. "1800–2200m"
  roastDate?: string;          // optional, ISO date "YYYY-MM-DD"
  barcode?: string;            // optional, raw scanned/typed value
  status: 'active' | 'archived';
  dateAdded: string;           // ISO date, set on creation
  dateFinished?: string;       // ISO date, set when status → archived
  ratingScore?: 1 | 2 | 3 | 4 | 5; // optional; set via finish prompt or archive edit
}

type ProcessingMethod = 'washed' | 'natural' | 'honey' | 'anaerobic';
```

**Constraints**:
- `name`, `roasterId`, `origin`, `processingMethod` are required; all other fields optional.
- `ratingScore` is null/undefined until the user rates the bag.
- `dateFinished` is set only when `status` transitions to `'archived'`.

**State transitions**:
```
created (status='active') → mark finished → status='archived', dateFinished=today
```
No transition back from `archived` to `active` without an explicit user action (FR-028 note: re-activation is possible but not default).

---

### Roaster

```typescript
interface Roaster {
  id: string;     // uuid
  name: string;   // required
  country?: string;
  website?: string;
}
```

**Constraints**: `name` is required. Names are not enforced unique at the DB level (user controls deduplication via the suggest-existing-roaster UX in FR-008).

---

### Grinder

```typescript
interface Grinder {
  id: string;
  name: string;
  type: 'hand' | 'electric';
}
```

**Deletion rule** (FR-019): A grinder MUST NOT be deleted if any `GrindSetting` references its `id`. Enforced in application logic before calling `del(grindersStore, id)`.

---

### BrewMethod

```typescript
interface BrewMethod {
  id: string;
  name: string;   // e.g. "V60", "Hario Switch", "Espresso"
}
```

**Deletion rule** (FR-019): Same as Grinder — blocked if any `GrindSetting` references its `id`.

**Seed data**: Pre-populated on first launch with: V60, Hario Switch, Espresso, AeroPress, Chemex, French Press.

---

### GrindSetting

Immutable once saved. Each record represents one logged dial-in event.

```typescript
interface GrindSetting {
  id: string;          // uuid
  bagId: string;       // foreign key → Bag.id
  grinderId: string;   // foreign key → Grinder.id
  brewMethodId: string;// foreign key → BrewMethod.id
  settingValue: string;// free text, e.g. "15", "3.5", "coarse"
  notes?: string;      // optional free text
  dateLogged: string;  // ISO date, set on creation — immutable
}
```

**Constraints**:
- No edit or delete operations exposed to the user (FR-014, Clarification 1).
- Multiple records per `(bagId, grinderId, brewMethodId)` combination are expected and intended.
- Displayed in reverse-chronological order by `dateLogged`.

---

### AppPreferences

Singleton record stored under the key `'prefs'`.

```typescript
interface AppPreferences {
  defaultRatio: number; // e.g. 16 for a 1:16 ratio (coffee:water)
}
```

**Default**: `{ defaultRatio: 16 }` written on first launch if not present.

---

## Relationships

```
Roaster ──< Bag >── GrindSetting >── Grinder
                         └────────── BrewMethod
```

- One Roaster → many Bags
- One Bag → many GrindSettings (indexed via `bagId`)
- One Grinder → many GrindSettings (deletion blocked if referenced)
- One BrewMethod → many GrindSettings (deletion blocked if referenced)
- One Bag → one optional `ratingScore` (inline field, no join needed)

---

## idb-keyval Store Layout

```typescript
import { createStore } from 'idb-keyval';

export const bagsStore        = createStore('coffee-tracker', 'bags');
export const roastersStore    = createStore('coffee-tracker', 'roasters');
export const grindersStore    = createStore('coffee-tracker', 'grinders');
export const brewMethodsStore = createStore('coffee-tracker', 'brew-methods');
export const grindSettingsStore = createStore('coffee-tracker', 'grind-settings');
export const preferencesStore = createStore('coffee-tracker', 'preferences');
```

All stores live in the `coffee-tracker` IndexedDB database. The database name is fixed; store names match the entity plurals.

---

## Common Query Patterns

| Query | Implementation |
|---|---|
| Active bags (home screen) | `getAll(bagsStore)` → filter `status === 'active'` |
| Grind history for combo | `getAll(grindSettingsStore)` → filter `bagId + grinderId + brewMethodId`, sort by `dateLogged` desc |
| Archive (with optional filters) | `getAll(bagsStore)` → filter `status === 'archived'`, apply origin/processing/roaster filters, sort by `dateFinished` desc |
| Stats aggregation | `getAll(bagsStore)` → group/count in memory |
| Check grinder has settings | `getAll(grindSettingsStore)` → any record with `grinderId === id` |

All queries are in-memory; no cursor-based IndexedDB iteration needed at expected scale.

---

## Schema Evolution Notes

- Future export/import: serialize each store's records as a JSON array. The flat schema makes this trivial.
- Future cloud sync: add `updatedAt: string` timestamp to each entity. No structural changes to existing fields needed (FR-032).
