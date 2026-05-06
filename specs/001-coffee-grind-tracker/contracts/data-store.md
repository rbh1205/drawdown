# Contract: Local Data Store

**Type**: IndexedDB schema contract  
**Date**: 2026-05-06  
**Stability**: v1 (no migration tooling required until schema breaks)

This document defines the authoritative shape of every record persisted by the app. Any code that reads from or writes to the stores MUST conform to these types. Changes to this contract require a version bump and a migration path documented here.

---

## Database

**Name**: `coffee-tracker`  
**Version**: 1

---

## Store: `bags`

**Key**: `bag.id` (string, UUID)

```typescript
{
  id: string;
  name: string;
  roasterId: string;
  origin: string;
  processingMethod: 'washed' | 'natural' | 'honey' | 'anaerobic';
  variety?: string;
  altitude?: string;
  roastDate?: string;          // "YYYY-MM-DD"
  barcode?: string;
  status: 'active' | 'archived';
  dateAdded: string;           // "YYYY-MM-DD"
  dateFinished?: string;       // "YYYY-MM-DD", present only when status = 'archived'
  ratingScore?: 1 | 2 | 3 | 4 | 5;
}
```

**Invariants**:
- `name`, `roasterId`, `origin`, `processingMethod`, `status`, `dateAdded` are always present.
- `dateFinished` is only set when `status === 'archived'`.
- `ratingScore` may be absent even on archived bags (skipped prompt).

---

## Store: `roasters`

**Key**: `roaster.id` (string, UUID)

```typescript
{
  id: string;
  name: string;
  country?: string;
  website?: string;
}
```

---

## Store: `grinders`

**Key**: `grinder.id` (string, UUID)

```typescript
{
  id: string;
  name: string;
  type: 'hand' | 'electric';
}
```

**Deletion guard**: A grinder MUST NOT be deleted while any `grind-settings` record references its `id`. Application code enforces this; the store itself has no constraint.

---

## Store: `brew-methods`

**Key**: `brewMethod.id` (string, UUID)

```typescript
{
  id: string;
  name: string;
}
```

**Deletion guard**: Same as `grinders`.

**Seed records** (written on first launch):

| id | name |
|---|---|
| `bm-v60` | V60 |
| `bm-switch` | Hario Switch |
| `bm-espresso` | Espresso |
| `bm-aeropress` | AeroPress |
| `bm-chemex` | Chemex |
| `bm-french-press` | French Press |

---

## Store: `grind-settings`

**Key**: `grindSetting.id` (string, UUID)

```typescript
{
  id: string;
  bagId: string;
  grinderId: string;
  brewMethodId: string;
  settingValue: string;   // free text, e.g. "15", "3.5", "medium-coarse"
  notes?: string;
  dateLogged: string;     // "YYYY-MM-DD"
}
```

**Invariants**:
- Records are immutable once written. No update or delete operations are exposed.
- Multiple records with the same `(bagId, grinderId, brewMethodId)` tuple are normal.

---

## Store: `preferences`

**Key**: `'prefs'` (singleton — only one record in this store)

```typescript
{
  defaultRatio: number;   // coffee-to-water multiplier, e.g. 16 means 1:16
}
```

**Default**: `{ defaultRatio: 16 }` on first launch.

---

## Contract Versioning

| Version | Change | Migration |
|---|---|---|
| v1 | Initial schema | — |

Future changes that add optional fields are backwards-compatible and do not require a version bump. Changes that remove fields, rename fields, or alter types require a version bump and a migration function run on app startup.
