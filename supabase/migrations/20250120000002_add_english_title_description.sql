-- Add English title and description fields to podcasts table
ALTER TABLE podcasts 
ADD COLUMN title_english TEXT,
ADD COLUMN description_english TEXT;

-- Add comments for clarity
COMMENT ON COLUMN podcasts.title_english IS 'English version of the podcast title (optional)';
COMMENT ON COLUMN podcasts.description_english IS 'English version of the podcast description (optional)';
