-- Add podcast image gallery table
CREATE TABLE IF NOT EXISTS podcast_image_gallery (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    podcast_id UUID REFERENCES podcasts(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    image_name TEXT NOT NULL,
    image_size BIGINT NOT NULL,
    image_type TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE podcast_image_gallery ENABLE ROW LEVEL SECURITY;

-- RLS Policies for podcast_image_gallery
CREATE POLICY "Users can view podcast image galleries" ON podcast_image_gallery
    FOR SELECT USING (true);

CREATE POLICY "Authors can insert their own podcast image galleries" ON podcast_image_gallery
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM podcasts 
            WHERE podcasts.id = podcast_image_gallery.podcast_id 
            AND podcasts.author_id = auth.uid()
        )
    );

CREATE POLICY "Authors can update their own podcast image galleries" ON podcast_image_gallery
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM podcasts 
            WHERE podcasts.id = podcast_image_gallery.podcast_id 
            AND podcasts.author_id = auth.uid()
        )
    );

CREATE POLICY "Authors can delete their own podcast image galleries" ON podcast_image_gallery
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM podcasts 
            WHERE podcasts.id = podcast_image_gallery.podcast_id 
            AND podcasts.author_id = auth.uid()
        )
    );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_podcast_image_gallery_podcast_id ON podcast_image_gallery(podcast_id);
CREATE INDEX IF NOT EXISTS idx_podcast_image_gallery_sort_order ON podcast_image_gallery(podcast_id, sort_order);
