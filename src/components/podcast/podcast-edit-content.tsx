'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import EditPodcastForm from '@/components/forms/edit-podcast-form'
import { EpisodePreviewList, Episode } from '@/components/ui/episode-preview-list'
import { COUNTRIES, countryNameByCode } from '@/lib/countries'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import HostsManager from '@/components/podcast/edit/HostsManager'
import type { Host, Podcast as PodcastType } from '@/components/podcast/edit/types'
import TranslateAllPodcast from '@/components/podcast/translate-all-podcast'

// Using imported Podcast type from types.ts

interface PodcastEditContentProps {
  podcastId: string
  isAdmin: boolean
  backHref: string
  user: any
  profile: any
}

function PodcastEditContent({ 
  podcastId, 
  isAdmin, 
  backHref, 
  user, 
  profile 
}: PodcastEditContentProps) {
  const [podcast, setPodcast] = useState<PodcastType | null>(null)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const supabase = createBrowserSupabaseClient()
  const { addToast } = useToast()



  // General info for right column
  const [generalStatus, setGeneralStatus] = useState<'draft' | 'pending' | 'approved' | 'rejected' | ''>('')
  const [generalCategory, setGeneralCategory] = useState('')
  const [generalRss, setGeneralRss] = useState('')
  const [generalCountry, setGeneralCountry] = useState('DE')
  const [generalLanguage, setGeneralLanguage] = useState('en')

  // Form data from EditPodcastForm
  const [currentFormData, setCurrentFormData] = useState<any>(null)
  const [currentCoverImage, setCurrentCoverImage] = useState<File | null>(null)
  const [currentHosts, setCurrentHosts] = useState<Host[]>([])

  // Country exclusion list
  const [excludedCountries, setExcludedCountries] = useState<string[]>([])
  const [selectedCountryToExclude, setSelectedCountryToExclude] = useState<string>('')

  // Callback to handle form data changes (hosts managed separately by HostsManager)
  const handleFormDataChange = useCallback((formData: any, coverImage: File | null) => {
    setCurrentFormData(formData)
    setCurrentCoverImage(coverImage)
  }, [])



  useEffect(() => {
    if (!podcastId) {
      setFetching(false)
      return
    }

    let cancelled = false

    const fetchPodcast = async () => {
      try {
        setFetching(true)
        setFetchError('')
        
        if (!user) {
          setFetchError('You must be logged in to edit a podcast')
          if (!cancelled) setFetching(false)
          return
        }

        // Check authorization based on role
        if (isAdmin) {
          if (!profile || profile.role !== 'admin') {
            setFetchError('You must be an admin to edit podcasts')
            if (!cancelled) setFetching(false)
            return
          }
        } else {
          if (!profile || (profile.role !== 'author' && profile.role !== 'admin')) {
            setFetchError('You must be an author or admin to edit podcasts')
            if (!cancelled) setFetching(false)
            return
          }
        }

        // Build query based on admin vs author
        let query = supabase
          .from('podcasts')
          .select(`
            *,
            user_profiles!inner(
              full_name,
              email
            ),
            license_countries:podcast_license_countries(country_code)
          `)
          .eq('id', podcastId)

        // Authors can only edit their own podcasts
        if (!isAdmin) {
          query = query.eq('author_id', user.id)
        }

        // Execute podcast data and episodes queries in parallel
        // Only fetch 5 episodes for preview to improve performance
        const [podcastResult, episodesResult] = await Promise.all([
          query.single(),
          supabase
            .from('episodes')
            .select('id, title, description, title_english, description_english, episode_number, duration, published_at, audio_url, cover_image_url, script_url, season_number, created_at, updated_at, status')
            .eq('podcast_id', podcastId)
            .order('episode_number', { ascending: false })
            .limit(5)
        ])

        if (cancelled) return

        const { data: podcastData, error: podcastError } = podcastResult
        
        if (podcastError || !podcastData) {
          setFetchError(podcastError?.message || 'Failed to fetch podcast')
          setFetching(false)
          return
        }

        // Set podcast data
        setPodcast({
          ...podcastData,
          license_countries: (podcastData as any).license_countries?.map((c: any) => c.country_code) || [],
        })

        const defaultCountry = podcastData?.country || 'DE'
        setGeneralStatus((podcastData?.status as any) || '')
        setGeneralCategory(podcastData?.category || '')
        setGeneralRss(podcastData?.rss_url || '')
        setGeneralCountry(defaultCountry)
        setGeneralLanguage((podcastData as any)?.language || 'en')
        
        // Initialize excluded countries from podcast data
        const excludedCountriesData = podcastData?.license_excluded_countries || []
        
        // Filter out invalid country codes
        const validExcludedCountries = excludedCountriesData.filter((code: string) => {
          const name = countryNameByCode(code)
          return name !== 'Unknown'
        })
        
        setExcludedCountries(validExcludedCountries)

        // Initialize hosts from podcast data
        if (podcastData?.hosts && Array.isArray(podcastData.hosts)) {
          const hostsData = podcastData.hosts.map((host: any, index: number) => ({
            id: host.id || `host_${index}`,
            name: host.name || '',
            language: host.language || 'en',
            image: host.image_url || '',
            imagePreviewUrl: host.image_url || undefined,
            imageFile: null
          }))
          setCurrentHosts(hostsData)
        } else {
          // Initialize with empty hosts array if no hosts data
          setCurrentHosts([])
        }

        // Set episodes
        const { data: episodesData, error: episodesError } = episodesResult
        
        if (episodesError) {
          // Don't fail the whole page if episodes fail to load
          setEpisodes([])
        } else {
          setEpisodes(episodesData || [])
        }

        setFetching(false)

      } catch (err) {
        if (!cancelled) {
          setFetchError(err instanceof Error ? err.message : 'An unexpected error occurred')
          setFetching(false)
        }
      }
    }

    fetchPodcast()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [podcastId, user?.id, profile?.role, isAdmin])



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

      // Upload script files if provided
      let scriptUrl = podcast?.script_url
      let scriptEnglishUrl = podcast?.script_english_url
      let scriptAudioTracksUrl = podcast?.script_audio_tracks_url
      let scriptMusicUrl = podcast?.script_music_url

      // Upload script file
      if (formData.scriptFile) {
        const scriptFile = formData.scriptFile as File
        const fileExt = scriptFile.name.split('.').pop()
        const fileName = `podcast-script-${podcastId}-${Date.now()}.${fileExt}`
        
        const { error: scriptUploadError } = await supabase.storage
          .from('podcast-covers')
          .upload(fileName, scriptFile)

        if (scriptUploadError) {
          addToast({ type: 'error', message: `Failed to upload script: ${scriptUploadError.message}` })
        } else {
          const { data: scriptUrlData } = supabase.storage
            .from('podcast-covers')
            .getPublicUrl(fileName)
          scriptUrl = scriptUrlData.publicUrl
        }
      }

      // Upload script English file
      if (formData.scriptEnglishFile) {
        const scriptEnglishFile = formData.scriptEnglishFile as File
        const fileExt = scriptEnglishFile.name.split('.').pop()
        const fileName = `podcast-script-english-${podcastId}-${Date.now()}.${fileExt}`
        
        const { error: scriptEnglishUploadError } = await supabase.storage
          .from('podcast-covers')
          .upload(fileName, scriptEnglishFile)

        if (scriptEnglishUploadError) {
          addToast({ type: 'error', message: `Failed to upload script English: ${scriptEnglishUploadError.message}` })
        } else {
          const { data: scriptEnglishUrlData } = supabase.storage
          .from('podcast-covers')
            .getPublicUrl(fileName)
          scriptEnglishUrl = scriptEnglishUrlData.publicUrl
        }
      }

      // Upload script audio tracks file
      if (formData.scriptAudioTracksFile) {
        const scriptAudioTracksFile = formData.scriptAudioTracksFile as File
        const fileExt = scriptAudioTracksFile.name.split('.').pop()
        const fileName = `podcast-script-audio-tracks-${podcastId}-${Date.now()}.${fileExt}`
        
                const { error: scriptAudioTracksUploadError } = await supabase.storage
          .from('podcast-covers')
          .upload(fileName, scriptAudioTracksFile)

        if (scriptAudioTracksUploadError) {
          addToast({ type: 'error', message: `Failed to upload script audio tracks: ${scriptAudioTracksUploadError.message}` })
        } else {
          const { data: scriptAudioTracksUrlData } = supabase.storage
          .from('podcast-covers')
          .getPublicUrl(fileName)
          scriptAudioTracksUrl = scriptAudioTracksUrlData.publicUrl
        }
      }

      // Upload script music file
      if (formData.scriptMusicFile) {
        const scriptMusicFile = formData.scriptMusicFile as File
        const fileExt = scriptMusicFile.name.split('.').pop()
        const fileName = `podcast-script-music-${podcastId}-${Date.now()}.${fileExt}`
        
        const { error: scriptMusicUploadError } = await supabase.storage
          .from('podcast-covers')
          .upload(fileName, scriptMusicFile)

        if (scriptMusicUploadError) {
          addToast({ type: 'error', message: `Failed to upload script music: ${scriptMusicUploadError.message}` })
        } else {
          const { data: scriptMusicUrlData } = supabase.storage
            .from('podcast-covers')
            .getPublicUrl(fileName)
          scriptMusicUrl = scriptMusicUrlData.publicUrl
        }
      }

      // Process hosts and upload host images
      const processedHosts = []
      const hostsData = currentHosts || []

      for (const host of hostsData) {
        let hostImageUrl = null
        const fileToUpload = host.imageFile
        
        if (fileToUpload) {
          const fileExt = fileToUpload.name.split('.').pop()
          const fileName = `host-image-${podcastId}-${host.id}-${Date.now()}.${fileExt}`
          
          const { error: hostUploadError } = await supabase.storage
            .from('podcast-covers')
            .upload(fileName, fileToUpload)

          if (hostUploadError) {
            addToast({ type: 'error', message: `Failed to upload image for ${host.name}: ${hostUploadError.message}` })
          } else {
            const { data: hostUrlData } = supabase.storage
              .from('podcast-covers')
              .getPublicUrl(fileName)
            hostImageUrl = hostUrlData.publicUrl
          }
        } else if (typeof host.image === 'string' && host.image) {
          // Keep existing image URL (already stored)
          hostImageUrl = host.image
        }

        if (host.name.trim()) { // Only save hosts with names
          processedHosts.push({
            id: host.id,
            name: host.name.trim(),
            language: host.language,
            image_url: hostImageUrl
          })
        }
      }

      const resolvedCategory = generalCategory || formData.category || ''
      const resolvedLanguage = generalLanguage || formData.language || 'en'
      const resolvedCountry = generalCountry || formData.country || 'DE'
      const resolvedStatus = (generalStatus || formData.status || 'draft') as 'draft' | 'pending' | 'approved' | 'rejected'
      const resolvedRssUrl = generalRss || formData.rss_url || null

      const existingOverrides =
        (podcast as any)?.manual_overrides ? { ...(podcast as any).manual_overrides } : {}
      const updatedOverrides = { ...existingOverrides }

      if (resolvedCategory && resolvedCategory !== podcast?.category) {
        updatedOverrides.category = true
      }
      if (resolvedLanguage && resolvedLanguage !== podcast?.language) {
        updatedOverrides.language = true
      }
      if (resolvedCountry && resolvedCountry !== podcast?.country) {
        updatedOverrides.country = true
      }

      // Update podcast with normal fields
      const podcastUpdate: any = {
        title: formData.title as string,
        description: formData.description as string,
        title_english: formData.title_english as string | null,
        description_english: formData.description_english as string | null,
        category: resolvedCategory,
        language: resolvedLanguage,
        country: resolvedCountry,
        status: resolvedStatus,
        rss_url: resolvedRssUrl,
        auto_publish_episodes: formData.auto_publish_episodes as boolean,
        cover_image_url: coverImageUrl,
        hosts: processedHosts,
        // License agreement fields
        license_format: formData.license_format as string | null,
        license_copyright: formData.license_copyright as string | null,
        license_territory: formData.license_territory as string | null,
        license_excluded_countries: excludedCountries.length > 0 ? excludedCountries : null,
        license_total_listeners: formData.license_total_listeners as number | null,
        license_listeners_per_episode: formData.license_listeners_per_episode as number | null,
        license_demographics: formData.license_demographics as any | null,
        license_rights_ownership: formData.license_rights_ownership as string | null,
        // Script URLs
        script_url: scriptUrl,
        script_english_url: scriptEnglishUrl,
        script_audio_tracks_url: scriptAudioTracksUrl,
        script_music_url: scriptMusicUrl,
        // Script metadata
        script_audio_tracks_title: formData.script_audio_tracks_title as string | null,
        script_audio_tracks_description: formData.script_audio_tracks_description as string | null,
        script_music_title: formData.script_music_title as string | null,
        script_music_description: formData.script_music_description as string | null,
        updated_at: new Date().toISOString()
      }

      if (Object.keys(updatedOverrides).length > 0) {
        podcastUpdate.manual_overrides = updatedOverrides
      }
      
      const { error: updateError } = await supabase
        .from('podcasts')
        .update(podcastUpdate)
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

      if (updateError) throw updateError

      addToast({
        type: 'success',
        message: 'Podcast updated successfully!'
      })

      // Refresh data
      window.location.reload()

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <h1 className="text-2xl font-bold text-red-800 mb-2">Error</h1>
          <p className="text-red-700">{fetchError}</p>
          <Link href={backHref} className="mt-4 inline-block">
            <Button variant="outline">← Back to Podcasts</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (fetching || !podcast) {
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
        {fetchError && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{fetchError}</p>
          </div>
        )}
      </div>
    )
  }

  const pageTitle = isAdmin ? `Edit ${podcast.title}` : 'Edit Podcast'
  const pageSubtitle = isAdmin 
    ? 'Administrative podcast editing and content management'
    : 'Update your podcast information and settings'

  return (
    <div className={`min-h-screen ${isAdmin ? '' : 'bg-orange-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {isAdmin ? (
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
                    {pageTitle}
                  </h1>
                  <p className="text-gray-600">
                    {pageSubtitle}
                  </p>
                  {podcast.user_profiles && (
                    <p className="text-sm text-gray-500 mt-1">
                      Author: {podcast.user_profiles.full_name} ({podcast.user_profiles.email})
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
                <p className="mt-2 text-lg text-gray-600">
                  {pageSubtitle}
                </p>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 items-center">
              <Link href={backHref}>
                <Button variant="outline" size="sm" className={isAdmin ? "border-gray-300 text-gray-700 hover:bg-gray-50 whitespace-nowrap" : "whitespace-nowrap"}>
                  ← Back
                </Button>
              </Link>
              <div className="relative">
                <TranslateAllPodcast
                  podcastId={podcastId}
                  podcastTitle={podcast.title}
                  podcastDescription={podcast.description || ''}
                  podcastTitleEnglish={podcast.title_english || null}
                  podcastDescriptionEnglish={podcast.description_english || null}
                  episodes={episodes.map(ep => ({
                    ...ep,
                    title_english: ep.title_english || null,
                    description_english: ep.description_english || null
                  }))}
                  onUpdate={() => {
                    // Refresh the page data
                    window.location.reload()
                  }}
                />
              </div>
                <Button 
                  type="button"
                  variant="default"
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white whitespace-nowrap"
                  disabled={loading}
                  onClick={async (e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    
                    if (!podcastId) {
                      return
                    }
                    setLoading(true)
                    
                    try {
                      // Define default country once at the top
                      const defaultCountry = generalCountry || 'DE'
                      
                    // Use the handleSubmit function with form data
                      if (currentFormData) {
                        await handleSubmit(currentFormData, currentCoverImage)
                      } else {
                      // Fallback: update general info only
                        const generalOverrides =
                          (podcast as any)?.manual_overrides ? { ...(podcast as any).manual_overrides } : {}
                        if (generalCategory && generalCategory !== podcast?.category) {
                          generalOverrides.category = true
                        }
                        if (generalLanguage && generalLanguage !== podcast?.language) {
                          generalOverrides.language = true
                        }
                        if (generalCountry && generalCountry !== podcast?.country) {
                          generalOverrides.country = true
                        }

                        const podcastUpdateData: any = { 
                          status: generalStatus, 
                          category: generalCategory, 
                          language: generalLanguage,
                          rss_url: generalRss, 
                          country: generalCountry,
                          updated_at: new Date().toISOString(),
                        }

                        if (Object.keys(generalOverrides).length > 0) {
                          podcastUpdateData.manual_overrides = generalOverrides
                        }
                        
                        const { error: generalError } = await supabase
                          .from('podcasts')
                          .update(podcastUpdateData)
                          .eq('id', podcastId)
                        
                        if (generalError) throw generalError

                      addToast({ type: 'success', message: 'General info updated successfully!' })
                        window.location.reload()
                      }
                      
                    } catch (error: any) {
                      addToast({ type: 'error', message: `Save failed: ${error.message}` })
                    } finally {
                      setLoading(false)
                    }
                  }}
                >
                  {loading ? 'Saving...' : 'Save'}
                </Button>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Full Width - General Info at the top */}
          <div className="space-y-4">
            {/* General Info */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="text-sm font-medium text-gray-900 mb-3">General Info</div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {isAdmin && (
                <Select label="Status" id={`status_${isAdmin ? 'admin' : 'author'}`} value={generalStatus} onChange={(e) => setGeneralStatus(e.target.value as any)}>
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </Select>
                )}
                <Select label="Category" id={`category_${isAdmin ? 'admin' : 'author'}`} value={generalCategory} onChange={(e) => setGeneralCategory(e.target.value)}>
                  {['Business','Technology','Entertainment','Education','News','Health','Sports','Music','Comedy','True Crime','Science','History','Politics','Arts','Other'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
                <Select label="Default Country" id={`country_${isAdmin ? 'admin' : 'author'}`} value={generalCountry} onChange={(e) => setGeneralCountry(e.target.value)}>
                  {[
                    // Germany first
                    { code: 'DE', name: countryNameByCode('DE') },
                    // Then all other countries alphabetically
                    ...COUNTRIES.filter(c => c.code !== 'DE').map(c => ({ code: c.code, name: countryNameByCode(c.code) })).sort((a, b) => a.name.localeCompare(b.name))
                  ].map((country) => (
                    <option key={country.code} value={country.code}>{country.name}</option>
                  ))}
                </Select>
                <Select label="Language" id={`language_${isAdmin ? 'admin' : 'author'}`} value={generalLanguage} onChange={(e) => setGeneralLanguage(e.target.value)}>
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
                <Input label="RSS Feed URL (Optional)" id={`rss_${isAdmin ? 'admin' : 'author'}`} type="url" value={generalRss} onChange={(e) => setGeneralRss(e.target.value)} placeholder="https://.../rss" />
                
              </div>
            </div>

            {/* Hosts */}
            <HostsManager 
              hosts={currentHosts.map(h => ({
                ...h,
                image: h.imageFile ? h.imageFile : h.image
              }))}
              onHostsChange={(hosts) => {
                setCurrentHosts(hosts.map(h => ({
                  ...h,
                  imageFile: h.image instanceof File ? h.image : null,
                  image: typeof h.image === 'string' ? h.image : ''
                })))
              }}
            />
          </div>

          {/* Full Width - Country selector + Podcast Form */}
          <div className="space-y-4">
            {/* Country Exclusion List */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="text-sm font-medium text-gray-900 mb-3">Countries where podcast is not available</div>
              <div className="space-y-3">
                {/* Selected countries as tags */}
                {excludedCountries.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {excludedCountries.map((countryCode) => {
                      const countryName = countryNameByCode(countryCode)
                      console.log(`Country code: ${countryCode}, Name: ${countryName}`)
                      
                      // Skip invalid country codes
                      if (countryName === 'Unknown') {
                        console.warn(`Invalid country code found: ${countryCode}`)
                        return null
                      }
                      
                      return (
                      <div
                        key={countryCode}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-red-100 border border-red-200 text-red-800"
                      >
                        <span>{countryName}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setExcludedCountries(prev => prev.filter(code => code !== countryCode))
                          }}
                          className="ml-1 rounded-full p-0.5 hover:bg-red-200 transition-colors"
                          aria-label={`Remove ${countryNameByCode(countryCode)}`}
                        >
                          ×
                        </button>
                      </div>
                      )
                    })}
                  </div>
                )}
                
                {/* Country selection dropdown */}
                <select
                  value={selectedCountryToExclude}
                  onChange={(e) => {
                    const selectedValue = e.target.value
                    console.log('Selected country:', selectedValue)
                    if (selectedValue && !excludedCountries.includes(selectedValue)) {
                      console.log('Adding country to excluded list:', selectedValue)
                      setExcludedCountries(prev => {
                        const newList = [...prev, selectedValue]
                        console.log('New excluded countries list:', newList)
                        return newList
                      })
                    }
                    setSelectedCountryToExclude('') // Reset dropdown
                  }}
                  className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 cursor-pointer"
                >
                  <option value="">Select country to exclude...</option>
                  {COUNTRIES
                    .filter(country => !excludedCountries.includes(country.code))
                    .map(country => (
                      <option key={country.code} value={country.code}>
                        {countryNameByCode(country.code)}
                      </option>
                    ))}
                </select>
                
                {excludedCountries.length > 0 && (
                  <p className="text-xs text-gray-500">
                    This podcast will not be available in the selected countries.
                  </p>
                )}
              </div>
            </div>

            <EditPodcastForm
              podcast={podcast}
              onSubmit={isAdmin ? handleSubmit : async () => {}} // Admin uses form submit, author uses header button
              loading={isAdmin ? loading : false} // Admin shows loading in form, author in header
              isAdmin={isAdmin}
              onFormDataChange={handleFormDataChange}
            />
          </div>

          {/* Full Width - Episodes */}
          <div className="space-y-4">
            {/* Episodes Preview */}
            {/* {episodes.length > 0 ? (
              <div className="flex-1 min-h-0">
                <EpisodePreviewList
                  title={`Recent Episodes (showing ${episodes.length})`}
                  episodes={episodes}
                  autoHeight
                  emptyStateMessage="No episodes yet"
                  emptyStateIcon="🎙️"
                  showActions={true}
                  getEpisodeHref={(episode) => isAdmin ? `/admin/episodes/${episode.id}/edit` : `/author/podcasts/${podcastId}/episodes/${episode.id}/edit`}
                  className="w-full overflow-hidden"
                />
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <p className="text-gray-600 mb-4">No episodes yet</p>
              </div>
            )} */}
            
            {/* Manage Episodes Button - Always Prominent */}
            <div className="space-y-2 flex-shrink-0">
              <Link href={isAdmin ? `/admin/podcasts/${podcastId}/episodes` : `/author/podcasts/${podcastId}/episodes`} className="block">
                <Button
                  variant="default" 
                  size="lg" 
                  className={`w-full bg-blue-600 hover:bg-blue-700 text-white ${isAdmin ? '' : 'rounded-full'}`}
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
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

// Export the component (memo removed to fix lazy loading issue)
export default PodcastEditContent
