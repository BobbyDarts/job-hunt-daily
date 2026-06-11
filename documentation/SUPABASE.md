# Supabase Setup

This guide covers setting up a Supabase project to use as the backend for Job Hunt Daily.

## Prerequisites

- A [Supabase](https://supabase.com) account
- The project running locally (`npm run dev`)

## 1. Create a Supabase project

1. Log in to [supabase.com](https://supabase.com) and click **New project**
2. Choose an organization, give the project a name, set a database password, and select a region
3. Wait for the project to finish provisioning (~2 minutes)

## 2. Run migrations

1. In the Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `src/services/repositories/schema/migrations.sql`
3. Paste into the SQL editor and click **Run**

This creates all tables, triggers, and RLS policies.

## 3. Configure environment variables

In your project root, create or edit `.env.local`:

```bash
VITE_USE_SUPABASE=true
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Find your URL and anon key in the Supabase dashboard under **Project Settings → API**.

> `.env.local` is gitignored. Never commit your Supabase keys.

## 4. Run the app

```bash
npm run dev
```

When `VITE_USE_SUPABASE=true`, the app will show a login screen on first load. Create an account or log in to get started.

## 5. Migrate existing data (optional)

If you have existing data in localStorage you want to keep:

1. Before switching to Supabase mode, use **Header menu → Export...** to download a backup
2. Switch to Supabase mode and log in
3. Use **Header menu → Import...** to restore your data

All data can also be entered manually via the existing views — migration is not required.

## Architecture

When `VITE_USE_SUPABASE=true`, the factory in `src/services/repositories/factory/resolve-mode.ts` selects the Supabase repository implementations instead of the localStorage ones. No component or composable changes are required — the switch is entirely at the repository layer.

| localStorage | Supabase |
|---|---|
| `createLocalApplicationsRepository` | `createSupabaseApplicationsRepository` |
| `createLocalJobSitesRepository` | `createSupabaseJobSitesRepository` |
| `createLocalVisitedSitesRepository` | `createSupabaseVisitedSitesRepository` |

## Authentication

Supabase mode requires a logged-in user. All data is scoped to the authenticated user via Row Level Security policies — one user cannot access another user's data.

Email/password and magic link sign-in are supported. Auth is handled via `src/services/supabase/auth.ts`.

## Schema

The full schema including RLS policies and triggers lives in: `src/services/repositories/schema/migrations.sql`

Tables:
- `applications` — job applications
- `application_history` — immutable snapshots before each update or deletion
- `job_categories` — user's job site categories
- `job_sites` — user's job sites, referencing `job_categories`
- `visited_sites` — today's visited site URLs (one row per URL per date)
- `visited_site_history` — daily summaries of visited sites for habit reporting

## Notes

- The Supabase free tier is sufficient for personal use
- All tables have RLS enabled — direct database access without authentication will return no rows
- `job_sites` cascades on category delete, matching the localStorage behavior
- `updated_at` is maintained automatically by database triggers on `applications`, `job_categories`, and `job_sites`