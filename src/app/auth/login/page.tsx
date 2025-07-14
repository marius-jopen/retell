'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { getRedirectForRole } from '@/lib/auth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user) {
        // Get user profile to determine redirect
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()

        if (profile?.role) {
          router.push(getRedirectForRole(profile.role))
          router.refresh() // Refresh to update server-side auth state
        } else {
          router.push('/')
          router.refresh() // Refresh to update server-side auth state
        }
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = async () => {
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
        return
      }

      setMagicLinkSent(true)
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (magicLinkSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-400 via-red-500 to-red-600 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-red-600/20 backdrop-blur-sm"></div>
        <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl px-8 py-12 border border-white/20">
            <div className="text-center animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
              <div className="text-6xl mb-6">📧</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                ✨ Check Your Email!
              </h2>
              <p className="text-gray-600 mb-2">
                🎉 We've sent a magic link to
              </p>
              <p className="text-red-600 font-semibold mb-8">
                {email}
              </p>
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 mb-8 border border-red-100">
                <p className="text-sm text-gray-700">
                  🔮 Click the magic link in your email to sign in instantly!
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setMagicLinkSent(false)}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                🔙 Back to Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-400 via-red-500 to-red-600 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-red-600/20"></div>
      <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
          <div className="text-6xl mb-6">🎙️</div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Welcome Back! ✨
          </h2>
          <p className="text-red-100 mb-8">
            🎧 Ready to dive back into your podcast journey? Let's get you signed in!
          </p>
          <p className="text-red-100/80">
            Don't have an account yet?{' '}
            <Link href="/auth/signup" className="font-medium text-white hover:text-red-200 underline decoration-white/50 hover:decoration-white transition-all">
              🚀 Create one here
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative">
        <div className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl px-8 py-12 border border-white/20 animate-in fade-in-0 slide-in-from-bottom-2 duration-1000 delay-300">
          <form className="space-y-6" onSubmit={handleEmailLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                📧 Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-4 py-3 border border-red-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white/80 backdrop-blur-sm"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                🔐 Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 py-3 border border-red-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white/80 backdrop-blur-sm"
                placeholder="Your secret password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-in fade-in-0 slide-in-from-top-2 duration-300">
                <p className="text-red-600 text-sm">⚠️ {error}</p>
              </div>
            )}

            <div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                disabled={loading}
              >
                {loading ? '🔄 Signing in...' : '🎉 Sign In'}
              </Button>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-red-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white/95 text-gray-500">✨ Or try magic ✨</span>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 py-3 px-6 rounded-xl font-medium transition-all duration-200"
                  onClick={handleMagicLink}
                  disabled={loading}
                >
                  {loading ? '🪄 Sending magic...' : '🔮 Send Magic Link'}
                </Button>
              </div>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              🎧 Join thousands of podcast creators sharing their stories
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 