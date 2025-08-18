-- Fix RLS policies to prevent infinite recursion
-- The problem is that the admin policies are checking the same table they're protecting

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update user roles" ON user_profiles;

-- Create fixed policies
-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- Users can create their own profile
CREATE POLICY "Users can create their own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- FIXED: Admins can view all profiles - use a function to avoid recursion
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$;

-- Admin policies using the function
CREATE POLICY "Admins can view all profiles" ON user_profiles FOR SELECT USING (is_admin());
CREATE POLICY "Admins can update user roles" ON user_profiles FOR UPDATE USING (is_admin());

-- Create a simple bypass policy for service role (used by admin client)
DROP POLICY IF EXISTS "Service role bypass" ON user_profiles;
CREATE POLICY "Service role bypass" ON user_profiles FOR ALL USING (auth.role() = 'service_role');

SELECT 'RLS policies fixed successfully!' AS status;
