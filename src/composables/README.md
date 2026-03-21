# Composables

This directory contains all Vue composables for the app. Each composable encapsulates a specific concern and is designed to be called from components or other composables.

Each subdirectory has a barrel `index.ts` that re-exports its composables. Consumers should import from the subdirectory, not individual files:
```ts
import { useApplications } from '@/composables/data'
import { useCommandPalette } from '@/composables/ui'
```

---

## `data/`

Composables that own or interact with the app's data layer — reading from and writing to localStorage, the static job data file, or (in the future) a remote backend. Repository composables abstract the persistence layer; their consumers are thin reactive wrappers that expose the public API to the rest of the app.

### `use-applications`
Full CRUD interface for job applications. Handles create, update, delete, and retrieval, as well as application history snapshots on every update. Also exposes computed stats (`totalCount`, `countByStatus`) and filter/search helpers.

### `use-applications-repository`
Owns all persistence logic for applications and application history. Backed by `localStorage` via `useLocalStorage`. Handles the snapshot-before-update behavior that powers application history. Accepts optional `storageKey` and `historyStorageKey` overrides for test isolation.

### `use-ats-detection`
Thin wrapper around the ATS detection library. Given a `JobSite`, returns either an `ATSInfo` object (type, initials, color classes, URL patterns) or `undefined`. Also exposes a boolean `isATS(site)` helper.

### `use-data-management`
Orchestrates full data export and import. Exports all app data (visited sites, applications, application history, job sites) as a single versioned JSON file (v1.2). On import, validates and applies each section independently — all sections are optional. Accepts optional storage key overrides for test isolation. v1.1 files (no job sites) are still accepted on import.

### `use-job-sites`
Reactive interface over job site data. Returns `categories`, `sites`, `sitesByCategory`, `siteById`, `siteByUrl`, `categoryById`, `allSitesWithCategory`, `totalSites`, lookup helpers (`getSiteById`, `getSiteByUrl`, `getCategoryById`, `getSitesByCategory`), and full CRUD methods for both sites and categories (`addSite`, `updateSite`, `deleteSite`, `addCategory`, `updateCategory`, `deleteCategory`, `setAll`). Accepts an optional `storageKey` override for test isolation.

### `use-job-sites-repository`
Owns all persistence logic for job site data. Backed by `localStorage` via `useLocalStorage`, seeded from `job-hunt-daily.json` on first load. The data model is flat: `JobHuntData` contains a `categories` array and a `sites` array, with each site holding a `categoryId` reference rather than being nested inside a category. Exposes full CRUD for both sites and categories, plus `setAll` for bulk replacement. Accepts an optional `storageKey` override for test isolation. Supabase backend planned in Issue [#24](https://github.com/BobbyDarts/job-hunt-daily/issues/24).

### `use-visited-sites`
Tracks which job site URLs have been visited today. Automatically resets at midnight and on window focus regain. Exposes `markVisited()`, `isSiteVisited()`, `visitedCount`, `isComplete`, and `serialize`/`hydrate` for export/import.

### `use-visited-sites-repository`
Owns all persistence logic for visited sites. Backed by `localStorage` via `useLocalStorage`. Handles day-change detection, auto-reset via `watchDebounced`, and overnight tab detection via `useWindowFocus`. Accepts optional `storageKey` and `skipInitReset` overrides for test isolation.

---

## `ui/`

Singleton composables that manage the open/close state of global UI elements — dialogs, palettes, and focus registries. Each is a module-level singleton, meaning state is shared across all callers.

### `use-add-application-dialog`
Singleton dialog state for the Add Application dialog. Holds the `open` flag and the `site` ref (which job site triggered the dialog). Exposes `openDialog(site?)` and `closeDialog()`.

### `use-add-job-site-dialog`
Singleton dialog state for the Add Job Site dialog. Holds the `open` flag and a `category` ref (the `categoryId` string of the category that triggered the dialog, if any). Exposes `openDialog(categoryId?)` and `closeDialog()`. Used by both the `/job-sites` view and `CategoryCard` action bar.

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
Registers all vim-style keyboard shortcuts via `useMagicKeys`. Handles `j`/`k` focus navigation (Home only), `a` for add application, `v` for mark visited, `g`+`a`/`g`+`h`/`g`+`j` navigation sequences, `t` for theme toggle, and `?` for the shortcut reference dialog. Clears site focus state on route change.

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
Computes sorted categories (by site count descending), per-category sites (sorted alphabetically), visited counts and progress percentages, and `maxCategoryHeight` for card layout. Results are cached in a `categoryStats` computed — each entry contains `{ category, sites, visitedCount, progress }` — to avoid redundant recalculation. `CategoryCard` consumers should prefer reading `sites` from `categoryStats` rather than calling `getSitesByCategory` separately. Both params are optional — if omitted, data is pulled from `useJobSites()` and `isSiteVisited` from `useVisitedSites()`. Pass `storageKey` and/or `isSiteVisited` explicitly in tests to inject mock data.