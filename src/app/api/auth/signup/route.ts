import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('🔍 Signup API called')
  
  try {
    const { email, password, fullName, role } = await request.json()
    console.log('📝 Request data:', { email, fullName, role })

    if (!email || !password || !fullName || !role) {
      console.log('❌ Missing required fields')
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    console.log('🔄 Creating Supabase clients...')
    const supabase = await createServerSupabaseClient()
    
    // Try to use admin client if service role key is available
    let adminSupabase = null
    try {
      adminSupabase = createAdminSupabaseClient()
      console.log('✅ Admin client created successfully')
    } catch (error) {
      console.log('⚠️ Admin client not available, will use regular client:', error)
    }

    console.log('🔄 Creating auth user...')
    // Create auth user
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    })

    if (authError) {
      console.error('❌ Auth error:', authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    console.log('✅ Auth user created:', data.user?.id)

    if (data.user) {
      console.log('⏳ Waiting for trigger execution...')
      // Wait a moment for potential trigger execution
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log('🔍 Checking if profile was created by trigger...')
      // Check if user profile was created by trigger using admin client or regular client
      const client = adminSupabase || supabase
      const { data: profileData, error: profileError } = await client
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()
      let profile = profileData

      if (profileError || !profile) {
        console.log('⚠️ Trigger did not create profile, using fallback method...')
        console.log('Profile error:', profileError)
        
        // Try using the database function first (if admin client is available)
        if (adminSupabase) {
          try {
            const { data: functionResult, error: functionError } = await adminSupabase
              .rpc('create_user_profile_if_missing', { user_id: data.user.id })
            
            if (functionError) {
              console.log('⚠️ Database function failed:', functionError)
            } else {
              console.log('✅ Database function result:', functionResult)
              
              // Check if profile was created by the function
              const { data: newProfile, error: newProfileError } = await adminSupabase
                .from('user_profiles')
                .select('*')
                .eq('id', data.user.id)
                .single()
              
              if (newProfile && !newProfileError) {
                profile = newProfile
                console.log('✅ Profile created by database function')
              }
            }
          } catch (funcError) {
            console.log('⚠️ Database function exception:', funcError)
          }
        }
        
        // If still no profile, try manual creation
        if (!profile) {
          console.log('⚠️ Attempting manual profile creation...')
          const { data: createdProfile, error: createError } = await client
            .from('user_profiles')
            .insert({
              id: data.user.id,
              email: data.user.email || email,
              full_name: fullName,
              role: role,
            })
            .select()
            .single()

          if (createError) {
            console.error('❌ Manual profile creation failed:', createError)
            
            // If we failed and we don't have admin client, return a helpful error
            if (!adminSupabase) {
              return NextResponse.json({ 
                error: `User created but profile creation failed. Please contact support. Details: ${createError.message}`,
                userCreated: true,
                userId: data.user.id
              }, { status: 201 })
            }
            
            return NextResponse.json({ 
              error: `Failed to create user profile: ${createError.message}` 
            }, { status: 500 })
          }
          
          profile = createdProfile
          console.log('✅ Profile created manually')
        }
      } else {
        console.log('✅ Profile was created by trigger')
      }

      console.log('🎉 User profile created successfully:', profile?.id)

      return NextResponse.json({ 
        user: data.user, 
        profile,
        message: 'User created successfully' 
      })
    }

    console.log('❌ User creation failed - no user returned')
    return NextResponse.json({ error: 'User creation failed' }, { status: 500 })
  } catch (error) {
    console.error('❌ Signup API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 