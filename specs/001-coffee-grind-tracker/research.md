# Research: Specialty Coffee Grind Tracker

**Phase**: 0 | **Date**: 2026-05-06 | **Plan**: [plan.md](plan.md)

---

## Decision 1: Barcode Scanning Approach

**Decision**: Use the native `BarcodeDetector` API with manual-entry fallback.

**Rationale**: `BarcodeDetector` is available in Chromium 83+ (well within our Chrome 110+ minimum). It requires no library, no bundle size cost, and handles the camera lifecycle natively. It supports QR codes and all common 1-D barcode formats (EAN-13, Code 128, etc.) used on specialty coffee packaging.

**Usage pattern**:
```
const detector = new BarcodeDetector({ formats: ['qr_code', 'ean_13', 'code_128'] });
const barcodes = await detector.detect(videoElement);
```

Feature-detect with `'BarcodeDetector' in window`; if absent (e.g., desktop Chrome without the Barcode API flag), degrade to manual text entry.

**Alternatives considered**:
- `jsQR` / `ZXing-js`: JS barcode decoding libraries. Heavier (~300 KB), no camera management. Rejected — violates Radical Simplicity; native API is sufficient for our target.
- External barcode database lookup: Explicitly out of scope (spec FR-006).

---

## Decision 2: Storage Strategy

**Decision**: `idb-keyval` with one `createStore` per entity type; all filtering done in memory.

**Rationale**: The constitution mandates `idb-keyval` for structured collections. For the expected scale (dozens to hundreds of bags, single user), loading all records of a type into memory and filtering in JavaScript is fast and far simpler than maintaining secondary indexes. `createStore` allows named, isolated stores without raw IndexedDB boilerplate.

**Store layout**:

| Store name | Key | Value type |
|---|---|---|
| `bags` | `bag.id` (uuid) | `Bag` |
| `roasters` | `roaster.id` | `Roaster` |
| `grinders` | `grinder.id` | `Grinder` |
| `brewMethods` | `brewMethod.id` | `BrewMethod` |
| `grindSettings` | `grindSetting.id` | `GrindSetting` |
| `preferences` | `'prefs'` (singleton) | `AppPreferences` |

**Alternatives considered**:
- Raw IndexedDB with cursor-based queries: Verbose, brittle, significant boilerplate. Rejected — idb-keyval is the constitution-mandated choice.
- Single store with prefixed keys (`bag:uuid`): Simpler but makes type-scoped `getAll` impossible without iterating all keys. Rejected in favour of per-entity stores.
- Dexie.js (full ORM): Heavier abstraction. Rejected — violates Radical Simplicity; in-memory filtering suffices.

---

## Decision 3: TypeScript

**Decision**: Opt in to TypeScript for this feature.

**Rationale**: The data model has 6 entity types with inter-references (GrindSetting references Bag, Grinder, and BrewMethod by ID). TypeScript catches mismatched IDs and missing fields at authoring time rather than at runtime. The overhead (tsconfig, type annotations) is justified by the model complexity. Constitution notes TypeScript as optional but explicitly allows opting in when type safety justifies the overhead.

**Alternatives considered**:
- Plain JavaScript with JSDoc: Partial type coverage, no enforcement. Rejected for this feature given entity count.

---

## Decision 4: PWA Setup

**Decision**: `vite-plugin-pwa` for service worker and web app manifest generation.

**Rationale**: SvelteKit with the static adapter + `vite-plugin-pwa` is the established, low-friction path to a fully installable PWA. The plugin auto-generates the service worker (Workbox precaching all static assets) and manifest from config. Manual service worker authoring would add ~200+ lines of boilerplate. One dependency, well-maintained, zero runtime cost.

**Manifest minimum for Android Chrome installability**: `name`, `short_name`, `start_url`, `display: standalone`, `background_color`, `theme_color`, icons at 192×192 and 512×512.

**Alternatives considered**:
- Manual service worker: Correct but high maintenance cost. Rejected under Radical Simplicity.
- `@vite-pwa/sveltekit` integration plugin: Same as above — this is the Svelte-specific wrapper around vite-plugin-pwa and is the canonical approach.

---

## Decision 5: Rating stored inline on Bag entity

**Decision**: Store `ratingScore` (1–5 integer or null) directly on the `Bag` record rather than as a separate entity.

**Rationale**: The spec defines a rating as a single field (score only, no notes). The constitution mandates flat schemas. A separate `Rating` entity would add a join for zero benefit. Inline storage is flat, readable, and eliminates a store.

**Alternatives considered**:
- Separate `Rating` store: Justified only if rating had multiple fields (notes, tags, etc.). Rejected — those were removed during clarification.

---

## Decision 6: Navigation pattern

**Decision**: Bottom tab bar with four tabs: Home, Archive, Calculator, Stats. Bag management flows are presented as sheets/push navigation within Home and Archive.

**Rationale**: Four top-level destinations match the four primary use surfaces. Bottom tabs are the native Android navigation pattern for 2–5 destinations (Material Design 3). One-handed reachability is maximised. Bag detail and add-bag are secondary views navigated to from the Home tab — they do not need their own tab.

**Tab destinations**:
1. **Home** — active rotation + add bag
2. **Archive** — finished bags + filters
3. **Calculator** — brew ratio tool
4. **Stats** — collection insights

**Alternatives considered**:
- Hamburger/drawer nav: Harder to reach one-handed; considered legacy pattern on Android. Rejected.
- Five tabs (adding Settings as top-level): Settings (grinder/brew method management, default ratio) is infrequent; better as a cog icon within relevant screens. Rejected to keep tab bar uncluttered.
