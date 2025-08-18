create table if not exists public.podcast_country_translations (
  id uuid primary key default gen_random_uuid(),
  podcast_id uuid not null references public.podcasts(id) on delete cascade,
  country_code text not null,
  title text not null,
  description text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (podcast_id, country_code)
);

alter table public.podcast_country_translations enable row level security;


