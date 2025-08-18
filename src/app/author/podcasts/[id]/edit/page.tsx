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
  const [generalCountry, setGeneralCountry] = useState('DE')
  const [generalLanguage, setGeneralLanguage] = useState('en')

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

        const defaultCountry = podcastData?.country || 'DE'
        setGeneralStatus((podcastData?.status as any) || '')
        setGeneralCategory(podcastData?.category || '')
        setGeneralRss(podcastData?.rss_url || '')
        setGeneralCountry(defaultCountry)
        setGeneralLanguage((podcastData as any)?.language || 'en')
        
        // Initialize selectedCountry to the default country
        setSelectedCountry(defaultCountry)
        
        // Initialize form fields with podcast data (since default country is selected)
        setLocalTitle(podcastData?.title || '')
        setLocalDescription(podcastData?.description || '')
        setLocalCoverDataUrl(podcastData?.cover_image_url || null)

        // Load country translations for this podcast
        const { data: countryTrans } = await supabase
          .from('podcast_country_translations')
          .select('country_code,title,description,cover_image_url')
          .eq('podcast_id', id)

        const map: Record<string, { title: string; description: string; cover_image_url: string | null }> = {}
        ;(countryTrans || []).forEach((row: any) => {
          // Only include valid country codes that are not the default country
          const code = row.country_code
          if (code && 
              code.length === 2 && 
              code !== defaultCountry && 
              countryNameByCode(code) !== 'Unknown') {
            map[code] = {
              title: row.title,
              description: row.description,
              cover_image_url: row.cover_image_url || null,
            }
          }
        })
        console.log('Country translations loaded:', map)
        console.log('Raw country translations from DB:', countryTrans)
        setCountryTranslations(map)
        
        // Clean up any invalid translations from the database
        if (countryTrans && countryTrans.length > 0) {
          const invalidCodes = countryTrans
            .map((row: any) => row.country_code)
            .filter((code: string) => 
              !code || 
              code.length !== 2 || 
              code === defaultCountry || 
              countryNameByCode(code) === 'Unknown'
            )
          
          if (invalidCodes.length > 0) {
            console.log('Cleaning up invalid country codes:', invalidCodes)
            // Delete invalid translations from database
            for (const code of invalidCodes) {
              await supabase
                .from('podcast_country_translations')
                .delete()
                .eq('podcast_id', id)
                .eq('country_code', code)
            }
          }
        }
        
        // If selectedCountry is invalid, reset to default
        if (!selectedCountry || 
            selectedCountry === 'Unknown' || 
            (selectedCountry !== defaultCountry && !map[selectedCountry])) {
          setSelectedCountry(defaultCountry)
        }
        
        // Initialize left column with base or default country-specific values
        const preset = map[defaultCountry]
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
            <div className="flex gap-3">
              <Link href="/author/podcasts">
                <Button variant="outline">← Back to Podcasts</Button>
              </Link>
              <Button 
                variant="default"
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={loading}
                onClick={async () => {
                  if (!podcastId) return
                  setLoading(true)
                  
                  try {
                    // Save general info (status, category, RSS, default country)
                              let podcastUpdateData: any = { 
            status: generalStatus, 
            category: generalCategory, 
            language: generalLanguage,
            rss_url: generalRss, 
            country: generalCountry,
            updated_at: new Date().toISOString() 
          }
                    
                    // If default country is selected, also update the base title/description
                    if (selectedCountry === (generalCountry || 'DE')) {
                      podcastUpdateData.title = localTitle
                      podcastUpdateData.description = localDescription
                      // Note: cover image handling would go here if needed
                    }
                    
                    const { error: generalError } = await supabase
                      .from('podcasts')
                      .update(podcastUpdateData)
                      .eq('id', podcastId)
                    
                    if (generalError) throw generalError

                    // Save country-specific translation if a non-default country is selected
                    if (selectedCountry !== (generalCountry || 'DE') && (localTitle || localDescription)) {
                      const { error: countryError } = await supabase
                        .from('podcast_country_translations')
                        .upsert({
                          podcast_id: podcastId,
                          country_code: selectedCountry,
                          title: localTitle || '',
                          description: localDescription || '',
                          cover_image_url: localCoverDataUrl || null,
                          updated_at: new Date().toISOString(),
                        }, { onConflict: 'podcast_id,country_code' } as any)
                      
                      if (countryError) throw countryError
                    }
                    
                    addToast({ type: 'success', message: 'All changes saved successfully!' })
                    
                    // Refresh data
                    window.location.reload()
                    
                  } catch (error: any) {
                    addToast({ type: 'error', message: `Save failed: ${error.message}` })
                  } finally {
                    setLoading(false)
                  }
                }}
              >
                {loading ? 'Saving...' : 'Save All Changes'}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 min-h-0">
          {/* Left Column - Podcast Form (Sticky) */}
          <div className="lg:w-2/3 lg:sticky lg:top-8 lg:self-start">
            <EditPodcastForm
              podcast={podcast}
              onSubmit={async () => {}} // No-op function since we handle saving in the header
              loading={false} // Don't show loading in form since we control it from header
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
                <Select label="Language" id="language_author" value={generalLanguage} onChange={(e) => setGeneralLanguage(e.target.value)}>
                  <option value="en">English</option>
                  <option value="de">German</option>
                  <option value="fr">French</option>
                  <option value="es">Spanish</option>
                  <option value="it">Italian</option>
                  <option value="nl">Dutch</option>
                  <option value="pt">Portuguese</option>
                  <option value="pl">Polish</option>
                  <option value="sv">Swedish</option>
                  <option value="da">Danish</option>
                  <option value="no">Norwegian</option>
                  <option value="fi">Finnish</option>
                  <option value="ru">Russian</option>
                  <option value="zh">Chinese</option>
                  <option value="ja">Japanese</option>
                  <option value="ko">Korean</option>
                  <option value="ar">Arabic</option>
                  <option value="hi">Hindi</option>
                  <option value="other">Other</option>
                </Select>
                <Input label="RSS Feed URL (Optional)" id="rss_author" type="url" value={generalRss} onChange={(e) => setGeneralRss(e.target.value)} placeholder="https://.../rss" />
                <Select label="Default Country" id="country_author" value={generalCountry} onChange={(e) => setGeneralCountry(e.target.value)}>
                  {[
                    // Germany first
                    { code: 'DE', name: countryNameByCode('DE') },
                    // Then all other countries alphabetically
                    ...COUNTRIES.filter(c => c.code !== 'DE').map(c => ({ code: c.code, name: countryNameByCode(c.code) })).sort((a, b) => a.name.localeCompare(b.name))
                  ].map((country) => (
                    <option key={country.code} value={country.code}>{country.name}</option>
                  ))}
                </Select>

              </div>
            </div>

            {/* Country-specific content */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="text-sm font-medium text-gray-900 mb-3">Country-specific content</div>

              {/* Country bubbles - Default country + translations */}
              <div className="mb-3 flex flex-wrap gap-2">
                {/* Always show default country first (no X button) */}
                {(() => {
                  const defaultCountry = generalCountry || 'DE'
                  const isDefaultSelected = selectedCountry === defaultCountry
                  
                  return (
                    <div key={defaultCountry} className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border ${isDefaultSelected ? 'bg-red-600 border-red-600 text-white' : 'bg-white border-gray-300'}`}>
                      <button
                        onClick={() => {
                          setSelectedCountry(defaultCountry)
                          // Load default country content (base podcast data)
                          setLocalTitle(podcast?.title ?? '')
                          setLocalDescription(podcast?.description ?? '')
                          setLocalCoverDataUrl(podcast?.cover_image_url ?? null)
                        }}
                        type="button"
                        title={`${countryNameByCode(defaultCountry)} (Default)`}
                        className={`focus:outline-none ${isDefaultSelected ? 'text-white' : 'text-red-600'}`}
                      >
                        {countryNameByCode(defaultCountry)}
                      </button>
                      {/* No X button for default country */}
                    </div>
                  )
                })()}
                
                {/* Translation country bubbles (with X button) */}
                {Object.keys(countryTranslations)
                  .filter(code => {
                    // Filter out invalid/unknown countries and the default country
                    const defaultCountry = generalCountry || 'DE'
                    return code && 
                           code !== defaultCountry && 
                           countryNameByCode(code) !== 'Unknown' && 
                           code.length === 2
                  })
                  .sort((a, b) => countryNameByCode(a).localeCompare(countryNameByCode(b)))
                  .map((code) => {
                    const isSelected = selectedCountry === code
                    
                    return (
                      <div key={code} className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border ${isSelected ? 'bg-red-600 border-red-600 text-white' : 'bg-white border-gray-300'}`}>
                        <button
                          onClick={() => {
                            setSelectedCountry(code)
                            // Load translation content
                            const t = countryTranslations[code]
                            setLocalTitle(t?.title || (podcast?.title ?? ''))
                            setLocalDescription(t?.description || (podcast?.description ?? ''))
                            setLocalCoverDataUrl(t?.cover_image_url || (podcast?.cover_image_url ?? null))
                          }}
                          type="button"
                          title={countryNameByCode(code)}
                          className={`focus:outline-none ${isSelected ? 'text-white' : 'text-red-600'}`}
                        >
                          {countryNameByCode(code)}
                        </button>
                        {/* X button for translation countries */}
                        <button
                          type="button"
                          aria-label={`Remove ${countryNameByCode(code)}`}
                          className={`ml-1 rounded-full px-1.5 ${isSelected ? 'text-white hover:bg-red-700' : 'text-red-600 hover:bg-gray-100'}`}
                          onClick={async (e) => {
                            e.stopPropagation()
                            if (!podcastId) return
                            
                            // Delete from database
                            await supabase
                              .from('podcast_country_translations')
                              .delete()
                              .eq('podcast_id', podcastId)
                              .eq('country_code', code)

                            // Remove from local state
                            setCountryTranslations((prev) => {
                              const copy = { ...prev }
                              delete copy[code]
                              return copy
                            })

                            // If deleting the selected country, switch back to default country
                            if (code === selectedCountry) {
                              const defaultCountry = generalCountry || 'DE'
                              setSelectedCountry(defaultCountry)
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
                    )
                  })}
              </div>

              {/* Country selection dropdown and Add Country button */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Select country to add translation:
                  </label>
                  <select
                    id="countryDropdown"
                    value=""
                    onChange={(e) => {
                      if (!e.target.value) return
                      const newCountry = e.target.value
                      const defaultCountry = generalCountry || 'DE'
                      
                      // Don't allow adding the default country as a translation
                      if (newCountry === defaultCountry) {
                        addToast({ type: 'error', message: 'Cannot add default country as translation' })
                        e.target.value = ''
                        return
                      }
                      
                      // Don't allow adding if already exists
                      if (countryTranslations[newCountry]) {
                        addToast({ type: 'error', message: 'Translation for this country already exists' })
                        e.target.value = ''
                        return
                      }
                      
                      // Add new country translation (use current form values)
                      setCountryTranslations(prev => ({
                        ...prev,
                        [newCountry]: {
                          title: localTitle || podcast?.title || '',
                          description: localDescription || podcast?.description || '',
                          cover_image_url: localCoverDataUrl
                        }
                      }))
                      
                      // Select the new country and keep current form values
                      setSelectedCountry(newCountry)
                      
                      addToast({ type: 'success', message: `Added ${countryNameByCode(newCountry)} translation` })
                      
                      // Reset dropdown
                      e.target.value = ''
                    }}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Select country to add...</option>
                    {COUNTRIES
                      .filter(country => {
                        const defaultCountry = generalCountry || 'DE'
                        return country.code !== defaultCountry && !countryTranslations[country.code]
                      })
                      .map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                  </select>
                </div>


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