-- Fix missing RLS policies for podcast_country_translations table
-- This table has RLS enabled but no policies, so no one can access it

-- Policy for podcast authors to manage their own podcast's country translations
CREATE POLICY "Authors can view their podcast country translations" ON public.podcast_country_translations FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.podcasts 
        WHERE id = podcast_country_translations.podcast_id AND author_id = auth.uid()
    )
);

CREATE POLICY "Authors can insert their podcast country translations" ON public.podcast_country_translations FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.podcasts 
        WHERE id = podcast_country_translations.podcast_id AND author_id = auth.uid()
    )
);

CREATE POLICY "Authors can update their podcast country translations" ON public.podcast_country_translations FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.podcasts 
        WHERE id = podcast_country_translations.podcast_id AND author_id = auth.uid()
    )
);

CREATE POLICY "Authors can delete their podcast country translations" ON public.podcast_country_translations FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.podcasts 
        WHERE id = podcast_country_translations.podcast_id AND author_id = auth.uid()
    )
);

-- Policy for admins to manage all podcast country translations
CREATE POLICY "Admins can view all podcast country translations" ON public.podcast_country_translations FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Admins can insert any podcast country translations" ON public.podcast_country_translations FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Admins can update any podcast country translations" ON public.podcast_country_translations FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Admins can delete any podcast country translations" ON public.podcast_country_translations FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Service role bypass policy
CREATE POLICY "Service role bypass for country translations" ON public.podcast_country_translations FOR ALL USING (auth.role() = 'service_role');

SELECT 'Country translations RLS policies created successfully!' AS status;
