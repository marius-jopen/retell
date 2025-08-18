-- Podcast license countries (many-to-many)
create table if not exists public.podcast_license_countries (
  podcast_id uuid not null references public.podcasts(id) on delete cascade,
  country_code text not null,
  created_at timestamptz not null default now(),
  primary key (podcast_id, country_code)
);

-- Podcast translations for title/description (not per-episode)
create table if not exists public.podcast_translations (
  id uuid primary key default gen_random_uuid(),
  podcast_id uuid not null references public.podcasts(id) on delete cascade,
  language_code text not null,
  title text not null,
  description text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (podcast_id, language_code)
);

-- Optional: enable RLS (assumes global policies set elsewhere)
alter table public.podcast_license_countries enable row level security;
alter table public.podcast_translations enable row level security;


