import { createBrowserSupabaseClient } from './supabase'

export async function testDatabaseTrigger() {
  const supabase = createBrowserSupabaseClient()
  
  try {
    // Check if the trigger function exists
    const { data: functions, error: functionsError } = await supabase
      .from('pg_proc')
      .select('proname, prosrc')
      .eq('proname', 'handle_new_user')

    console.log('Functions:', functions, functionsError)

    // Check if the trigger exists
    const { data: triggers, error: triggersError } = await supabase
      .from('pg_trigger')
      .select('tgname, tgfoid')
      .eq('tgname', 'on_auth_user_created')

    console.log('Triggers:', triggers, triggersError)

    // Check user_profiles table structure
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1)

    console.log('Profiles test:', profiles, profilesError)

    // Test creating a profile manually
    const testUserId = 'test-user-' + Date.now()
    const { data: testProfile, error: testError } = await supabase
      .from('user_profiles')
      .insert({
        id: testUserId,
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'client'
      })
      .select()

    console.log('Manual profile creation:', testProfile, testError)

  } catch (error) {
    console.error('Debug error:', error)
  }
} 