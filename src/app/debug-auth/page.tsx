'use client'

import { useEffect, useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase'

export default function DebugAuthPage() {
  const [authState, setAuthState] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserSupabaseClient()

  useEffect(() => {
    checkAuthState()
  }, [])

  const checkAuthState = async () => {
    try {
      // Check session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      console.log('Session:', session, 'Error:', sessionError)

      // Check user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      console.log('User:', user, 'Error:', userError)

      setAuthState({
        session,
        user,
        sessionError,
        userError
      })

      // Get profile if user exists
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        console.log('Profile:', profile, 'Error:', profileError)
        setProfile({ profile, profileError })
      }
    } catch (error) {
      console.error('Debug auth error:', error)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  if (loading) {
    return <div className="p-8">Loading auth state...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Authentication Debug</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Session State</h2>
          <pre className="text-sm overflow-auto">{JSON.stringify(authState?.session, null, 2)}</pre>
          {authState?.sessionError && (
            <div className="mt-2 text-red-600">
              Session Error: {authState.sessionError.message}
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">User State</h2>
          <pre className="text-sm overflow-auto">{JSON.stringify(authState?.user, null, 2)}</pre>
          {authState?.userError && (
            <div className="mt-2 text-red-600">
              User Error: {authState.userError.message}
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Profile State</h2>
          <pre className="text-sm overflow-auto">{JSON.stringify(profile?.profile, null, 2)}</pre>
          {profile?.profileError && (
            <div className="mt-2 text-red-600">
              Profile Error: {profile.profileError.message}
            </div>
          )}
        </div>

        <div className="flex space-x-4">
          <button
            onClick={checkAuthState}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh Auth State
          </button>
          <button
            onClick={signOut}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
} 