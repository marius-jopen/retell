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
import { Listbox } from '@headlessui/react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

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
  const [countryTranslations, setCountryTranslations] = useState<Record<string, { title: string; description: string; cover_image_url: string | null }>>({})
  const [localTitle, setLocalTitle] = useState('')
  const [localDescription, setLocalDescription] = useState('')
  const [localCoverDataUrl, setLocalCoverDataUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState('')
  // General info state for right column
  const [generalStatus, setGeneralStatus] = useState<'draft' | 'pending' | 'approved' | 'rejected' | ''>('')
  const [generalCategory, setGeneralCategory] = useState('')
  const [generalRss, setGeneralRss] = useState('')
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
        setGeneralStatus((podcastData?.status as any) || '')
        setGeneralCategory(podcastData?.category || '')
        setGeneralRss(podcastData?.rss_url || '')

        // Load existing country translations
        const { data: countryTrans } = await supabase
          .from('podcast_country_translations')
          .select('country_code,title,description,cover_image_url')
          .eq('podcast_id', id)

        const map: Record<string, { title: string; description: string; cover_image_url: string | null }> = {}
        ;(countryTrans || []).forEach((row: any) => {
          map[row.country_code] = {
            title: row.title,
            description: row.description,
            cover_image_url: row.cover_image_url || null,
          }
        })
        setCountryTranslations(map)

        // initialize local fields for default country (fallback to base podcast values)
        const preset = map['DE']
        setLocalTitle(preset?.title || (podcastData?.title ?? ''))
        setLocalDescription(preset?.description || (podcastData?.description ?? ''))
        setLocalCoverDataUrl(preset?.cover_image_url || (podcastData?.cover_image_url ?? null))

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
            countryTitle={localTitle}
            countryDescription={localDescription}
            countryCoverPreviewUrl={localCoverDataUrl}
            onCountryTitleChange={(v) => setLocalTitle(v)}
            onCountryDescriptionChange={(v) => setLocalDescription(v)}
            onCountryCoverFileChange={(file) => {
              const reader = new FileReader()
              reader.onload = () => setLocalCoverDataUrl(reader.result as string)
              reader.readAsDataURL(file)
            }}
          />
                </div>

        {/* Right Column - General Info + Country selector + Episodes */}
        <div className="lg:w-1/3 flex flex-col space-y-4 min-h-0">
          {/* General Info */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <div className="text-sm font-medium text-gray-900 mb-3">General Info</div>
            <div className="grid grid-cols-1 gap-3">
              <Select
                label="Status"
                id="status_col2"
                value={generalStatus}
                onChange={(e) => setGeneralStatus(e.target.value as any)}
              >
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </Select>
              <Select
                label="Category"
                id="category_col2"
                value={generalCategory}
                onChange={(e) => setGeneralCategory(e.target.value)}
              >
                {['Business','Technology','Entertainment','Education','News','Health','Sports','Music','Comedy','True Crime','Science','History','Politics','Arts','Other'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
              <Input
                label="RSS Feed URL (Optional)"
                id="rss_col2"
                type="url"
                value={generalRss}
                onChange={(e) => setGeneralRss(e.target.value)}
                placeholder="https://.../rss"
              />
              <div className="text-right">
                <Button
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={async () => {
                    if (!podcastId) return
                    const { error } = await supabase
                      .from('podcasts')
                      .update({ status: generalStatus, category: generalCategory, rss_url: generalRss, updated_at: new Date().toISOString() })
                      .eq('id', podcastId)
                    if (error) {
                      addToast({ type: 'error', message: error.message })
                    } else {
                      addToast({ type: 'success', message: 'General info saved' })
                    }
                  }}
                >
                  Save general info
                </Button>
              </div>
            </div>
          </div>
          {/* Country translations selector */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <div className="text-sm font-medium text-gray-900 mb-3">Country-specific content</div>

            {/* Active country bubbles */}
            <div className="mb-3 flex flex-wrap gap-2">
              {(['DE', ...Object.keys(countryTranslations)
                  .filter((c) => c !== 'DE')
                  .sort((a, b) => countryNameByCode(a).localeCompare(countryNameByCode(b)))
                ]).map((code) => (
                <div key={code} className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border ${code === selectedCountry ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-700 border-gray-300'}`}>
                  <button
                    onClick={() => {
                      setSelectedCountry(code)
                      const t = countryTranslations[code]
                      setLocalTitle(t?.title || (podcast?.title ?? ''))
                      setLocalDescription(t?.description || (podcast?.description ?? ''))
                      setLocalCoverDataUrl(t?.cover_image_url || (podcast?.cover_image_url ?? null))
                    }}
                    type="button"
                    title={countryNameByCode(code)}
                    className={`focus:outline-none ${code === selectedCountry ? 'text-white' : ''}`}
                  >
                    {countryNameByCode(code)}
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove ${countryNameByCode(code)}`}
                    className={`ml-1 rounded-full px-1.5 ${code === selectedCountry ? 'text-white hover:bg-red-700' : 'hover:bg-gray-100'}`}
                    onClick={async (e) => {
                      e.stopPropagation()
                      if (!podcastId) return
                      await supabase
                        .from('podcast_country_translations')
                        .delete()
                        .eq('podcast_id', podcastId)
                        .eq('country_code', code)

                      setCountryTranslations((prev) => {
                        const copy = { ...prev }
                        delete copy[code]
                        return copy
                      })

                      // if deleting the currently selected translation, keep country selected but fall back to base values
                      if (code === selectedCountry) {
                        setLocalTitle(podcast?.title ?? '')
                        setLocalDescription(podcast?.description ?? '')
                        setLocalCoverDataUrl(podcast?.cover_image_url ?? null)
                      }
                      addToast({ type: 'success', message: `${countryNameByCode(code)} removed` })
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* Styled dropdown using HeadlessUI */}
            <div className="mb-4">
              <Listbox value={selectedCountry} onChange={(code) => {
                setSelectedCountry(code)
                const t = countryTranslations[code]
                setLocalTitle(t?.title || (podcast?.title ?? ''))
                setLocalDescription(t?.description || (podcast?.description ?? ''))
                setLocalCoverDataUrl(t?.cover_image_url || (podcast?.cover_image_url ?? null))
              }}>
                <div className="relative">
                  <Listbox.Button className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-left text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                    <span className="block truncate">{countryNameByCode(selectedCountry)}</span>
                  </Listbox.Button>
                  <Listbox.Options className="absolute z-10 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                    {COUNTRIES.map((c) => (
                      <Listbox.Option
                        key={c.code}
                        value={c.code}
                        className={({ active }) => `cursor-pointer select-none px-3 py-2 text-sm ${active ? 'bg-red-50 text-gray-900' : 'text-gray-700'}`}
                      >
                        {({ selected }) => (
                          <div className="flex items-center justify-between">
                            <span className="truncate">{countryNameByCode(c.code)}</span>
                            {(countryTranslations[c.code] || selected) && (
                              <span className="ml-2 text-red-600">✔</span>
                            )}
                          </div>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              </Listbox>
            </div>

            <div className="text-xs text-gray-600 mb-3">Use the fields in the left column to edit Title, Description, and Cover for the selected country. Save below to store this as a country translation.</div>

            <div className="text-right">
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={async () => {
                  if (!podcastId) return
                  await supabase
                    .from('podcast_country_translations')
                    .upsert({
                      podcast_id: podcastId,
                      country_code: selectedCountry,
                      title: localTitle || '',
                      description: localDescription || '',
                      cover_image_url: localCoverDataUrl || null,
                      updated_at: new Date().toISOString(),
                    }, { onConflict: 'podcast_id,country_code' } as any)

                  setCountryTranslations((prev) => ({
                    ...prev,
                    [selectedCountry]: {
                      title: localTitle || '',
                      description: localDescription || '',
                      cover_image_url: localCoverDataUrl || null,
                    },
                  }))
                  addToast({ type: 'success', message: 'Country content saved' })
                }}
              >
                Save country content
              </Button>
            </div>
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