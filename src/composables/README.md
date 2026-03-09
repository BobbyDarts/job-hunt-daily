# Composables

This directory contains all Vue composables for the app. Each composable encapsulates a specific concern and is designed to be called from components or other composables.

---

## `use-add-application-dialog`
Singleton dialog state for the Add Application dialog. Holds the `open` flag and the `site` ref (which job site triggered the dialog). Exposes `openDialog(site?)` and `closeDialog()`.

## `use-applications`
Full CRUD interface for job applications backed by `localStorage`. Handles create, update, delete, and retrieval, as well as application history snapshots on every update. Also exposes computed stats (`totalCount`, `countByStatus`) and filter/search helpers.

## `use-ats-detection`
Thin wrapper around the ATS detection library. Given a `JobSite`, returns either an `ATSInfo` object (type, initials, color classes, URL patterns) or `undefined`. Also exposes a boolean `isATS(site)` helper.

## `use-category-progress`
Computes sorted categories (by site count descending, sites alphabetically), per-category visited counts and progress percentages, and `maxCategoryHeight` for card layout. Results are cached in a `categoryStats` computed to avoid redundant recalculation. Both params are optional — if omitted, data is pulled from `useJobData()` and `isSiteVisited` from `useVisitedSites()`. Pass them explicitly in tests to inject mock data.

## `use-command-palette`
Singleton open/close state for the command palette. Also registers Ctrl+K / Cmd+K (with `preventDefault`) to open the palette. Exposes `open`, `openCommandPalette()`, and `closeCommandPalette()`.

## `use-data-management`
Orchestrates full data export and import. On export, serializes visited sites and applications to a JSON blob and triggers a download. On import, parses and validates the JSON, then hydrates visited sites and replaces application data. Accepts optional storage key overrides for testability.

## `use-grouped-options`
Generic grouping and filtering composable for select option lists. Accepts a `getOptions` factory and a config with `groupByCategory`, `searchQuery`, and `sortWithin`. Returns `filtered` (search-filtered options), `grouped` (options partitioned into `{ category, options }` buckets — ungrouped options land in a single `null`-category bucket, options with no category are placed under `"Other"`), `isEmpty` (true when all groups are empty), and `selectedCountByCategory` (a factory that accepts an `isSelected` function and returns a computed count per category). Used internally by `BaseSelect`.

## `use-input-guard`
Returns a computed `notUsingInput` boolean that is `true` when the currently active element is not an `INPUT` or `TEXTAREA`. Used by `use-command-palette` and `use-keyboard-shortcuts` to guard against shortcuts firing while the user is typing.

## `use-job-data`
Singleton wrapper around the real `job-hunt-daily.json` data file. Calls `useJobSites` once at module level and re-exports everything — `data`, site lookups, `allSitesWithCategory`, and `totalSites`. The single source of truth for the app's job data.

## `use-job-sites`
Accepts any `JobHuntData` object and builds reactive lookup maps and computed arrays. Returns `siteById`, `siteByUrl`, `getSiteById()`, `getSiteByUrl()`, `allSitesWithCategory`, and `totalSites`. Parameterized for testability — `use-job-data` wraps this with the real data.

## `use-keyboard-shortcuts`
Registers all vim-style keyboard shortcuts via `useMagicKeys`. Handles `j`/`k` focus navigation (Home only), `a` for add application, `v` for mark visited, `g`+`a`/`g`+`h` sequences, and `?` for the shortcut reference dialog. Clears site focus state on route change.

## `use-select-model`
Generic selection state composable for single and multi-select. Accepts a `getValue` factory, an `emit` callback, and a `multiple` option. Returns `isSelected(val)` (checks membership in current value), `toggle(val)` (adds/removes from array in multi mode, replaces in single mode, emits `"__all__"` sentinel when clearing), and `selectedCount` (computed length). Used internally by `BaseSelect`.

## `use-shortcut-reference`
Singleton dialog state for the keyboard shortcut reference dialog. Exposes `open`, `openDialog()`, and `closeDialog()`.

## `use-site-focus`
Singleton registry of focusable job site card elements. Components register/unregister their DOM element and `JobSite` on mount/unmount. Exposes `focusNext()`, `focusPrev()` with wrap-around, index correction on unregister, and `focusedSite` for shortcut handlers.

## `use-visited-sites`
Tracks which job site URLs have been visited today, backed by `localStorage`. Automatically resets at midnight and on window focus regain. Exposes `markVisited()`, `isSiteVisited()`, `visitedCount`, `isComplete`, and `serialize`/`hydrate` for export/import.