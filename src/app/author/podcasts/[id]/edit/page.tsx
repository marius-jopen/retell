'use client'

import React, { useState, useEffect } from 'react'
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

  // Country-specific editing state
  const [selectedCountry, setSelectedCountry] = useState<string>('DE')
  const [countryTranslations, setCountryTranslations] = useState<Record<string, { title: string; description: string; cover_image_url: string | null }>>({})
  const [localTitle, setLocalTitle] = useState('')
  const [localDescription, setLocalDescription] = useState('')
  const [localCoverDataUrl, setLocalCoverDataUrl] = useState<string | null>(null)

  // General info for right column
  const [generalStatus, setGeneralStatus] = useState<'draft' | 'pending' | 'approved' | 'rejected' | ''>('')
  const [generalCategory, setGeneralCategory] = useState('')
  const [generalRss, setGeneralRss] = useState('')

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

        setGeneralStatus((podcastData?.status as any) || '')
        setGeneralCategory(podcastData?.category || '')
        setGeneralRss(podcastData?.rss_url || '')

        // Load country translations for this podcast
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

        // Initialize left column with base or DE-specific values
        const preset = map['DE']
        setLocalTitle(preset?.title || (podcastData?.title ?? ''))
        setLocalDescription(preset?.description || (podcastData?.description ?? ''))
        setLocalCoverDataUrl(preset?.cover_image_url || (podcastData?.cover_image_url ?? null))

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

          {/* Right Column - General + Country selector + Episodes */}
          <div className="lg:w-1/3 flex flex-col space-y-4 min-h-0">
            {/* General Info */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="text-sm font-medium text-gray-900 mb-3">General Info</div>
              <div className="grid grid-cols-1 gap-3">
                <Select label="Status" id="status_author" value={generalStatus} onChange={(e) => setGeneralStatus(e.target.value as any)}>
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </Select>
                <Select label="Category" id="category_author" value={generalCategory} onChange={(e) => setGeneralCategory(e.target.value)}>
                  {['Business','Technology','Entertainment','Education','News','Health','Sports','Music','Comedy','True Crime','Science','History','Politics','Arts','Other'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
                <Input label="RSS Feed URL (Optional)" id="rss_author" type="url" value={generalRss} onChange={(e) => setGeneralRss(e.target.value)} placeholder="https://.../rss" />
                <div className="text-right">
                  <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={async () => {
                    if (!podcastId) return
                    const { error } = await supabase
                      .from('podcasts')
                      .update({ status: generalStatus, category: generalCategory, rss_url: generalRss, updated_at: new Date().toISOString() })
                      .eq('id', podcastId)
                    if (error) addToast({ type: 'error', message: error.message })
                    else addToast({ type: 'success', message: 'General info saved' })
                  }}>Save general info</Button>
                </div>
              </div>
            </div>

            {/* Country-specific selector (same as admin) */}
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
                        <Listbox.Option key={c.code} value={c.code} className={({ active }) => `cursor-pointer select-none px-3 py-2 text-sm ${active ? 'bg-red-50 text-gray-900' : 'text-gray-700'}`}>
                          {({ selected }) => (
                            <div className="flex items-center justify-between">
                              <span className="truncate">{countryNameByCode(c.code)}</span>
                              {(countryTranslations[c.code] || selected) && <span className="ml-2 text-red-600">✔</span>}
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
                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={async () => {
                  if (!podcastId) return
                  const { error } = await supabase
                    .from('podcast_country_translations')
                    .upsert({
                      podcast_id: podcastId,
                      country_code: selectedCountry,
                      title: localTitle || '',
                      description: localDescription || '',
                      cover_image_url: localCoverDataUrl || null,
                      updated_at: new Date().toISOString(),
                    }, { onConflict: 'podcast_id,country_code' } as any)
                  if (error) {
                    addToast({ type: 'error', message: `Save failed: ${error.message}` })
                    return
                  }
                  const { data: refetch } = await supabase
                    .from('podcast_country_translations')
                    .select('country_code,title,description,cover_image_url')
                    .eq('podcast_id', podcastId)
                  const updated: Record<string, { title: string; description: string; cover_image_url: string | null }> = {}
                  ;(refetch || []).forEach((row: any) => {
                    updated[row.country_code] = { title: row.title, description: row.description, cover_image_url: row.cover_image_url || null }
                  })
                  setCountryTranslations(updated)
                  addToast({ type: 'success', message: 'Country content saved' })
                }}>Save country content</Button>
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
                getEpisodeHref={(episode) => `/author/podcasts/${podcastId}/episodes/${episode.id}/edit`}
                className="w-full overflow-hidden"
              />
              <div className="space-y-2 flex-shrink-0 mt-3">
                <Link href={`/author/podcasts/${podcastId}/episodes`} className="block">
                  <Button variant="outline" size="lg" className="w-full rounded-full">Manage All Episodes</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 