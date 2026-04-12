# Job Hunt Daily

A daily job hunting tracker to help you stay consistent with checking job sites, logging applications, and managing your job search.

## Features

- ✅ Track which job sites you've visited today
- 📊 Visual progress indicator per category
- 🔄 Automatically resets daily at midnight
- 🎯 Sites organized into customizable categories
- 📝 Full application tracking (status, notes, tags, follow-up dates)
- 🏢 ATS Detection — automatically identifies Applicant Tracking Systems
- 🔍 Command palette (`⌘K`) for quick navigation and actions
- ⌨️ Vim-style keyboard shortcuts
- 💾 All data persists in localStorage
- 🌙 Light/dark theme support
- 📦 Export/import all data as JSON

## Views

### Home (`/`)
Your daily dashboard. Shows all job site categories with progress bars. Click a site to open it and mark it visited. Use action buttons on each card to add applications or manage existing ones.

### Applications (`/applications`)
Full application tracker. Add, edit, and delete applications. Filter by status, site, or search query. Grouped by company.

### Reports (`/reports`)
Analytics dashboard for your job hunt pipeline. Four reports: Status Counts (donut chart), Volume by Period (bar chart with day/week/month bucketing and time range filtering), Status Reach (how many applications reached each status), and Time in Status (average days per status). All reports include deleted applications to avoid skewing the data.

### Job Sites (`/job-sites`)
Manage your job site list. Add, edit, and delete sites and categories directly in the app — no JSON editing required.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `⌘K` / `Ctrl+K` | Open command palette |
| `j` / `k` | Move focus down / up (Home only) |
| `a` | Add application for focused site |
| `v` | Mark focused site as visited |
| `g h` | Go to Home |
| `g a` | Go to Applications |
| `g c` | Go to Categories |
| `g r` | Go to Reports |
| `g j` | Go to Job Sites |
| `t` | Toggle theme |
| `?` | Show shortcut reference |

## ATS Detection

Job Hunt Daily automatically detects which Applicant Tracking System each job site uses and displays a color-coded badge:

| Badge | ATS | Color |
|-------|-----|-------|
| WD | Workday | Blue |
| GH | Greenhouse | Green |
| LV | Lever | Purple |
| BH | BambooHR | Orange |
| PL | Polymer | Cyan |
| CT | Custom | Gray |

Detection is based on URL patterns. You can also set `atsType` explicitly when adding or editing a site in the app.

## Data Management

All data is stored in `localStorage` and can be exported and imported as JSON.

### Export
Header menu → Export... — downloads a full backup including visited sites, applications, and job sites.

### Import
Header menu → Import... — restores from a previously exported file. All sections are optional; only present sections are applied.

### Export format (v1.2)
```json
{
  "version": "1.2",
  "exportedAt": "...",
  "dailyChecklist": { "date": "...", "visited": ["..."] },
  "applications": [],
  "applicationHistory": [],
  "jobSites": { "categories": [], "sites": [] }
}
```

Files exported from v1.1 (applications and visited sites only) are still supported on import.

## Setup
```bash
npm install
npm run dev
```

## Scripts
```bash
npm run dev          # Start development server
npm run build        # Production build
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage
npm run lint         # Lint
npm run lint:fix     # Lint and auto-fix
npm run format       # Format with Prettier
npm run format:check # Check formatting
npm run validate     # Lint + format check + tests + typecheck
npm run typecheck    # TypeScript type check only
```

## Tech Stack

- Vue 3 + TypeScript
- Vite
- Tailwind CSS
- shadcn-vue / reka-ui
- TanStack Table
- VueUse
- Chart.js + vue-chartjs
- Vitest + Testing Library

## Development

### Code Quality

### Pre-commit Hooks

Husky and lint-staged run automatically on every commit:

- ESLint with auto-fix on staged `.js`, `.ts`, `.tsx`, `.vue` files
- Prettier formatting on all staged files
- Commits with unfixable lint errors are blocked

To bypass in an emergency: `git commit --no-verify`

### Recommended VSCode Extensions

The project includes workspace recommendations:

- Vue - Official (Volar)
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Error Lens
- Code Spell Checker