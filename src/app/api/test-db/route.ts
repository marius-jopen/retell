import { createAdminSupabaseClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const adminSupabase = createAdminSupabaseClient()

    // Test basic connection
    const { data: profiles, error: profilesError } = await adminSupabase
      .from('user_profiles')
      .select('id, email, role, full_name, created_at')
      .limit(5)

    if (profilesError) {
      console.error('Database error:', profilesError)
      return NextResponse.json({ 
        error: `Database connection failed: ${profilesError.message}` 
      }, { status: 500 })
    }

    // Test creating a sample profile (we'll delete it after)
    // Use a proper UUID format
    const testUserId = crypto.randomUUID()
    const { data: testProfile, error: testError } = await adminSupabase
      .from('user_profiles')
      .insert({
        id: testUserId,
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'client'
      })
      .select()

    // Clean up test profile
    if (testProfile) {
      await adminSupabase
        .from('user_profiles')
        .delete()
        .eq('id', testUserId)
    }

    return NextResponse.json({ 
      message: 'Database connection successful',
      profilesCount: profiles?.length || 0,
      sampleProfiles: profiles,
      canInsert: testError ? false : true,
      insertError: testError?.message || null
    })
  } catch (error) {
    console.error('Test DB error:', error)
    return NextResponse.json({ 
      error: `Database test failed: ${error}` 
    }, { status: 500 })
  }
} 