-- Add English title and description fields to episodes table
ALTER TABLE episodes 
ADD COLUMN title_english TEXT,
ADD COLUMN description_english TEXT;

-- Add comments for clarity
COMMENT ON COLUMN episodes.title_english IS 'English version of the episode title (optional)';
COMMENT ON COLUMN episodes.description_english IS 'English version of the episode description (optional)';

