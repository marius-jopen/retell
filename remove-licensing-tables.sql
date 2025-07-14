-- =============================================
-- REMOVE LICENSING FUNCTIONALITY
-- =============================================
-- This script removes all licensing-related tables and functionality
-- to simplify the RETELL application

-- Drop foreign key constraints first
ALTER TABLE contracts DROP CONSTRAINT IF EXISTS contracts_license_id_fkey;
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_license_id_fkey;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_license_id_fkey;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_template_id_fkey;
ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS questionnaire_responses_user_id_fkey;
ALTER TABLE questionnaire_templates DROP CONSTRAINT IF EXISTS questionnaire_templates_created_by_fkey;
ALTER TABLE licenses DROP CONSTRAINT IF EXISTS licenses_podcast_id_fkey;
ALTER TABLE licenses DROP CONSTRAINT IF EXISTS licenses_episode_id_fkey;
ALTER TABLE licenses DROP CONSTRAINT IF EXISTS licenses_client_id_fkey;

-- Drop licensing-related tables
DROP TABLE IF EXISTS contracts;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS questionnaire_responses;
DROP TABLE IF EXISTS questionnaire_templates;
DROP TABLE IF EXISTS licenses;

-- Drop licensing-related types
DROP TYPE IF EXISTS license_type;
DROP TYPE IF EXISTS payment_status;
DROP TYPE IF EXISTS payment_type;
DROP TYPE IF EXISTS contract_status;

-- Update user_role enum to remove client
ALTER TYPE user_role DROP VALUE IF EXISTS 'client';

-- Update user_profiles table to set default role to 'author' instead of 'client'
ALTER TABLE user_profiles ALTER COLUMN role SET DEFAULT 'author';

-- Update any existing client users to author role (optional - comment out if you want to keep them as clients)
-- UPDATE user_profiles SET role = 'author' WHERE role = 'client';

-- Drop RLS policies for removed tables
DROP POLICY IF EXISTS "Clients can view their own licenses" ON licenses;
DROP POLICY IF EXISTS "Authors can view licenses for their podcasts" ON licenses;
DROP POLICY IF EXISTS "Clients can create licenses" ON licenses;
DROP POLICY IF EXISTS "Clients can update their own licenses" ON licenses;
DROP POLICY IF EXISTS "Admins can view all licenses" ON licenses;
DROP POLICY IF EXISTS "Admins can update license status" ON licenses;

DROP POLICY IF EXISTS "Users can view their own payments" ON payments;
DROP POLICY IF EXISTS "Authors can view payments for their content" ON payments;
DROP POLICY IF EXISTS "Users can create payments" ON payments;
DROP POLICY IF EXISTS "Admins can view all payments" ON payments;

DROP POLICY IF EXISTS "Users can view questionnaire templates" ON questionnaire_templates;
DROP POLICY IF EXISTS "Admins can manage questionnaire templates" ON questionnaire_templates;

DROP POLICY IF EXISTS "Users can view their own questionnaire responses" ON questionnaire_responses;
DROP POLICY IF EXISTS "Admins can view all questionnaire responses" ON questionnaire_responses;
DROP POLICY IF EXISTS "Users can create questionnaire responses" ON questionnaire_responses;

DROP POLICY IF EXISTS "Users can view their own contracts" ON contracts;
DROP POLICY IF EXISTS "Admins can view all contracts" ON contracts;

-- Clean up any remaining references
SELECT 'Licensing functionality successfully removed from database' AS result; 