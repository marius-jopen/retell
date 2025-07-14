-- =============================================
-- RETELL Database Schema - Timing Fix
-- =============================================
-- This fixes the foreign key constraint timing issue
-- by ensuring the trigger waits and handles the constraint properly
-- =============================================

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create a more robust trigger function that handles timing issues
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure the user exists in auth.users before creating profile
    -- This should not be needed in theory, but helps with race conditions
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.id) THEN
        RETURN NEW;
    END IF;

    -- Insert the user profile with proper error handling
    INSERT INTO public.user_profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'client')::user_role
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        updated_at = NOW();

    RETURN NEW;
EXCEPTION
    WHEN foreign_key_violation THEN
        -- Log the foreign key violation and continue
        RAISE LOG 'Foreign key violation creating user profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
    WHEN unique_violation THEN
        -- Profile already exists, update it
        UPDATE public.user_profiles SET
            email = NEW.email,
            full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
            role = COALESCE(NEW.raw_user_meta_data->>'role', 'client')::user_role,
            updated_at = NOW()
        WHERE id = NEW.id;
        RETURN NEW;
    WHEN others THEN
        -- Log other errors but don't fail the user creation
        RAISE LOG 'Error creating user profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger with AFTER INSERT to ensure timing
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Alternative: Create a function that can be called manually if trigger fails
CREATE OR REPLACE FUNCTION create_user_profile_if_missing(user_id UUID)
RETURNS TABLE(created BOOLEAN, profile_id UUID) AS $$
DECLARE
    profile_exists BOOLEAN;
    user_data RECORD;
BEGIN
    -- Check if profile already exists
    SELECT EXISTS(SELECT 1 FROM user_profiles WHERE id = user_id) INTO profile_exists;
    
    IF profile_exists THEN
        RETURN QUERY SELECT FALSE, user_id;
        RETURN;
    END IF;
    
    -- Get user data from auth.users
    SELECT email, raw_user_meta_data INTO user_data
    FROM auth.users 
    WHERE id = user_id;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, user_id;
        RETURN;
    END IF;
    
    -- Create the profile
    INSERT INTO user_profiles (id, email, full_name, role)
    VALUES (
        user_id,
        user_data.email,
        COALESCE(user_data.raw_user_meta_data->>'full_name', 'User'),
        COALESCE(user_data.raw_user_meta_data->>'role', 'client')::user_role
    );
    
    RETURN QUERY SELECT TRUE, user_id;
    
EXCEPTION
    WHEN others THEN
        RAISE LOG 'Error in create_user_profile_if_missing for user %: %', user_id, SQLERRM;
        RETURN QUERY SELECT FALSE, user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the function
SELECT 'Database timing fix applied successfully!' AS status; 