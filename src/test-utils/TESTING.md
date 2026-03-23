# Testing Philosophy

## What We Test

- **Composables** — full coverage of state, CRUD, computed outputs, and edge cases
- **Complex components** — rendering, user interaction, event emission, and validation logic
- **Utilities** — pure functions with clear inputs and outputs

## What We Intentionally Skip

### Thin wrapper components

Components that do nothing except pass props to a well-tested base component are not tested directly. The base component's test suite covers the behavior.

**Examples:**
- `CategorySelect`, `CategoryMultiSelect` — thin wrappers over `BaseSelect`, options built from `useJobSites().categories`
- `ATSSelect`, `ATSMultiSelect` — thin wrappers over `BaseSelect`, options built from static `ATS_TABLE`
- `SiteMultiSelect` — thin wrapper over `BaseSelect` with external sites prop

### Pure wiring components

Components with no logic — only mounting and connecting other tested components — are not tested.

**Examples:**
- `GlobalDialogs` — mounts singleton dialogs, all wired via composables tested elsewhere
- `ShortcutReferenceDialog` — static content wired to `useShortcutReference`
- `CommandPalette`, `CommandPaletteSites` — connect composable actions to UI items
- `HeaderActions` — navigation links, composable calls, dropdown items

### Submission/persistence paths in dialog components

Dialog components that call composable methods internally (e.g. `addSite()`, `updateSite()`) do not have submission tests. The persistence logic is covered by the composable test suite. Dialog tests focus on rendering, field population, validation feedback, and open/close behavior only.

**Examples:**
- `AddJobSiteDialog` — submit path covered by `use-job-sites.test.ts`
- `EditJobSiteDialog` — submit path covered by `use-job-sites.test.ts`
- `EditCategoryDialog` — submit path covered by `use-job-sites.test.ts`
- `AddCategoryInline` — submit path covered by `use-job-sites.test.ts`
- `AddCategoryDialog` — submit path covered by `use-job-sites.test.ts`

### Singleton dialog state composables

Composables built on `createDialogState()` with no additional logic are not tested directly. The factory pattern is covered by `use-add-application-dialog.test.ts`.

**Examples:**
- `useAddCategoryDialog` — no custom logic beyond `createDialogState()`; pattern covered by `use-add-application-dialog.test.ts`

### View smoke tests

Views only have basic smoke tests (renders, shows data, shows empty state). Filtering, sorting, URL sync, and dialog interactions are covered by composable and component tests.

### Keyboard and theme wiring composables

`useKeyboardShortcuts` and `useTheme` wire browser events and VueUse utilities to app-level actions. Not tested directly; behavior is covered by the composables they delegate to.

### Command palette composable

`useCommandPalette` registers `⌘K`/`Ctrl+K` via `useMagicKeys` in addition to managing open/close state. The keyboard registration is not tested directly. The singleton open/close pattern is tested in `use-add-application-dialog.test.ts` which uses the same `createDialogState` factory.

## General Principles

- Test behavior, not implementation
- If it's already tested in a composable or utility, don't re-test it in a component
- Prefer testing what the user sees and does over internal state
- Mocks should be minimal — only mock what the component directly depends on