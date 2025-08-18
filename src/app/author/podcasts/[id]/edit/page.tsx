'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import EditPodcastForm from '@/components/forms/edit-podcast-form'
import { EpisodePreviewList, Episode } from '@/components/ui/episode-preview-list'

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
  translations?: Array<{ language_code: string; title: string; description: string }>
  license_countries?: string[]
  user_profiles?: {
    full_name: string
    email: string
  }
}

export default function AuthorEditPodcastPage({ params }: { params: Promise<{ id: string }> }) {
  const [podcastId, setPodcastId] = useState('')
  const [podcast, setPodcast] = useState<Podcast | null>(null)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState('')
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

        // Fetch podcast with user profile
        const { data: podcastData, error: podcastError } = await supabase
          .from('podcasts')
          .select(`
            *,
            user_profiles!inner(
              full_name,
              email
            ),
            podcast_translations:podcast_translations(language_code,title,description),
            license_countries:podcast_license_countries(country_code)
          `)
          .eq('id', id)
          .eq('author_id', user.id) // Only allow authors to edit their own podcasts
          .single()

        if (podcastError || !podcastData) {
          setFetchError(podcastError?.message || 'Failed to fetch podcast')
          return
        }

        setPodcast({
          ...podcastData,
          translations: (podcastData as any).podcast_translations?.map((t: any) => ({
            language_code: t.language_code,
            title: t.title,
            description: t.description,
          })) || [],
          license_countries: (podcastData as any).license_countries?.map((c: any) => c.country_code) || [],
        })

        // Fetch episodes
        const { data: episodesData } = await supabase
          .from('episodes')
          .select('*')
          .eq('podcast_id', id)
          .order('episode_number', { ascending: false })

        setEpisodes(episodesData || [])

      } catch (err) {
        console.error('Error in fetchPodcast:', err)
        setFetchError('An unexpected error occurred')
      }
    }

    fetchPodcast()
  }, [params, supabase])

  const handleSubmit = async (formData: Record<string, unknown>, coverImage: File | null) => {
    setLoading(true)

    try {
      let coverImageUrl = podcast?.cover_image_url

      // Upload cover image if provided
      if (coverImage) {
        const fileExt = coverImage.name.split('.').pop()
        const fileName = `podcast-cover-${podcastId}-${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('podcast-covers')
          .upload(fileName, coverImage)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('podcast-covers')
          .getPublicUrl(fileName)

        coverImageUrl = urlData.publicUrl
      }

      // Update podcast
      const { error: updateError } = await supabase
        .from('podcasts')
        .update({
          title: formData.title as string,
          description: formData.description as string,
          category: formData.category as string,
          language: formData.language as string,
          country: formData.country as string,
          status: formData.status as 'draft' | 'pending' | 'approved' | 'rejected',
          rss_url: formData.rss_url as string | null,
          auto_publish_episodes: formData.auto_publish_episodes as boolean,
          cover_image_url: coverImageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', podcastId)
      // Upsert license countries
      const licenseCountries = (formData as any).license_countries as string[] | undefined
      if (licenseCountries) {
        // Clear then insert current selection
        await supabase.from('podcast_license_countries').delete().eq('podcast_id', podcastId)
        if (licenseCountries.length > 0) {
          await supabase.from('podcast_license_countries').insert(
            licenseCountries.map(code => ({ podcast_id: podcastId, country_code: code }))
          )
        }
      }

      // Upsert translations
      const translations = (formData as any).translations as Array<{ language_code: string; title: string; description: string }> | undefined
      if (translations) {
        for (const t of translations) {
          if (!t.language_code || !t.title || !t.description) continue
          await supabase.from('podcast_translations').upsert({
            podcast_id: podcastId,
            language_code: t.language_code,
            title: t.title,
            description: t.description,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'podcast_id,language_code' } as any)
        }
      }


      if (updateError) throw updateError

      addToast({
        type: 'success',
        message: 'Podcast updated successfully'
      })

      // Refresh podcast data
      const { data: updatedPodcast } = await supabase
        .from('podcasts')
        .select(`
          *,
          user_profiles!inner(
            full_name,
            email
          ),
          podcast_translations:podcast_translations(language_code,title,description),
          license_countries:podcast_license_countries(country_code)
        `)
        .eq('id', podcastId)
        .single()

      if (updatedPodcast) {
        setPodcast({
          ...updatedPodcast,
          translations: (updatedPodcast as any).podcast_translations?.map((t: any) => ({
            language_code: t.language_code,
            title: t.title,
            description: t.description,
          })) || [],
          license_countries: (updatedPodcast as any).license_countries?.map((c: any) => c.country_code) || [],
        })
      }

    } catch (error: unknown) {
      console.error('Error updating podcast:', error)
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to update podcast'
      })
    } finally {
      setLoading(false)
    }
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{fetchError}</p>
          <Link href="/author/podcasts">
            <Button variant="outline">← Back to Podcasts</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!podcast) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading podcast...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Podcast</h1>
              <p className="mt-2 text-lg text-gray-600">
                Update your podcast information and settings
              </p>
            </div>
            <Link href="/author/podcasts">
              <Button variant="outline">← Back to Podcasts</Button>
            </Link>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 min-h-0">
          {/* Left Column - Podcast Form (Sticky) */}
          <div className="lg:w-2/3 lg:sticky lg:top-8 lg:self-start">
            <EditPodcastForm
              podcast={podcast}
              onSubmit={handleSubmit}
              loading={loading}
              isAdmin={false}
            />
          </div>

          {/* Right Column - Episodes (Scrollable) */}
          <div className="lg:w-1/3 flex flex-col space-y-4 min-h-0">
            {/* Episode Actions */}
            <div className="space-y-2 flex-shrink-0">
              <Link href={`/author/podcasts/${podcastId}/episodes`} className="block">
                <Button
                  variant="outline" 
                  size="lg" 
                  className="w-full rounded-full"
                >
                  Manage All Episodes
                </Button>
              </Link>
            </div>

            {/* Episodes List */}
            <div className="flex-1 min-h-0">
              <EpisodePreviewList
                title={`Episodes (${episodes.length})`}
                episodes={episodes}
                maxHeight="100%"
                emptyStateMessage="No episodes yet"
                emptyStateIcon="🎙️"
                showActions={true}
                getEpisodeHref={(episode) => `/author/podcasts/${podcastId}/episodes/${episode.id}/edit`}
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 