# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Working principles

These two rules supersede everything else.

1. **Always present options before making a change.** When the user asks for something to be changed, do not silently pick an approach and execute. Surface the relevant options, explain *how* each one works, explain the *rationale* (trade-offs, implications), and state your *recommended* choice based on your expertise and what is in the long-term best interest of the project and the code. Then wait for confirmation.

2. **Always fix at the deepest layer of the code.** Diagnose root causes; do not patch symptoms. Never resolve a bug by removing the feature or use case that exposed it. Never introduce hacks, workarounds, or "quick fixes" that paper over an underlying issue. If the right fix is structurally larger than the original ask, surface that — do not quietly take the cheap route.

## Commands

- `npm run dev` — start the Vite dev server (port 5173 by default).
- `npm run build` — TypeScript project-references check (`tsc -b`) followed by Vite production build. Run this before declaring work complete; it catches type errors the dev server tolerates.
- `npm run lint` — ESLint over the repo.
- `npm run preview` — serve the production build locally.

There is no test suite yet.

## Architecture

React 19 + Vite 8 + TypeScript. Tailwind v4 is configured via `@tailwindcss/vite`; all theme tokens live inside `src/index.css` via `@theme inline` — there is no `tailwind.config.js`. The shadcn/ui style preset is `radix-nova` with neutral base, using the unified `radix-ui` package as the primitive layer.

Path alias `@/*` resolves to `src/*`.

### Data layer (the most important thing to understand)

The whole app is built around a swappable repository abstraction:

```
component → useGoalsStore (zustand) → repository interface → LocalStorageRepository
```

- `src/lib/repository/types.ts` — `Repository` interface (`load`, `save`, `exportJSON`, `importJSON`).
- `src/lib/repository/localStorage.ts` — current implementation. Reads/writes a single JSON blob keyed by `STORAGE_KEY`.
- `src/lib/repository/migrations.ts` — schema versioning. Every saved blob is wrapped with `{ schemaVersion, data }`. On load, `runMigrations` walks pending migrations to bring data forward to `CURRENT_SCHEMA_VERSION`. **When changing the shape of any persisted data, bump the version and add a migration function.** Existing migrations: v1 → v2 (string → string[] for `goal.sections`).
- `src/lib/repository/index.ts` — exports the active repository singleton.
- `src/stores/goalsStore.ts` — Zustand store wrapping the repository. Components never call the repository directly. The store exposes typed CRUD per entity (goals, routes, habits, action items, experiments, maintenance) and persists on every mutation.
- Supabase is installed as a dependency but **not yet wired up**. The intent is that swapping `LocalStorageRepository` for a future `SupabaseRepository` requires no UI changes — preserve this property.

### Domain model

Hierarchy: **Goal → Route[] → (Habit[], ActionItem[], Experiment[], MaintenanceItem[])**

- `src/types/index.ts` is the single source of truth for the data model.
- `Goal.sections` is keyed by IDs from `src/config/goalSections.ts`. To add a new fixed section, add an entry to the `GOAL_SECTIONS` constant — the UI iterates over it. End users cannot create sections; only the developer can.
- All section values are `string[]` (bullet lists). If a longform section is ever needed, introduce a per-section `type` discriminator rather than mixing raw `string` back into the storage shape.

### UI layout

- `src/App.tsx` mounts `<BrowserRouter>` and a single layout route (`AppShell`) wrapping three pages:
  - `/` → `pages/GoalsPage.tsx` (card grid + new-goal dialog)
  - `/goals/:goalId` → `pages/GoalDetailPage.tsx` (header + sections accordion + routes tabs + four nested panels per route)
  - `/calendar` → `pages/CalendarPage.tsx` (placeholder; planned for a later phase)
- `components/layout/AppShell.tsx` — sidebar + main content area.
- `components/goal/`, `components/route/` — feature components organized by domain entity.
- `components/ui/` — shadcn primitives. Modifying one of these affects *every* consumer. Several have already been corrected away from buggy or surprising shadcn defaults (button hover gating to `<a>` only, accordion fixed-height locking content, accordion underline on hover, default tab variant rendering a "box" around the active tab). **Do not regenerate these files unthinkingly** — read the existing customizations first.

### Editing patterns

- Most text fields are "live edit": `onBlur` commits to the store, and empty values on blur typically delete the row. See `SectionBulletList`, `ActionItemsPanel`, `MaintenancePanel`. Preserve this pattern when adding new editable lists.
- Wrappable text inputs use `<Textarea>` with `field-sizing-content` (already in the shadcn Textarea base). Do not use `<Input>` for any field that needs to wrap.
- Hydration: `useGoalsStore.hydrate()` runs once in `App.tsx`. `GoalDetailPage` returns `null` until `hydrated` is true to avoid flashing a "not found" state.

### Visual design

- `--accent-action` (defined in `src/index.css`) is the project's adjustable accent token, currently a medium gray.
- The default `Button` variant is customized: hover keeps the black background and shifts text to warm cream (`oklch(0.92 0.04 80)`). Disabled state is opacity-only.
- Goal-detail header gray line, sections accordion, and route tabs all share the same `max-w-5xl` content column so their dividers align horizontally. Preserve that alignment if the page is restructured.

## Persistence safety

Two guardrails are in place around saved data:

1. The schema versioning + migration runner described above.
2. A behavioral rule: before any change that alters the shape of persisted data (renaming or removing fields, changing storage representation, splitting/merging records), warn the user, describe the migration, and proceed only after acknowledgment. Additive changes (new fields, new entities) and cosmetic changes do not require warning.
