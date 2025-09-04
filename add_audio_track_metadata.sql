-- Add title and description fields for audio tracks
-- This adds metadata fields for the script audio tracks and music files

ALTER TABLE podcasts 
ADD COLUMN IF NOT EXISTS script_audio_tracks_title TEXT,
ADD COLUMN IF NOT EXISTS script_audio_tracks_description TEXT,
ADD COLUMN IF NOT EXISTS script_music_title TEXT,
ADD COLUMN IF NOT EXISTS script_music_description TEXT;
