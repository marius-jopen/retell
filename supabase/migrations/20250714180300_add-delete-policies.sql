-- Fix podcast deletion by adding missing DELETE policies
-- The issue is that authors can't delete their own podcasts due to missing RLS policies

-- Add DELETE policy for authors to delete their own podcasts
CREATE POLICY "Authors can delete their own podcasts" ON podcasts FOR DELETE USING (author_id = auth.uid());

-- Add DELETE policy for authors to delete their own episodes
CREATE POLICY "Authors can delete their own episodes" ON episodes FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM podcasts 
        WHERE id = episodes.podcast_id AND author_id = auth.uid()
    )
);

-- Add DELETE policy for admins to delete any podcast
CREATE POLICY "Admins can delete any podcast" ON podcasts FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Add DELETE policy for admins to delete any episode
CREATE POLICY "Admins can delete any episode" ON episodes FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Confirm the policies were created
SELECT 'DELETE policies added successfully!' AS status; 