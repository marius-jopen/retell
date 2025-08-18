'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import EditPodcastForm from '@/components/forms/edit-podcast-form'
import { EpisodePreviewList, Episode } from '@/components/ui/episode-preview-list'
import { COUNTRIES, countryNameByCode } from '@/lib/countries'

interface Podcast {
  id: string
  title: string
  description: string
  category: string
  language: string
  country: string
  rss_url: string | null
  cover_image_url: string | null
  author_id: string
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  auto_publish_episodes: boolean
  user_profiles?: {
    full_name: string
    email: string
  }
}

export default function AdminEditPodcastPage({ params }: { params: Promise<{ id: string }> }) {
  const [podcastId, setPodcastId] = useState('')
  const [podcast, setPodcast] = useState<Podcast | null>(null)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [selectedCountry, setSelectedCountry] = useState<string>('DE')
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()
  const { addToast } = useToast()

  useEffect(() => {
    const fetchPodcast = async () => {
      try {
        // Await params in Next.js 15
        const { id } = await params
        setPodcastId(id)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setFetchError('You must be logged in to edit a podcast')
          return
        }

        // Check if user is admin
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (!profile || profile.role !== 'admin') {
          setFetchError('You must be an admin to edit podcasts')
          return
        }

        // Get podcast data (admin can edit any podcast)
        const { data: podcastData, error: podcastError } = await supabase
          .from('podcasts')
          .select(`
            *,
            user_profiles (
              full_name,
              email
            )
          `)
          .eq('id', id)
          .single()

        if (podcastError) {
          setFetchError('Error fetching podcast')
          return
        }

        setPodcast(podcastData)

        // Fetch episodes
        const { data: episodesData, error: episodesError } = await supabase
          .from('episodes')
          .select('*')
          .eq('podcast_id', id)
          .order('episode_number', { ascending: false })

        if (episodesError) {
          console.error('Error fetching episodes:', episodesError)
        } else {
          setEpisodes(episodesData || [])
        }
      } catch (error) {
        console.error('Error loading podcast:', error)
        setFetchError('Error loading podcast')
      }
    }

    fetchPodcast()
  }, [params, supabase])

  const handleSubmit = async (formData: any, coverImage: File | null) => {
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('You must be logged in to update a podcast')
      }

      // Check if user is admin
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || profile.role !== 'admin') {
        throw new Error('You must be an admin to update podcasts')
      }

      // Upload cover image if provided
      let coverImageUrl = podcast?.cover_image_url
      if (coverImage) {
        // TEMPORARY: Use base64 until storage bucket is set up
        const base64Url = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            const base64 = reader.result as string
            resolve(base64)
          }
          reader.onerror = () => reject(new Error('Failed to read file'))
          reader.readAsDataURL(coverImage)
        })
        coverImageUrl = base64Url
      }

      const updates = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        language: formData.language,
        country: formData.country,
        status: formData.status, // Admin can update status
        rss_url: formData.rss_url?.trim() || null,
        cover_image_url: coverImageUrl,
        auto_publish_episodes: formData.auto_publish_episodes,
        updated_at: new Date().toISOString()
      }

      // Update podcast
      const { error: updateError } = await supabase
        .from('podcasts')
        .update(updates)
        .eq('id', podcastId)

      if (updateError) {
        throw updateError
      }

      // Show success message
      addToast({
        type: 'success',
        message: `Successfully updated podcast "${formData.title}"`
      })

      // Navigate back to admin podcasts list
      router.push('/admin/podcasts')
    } catch (error) {
      console.error('Error updating podcast:', error)
      throw new Error('Failed to update podcast. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (fetchError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <h1 className="text-2xl font-bold text-red-800 mb-2">Error</h1>
          <p className="text-red-700">{fetchError}</p>
          <Link href="/admin/podcasts" className="mt-4 inline-block">
            <Button variant="outline">← Back to Podcasts</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!podcast) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="space-y-6">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Podcast Cover Image */}
            <div className="flex-shrink-0">
              {podcast.cover_image_url ? (
                <img
                  src={podcast.cover_image_url}
                  alt={podcast.title}
                  className="w-16 h-16 rounded-2xl object-cover shadow-md"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-red-400 via-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-lg">
                    {podcast.title.substring(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            
            {/* Title and Description */}
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">
              Edit {podcast.title}
            </h1>
            <p className="text-gray-600">
              Administrative podcast editing and content management
            </p>
              {podcast.user_profiles && (
                <p className="text-sm text-gray-500 mt-1">
                  Author: {podcast.user_profiles.full_name} ({podcast.user_profiles.email})
                </p>
              )}
            </div>
          </div>
          <Link href="/admin/podcasts">
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
              ← Back to Podcasts
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-8 min-h-0">
        {/* Left Column - Podcast Form (Sticky) */}
        <div className="lg:w-2/3 lg:sticky lg:top-8 lg:self-start">
          <EditPodcastForm
            podcast={podcast}
            onSubmit={handleSubmit}
            loading={loading}
            isAdmin={true}
                  />
                </div>

        {/* Right Column - Translations + Episodes */}
        <div className="lg:w-1/3 flex flex-col space-y-4 min-h-0">
          {/* Country translations selector */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <div className="text-sm font-medium text-gray-900 mb-3">Country-specific Titles & Descriptions</div>
            <div className="flex items-center gap-2 mb-3">
              <select
                className="text-sm border-gray-300 rounded-md px-3 py-2 flex-1"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
              >
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.code}>{countryNameByCode(c.code)}</option>
                ))}
              </select>
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {/* bubbles placeholder until wired to data */}
            </div>
            <p className="text-xs text-gray-500 mt-2">Select a country to create or edit localized title and description. Active countries appear in red.</p>
          </div>

          {/* Episodes List */}
          <div className="flex-1 min-h-0">
            <EpisodePreviewList
              title={`Episodes (${episodes.length})`}
              episodes={episodes.slice(0, 5)}
              autoHeight
              emptyStateMessage="No episodes yet"
              emptyStateIcon="🎙️"
              showActions={true}
              getEpisodeHref={(episode) => `/admin/episodes/${episode.id}/edit`}
              className="w-full overflow-hidden"
            />
            
            <div className="space-y-2 flex-shrink-0 mt-3">
            <Link href={`/author/podcasts/${podcastId}/episodes`} className="block">
                  <Button
                variant="outline" 
                size="lg" 
                rounded="full"
                className="w-full"
              >
                Manage All Episodes
                  </Button>
                </Link>
            </div>
          </div>

          
        </div>
      </div>
    </div>
  )
} 