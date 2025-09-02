'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
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
  
  // Store host files separately to avoid serialization issues
  const hostFilesRef = useRef<Map<string, File>>(new Map())

  // Country exclusion list
  const [excludedCountries, setExcludedCountries] = useState<string[]>([])
  const [selectedCountryToExclude, setSelectedCountryToExclude] = useState<string>('')

  // Callback to handle form data changes (hosts managed separately by HostsManager)
  const handleFormDataChange = useCallback((formData: any, coverImage: File | null) => {
    setCurrentFormData(formData)
    setCurrentCoverImage(coverImage)
  }, [])



  useEffect(() => {
    const fetchPodcast = async () => {
      try {
        if (!user) {
          setFetchError('You must be logged in to edit a podcast')
          return
        }

        // Check authorization based on role
        if (isAdmin) {
          if (!profile || profile.role !== 'admin') {
            setFetchError('You must be an admin to edit podcasts')
            return
          }
        } else {
          if (!profile || (profile.role !== 'author' && profile.role !== 'admin')) {
            setFetchError('You must be an author or admin to edit podcasts')
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
        const [podcastResult, episodesResult] = await Promise.all([
          query.single(),
          supabase
            .from('episodes')
            .select('*')
            .eq('podcast_id', podcastId)
            .order('episode_number', { ascending: false })
        ])

        const { data: podcastData, error: podcastError } = podcastResult
        if (podcastError || !podcastData) {
          setFetchError(podcastError?.message || 'Failed to fetch podcast')
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
        console.log('Excluded countries data:', excludedCountriesData)
        
        // Filter out invalid country codes
        const validExcludedCountries = excludedCountriesData.filter((code: string) => {
          const name = countryNameByCode(code)
          if (name === 'Unknown') {
            console.warn(`Removing invalid country code: ${code}`)
            return false
          }
          return true
        })
        
        setExcludedCountries(validExcludedCountries)

        // Initialize hosts from podcast data
        if (podcastData?.hosts && Array.isArray(podcastData.hosts)) {
          const hostsData = podcastData.hosts.map((host: any, index: number) => ({
            id: host.id || `host_${index}`,
            name: host.name || '',
            language: host.language || 'en',
            image: host.image_url || '',
            imagePreviewUrl: host.image_url || undefined
          }))
          setCurrentHosts(hostsData)
        } else {
          // Initialize with empty hosts array if no hosts data
          setCurrentHosts([])
        }



        // Set episodes
        const { data: episodesData } = episodesResult
        setEpisodes(episodesData || [])



      } catch (err) {
        console.error('Error in fetchPodcast:', err)
        setFetchError('An unexpected error occurred')
      }
    }

    fetchPodcast()
  }, [podcastId, supabase, user, profile, isAdmin])



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

      // Process hosts and upload host images
      const processedHosts = []
      const hostsData = currentHosts || []
      
      for (const host of hostsData) {
        let hostImageUrl = null
        
        // Check if image is a File reference
        if (host.image && typeof host.image === 'string' && host.image.startsWith('FILE:')) {
          const hostId = host.image.replace('FILE:', '')
          const imageFile = hostFilesRef.current.get(hostId)
          
          if (imageFile) {
            const fileExt = imageFile.name.split('.').pop()
            const fileName = `host-image-${podcastId}-${host.id}-${Date.now()}.${fileExt}`
            
            const { error: hostUploadError } = await supabase.storage
              .from('podcast-covers')
              .upload(fileName, imageFile)

            if (hostUploadError) {
              addToast({ type: 'error', message: `Failed to upload image for ${host.name}: ${hostUploadError.message}` })
            } else {
              const { data: hostUrlData } = supabase.storage
                .from('podcast-covers')
                .getPublicUrl(fileName)
              hostImageUrl = hostUrlData.publicUrl
            }
          }
        } else if (host.image && host.image instanceof File) {
          const fileExt = host.image.name.split('.').pop()
          const fileName = `host-image-${podcastId}-${host.id}-${Date.now()}.${fileExt}`
          
          const { error: hostUploadError } = await supabase.storage
            .from('podcast-covers')
            .upload(fileName, host.image)

          if (hostUploadError) {
            addToast({ type: 'error', message: `Failed to upload image for ${host.name}: ${hostUploadError.message}` })
          } else {
            const { data: hostUrlData } = supabase.storage
              .from('podcast-covers')
              .getPublicUrl(fileName)
            hostImageUrl = hostUrlData.publicUrl
          }
        } else if (typeof host.image === 'string' && host.image && !host.image.startsWith('FILE:')) {
          // Keep existing image URL
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

      // Update podcast with normal fields
      const podcastUpdate: any = {
        title: formData.title as string,
        description: formData.description as string,
        category: formData.category as string,
        language: formData.language as string,
        country: formData.country as string,
        status: formData.status as 'draft' | 'pending' | 'approved' | 'rejected',
        rss_url: formData.rss_url as string | null,
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
        updated_at: new Date().toISOString()
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
            
            <div className="flex gap-3">
              <Link href={backHref}>
                <Button variant="outline" className={isAdmin ? "border-gray-300 text-gray-700 hover:bg-gray-50" : ""}>
                  ← Back to Podcasts
                </Button>
              </Link>
              {!isAdmin && (
                <Button 
                  variant="default"
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={loading}
                  onClick={async () => {
                    console.log('🚀 SAVE BUTTON CLICKED!')
                    console.log('🚀 SAVE - Podcast ID:', podcastId)
                    console.log('🚀 SAVE - Loading state:', loading)
                    
                    if (!podcastId) {
                      console.log('❌ SAVE - No podcast ID, returning')
                      return
                    }
                    setLoading(true)
                    
                    try {
                      console.log('🚀 SAVE - Starting save process...')
                      // Define default country once at the top
                      const defaultCountry = generalCountry || 'DE'
                      
                      // Use the handleSubmit function with form data
                      if (currentFormData) {
                        await handleSubmit(currentFormData, currentCoverImage)
                      } else {
                        // Fallback: update general info only
                        const podcastUpdateData: any = { 
                          status: generalStatus, 
                          category: generalCategory, 
                          language: generalLanguage,
                          rss_url: generalRss, 
                          country: generalCountry,
                          updated_at: new Date().toISOString() 
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
                      console.error('❌ SAVE - Error in save process:', error)
                      addToast({ type: 'error', message: `Save failed: ${error.message}` })
                    } finally {
                      console.log('🚀 SAVE - Finished save process, setting loading to false')
                      setLoading(false)
                    }
                  }}
                >
                  {loading ? 'Saving...' : 'Save All Changes'}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 min-h-0">
          {/* Left Column - Country selector + Podcast Form (Sticky) */}
          <div className="lg:w-2/3 lg:sticky lg:top-8 lg:self-start space-y-4">
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

          {/* Right Column - General + Hosts + Episodes */}
          <div className="lg:w-1/3 flex flex-col space-y-4 min-h-0">
            {/* General Info */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="text-sm font-medium text-gray-900 mb-3">General Info</div>
              <div className="grid grid-cols-1 gap-3">
                <Select label="Status" id={`status_${isAdmin ? 'admin' : 'author'}`} value={generalStatus} onChange={(e) => setGeneralStatus(e.target.value as any)}>
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </Select>
                <Select label="Category" id={`category_${isAdmin ? 'admin' : 'author'}`} value={generalCategory} onChange={(e) => setGeneralCategory(e.target.value)}>
                  {['Business','Technology','Entertainment','Education','News','Health','Sports','Music','Comedy','True Crime','Science','History','Politics','Arts','Other'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
                {!isAdmin && (
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
                )}
                {!isAdmin && (
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
                )}
                <Input label="RSS Feed URL (Optional)" id={`rss_${isAdmin ? 'admin' : 'author'}`} type="url" value={generalRss} onChange={(e) => setGeneralRss(e.target.value)} placeholder="https://.../rss" />
                
                {isAdmin && (
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
                )}
              </div>
            </div>

            {/* Hosts */}
            <HostsManager 
              hosts={currentHosts}
              onHostsChange={setCurrentHosts}
              onFileUpload={(hostId, file) => {
                hostFilesRef.current.set(hostId, file)
              }}
            />

            {/* Episodes List */}
            <div className="flex-1 min-h-0">
              <EpisodePreviewList
                title={`Episodes (${episodes.length})`}
                episodes={episodes.slice(0, 5)}
                autoHeight
                emptyStateMessage="No episodes yet"
                emptyStateIcon="🎙️"
                showActions={true}
                getEpisodeHref={(episode) => isAdmin ? `/admin/episodes/${episode.id}/edit` : `/author/podcasts/${podcastId}/episodes/${episode.id}/edit`}
                className="w-full overflow-hidden"
              />
              
              <div className="space-y-2 flex-shrink-0 mt-3">
                <Link href={isAdmin ? `/author/podcasts/${podcastId}/episodes` : `/author/podcasts/${podcastId}/episodes`} className="block">
                  <Button
                    variant="outline" 
                    size="lg" 
                    className={`w-full ${isAdmin ? '' : 'rounded-full'}`}
                  >
                    Manage All Episodes
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Memoize the component to prevent unnecessary re-renders
export default React.memo(PodcastEditContent)
