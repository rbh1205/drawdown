# AgentDay — Agent Context

This file provides orientation for AI agents working on this codebase.

## Project

A personal specialty coffee tracking Progressive Web App. Local-first, no backend, no accounts.

## Constitution

Read `.specify/memory/constitution.md` before writing any code. Key constraints:
- SvelteKit (static adapter) + TypeScript + idb-keyval + vite-plugin-pwa
- All data in IndexedDB — no server, no cloud
- 44×44 dp touch targets; mobile-first (360×780 dp viewport)
- WCAG AA color contrast
- Minimum browser: Chromium 110+

## Active Feature

<!-- SPECKIT START -->
Plan: specs/001-coffee-grind-tracker/plan.md
<!-- SPECKIT END -->

## Key Artifacts

- Spec: `specs/001-coffee-grind-tracker/spec.md`
- Data model: `specs/001-coffee-grind-tracker/data-model.md`
- Data store contract: `specs/001-coffee-grind-tracker/contracts/data-store.md`
- Quickstart: `specs/001-coffee-grind-tracker/quickstart.md`
- Research: `specs/001-coffee-grind-tracker/research.md`
