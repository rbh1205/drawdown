<!--
Sync Impact Report
==================
Version change: [template] → 1.0.0 (initial ratification)
Modified principles:
  - Principle I retained verbatim from template (Incremental Delivery with Frequent Feedback)
  - Principles II–V filled from scratch (UX-First, Radical Simplicity, Local-First Storage, PWA Baseline)
Added sections: "Tech Stack & Platform Constraints", "Development Workflow"
Removed sections: [SECTION_2_NAME], [SECTION_3_NAME] placeholders replaced with concrete sections above
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ — Constitution Check gate reads "Gates determined based on constitution file"; no structural change needed
  - .specify/templates/spec-template.md ✅ — No mandatory sections added or removed; compatible as-is
  - .specify/templates/tasks-template.md ✅ — Mobile path convention (android/src/) already present; compatible as-is
Deferred TODOs: None — all placeholders resolved
-->

# AgentDay Constitution

## Core Principles

### I. Incremental Delivery with Frequent Feedback (NON-NEGOTIABLE)

The plan is authored as an ordered ladder of iterations. Each iteration is a small, vertical
slice of user-visible value that runs end-to-end. Iterations are ordered so that any stopping
point leaves a coherent, working product. The next iteration is not implemented until the current
one has been exercised and feedback received; the plan itself may be refined between iterations
when running code reveals something the plan did not anticipate. At the end of each iteration the
agent stops and provides a brief user-perspective summary of what is now possible; it does not run
or verify the increment itself — that step is the user's.

### II. UX-First Design (NON-NEGOTIABLE)

Every implementation decision MUST be evaluated first through the lens of the mobile user
experience. Touch targets MUST be at minimum 44×44 dp. Interactions MUST feel native and
responsive — no layout shifts, no janky transitions. The UI MUST work reliably in one-handed use
on a typical Android screen. Complexity that serves the developer but not the user is prohibited.
Interactive elements MUST have accessible labels; color contrast MUST meet WCAG AA.

### III. Radical Simplicity

The codebase MUST remain as small and understandable as possible. YAGNI (You Aren't Gonna Need It)
is the default stance. New dependencies require explicit justification; if native browser APIs
suffice, a library MUST NOT be added. Abstractions are permitted only when the same pattern repeats
three or more times. Any complexity that violates this principle MUST be justified in the plan's
Complexity Tracking table.

### IV. Local-First Storage

All application data MUST be stored locally on the device. No backend server, no cloud sync, and
no user accounts are permitted in the baseline product. Storage MUST use `localStorage` for simple
key-value data or `IndexedDB` (via `idb-keyval`) for structured collections. Data schemas MUST be
flat and human-readable; nested structures require justification.

### V. Progressive Web App (PWA) Baseline

The app MUST be installable as a PWA on Android (valid web app manifest + registered service
worker). It MUST load and function fully offline once installed. The service worker MUST cache all
static assets on first install. Push notifications and background sync are NOT required in the
baseline.

## Tech Stack & Platform Constraints

- **Framework**: SvelteKit with the static adapter (no server runtime)
- **Build tool**: Vite (bundled with SvelteKit)
- **Storage**: `localStorage` for simple key-value data; `idb-keyval` when structured collections
  are needed
- **Styling**: Plain CSS custom properties by default; a lightweight utility library (e.g., Open
  Props) is permitted only if it measurably reduces bespoke CSS
- **Target platform**: Android Chrome via PWA; desktop Chrome is a secondary target
- **Minimum browser**: Chromium 110+
- TypeScript is optional in the baseline; opt in per feature when type safety justifies the
  overhead

## Development Workflow

- All UI work MUST be reviewed at a mobile viewport (360×780 dp or equivalent) before an
  iteration is marked complete
- The agent does NOT run the dev server to verify — the user drives verification on their device
  or via browser DevTools mobile emulation
- Feature branches follow the convention `###-feature-name`; commits are small and scoped to a
  single task
- Any deviation from the constitution MUST be recorded in the plan's Complexity Tracking table
  before implementation begins

## Governance

This constitution supersedes all other project conventions. Any amendment requires:

1. A documented reason and a version bump per the versioning policy below.
2. An updated Sync Impact Report (HTML comment at top of this file).
3. Dependent templates reviewed and updated if the amendment adds or removes mandatory constraints.

**Versioning policy**:
- MAJOR: Removal or redefinition of a principle that breaks existing feature work.
- MINOR: New principle or section added, or material expansion of an existing one.
- PATCH: Wording clarification, typo fix, or non-semantic refinement.

All features MUST verify compliance with this constitution in the Constitution Check section of
their plan before implementation begins.

**Version**: 1.0.0 | **Ratified**: 2026-05-06 | **Last Amended**: 2026-05-06
