# Composables

This directory contains all Vue composables for the app. Each composable encapsulates a specific concern and is designed to be called from components or other composables.

Each subdirectory has a barrel `index.ts` that re-exports its composables. Consumers should import from the subdirectory, not individual files:
```ts
import { useApplications } from '@/composables/data'
import { useCommandPalette } from '@/composables/ui'
```

---

## `data/`

Composables that own or interact with the app's data layer. Each composable is a module-level singleton initialized once in `main.ts` before the app mounts. Repository implementations live in `src/services/repositories/` and follow
a lazy init/get pattern: `init*Repository()` is called once at startup (from `main.ts`, `Welcome.vue`, or `Login.vue`) and `get*Repository()` is called by composables on each operation. The active implementation is selected by `src/services/repositories/factory/resolve-mode.ts` based on the stored mode preference, falling back to the `VITE_USE_SUPABASE` environment variable.

### `use-applications`
Singleton CRUD interface for job applications. Initialized via `init()` in `main.ts`. Exposes `createApplication`, `updateApplication`, `removeApplication`, `getApplication`, `getApplicationTimeline`, `getStatusChanges`, computed stats (`totalCount`, `countByStatus`), and filter/search helpers (`filterByStatus`, `filterByTag`, `search`). Also exposes `applicationHistory` for timeline and reporting use.

### `use-ats-detection`
Thin wrapper around the ATS detection library. Given a `JobSite`, returns either an `ATSInfo` object (type, initials, color classes, URL patterns) or `undefined`. Also exposes a boolean `isATS(site)` helper.

### `use-data-management`
Orchestrates full data export and import. Exports all app data (visited sites, visited site history, applications, application history, job sites) as a single versioned JSON file (v1.3). On import, validates and applies each section independently — all sections are optional. v1.1 and v1.2 files are still accepted on import.

### `use-job-sites`
Singleton reactive interface over job site data. Initialized via `init()` in `main.ts`. Returns `categories`, `sites`, computed maps (`sitesByCategory`, `siteById`, `siteByUrl`, `categoryById`, `categoryByName`, `allSitesWithCategory`, `totalSites`), lookup helpers (`getSiteById`, `getSiteByUrl`, `getCategoryById`, `getCategoryByName`, `getCategoryBySlug`, `getSitesByCategory`), and full CRUD methods for both sites and categories (`createSite`, `updateSite`, `removeSite`, `createCategory`, `updateCategory`, `removeCategory`).

### `use-visited-sites`
Singleton that tracks which job site URLs have been visited today. Initialized via `init()` in `main.ts` — initialization handles midnight reset detection and registers window focus and day-change watchers. Exposes `markVisited()`, `isSiteVisited()`, `visitedCount`, `isComplete`, `today`, `history`, and `serialize`/`hydrate` for export/import. Must be initialized after `useJobSites` since it reads `totalSites` when snapshotting history.

---

## `ui/`

Singleton composables that manage the open/close state of global UI elements — dialogs, palettes, and focus registries. Each is a module-level singleton, meaning state is shared across all callers.

### `use-add-application-dialog`
Singleton dialog state for the Add Application dialog. Holds the `open` flag and the `site` ref (which job site triggered the dialog). Exposes `openDialog(site?)` and `closeDialog()`.

### `use-add-job-site-dialog`
Singleton dialog state for the Add Job Site dialog. Holds the `open` flag and a `category` ref (the `categoryId` string of the category that triggered the dialog, if any). Exposes `openDialog(categoryId?)` and `closeDialog()`. Used by both the `/job-sites` view and `CategoryCard` action bar.

### `use-app-mode`
Singleton that tracks whether the app is running in `"local"` or
`"supabase"` mode. Persists the preference to localStorage via VueUse
`useLocalStorage`. Exposes `mode`, `isLocal`, `isSupabase`, `isSet`,
`setMode(mode)`, and `clearMode()`. Read at boot time by
`resolve-mode.ts` (via direct `localStorage.getItem` to avoid circular
imports) and by `HeaderActions` for the mode indicator badge.

### `use-command-palette`
Singleton open/close state for the command palette. Also registers `⌘K`/`Ctrl+K` (with `preventDefault`) to open the palette. Exposes `open`, `openCommandPalette()`, `closeCommandPalette()`, and `withClose(fn)` — a wrapper that calls a function then closes the palette.

### `use-shortcut-reference`
Singleton dialog state for the keyboard shortcut reference dialog. Exposes `open`, `openDialog()`, and `closeDialog()`.

### `use-site-focus`
Singleton registry of focusable job site card elements. Components register/unregister their DOM element and `JobSite` on mount/unmount. Exposes `focusNext()`, `focusPrev()` with wrap-around, index correction on unregister, and `focusedSite` for shortcut handlers.

### `use-theme`
Wraps VueUse's `useColorMode` to provide app-level theme toggling. Exposes `toggleTheme()`, `themeText` (e.g. `"Dark"` / `"Light"`), and `themeIcon` (a Lucide icon component reflecting the current mode). Used by `HeaderActions` and `useKeyboardShortcuts`.

---

## `keyboard/`

Composables responsible for registering and guarding keyboard interactions. These sit close to the browser event layer and feed into the `ui/` singletons.

### `use-input-guard`
Returns a computed `notUsingInput` boolean that is `true` when the currently active element is not an `INPUT` or `TEXTAREA`. Used by `use-command-palette` and `use-keyboard-shortcuts` to guard against shortcuts firing while the user is typing.

### `use-keyboard-shortcuts`
Registers all vim-style keyboard shortcuts via `useMagicKeys`. Handles `j`/`k` focus navigation (Home only), `a` for add application, `v` for mark visited, `g`+`a`/`g`+`h`/`g`+`c`/`g`+`r`/`g`+`j` navigation sequences, `t` for theme toggle, and `?` for the shortcut reference dialog. Clears site focus state on route change.

---

## `lib/`

Generic, reusable composables with no app-specific knowledge. These are utility primitives used internally by base components and could in principle be extracted to a separate package.

### `use-grouped-options`
Generic grouping and filtering composable for select option lists. Accepts a `getOptions` factory and a config with `groupByCategory`, `searchQuery`, and `sortWithin`. Returns `filtered` (search-filtered options), `grouped` (options partitioned into `{ category, options }` buckets — ungrouped options land in a single `null`-category bucket, options with no category are placed under `"Other"`), `isEmpty` (true when all groups are empty), and `selectedCountByCategory` (a factory that accepts an `isSelected` function and returns a computed count per category). Used internally by `BaseSelect`.

### `use-select-model`
Generic selection state composable for single and multi-select. Accepts a `getValue` factory, an `emit` callback, and a `multiple` option. Returns `isSelected(val)` (checks membership in current value), `toggle(val)` (adds/removes from array in multi mode, replaces in single mode, emits `"__all__"` sentinel when clearing), and `selectedCount` (computed length). Used internally by `BaseSelect`.

---

## `dashboard/`

Composables that compute derived, view-specific data for the dashboard and reports views. These sit above the data layer and below the component layer — they transform raw data into what the views need.

### `use-category-progress`
Computes sorted categories (by site count descending), per-category sites (sorted alphabetically), visited counts and progress percentages, and `maxCategoryHeight` for card layout. Results are cached in a `categoryStats` computed — each entry contains `{ category, sites, visitedCount, progress }` — to avoid redundant recalculation. Both params are optional — if omitted, data is pulled from `useJobSites()` and `isSiteVisited` from `useVisitedSites()`. Pass `isSiteVisited` explicitly in tests via `vi.mock`.

### `use-applications-reports`
Provides derived analytics data for the `/reports` view. Reads from `useApplications` — no storage keys or persistence logic live here. All computeds include deleted applications (reconstructed from history records) to avoid skewing report data.

Exposes:
- `deletedApplications` — last known snapshot of each deleted application, reconstructed from history records
- `statusCounts` — current count of applications grouped by status (passthrough of `countByStatus`)
- `volumeByPeriod` — applications grouped and counted by creation date, bucketed by `periodUnit` from `usePeriodUnit()`; returns `{ label, count }[]` sorted chronologically
- `statusReach` — count of applications that reached each status at any point in their history, derived from history snapshots
- `timeInStatus` — average and per-application duration (in days) spent in each status, derived from history snapshots; terminal statuses (`accepted`, `rejected`, `withdrew`) are capped at `updatedAt` rather than growing indefinitely

### `use-period-unit`
Module-level singleton. Controls the active period unit for `volumeByPeriod` charting. Exposes `state.periodUnit` (`"day" | "week" | "month"`, defaults to `"day"`), `VALID_PERIOD_UNITS`, and syncs to the URL via `?period=` query param.

### `use-report-time-range`
Module-level singleton. Controls the active time range filter for the Volume by Period report. Exposes `state.timeRange` (`"7d" | "30d" | "90d" | "all"`, defaults to `"30d"`) and `TIME_RANGES` (the full list of options for rendering the selector). Syncs to the URL via `?range=` query param.