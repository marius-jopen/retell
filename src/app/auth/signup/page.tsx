'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui'
import { UserRole } from '@/lib/auth'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<UserRole>('author')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createBrowserSupabaseClient()

  useEffect(() => {
    const roleParam = searchParams.get('role') as UserRole
    if (roleParam && ['author'].includes(roleParam)) {
      setRole(roleParam)
    }
  }, [searchParams])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          fullName,
          role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Signup error:', data)
        setError(data.error || 'An error occurred during signup')
        return
      }

      // Redirect to appropriate dashboard based on role
      if (role === 'author') {
        router.push('/author')
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('Signup error:', error)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-400 via-red-500 to-red-600 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-red-600/20"></div>
      <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
          <div className="text-6xl mb-6">🚀</div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Join the Adventure! ✨
          </h2>
          <p className="text-red-100 mb-8">
            🎙️ Ready to share your amazing podcast stories with the world? Let's create your account!
          </p>
          <p className="text-red-100/80">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-medium text-white hover:text-red-200 underline decoration-white/50 hover:decoration-white transition-all">
              🎧 Sign in here
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative">
        <div className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl px-8 py-12 border border-white/20 animate-in fade-in-0 slide-in-from-bottom-2 duration-1000 delay-300">
          <form className="space-y-6" onSubmit={handleSignup}>
            <Input
              label="👤 Full Name"
              id="full_name"
              name="full_name"
              type="text"
              autoComplete="name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your awesome name"
              className="bg-white/80 backdrop-blur-sm border-red-200"
            />

            <Input
              label="📧 Email Address"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="bg-white/80 backdrop-blur-sm border-red-200"
            />

            <Input
              label="🔐 Password"
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              className="bg-white/80 backdrop-blur-sm border-red-200"
            />

            <div>
              <Select
                label="🎯 I am a..."
                id="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="bg-white/80 backdrop-blur-sm border-red-200"
              >
                <option value="author">🎙️ Author (Upload content)</option>
              </Select>
              <div className="mt-3 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border border-red-100">
                <p className="text-sm text-gray-700">
                  {role === 'author' && '🎨 Perfect! You\'ll be able to upload and manage your amazing podcast content'}
                </p>
              </div>
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
                {loading ? '🔄 Creating your account...' : '🎉 Create Account'}
              </Button>
            </div>
          </form>

          <div className="mt-8">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border border-red-100">
              <p className="text-xs text-gray-600 text-center">
                🤝 By creating an account, you agree to our{' '}
                <Link href="/terms" className="text-red-600 hover:text-red-700 underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-red-600 hover:text-red-700 underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              🎧 Join thousands of podcast creators sharing their stories with the world!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 