-- Remove translation tables as multi-language feature is no longer needed
-- This migration removes podcast_translations and podcast_country_translations tables

-- Drop the translation tables
drop table if exists public.podcast_country_translations;
drop table if exists public.podcast_translations;

-- Note: podcast_license_countries table is kept as it's used for licensing, not translations
