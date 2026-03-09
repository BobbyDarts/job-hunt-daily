# Composables

This directory contains all Vue composables for the app. Each composable encapsulates a specific concern and is designed to be called from components or other composables.

Each subdirectory has a barrel `index.ts` that re-exports its composables. Consumers should import from the subdirectory, not individual files:

```ts
import { useApplications } from '@/composables/data'
import { useCommandPalette } from '@/composables/ui'
```

---

## `data/`

Composables that own or interact with the app's data layer — reading from and writing to localStorage, the static job data file, or (in the future) a remote backend. These are the composables that will be refactored to sit on top of the repository/service layer in [#23](https://github.com/BobbyDarts/job-hunt-daily/issues/23).

### `use-applications`
Full CRUD interface for job applications backed by `localStorage`. Handles create, update, delete, and retrieval, as well as application history snapshots on every update. Also exposes computed stats (`totalCount`, `countByStatus`) and filter/search helpers.

### `use-ats-detection`
Thin wrapper around the ATS detection library. Given a `JobSite`, returns either an `ATSInfo` object (type, initials, color classes, URL patterns) or `undefined`. Also exposes a boolean `isATS(site)` helper.

### `use-data-management`
Orchestrates full data export and import. On export, serializes visited sites and applications to a JSON blob and triggers a download. On import, parses and validates the JSON, then hydrates visited sites and replaces application data. Accepts optional storage key overrides for testability.

### `use-job-data`
Singleton wrapper around the real `job-hunt-daily.json` data file. Calls `useJobSites` once at module level and re-exports everything — `data`, site lookups, `allSitesWithCategory`, and `totalSites`. The single source of truth for the app's job data.

### `use-job-sites`
Accepts any `JobHuntData` object and builds reactive lookup maps and computed arrays. Returns `siteById`, `siteByUrl`, `getSiteById()`, `getSiteByUrl()`, `allSitesWithCategory`, and `totalSites`. Parameterized for testability — `use-job-data` wraps this with the real data.

### `use-visited-sites`
Tracks which job site URLs have been visited today, backed by `localStorage`. Automatically resets at midnight and on window focus regain. Exposes `markVisited()`, `isSiteVisited()`, `visitedCount`, `isComplete`, and `serialize`/`hydrate` for export/import.

---

## `ui/`

Singleton composables that manage the open/close state of global UI elements — dialogs, palettes, and focus registries. Each is a module-level singleton, meaning state is shared across all callers.

### `use-add-application-dialog`
Singleton dialog state for the Add Application dialog. Holds the `open` flag and the `site` ref (which job site triggered the dialog). Exposes `openDialog(site?)` and `closeDialog()`.

### `use-command-palette`
Singleton open/close state for the command palette. Also registers Ctrl+K / Cmd+K (with `preventDefault`) to open the palette. Exposes `open`, `openCommandPalette()`, and `closeCommandPalette()`.

### `use-shortcut-reference`
Singleton dialog state for the keyboard shortcut reference dialog. Exposes `open`, `openDialog()`, and `closeDialog()`.

### `use-site-focus`
Singleton registry of focusable job site card elements. Components register/unregister their DOM element and `JobSite` on mount/unmount. Exposes `focusNext()`, `focusPrev()` with wrap-around, index correction on unregister, and `focusedSite` for shortcut handlers.

---

## `keyboard/`

Composables responsible for registering and guarding keyboard interactions. These sit close to the browser event layer and feed into the `ui/` singletons.

### `use-input-guard`
Returns a computed `notUsingInput` boolean that is `true` when the currently active element is not an `INPUT` or `TEXTAREA`. Used by `use-command-palette` and `use-keyboard-shortcuts` to guard against shortcuts firing while the user is typing.

### `use-keyboard-shortcuts`
Registers all vim-style keyboard shortcuts via `useMagicKeys`. Handles `j`/`k` focus navigation (Home only), `a` for add application, `v` for mark visited, `g`+`a`/`g`+`h` sequences, and `?` for the shortcut reference dialog. Clears site focus state on route change.

---

## `lib/`

Generic, reusable composables with no app-specific knowledge. These are utility primitives used internally by base components and could in principle be extracted to a separate package.

### `use-grouped-options`
Generic grouping and filtering composable for select option lists. Accepts a `getOptions` factory and a config with `groupByCategory`, `searchQuery`, and `sortWithin`. Returns `filtered` (search-filtered options), `grouped` (options partitioned into `{ category, options }` buckets — ungrouped options land in a single `null`-category bucket, options with no category are placed under `"Other"`), `isEmpty` (true when all groups are empty), and `selectedCountByCategory` (a factory that accepts an `isSelected` function and returns a computed count per category). Used internally by `BaseSelect`.

### `use-select-model`
Generic selection state composable for single and multi-select. Accepts a `getValue` factory, an `emit` callback, and a `multiple` option. Returns `isSelected(val)` (checks membership in current value), `toggle(val)` (adds/removes from array in multi mode, replaces in single mode, emits `"__all__"` sentinel when clearing), and `selectedCount` (computed length). Used internally by `BaseSelect`.

---

## `dashboard/`

Composables that compute derived, view-specific data for the dashboard. These sit above the data layer and below the component layer — they transform raw data into what the dashboard views need.

### `use-category-progress`
Computes sorted categories (by site count descending, sites alphabetically), per-category visited counts and progress percentages, and `maxCategoryHeight` for card layout. Results are cached in a `categoryStats` computed to avoid redundant recalculation. Both params are optional — if omitted, data is pulled from `useJobData()` and `isSiteVisited` from `useVisitedSites()`. Pass them explicitly in tests to inject mock data.