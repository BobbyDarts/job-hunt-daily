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
- `DataTable` — renders a TanStack Table instance via `FlexRender`; no independent logic
- `DataToolbar` — slot-based toolbar layout with a conditional clear button; behavior covered by view tests

### Report chart components

Report components in `src/views/reports/` wrap Chart.js charts. Chart rendering itself is not tested — Chart.js is mocked out entirely. Tests cover only:
- The title and description render correctly
- The empty state renders when the composable returns no data

The chart data shape and options logic are covered implicitly by the `useApplicationsReports` composable tests.

**Examples:**
- `ApplicationStatusCounts` — chart rendering mocked; title and empty state tested
- `ApplicationVolumeByPeriod` — chart rendering mocked; title and empty state tested
- `ApplicationStatusReach` — chart rendering mocked; title and empty state tested
- `ApplicationTimeInStatus` — chart rendering mocked; title and empty state tested

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

### Table wiring composables

Composables in `composables/tables/` combine already-tested primitives (`useDataTable`, `useToolbarState`, `useQuerySync`) with straightforward dialog ref toggling. The filter→table adapter logic and URL sync are covered by their respective primitive tests. Not tested directly.

**Examples:**
- `useCategoryTable` — wires `useDataTable`, `useToolbarState`, `useQuerySync`, and delete/edit dialog refs
- `useJobSiteTable` — same pattern

### Column factory functions

`createTextColumn`, `createSortableHeader`, `createActionsColumn`, and the column definition factories (`createCategoryColumns`, `createJobSiteColumns`) produce TanStack Table column configurations. Their rendering output is covered implicitly by view smoke tests. Not tested directly.

### URL sync composable

`useQuerySync` depends on `useRoute` and `useRouter` and is tested implicitly through view smoke tests. The state sync behavior is straightforward `watch` wiring with no independent logic worth isolating.

### View smoke tests

Views only have basic smoke tests (renders, shows data, shows empty state). Filtering, sorting, URL sync, and dialog interactions are covered by composable and component tests.

### Router configuration

Route names, paths, and navigation behavior are covered implicitly by view smoke tests which push to named routes and assert on rendered content. A dedicated router test is not maintained — lazy-loaded route components cause reliable timeout issues in the test environment.

### Keyboard and theme wiring composables

`useKeyboardShortcuts` and `useTheme` wire browser events and VueUse utilities to app-level actions. Not tested directly; behavior is covered by the composables they delegate to.

### Command palette composable

`useCommandPalette` registers `⌘K`/`Ctrl+K` via `useMagicKeys` in addition to managing open/close state. The keyboard registration is not tested directly. The singleton open/close pattern is tested in `use-add-application-dialog.test.ts` which uses the same `createDialogState` factory.

## General Principles

- Test behavior, not implementation
- If it's already tested in a composable or utility, don't re-test it in a component
- Prefer testing what the user sees and does over internal state
- Mocks should be minimal — only mock what the component directly depends on
- Composables that call `useQuerySync` (e.g. `usePeriodUnit`, `useReportTimeRange`) require a `vue-router` mock in their test files since `useRoute` and `useRouter` are called internally. Mock pattern:

```ts
vi.mock("vue-router", () => ({
  useRoute: () => ({ name: "test", query: {} }),
  useRouter: () => ({ replace: vi.fn() }),
}));
```