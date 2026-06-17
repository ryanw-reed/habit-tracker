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

## Delivery workflow

Build in **small, visible increments**: ship the smallest thing that renders, run `npm run build`, then get user feedback before extending. The user iterates on visuals on-screen, so favor getting pixels up over fully speccing ahead — but still surface options first (see Working principles). Commit/merge at natural breakpoints and keep `main` runnable. Development happens directly on `main` for this project.

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
- `src/lib/repository/migrations.ts` — schema versioning. Every saved blob is wrapped with `{ schemaVersion, data }`. On load, `runMigrations` walks pending migrations to bring data forward to `CURRENT_SCHEMA_VERSION`. **When changing the shape of any persisted data, bump `CURRENT_SCHEMA_VERSION` and add a migration function** — this convention is followed rigorously. The chain is currently at **v6**: v2 made `goal.sections` `string[]`; v3 renamed `route.actionItems` → `route.tasks`; v4 split habit `notes` into `actions`/`context`; v5 replaced habit `durationMinutes` with the `quantity`/`baseQuantity`/`incrementQuantity`/`unitId` system; v6 added `habit.completedDates`. Each migration is a defensive pure function tolerant of missing/old-shaped fields.
- `src/lib/repository/index.ts` — exports the active repository singleton.
- `src/stores/goalsStore.ts` — Zustand store wrapping the repository. Components never call the repository directly. The store exposes typed CRUD per entity (goals, routes, habits, tasks, experiments, maintenance) and persists on every mutation. Beyond CRUD it exposes `moveHabit` (reorder within a route) and `toggleHabitCompletion` (per-date habit check-off). A shared `applyRoutePatch` helper centralizes nested route updates — use it for new route-scoped mutations.
- Supabase is installed as a dependency but **not yet wired up**. The intent is that swapping `LocalStorageRepository` for a future `SupabaseRepository` requires no UI changes — preserve this property.

### Domain model

Hierarchy: **Goal → Route[] → (Habit[], Task[], Experiment[], MaintenanceItem[])**

- `src/types/index.ts` is the single source of truth for the data model.
- `Goal.sections` is keyed by IDs from `src/config/goalSections.ts`. To add a new fixed section, add an entry to the `GOAL_SECTIONS` constant — the UI iterates over it. End users cannot create sections; only the developer can.
- All section values are `string[]` (bullet lists). If a longform section is ever needed, introduce a per-section `type` discriminator rather than mixing raw `string` back into the storage shape.
- A `Habit` recurs weekly via `daysOfWeek` (no start/end bound) with an optional specific `timeOfDay`; a `quantity`/`baseQuantity`/`incrementQuantity` + `unitId` target system (progressive overload; units in `src/config/habitUnits.ts`); `actions`/`context`/`links`; an optional `calendarAlias` (short label for the calendar); and `completedDates: string[]` (yyyy-MM-dd keys). **Completion is per-date** — a recurring habit is checked off independently on each day.

### UI layout

- `src/App.tsx` mounts `<BrowserRouter>` and a single layout route (`AppShell`) wrapping three pages:
  - `/` → `pages/GoalsPage.tsx` (card grid + new-goal dialog)
  - `/goals/:goalId` → `pages/GoalDetailPage.tsx` (header + sections accordion + routes tabs + four nested panels per route)
  - `/calendar` → `pages/CalendarPage.tsx` (custom month grid; see Calendar below)
- `components/layout/AppShell.tsx` — sidebar + main content area.
- `components/goal/`, `components/route/`, `components/calendar/` — feature components organized by domain entity.
- `components/ui/` — shadcn primitives. Modifying one of these affects *every* consumer. Several have already been corrected away from buggy or surprising shadcn defaults (button hover gating to `<a>` only, accordion fixed-height locking content, accordion underline on hover, default tab variant rendering a "box" around the active tab). **Do not regenerate these files unthinkingly** — read the existing customizations first. Two recurring gotchas when overriding these primitives: (1) **a base class with a responsive prefix can only be overridden at the same prefix** — `DialogContent` ships `sm:max-w-sm`, so an unprefixed `max-w-4xl` won't win; pass `sm:max-w-4xl`. (2) **Never nest interactive elements** — the shadcn `Checkbox`/`Button` render their own `<button>`, so don't place them inside another clickable button; use sibling click targets or a custom indicator (see `DayHabitsOverlay` rows).

### Calendar

- Custom month grid built on `date-fns` — **not** `react-big-calendar` (evaluated and removed). The model is a list-on-each-day, not a timed hour-axis schedule; don't reintroduce a calendar library without revisiting this.
- `src/lib/calendar/events.ts` is a pure derivation layer: `buildCalendarModel(goals, filter)` flattens the goal hierarchy into a weekday-indexed habit map + date-keyed tasks + experiment spans; `itemsForDate(model, date)` resolves a day's habits with per-date `completed`. Keep calendar logic here so components stay presentational.
- Month cells are **intentionally habits-only**: each day shows a single `Habits completed · X/Y` chip (overflow-proof at any habit count). Tasks/experiments are deliberately not rendered on the grid (the model still derives them for a later increment) — don't "fix" this by adding them back without asking.
- `DayHabitsOverlay` is a two-pane modal that doubles as the evolving **day view**: left = the day's habit checklist (round control toggles completion, row body selects the habit); right = `HabitDetailPanel`, a read-optimized habit view whose Edit button reuses `HabitDialog`. A planned increment adds Morning/Afternoon/Evening/Anytime time buckets + drag here.

### Editing patterns

- Most text fields are "live edit": `onBlur` commits to the store, and empty values on blur typically delete the row. See `SectionBulletList`, `TasksPanel`, `MaintenancePanel`. Preserve this pattern when adding new editable lists.
- Wrappable text inputs use `<Textarea>` with `field-sizing-content` (already in the shadcn Textarea base). Do not use `<Input>` for any field that needs to wrap.
- Shared date/schedule formatters live in `src/lib/dates.ts` (`formatTime`, `formatDays`, `daysUntil`, `describeCountdown`). Reuse them rather than re-implementing — both the route panels and the calendar consume them, so they stay in sync.
- Prefer **deriving** state from props/store over syncing it via `useEffect` + `setState` where practical (e.g. `DayHabitsOverlay` derives the effective selected habit each render instead of an effect). ESLint flags `set-state-in-effect`; the older live-edit fields predate this rule and are known debt.
- Hydration: `useGoalsStore.hydrate()` runs once in `App.tsx`. `GoalDetailPage` returns `null` until `hydrated` is true to avoid flashing a "not found" state.

### Visual design

- `--accent-action` (defined in `src/index.css`) is the project's adjustable accent token, currently a medium gray. `--accent-done` (same file) is the green completion accent used for checked-off habits. Both have light/dark values and `--color-*` mappings in the `@theme inline` block.
- The default `Button` variant is customized: hover keeps the black background and shifts text to warm cream (`oklch(0.92 0.04 80)`). Disabled state is opacity-only.
- Goal-detail header gray line, sections accordion, and route tabs all share the same `max-w-5xl` content column so their dividers align horizontally. Preserve that alignment if the page is restructured.

## Persistence safety

Two guardrails are in place around saved data:

1. The schema versioning + migration runner described above.
2. A behavioral rule: before any change that alters the shape of persisted data (renaming or removing fields, changing storage representation, splitting/merging records), warn the user, describe the migration, and proceed only after acknowledgment. Additive changes (new fields, new entities) and cosmetic changes do not require warning.
