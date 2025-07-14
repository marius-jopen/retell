'use client'

import { useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

export default function DbFixPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')
  const supabase = createBrowserSupabaseClient()

  const runDbFix = async () => {
    setLoading(true)
    setResult('')

    try {
      // Run the database fix script
      const fixScript = `
        -- Drop existing policies and triggers
        DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
        DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
        DROP POLICY IF EXISTS "Users can create their own profile" ON user_profiles;
        DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
        DROP POLICY IF EXISTS "Admins can update user roles" ON user_profiles;

        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        DROP FUNCTION IF EXISTS handle_new_user();

        -- Create fixed trigger function
        CREATE OR REPLACE FUNCTION handle_new_user()
        RETURNS TRIGGER AS $$
        BEGIN
            INSERT INTO public.user_profiles (id, email, full_name, role)
            VALUES (
                NEW.id,
                NEW.email,
                COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
                COALESCE(NEW.raw_user_meta_data->>'role', 'client')::user_role
            );
            RETURN NEW;
        EXCEPTION
            WHEN others THEN
                RAISE LOG 'Error creating user profile for user %: %', NEW.id, SQLERRM;
                RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        -- Create the trigger
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION handle_new_user();

        -- Recreate RLS policies
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
      `

      const { error } = await supabase.rpc('exec_sql', { query: fixScript })

      if (error) {
        setResult(`Error: ${error.message}`)
      } else {
        setResult('Database fix applied successfully!')
      }
    } catch (error) {
      setResult(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Database Fix Utility</h1>
      <p className="mb-4">This will fix the user profile creation trigger and RLS policies.</p>
      
      <Button
        onClick={runDbFix}
        disabled={loading}
        className="mb-4"
      >
        {loading ? 'Running Fix...' : 'Run Database Fix'}
      </Button>

      {result && (
        <div className={`p-4 rounded ${result.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          <pre>{result}</pre>
        </div>
      )}
    </div>
  )
} 