'use client'

import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase'
// Import directly to debug (lazy loading removed temporarily)
import PodcastEditContent from '@/components/podcast/podcast-edit-content'

// Error boundary component
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('❌ ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-orange-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <h1 className="text-2xl font-bold text-red-800 mb-2">Error Loading Editor</h1>
              <p className="text-red-700 mb-4">{this.state.error?.message || 'An unexpected error occurred'}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Reload Page
              </button>
              <pre className="mt-4 text-xs bg-red-100 p-4 rounded overflow-auto">
                {this.state.error?.stack}
              </pre>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default function AuthorEditPodcastPage({ params }: { params: Promise<{ id: string }> }) {
  const [podcastId, setPodcastId] = useState('')
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()

  useEffect(() => {
    const fetchAuth = async () => {
      try {
        // Await params in Next.js 15
        const { id } = await params
        setPodcastId(id)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/login')
          return
        }

        // Get user profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        setUser(user)
        setProfile(profile)
      } catch (error) {
        console.error('Error fetching auth:', error)
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    fetchAuth()
  }, [params, supabase, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header skeleton */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded w-96 animate-pulse"></div>
              </div>
              <div className="flex gap-3">
                <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Content skeleton */}
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="lg:w-1/3">
              <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return null // Will redirect to login
  }

  if (!podcastId) {
    return (
      <div className="min-h-screen bg-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading podcast ID...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  console.log('🎯 Rendering PodcastEditContent with:', { podcastId, hasUser: !!user, hasProfile: !!profile })
  
  return (
    <ErrorBoundary>
      <PodcastEditContent
        podcastId={podcastId}
        isAdmin={false}
        backHref="/author/podcasts"
        user={user}
        profile={profile}
      />
    </ErrorBoundary>
  )
}
