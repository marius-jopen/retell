-- Add script-related fields to podcasts table
ALTER TABLE podcasts 
ADD COLUMN IF NOT EXISTS script_url TEXT,
ADD COLUMN IF NOT EXISTS script_english_url TEXT,
ADD COLUMN IF NOT EXISTS script_audio_tracks_url TEXT,
ADD COLUMN IF NOT EXISTS script_music_url TEXT;
