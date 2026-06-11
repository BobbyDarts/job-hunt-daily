-- /src/services/repositories/schema/migrations.sql

-- ========================
-- Functions & Triggers
-- ========================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- ========================
-- Applications
-- ========================

create table applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  company text not null,
  position text not null,
  job_site_id text not null,
  job_site_url text,
  ats_type text,
  job_posting_url text,
  applied_date text not null,
  status text not null,
  tags text[],
  notes text,
  follow_up_date text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create trigger applications_updated_at
  before update on applications
  for each row execute function update_updated_at();

alter table applications enable row level security;

create policy "Users can only access their own applications"
  on applications for all
  using (auth.uid() = user_id);

-- ========================
-- Application History
-- ========================

create table application_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  application_id uuid null,
  history_timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
  reason text not null,
  -- mirrors application fields at time of snapshot
  company text not null,
  position text not null,
  job_site_id text not null,
  job_site_url text,
  ats_type text,
  job_posting_url text,
  applied_date text not null,
  status text not null,
  tags text[],
  notes text,
  follow_up_date text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table application_history enable row level security;

create policy "Users can only access their own application history"
  on application_history for all
  using (auth.uid() = user_id);

create index if not exists idx_application_history_application_id
on application_history(application_id);

-- ========================
-- Job Categories
-- ========================

create table job_categories (
  id text primary key,
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create trigger job_categories_updated_at
  before update on job_categories
  for each row execute function update_updated_at();

alter table job_categories enable row level security;

create policy "Users can only access their own job categories"
  on job_categories for all
  using (auth.uid() = user_id);

-- ========================
-- Job Sites
-- ========================

create table job_sites (
  id text primary key,
  user_id uuid references auth.users not null,
  name text not null,
  url text not null,
  category_id text not null references job_categories(id) on delete cascade,
  ats_type text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create trigger job_sites_updated_at
  before update on job_sites
  for each row execute function update_updated_at();

alter table job_sites enable row level security;

create policy "Users can only access their own job sites"
  on job_sites for all
  using (auth.uid() = user_id);

-- ========================
-- Visited Sites (today only)
-- ========================

create table visited_sites (
  user_id uuid references auth.users not null,
  url text not null,
  visited_date date not null default current_date,
  primary key (user_id, url, visited_date)
);

alter table visited_sites enable row level security;

create policy "Users can only access their own visited sites"
  on visited_sites for all
  using (auth.uid() = user_id);

-- ========================
-- Visited Site History
-- ========================

create table visited_site_history (
  user_id uuid references auth.users not null,
  date text not null,
  visited_urls text[] not null,
  total_sites integer not null,
  primary key (user_id, date)
);

alter table visited_site_history enable row level security;

create policy "Users can only access their own visited site history"
  on visited_site_history for all
  using (auth.uid() = user_id);


grant select, insert, update, delete
on applications
to authenticated;

grant select, insert, update, delete
on application_history
to authenticated;

grant select, insert, update, delete
on job_categories
to authenticated;

grant select, insert, update, delete
on job_sites
to authenticated;

grant select, insert, update, delete
on visited_sites
to authenticated;

grant select, insert, update, delete
on visited_site_history
to authenticated;