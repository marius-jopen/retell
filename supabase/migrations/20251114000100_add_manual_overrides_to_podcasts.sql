alter table public.podcasts
add column if not exists manual_overrides jsonb default '{}'::jsonb;

update public.podcasts
set manual_overrides = '{}'::jsonb
where manual_overrides is null;

