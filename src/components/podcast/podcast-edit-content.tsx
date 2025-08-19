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
import CountrySelector from '@/components/podcast/edit/CountrySelector'
import type { Host, Podcast as PodcastType, CountryTranslation } from '@/components/podcast/edit/types'

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

  // Country-specific editing state
  const [selectedCountry, setSelectedCountry] = useState<string>('DE')
  const [countryTranslations, setCountryTranslations] = useState<Record<string, CountryTranslation>>({})
  const [localTitle, setLocalTitle] = useState('')
  const [localDescription, setLocalDescription] = useState('')
  const [localCoverDataUrl, setLocalCoverDataUrl] = useState<string | null>(null)
  
  // Store country cover Files separately to avoid serialization issues
  const countryCoverFilesRef = useRef<Map<string, File>>(new Map())

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

  // Callback to handle form data changes (hosts managed separately by HostsManager)
  const handleFormDataChange = useCallback((formData: any, coverImage: File | null) => {
    setCurrentFormData(formData)
    setCurrentCoverImage(coverImage)
  }, [])

  // Country management handlers
  const handleCountryChange = useCallback((country: string) => {
    // Save current content before switching
    const currentCountry = selectedCountry
    const defaultCountry = generalCountry || 'DE'
    
    if (currentCountry !== defaultCountry) {
      setCountryTranslations((prev) => ({
        ...prev,
        [currentCountry]: {
          title: localTitle,
          description: localDescription,
          cover_image_url: localCoverDataUrl
        }
      }))
    }
    
    // Switch to selected country
    setSelectedCountry(country)
    const translation = countryTranslations[country]
    setLocalTitle(translation?.title || (podcast?.title ?? ''))
    setLocalDescription(translation?.description || (podcast?.description ?? ''))
    setLocalCoverDataUrl(translation?.cover_image_url || (podcast?.cover_image_url ?? null))
  }, [selectedCountry, generalCountry, localTitle, localDescription, localCoverDataUrl, countryTranslations, podcast])

  const handleAddCountry = useCallback((newCountry: string) => {
    // Save current content and add new country
    const currentCountry = selectedCountry
    setCountryTranslations((prev) => ({
      ...prev,
      [currentCountry]: {
        title: localTitle,
        description: localDescription,
        cover_image_url: localCoverDataUrl
      },
      [newCountry]: {
        title: localTitle,
        description: localDescription,
        cover_image_url: localCoverDataUrl
      }
    }))
    
    setSelectedCountry(newCountry)
  }, [selectedCountry, localTitle, localDescription, localCoverDataUrl])

  const handleRemoveCountry = useCallback(async (country: string) => {
    if (!podcastId) return
    
    // Delete from database
    await supabase
      .from('podcast_country_translations')
      .delete()
      .eq('podcast_id', podcastId)
      .eq('country_code', country)

    // Remove from local state
    setCountryTranslations((prev) => {
      const copy = { ...prev }
      delete copy[country]
      return copy
    })

    // If deleting the selected country, switch back to default country
    if (country === selectedCountry) {
      const defaultCountry = generalCountry || 'DE'
      setSelectedCountry(defaultCountry)
      const defaultTranslation = countryTranslations[defaultCountry]
      setLocalTitle(defaultTranslation?.title || (podcast?.title ?? ''))
      setLocalDescription(defaultTranslation?.description || (podcast?.description ?? ''))
      setLocalCoverDataUrl(defaultTranslation?.cover_image_url || (podcast?.cover_image_url ?? null))
    }
  }, [podcastId, supabase, selectedCountry, generalCountry, countryTranslations, podcast])

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
            podcast_translations:podcast_translations(language_code,title,description),
            license_countries:podcast_license_countries(country_code)
          `)
          .eq('id', podcastId)

        // Authors can only edit their own podcasts
        if (!isAdmin) {
          query = query.eq('author_id', user.id)
        }

        // Execute podcast data and country translations queries in parallel
        const [podcastResult, countryTransResult, episodesResult] = await Promise.all([
          query.single(),
          supabase
            .from('podcast_country_translations')
            .select('country_code,title,description,cover_image_url')
            .eq('podcast_id', podcastId),
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
        setSelectedCountry(defaultCountry)
        
        // Initialize form fields with podcast data
        setLocalTitle(podcastData?.title || '')
        setLocalDescription(podcastData?.description || '')
        setLocalCoverDataUrl(podcastData?.cover_image_url || null)

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

        // Process country translations
        const { data: countryTrans } = countryTransResult
        const map: Record<string, { title: string; description: string; cover_image_url: string | null }> = {}
        ;(countryTrans || []).forEach((row: any) => {
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
        setCountryTranslations(map)

        // Set episodes
        const { data: episodesData } = episodesResult
        setEpisodes(episodesData || [])

        // Clean up invalid translations in background (non-blocking)
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
            // Clean up in background without blocking UI
            Promise.all(
              invalidCodes.map(code => 
                supabase
                  .from('podcast_country_translations')
                  .delete()
                  .eq('podcast_id', podcastId)
                  .eq('country_code', code)
              )
            ).catch(err => console.warn('Failed to clean up invalid translations:', err))
          }
        }

      } catch (err) {
        console.error('Error in fetchPodcast:', err)
        setFetchError('An unexpected error occurred')
      }
    }

    fetchPodcast()
  }, [podcastId, supabase, user, profile, isAdmin])

  // Separate function to save country translations
  const saveCountryTranslationsDirectly = async () => {
    const currentCountry = selectedCountry
    const defaultCountry = generalCountry || 'DE'
    
    // Create complete translations including current form values
    const completeTranslations = { ...countryTranslations }
    completeTranslations[currentCountry] = {
      title: localTitle,
      description: localDescription,
      cover_image_url: localCoverDataUrl
    }

    // Ensure default country is also included with base podcast data if not already present
    if (!completeTranslations[defaultCountry]) {
      completeTranslations[defaultCountry] = {
        title: podcast?.title || '',
        description: podcast?.description || '',
        cover_image_url: podcast?.cover_image_url || null
      }
    }

    // Save all country translations
    for (const [countryCode, translation] of Object.entries(completeTranslations)) {
      let coverImageUrl = translation.cover_image_url
      
      // Check if there's a new cover image file to upload for this country
      const coverFile = countryCoverFilesRef.current.get(countryCode)
      if (coverFile) {
        const fileExt = coverFile.name.split('.').pop()
        const fileName = `country-cover-${podcastId}-${countryCode}-${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('podcast-covers')
          .upload(fileName, coverFile)

        if (uploadError) {
          addToast({ type: 'error', message: `Failed to upload cover for ${countryCode}: ${uploadError.message}` })
        } else {
          const { data: urlData } = supabase.storage
            .from('podcast-covers')
            .getPublicUrl(fileName)
          coverImageUrl = urlData.publicUrl
        }
      }
      
      // Save/update country translation
      const translationData = {
        podcast_id: podcastId,
        country_code: countryCode,
        title: translation.title || '',
        description: translation.description || '',
        cover_image_url: coverImageUrl,
        updated_at: new Date().toISOString(),
      }
      
      const { error: countryError } = await supabase
        .from('podcast_country_translations')
        .upsert(translationData, { onConflict: 'podcast_id,country_code' } as any)
      
      if (countryError) {
        addToast({ type: 'error', message: `Failed to save ${countryCode} translation: ${countryError.message}` })
      }
    }
  }

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

      // Update podcast
      const defaultCountryForUpdate = generalCountry || 'DE'
      const isEditingDefaultCountry = selectedCountry === defaultCountryForUpdate
      
      console.log(`🔍 HANDLESUBMIT - Is editing default country ${defaultCountryForUpdate}? ${isEditingDefaultCountry}`)
      
      const podcastUpdate: any = {
        category: formData.category as string,
        language: formData.language as string,
        country: formData.country as string,
        status: formData.status as 'draft' | 'pending' | 'approved' | 'rejected',
        rss_url: formData.rss_url as string | null,
        auto_publish_episodes: formData.auto_publish_episodes as boolean,
        cover_image_url: coverImageUrl,
        hosts: processedHosts,
        updated_at: new Date().toISOString()
      }
      
      // Only update base title/description if editing the default country
      if (isEditingDefaultCountry) {
        podcastUpdate.title = formData.title as string
        podcastUpdate.description = formData.description as string
        console.log('🔍 HANDLESUBMIT - Updating base podcast title/description (editing default country)')
      } else {
        console.log('🔍 HANDLESUBMIT - NOT updating base podcast title/description (editing non-default country)')
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

      // Save country translations after main podcast update
      console.log('🔍 HANDLESUBMIT - Starting country translations save...')
      const currentCountry = selectedCountry
      const defaultCountry = generalCountry || 'DE'
      
      // Create complete translations including current form values
      const completeTranslations = { ...countryTranslations }
      // Save current form values to the ACTUALLY selected country, not the form's country field
      completeTranslations[currentCountry] = {
        title: formData.title as string,
        description: formData.description as string,
        cover_image_url: localCoverDataUrl
      }
      
      console.log(`🔍 HANDLESUBMIT - Saving form data to ACTIVE country ${currentCountry} instead of form country ${formData.country}`)

      console.log('🔍 HANDLESUBMIT - Complete Translations:', completeTranslations)
      console.log('🔍 HANDLESUBMIT - Current Country:', currentCountry)
      console.log('🔍 HANDLESUBMIT - Countries to save:', Object.keys(completeTranslations))

      // Ensure default country is also included with base podcast data if not already present
      if (!completeTranslations[defaultCountry]) {
        completeTranslations[defaultCountry] = {
          title: podcast?.title || '',
          description: podcast?.description || '',
          cover_image_url: podcast?.cover_image_url || null
        }
        console.log(`🔍 HANDLESUBMIT - Added missing default country ${defaultCountry}:`, completeTranslations[defaultCountry])
      }

      // Save all country translations
      for (const [countryCode, translation] of Object.entries(completeTranslations)) {
        let coverImageUrl = translation.cover_image_url
        
        // Check if there's a new cover image file to upload for this country
        const coverFile = countryCoverFilesRef.current.get(countryCode)
        if (coverFile) {
          const fileExt = coverFile.name.split('.').pop()
          const fileName = `country-cover-${podcastId}-${countryCode}-${Date.now()}.${fileExt}`
          
          const { error: uploadError } = await supabase.storage
            .from('podcast-covers')
            .upload(fileName, coverFile)

          if (uploadError) {
            console.error(`❌ HANDLESUBMIT - Upload error for ${countryCode}:`, uploadError)
            addToast({ type: 'error', message: `Failed to upload cover for ${countryCode}: ${uploadError.message}` })
          } else {
            const { data: urlData } = supabase.storage
              .from('podcast-covers')
              .getPublicUrl(fileName)
            coverImageUrl = urlData.publicUrl
          }
        }
        
        // Save/update country translation
        const translationData = {
          podcast_id: podcastId,
          country_code: countryCode,
          title: translation.title || '',
          description: translation.description || '',
          cover_image_url: coverImageUrl,
          updated_at: new Date().toISOString(),
        }
        
        console.log(`🔍 HANDLESUBMIT - Saving ${countryCode} translation:`, translationData)
        
        const { data: upsertResult, error: countryError } = await supabase
          .from('podcast_country_translations')
          .upsert(translationData, { onConflict: 'podcast_id,country_code' } as any)
        
        if (countryError) {
          console.error(`❌ HANDLESUBMIT - Save error for ${countryCode}:`, countryError)
          addToast({ type: 'error', message: `Failed to save ${countryCode} translation: ${countryError.message}` })
        } else {
          console.log(`✅ HANDLESUBMIT - ${countryCode} translation saved:`, upsertResult)
        }
      }

      addToast({
        type: 'success',
        message: 'Podcast and country translations updated successfully'
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
                      
                      // Use the comprehensive handleSubmit function with all form data
                      console.log('🚀 SAVE - Checking currentFormData:', currentFormData)
                      console.log('🚀 SAVE - currentCoverImage:', currentCoverImage)
                      
                      if (currentFormData) {
                        console.log('🚀 SAVE - Using handleSubmit with currentFormData')
                        await handleSubmit(currentFormData, currentCoverImage)
                      } else {
                        console.log('🚀 SAVE - Using fallback logic (no currentFormData)')
                        // First save country translations using the fallback logic
                        await saveCountryTranslationsDirectly()
                        
                        // Then continue with regular podcast update
                        // Fallback to the original logic if form data not available
                        // Fallback to the original logic if form data not available
                        const podcastUpdateData: any = { 
                          status: generalStatus, 
                          category: generalCategory, 
                          language: generalLanguage,
                          rss_url: generalRss, 
                          country: generalCountry,
                          updated_at: new Date().toISOString() 
                        }
                        
                        // If default country is selected, also update the base title/description
                        if (selectedCountry === defaultCountry) {
                          podcastUpdateData.title = localTitle
                          podcastUpdateData.description = localDescription
                        }
                        
                        const { error: generalError } = await supabase
                          .from('podcasts')
                          .update(podcastUpdateData)
                          .eq('id', podcastId)
                        
                        if (generalError) throw generalError

                        // Prepare current form values to include in save
                        const currentCountry = selectedCountry
                        
                        // Create a complete translations object including current form values
                        const completeTranslations = { ...countryTranslations }
                        // ALWAYS save current country data (including default country)
                        completeTranslations[currentCountry] = {
                          title: localTitle,
                          description: localDescription,
                          cover_image_url: localCoverDataUrl
                        }

                        console.log('🔍 SAVE DEBUG - Current Country:', currentCountry)
                        console.log('🔍 SAVE DEBUG - Default Country:', defaultCountry)
                        console.log('🔍 SAVE DEBUG - Original countryTranslations:', countryTranslations)
                        console.log('🔍 SAVE DEBUG - Complete Translations:', completeTranslations)
                        console.log('🔍 SAVE DEBUG - Local Form Values:', { title: localTitle, description: localDescription, cover: localCoverDataUrl })
                        console.log('🔍 SAVE DEBUG - Podcast ID:', podcastId)
                        console.log('🔍 SAVE DEBUG - Number of countries to save:', Object.keys(completeTranslations).length)
                        console.log('🔍 SAVE DEBUG - Countries list:', Object.keys(completeTranslations))

                        // Save all country translations with cover image uploads
                        for (const [countryCode, translation] of Object.entries(completeTranslations)) {
                          // Save ALL countries including default country as translations
                          
                          let coverImageUrl = translation.cover_image_url
                          
                          // Check if there's a new cover image file to upload for this country
                          const coverFile = countryCoverFilesRef.current.get(countryCode)
                          if (coverFile) {
                            const fileExt = coverFile.name.split('.').pop()
                            const fileName = `country-cover-${podcastId}-${countryCode}-${Date.now()}.${fileExt}`
                            
                            const { error: uploadError } = await supabase.storage
                              .from('podcast-covers')
                              .upload(fileName, coverFile)

                            if (uploadError) {
                              addToast({ type: 'error', message: `Failed to upload cover for ${countryNameByCode(countryCode)}: ${uploadError.message}` })
                            } else {
                              const { data: urlData } = supabase.storage
                                .from('podcast-covers')
                                .getPublicUrl(fileName)
                              coverImageUrl = urlData.publicUrl
                            }
                          }
                          
                          // Save/update country translation
                          const translationData = {
                            podcast_id: podcastId,
                            country_code: countryCode,
                            title: translation.title || '',
                            description: translation.description || '',
                            cover_image_url: coverImageUrl,
                            updated_at: new Date().toISOString(),
                          }
                          
                          console.log(`🔍 SAVE DEBUG - Saving ${countryCode} translation:`, translationData)
                          
                          const { data: upsertResult, error: countryError } = await supabase
                            .from('podcast_country_translations')
                            .upsert(translationData, { onConflict: 'podcast_id,country_code' } as any)
                          
                          if (countryError) {
                            console.error(`❌ SAVE ERROR - ${countryCode}:`, countryError)
                            addToast({ type: 'error', message: `Failed to save ${countryNameByCode(countryCode)} translation: ${countryError.message}` })
                          } else {
                            console.log(`✅ SAVE SUCCESS - ${countryCode} translation saved:`, upsertResult)
                          }
                        }
                        
                        // Clear uploaded file references
                        countryCoverFilesRef.current.clear()
                        
                        addToast({ type: 'success', message: 'All changes saved successfully!' })
                        
                        // Refresh data
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
            {/* Country-specific content */}
            <CountrySelector
              selectedCountry={selectedCountry}
              countryTranslations={countryTranslations}
              generalCountry={generalCountry}
              isAdmin={isAdmin}
              onCountryChange={handleCountryChange}
              onAddCountry={handleAddCountry}
              onRemoveCountry={handleRemoveCountry}
            />

            <EditPodcastForm
              podcast={podcast}
              onSubmit={isAdmin ? handleSubmit : async () => {}} // Admin uses form submit, author uses header button
              loading={isAdmin ? loading : false} // Admin shows loading in form, author in header
              isAdmin={isAdmin}
              countryTitle={localTitle}
              countryDescription={localDescription}
              countryCoverPreviewUrl={localCoverDataUrl}
              onCountryTitleChange={(v) => setLocalTitle(v)}
              onCountryDescriptionChange={(v) => setLocalDescription(v)}
              onCountryCoverFileChange={(file) => {
                // Store File object for upload
                countryCoverFilesRef.current.set(selectedCountry, file)
                
                // Create preview URL for UI
                const reader = new FileReader()
                reader.onload = () => setLocalCoverDataUrl(reader.result as string)
                reader.readAsDataURL(file)
              }}
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
