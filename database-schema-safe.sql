-- =============================================
-- RETELL Database Schema - Safe Version
-- =============================================
-- This script can be run multiple times safely
-- Uses IF NOT EXISTS and CREATE OR REPLACE
-- =============================================

-- Create custom types (skip if they exist)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'author', 'client');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE license_type AS ENUM ('buyout', 'revenue_share');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE content_status AS ENUM ('draft', 'pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE upload_type AS ENUM ('audio', 'script', 'image', 'document');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_type AS ENUM ('first_look', 'full_license');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE contract_status AS ENUM ('draft', 'active', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- TABLES
-- =============================================

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    role user_role NOT NULL DEFAULT 'client',
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    company TEXT,
    country TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Podcasts Table
CREATE TABLE IF NOT EXISTS podcasts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    cover_image_url TEXT,
    author_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    category TEXT NOT NULL,
    language TEXT NOT NULL,
    country TEXT NOT NULL,
    status content_status DEFAULT 'draft',
    rss_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Episodes Table
CREATE TABLE IF NOT EXISTS episodes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    podcast_id UUID REFERENCES podcasts(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    audio_url TEXT NOT NULL,
    script_url TEXT NOT NULL,
    duration INTEGER, -- in seconds
    episode_number INTEGER NOT NULL,
    season_number INTEGER DEFAULT 1,
    status content_status DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Licenses Table
CREATE TABLE IF NOT EXISTS licenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    podcast_id UUID REFERENCES podcasts(id) ON DELETE CASCADE NOT NULL,
    episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
    client_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    license_type license_type NOT NULL,
    territory TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'cancelled')),
    expires_at TIMESTAMP WITH TIME ZONE,
    first_look_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    license_id UUID REFERENCES licenses(id) ON DELETE CASCADE NOT NULL,
    stripe_payment_intent_id TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    status payment_status DEFAULT 'pending',
    payment_type payment_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Questionnaire Templates Table
CREATE TABLE IF NOT EXISTS questionnaire_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    schema JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Questionnaire Responses Table
CREATE TABLE IF NOT EXISTS questionnaire_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    podcast_id UUID REFERENCES podcasts(id) ON DELETE CASCADE NOT NULL,
    template_id UUID REFERENCES questionnaire_templates(id) ON DELETE CASCADE NOT NULL,
    author_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    responses JSONB NOT NULL,
    status content_status DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Contracts Table
CREATE TABLE IF NOT EXISTS contracts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    license_id UUID REFERENCES licenses(id) ON DELETE CASCADE NOT NULL,
    contract_url TEXT NOT NULL,
    status contract_status DEFAULT 'draft',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Agencies Table
CREATE TABLE IF NOT EXISTS agencies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    country TEXT NOT NULL,
    website TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Uploads Table
CREATE TABLE IF NOT EXISTS uploads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type TEXT NOT NULL,
    upload_type upload_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;

-- =============================================
-- DROP EXISTING POLICIES (if any)
-- =============================================

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
    DROP POLICY IF EXISTS "Users can create their own profile" ON user_profiles;
    DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
    DROP POLICY IF EXISTS "Admins can update user roles" ON user_profiles;
    
    DROP POLICY IF EXISTS "Anyone can view approved podcasts" ON podcasts;
    DROP POLICY IF EXISTS "Authors can view their own podcasts" ON podcasts;
    DROP POLICY IF EXISTS "Authors can create podcasts" ON podcasts;
    DROP POLICY IF EXISTS "Authors can update their own podcasts" ON podcasts;
    DROP POLICY IF EXISTS "Admins can view all podcasts" ON podcasts;
    DROP POLICY IF EXISTS "Admins can update podcast status" ON podcasts;
    
    DROP POLICY IF EXISTS "Anyone can view approved episodes" ON episodes;
    DROP POLICY IF EXISTS "Authors can view their own episodes" ON episodes;
    DROP POLICY IF EXISTS "Authors can create episodes" ON episodes;
    DROP POLICY IF EXISTS "Authors can update their own episodes" ON episodes;
    DROP POLICY IF EXISTS "Admins can view all episodes" ON episodes;
    DROP POLICY IF EXISTS "Admins can update episode status" ON episodes;
    
    DROP POLICY IF EXISTS "Clients can view their own licenses" ON licenses;
    DROP POLICY IF EXISTS "Authors can view licenses for their podcasts" ON licenses;
    DROP POLICY IF EXISTS "Clients can create licenses" ON licenses;
    DROP POLICY IF EXISTS "Clients can update their own licenses" ON licenses;
    DROP POLICY IF EXISTS "Admins can view all licenses" ON licenses;
    DROP POLICY IF EXISTS "Admins can update license status" ON licenses;
    
    DROP POLICY IF EXISTS "Users can view their own payments" ON payments;
    DROP POLICY IF EXISTS "Authors can view payments for their content" ON payments;
    DROP POLICY IF EXISTS "Clients can create payments" ON payments;
    DROP POLICY IF EXISTS "Admins can view all payments" ON payments;
    
    DROP POLICY IF EXISTS "Anyone can view active templates" ON questionnaire_templates;
    DROP POLICY IF EXISTS "Admins can manage templates" ON questionnaire_templates;
    
    DROP POLICY IF EXISTS "Authors can view their own responses" ON questionnaire_responses;
    DROP POLICY IF EXISTS "Authors can create responses" ON questionnaire_responses;
    DROP POLICY IF EXISTS "Authors can update their own responses" ON questionnaire_responses;
    DROP POLICY IF EXISTS "Admins can view all responses" ON questionnaire_responses;
    
    DROP POLICY IF EXISTS "Users can view their own contracts" ON contracts;
    DROP POLICY IF EXISTS "Authors can view contracts for their content" ON contracts;
    DROP POLICY IF EXISTS "Admins can view all contracts" ON contracts;
    
    DROP POLICY IF EXISTS "Anyone can view agencies" ON agencies;
    DROP POLICY IF EXISTS "Admins can manage agencies" ON agencies;
    
    DROP POLICY IF EXISTS "Users can view their own uploads" ON uploads;
    DROP POLICY IF EXISTS "Users can create uploads" ON uploads;
    DROP POLICY IF EXISTS "Admins can view all uploads" ON uploads;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- User Profiles Policies
CREATE POLICY "Users can view their own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can create their own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON user_profiles FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);
CREATE POLICY "Admins can update user roles" ON user_profiles FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Podcasts Policies
CREATE POLICY "Anyone can view approved podcasts" ON podcasts FOR SELECT USING (status = 'approved');
CREATE POLICY "Authors can view their own podcasts" ON podcasts FOR SELECT USING (author_id = auth.uid());
CREATE POLICY "Authors can create podcasts" ON podcasts FOR INSERT WITH CHECK (author_id = auth.uid());
CREATE POLICY "Authors can update their own podcasts" ON podcasts FOR UPDATE USING (author_id = auth.uid());
CREATE POLICY "Admins can view all podcasts" ON podcasts FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);
CREATE POLICY "Admins can update podcast status" ON podcasts FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Episodes Policies
CREATE POLICY "Anyone can view approved episodes" ON episodes FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM podcasts 
        WHERE id = episodes.podcast_id AND status = 'approved'
    )
);
CREATE POLICY "Authors can view their own episodes" ON episodes FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM podcasts 
        WHERE id = episodes.podcast_id AND author_id = auth.uid()
    )
);
CREATE POLICY "Authors can create episodes" ON episodes FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM podcasts 
        WHERE id = episodes.podcast_id AND author_id = auth.uid()
    )
);
CREATE POLICY "Authors can update their own episodes" ON episodes FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM podcasts 
        WHERE id = episodes.podcast_id AND author_id = auth.uid()
    )
);
CREATE POLICY "Admins can view all episodes" ON episodes FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);
CREATE POLICY "Admins can update episode status" ON episodes FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Licenses Policies
CREATE POLICY "Clients can view their own licenses" ON licenses FOR SELECT USING (client_id = auth.uid());
CREATE POLICY "Authors can view licenses for their podcasts" ON licenses FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM podcasts 
        WHERE id = licenses.podcast_id AND author_id = auth.uid()
    )
);
CREATE POLICY "Clients can create licenses" ON licenses FOR INSERT WITH CHECK (client_id = auth.uid());
CREATE POLICY "Clients can update their own licenses" ON licenses FOR UPDATE USING (client_id = auth.uid());
CREATE POLICY "Admins can view all licenses" ON licenses FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);
CREATE POLICY "Admins can update license status" ON licenses FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Payments Policies
CREATE POLICY "Users can view their own payments" ON payments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM licenses 
        WHERE id = payments.license_id AND client_id = auth.uid()
    )
);
CREATE POLICY "Authors can view payments for their content" ON payments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM licenses l
        JOIN podcasts p ON l.podcast_id = p.id
        WHERE l.id = payments.license_id AND p.author_id = auth.uid()
    )
);
CREATE POLICY "Clients can create payments" ON payments FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM licenses 
        WHERE id = payments.license_id AND client_id = auth.uid()
    )
);
CREATE POLICY "Admins can view all payments" ON payments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Questionnaire Templates Policies
CREATE POLICY "Anyone can view active templates" ON questionnaire_templates FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage templates" ON questionnaire_templates FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Questionnaire Responses Policies
CREATE POLICY "Authors can view their own responses" ON questionnaire_responses FOR SELECT USING (author_id = auth.uid());
CREATE POLICY "Authors can create responses" ON questionnaire_responses FOR INSERT WITH CHECK (author_id = auth.uid());
CREATE POLICY "Authors can update their own responses" ON questionnaire_responses FOR UPDATE USING (author_id = auth.uid());
CREATE POLICY "Admins can view all responses" ON questionnaire_responses FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Contracts Policies
CREATE POLICY "Users can view their own contracts" ON contracts FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM licenses 
        WHERE id = contracts.license_id AND client_id = auth.uid()
    )
);
CREATE POLICY "Authors can view contracts for their content" ON contracts FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM licenses l
        JOIN podcasts p ON l.podcast_id = p.id
        WHERE l.id = contracts.license_id AND p.author_id = auth.uid()
    )
);
CREATE POLICY "Admins can view all contracts" ON contracts FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Agencies Policies
CREATE POLICY "Anyone can view agencies" ON agencies FOR SELECT USING (true);
CREATE POLICY "Admins can manage agencies" ON agencies FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Uploads Policies
CREATE POLICY "Users can view their own uploads" ON uploads FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create uploads" ON uploads FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can view all uploads" ON uploads FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_podcasts_author_id ON podcasts(author_id);
CREATE INDEX IF NOT EXISTS idx_podcasts_status ON podcasts(status);
CREATE INDEX IF NOT EXISTS idx_episodes_podcast_id ON episodes(podcast_id);
CREATE INDEX IF NOT EXISTS idx_episodes_status ON episodes(status);
CREATE INDEX IF NOT EXISTS idx_licenses_podcast_id ON licenses(podcast_id);
CREATE INDEX IF NOT EXISTS idx_licenses_client_id ON licenses(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_license_id ON payments(license_id);
CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_podcast_id ON questionnaire_responses(podcast_id);
CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_author_id ON questionnaire_responses(author_id);
CREATE INDEX IF NOT EXISTS idx_contracts_license_id ON contracts(license_id);
CREATE INDEX IF NOT EXISTS idx_uploads_user_id ON uploads(user_id);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- CRITICAL: Function to handle new user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User'),
        COALESCE(NEW.raw_user_meta_data ->> 'role', 'client')::user_role
    );
    RETURN NEW;
END;
$$ language 'plpgsql' security definer;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_podcasts_updated_at ON podcasts;
CREATE TRIGGER update_podcasts_updated_at BEFORE UPDATE ON podcasts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_episodes_updated_at ON episodes;
CREATE TRIGGER update_episodes_updated_at BEFORE UPDATE ON episodes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_licenses_updated_at ON licenses;
CREATE TRIGGER update_licenses_updated_at BEFORE UPDATE ON licenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_questionnaire_templates_updated_at ON questionnaire_templates;
CREATE TRIGGER update_questionnaire_templates_updated_at BEFORE UPDATE ON questionnaire_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_questionnaire_responses_updated_at ON questionnaire_responses;
CREATE TRIGGER update_questionnaire_responses_updated_at BEFORE UPDATE ON questionnaire_responses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contracts_updated_at ON contracts;
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_agencies_updated_at ON agencies;
CREATE TRIGGER update_agencies_updated_at BEFORE UPDATE ON agencies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SAMPLE DATA
-- =============================================

-- Insert default questionnaire template (if not exists)
INSERT INTO questionnaire_templates (name, description, schema, is_active) 
SELECT 'Default Licensing Questionnaire', 'Standard licensing questionnaire for podcast content', '{
  "fields": [
    {
      "id": "content_type",
      "type": "select",
      "label": "Content Type",
      "required": true,
      "options": ["Full Podcast", "Individual Episodes", "Podcast Concept"]
    },
    {
      "id": "territory",
      "type": "multiselect",
      "label": "Preferred Territories",
      "required": true,
      "options": ["United States", "Canada", "United Kingdom", "Germany", "France", "Spain", "Italy", "Netherlands", "Other"]
    },
    {
      "id": "license_type",
      "type": "select",
      "label": "License Type",
      "required": true,
      "options": ["Buyout", "Revenue Share"]
    },
    {
      "id": "duration",
      "type": "select",
      "label": "License Duration",
      "required": true,
      "options": ["1 Year", "2 Years", "3 Years", "5 Years", "Perpetual"]
    },
    {
      "id": "exclusivity",
      "type": "select",
      "label": "Exclusivity",
      "required": true,
      "options": ["Exclusive", "Non-Exclusive"]
    },
    {
      "id": "modifications",
      "type": "checkbox",
      "label": "Modifications Allowed",
      "options": ["Edit for length", "Translate", "Add intro/outro", "Change music"]
    },
    {
      "id": "target_audience",
      "type": "text",
      "label": "Target Audience Description",
      "required": true
    },
    {
      "id": "distribution_channels",
      "type": "multiselect",
      "label": "Distribution Channels",
      "required": true,
      "options": ["Spotify", "Apple Podcasts", "Google Podcasts", "Radio", "Streaming Platforms", "Other"]
    },
    {
      "id": "budget_range",
      "type": "select",
      "label": "Budget Range",
      "required": true,
      "options": ["Under $1,000", "$1,000 - $5,000", "$5,000 - $10,000", "$10,000 - $25,000", "$25,000+"]
    },
    {
      "id": "additional_info",
      "type": "textarea",
      "label": "Additional Information",
      "required": false
    }
  ]
}', true
WHERE NOT EXISTS (SELECT 1 FROM questionnaire_templates WHERE name = 'Default Licensing Questionnaire');

-- Insert sample agencies data (if not exists)
INSERT INTO agencies (name, description, contact_email, country, website)
SELECT * FROM (VALUES
    ('BBC Radio', 'British Broadcasting Corporation Radio Division', 'radio@bbc.co.uk', 'United Kingdom', 'https://www.bbc.co.uk/radio'),
    ('NPR', 'National Public Radio', 'programs@npr.org', 'United States', 'https://www.npr.org'),
    ('CBC Radio', 'Canadian Broadcasting Corporation Radio', 'radio@cbc.ca', 'Canada', 'https://www.cbc.ca/radio'),
    ('Radio France', 'French National Radio', 'contact@radiofrance.fr', 'France', 'https://www.radiofrance.fr'),
    ('ARD', 'German Public Broadcasting', 'info@ard.de', 'Germany', 'https://www.ard.de')
) AS temp(name, description, contact_email, country, website)
WHERE NOT EXISTS (SELECT 1 FROM agencies WHERE agencies.name = temp.name);

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

SELECT 'RETELL Database Setup Complete! ✅
- All tables created with proper structure
- RLS policies configured for security
- Automatic user profile creation enabled
- Sample data inserted
- Ready for production use!' AS status; 