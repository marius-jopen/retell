'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
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
  const [currentHosts, setCurrentHosts] = useState<any[]>([])
  
  // Store host files separately to avoid serialization issues
  const hostFilesRef = useRef<Map<string, File>>(new Map())

  // Callback to handle form data changes
  const handleFormDataChange = useCallback((formData: any, coverImage: File | null, hosts: any[]) => {
    setCurrentFormData(formData)
    setCurrentCoverImage(coverImage)
    
    // Handle hosts and store File objects separately
    const hostsWithoutFiles = hosts.map(host => {
      if (host.image && host.image instanceof File) {
        // Store File in ref and replace with placeholder
        hostFilesRef.current.set(host.id, host.image)
        return { ...host, image: `FILE:${host.id}` }
      }
      return host
    })
    setCurrentHosts(hostsWithoutFiles)
  }, [])

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
        console.log('🔍 LOAD DEBUG - Country translations loaded from DB:', map)
        console.log('🔍 LOAD DEBUG - Raw country translations from DB:', countryTrans)
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
        
        // Initialize left column with default country-specific values
        const defaultPreset = map[defaultCountry]
        setLocalTitle(defaultPreset?.title || (podcastData?.title ?? ''))
        setLocalDescription(defaultPreset?.description || (podcastData?.description ?? ''))
        setLocalCoverDataUrl(defaultPreset?.cover_image_url || (podcastData?.cover_image_url ?? null))

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

  // Separate function to save country translations
  const saveCountryTranslationsDirectly = async () => {
    console.log('🔍 DIRECT SAVE - Starting country translations save...')
    const currentCountry = selectedCountry
    const defaultCountry = generalCountry || 'DE'
    
    // Create complete translations including current form values
    const completeTranslations = { ...countryTranslations }
    // Save current form values to the ACTUALLY selected country
    completeTranslations[currentCountry] = {
      title: localTitle,
      description: localDescription,
      cover_image_url: localCoverDataUrl
    }
    
    console.log(`🔍 DIRECT SAVE - Saving form data to ACTIVE country ${currentCountry}`)

    console.log('🔍 DIRECT SAVE - Complete Translations:', completeTranslations)
    console.log('🔍 DIRECT SAVE - Current Country:', currentCountry)
    console.log('🔍 DIRECT SAVE - Countries to save:', Object.keys(completeTranslations))

    // Ensure default country is also included with base podcast data if not already present
    if (!completeTranslations[defaultCountry]) {
      completeTranslations[defaultCountry] = {
        title: podcast?.title || '',
        description: podcast?.description || '',
        cover_image_url: podcast?.cover_image_url || null
      }
      console.log(`🔍 DIRECT SAVE - Added missing default country ${defaultCountry}:`, completeTranslations[defaultCountry])
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
          console.error(`❌ DIRECT SAVE - Upload error for ${countryCode}:`, uploadError)
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
      
      console.log(`🔍 DIRECT SAVE - Saving ${countryCode} translation:`, translationData)
      
      const { data: upsertResult, error: countryError } = await supabase
        .from('podcast_country_translations')
        .upsert(translationData, { onConflict: 'podcast_id,country_code' } as any)
      
      if (countryError) {
        console.error(`❌ DIRECT SAVE - Save error for ${countryCode}:`, countryError)
        addToast({ type: 'error', message: `Failed to save ${countryCode} translation: ${countryError.message}` })
      } else {
        console.log(`✅ DIRECT SAVE - ${countryCode} translation saved:`, upsertResult)
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
        title: formData.title,
        description: formData.description,
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
                      let podcastUpdateData: any = { 
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
                  const defaultCountryBtn = generalCountry || 'DE'
                  const isDefaultSelected = selectedCountry === defaultCountryBtn
                  
                  return (
                    <div key={defaultCountryBtn} className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border ${isDefaultSelected ? 'bg-red-600 border-red-600 text-white' : 'bg-white border-gray-300'}`}>
                                              <button
                          onClick={() => {
                            console.log(`🔄 SWITCH DEBUG - Switching from ${selectedCountry} to ${defaultCountryBtn}`)
                            console.log(`🔄 SWITCH DEBUG - Current form values:`, { title: localTitle, description: localDescription })
                            
                            // Save current content to currently selected country before switching
                            const currentCountry = selectedCountry
                            
                            if (currentCountry !== defaultCountryBtn) {
                              console.log(`🔄 SWITCH DEBUG - Saving ${currentCountry} values before switch`)
                              setCountryTranslations(prev => ({
                                ...prev,
                                [currentCountry]: {
                                  title: localTitle,
                                  description: localDescription,
                                  cover_image_url: localCoverDataUrl
                                }
                              }))
                            }
                            
                            setSelectedCountry(defaultCountryBtn)
                            // Load default country content (check for country-specific data first, then base podcast data)
                            const defaultTranslation = countryTranslations[defaultCountryBtn]
                            console.log(`🔄 SWITCH DEBUG - Loading ${defaultCountryBtn} translation:`, defaultTranslation)
                            console.log(`🔄 SWITCH DEBUG - Available translations:`, countryTranslations)
                            setLocalTitle(defaultTranslation?.title || (podcast?.title ?? ''))
                            setLocalDescription(defaultTranslation?.description || (podcast?.description ?? ''))
                            setLocalCoverDataUrl(defaultTranslation?.cover_image_url || (podcast?.cover_image_url ?? null))
                          }}
                        type="button"
                        title={`${countryNameByCode(defaultCountryBtn)} (Default)`}
                        className={`focus:outline-none ${isDefaultSelected ? 'text-white' : 'text-red-600'}`}
                      >
                        {countryNameByCode(defaultCountryBtn)}
                      </button>
                      {/* No X button for default country */}
                    </div>
                  )
                })()}
                
                {/* Translation country bubbles (with X button) */}
                {Object.keys(countryTranslations)
                  .filter(code => {
                    // Filter out invalid/unknown countries and the default country
                    const defaultCountryFilter = generalCountry || 'DE'
                    return code && 
                           code !== defaultCountryFilter && 
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
                            console.log(`🔄 SWITCH DEBUG - Switching from ${selectedCountry} to ${code}`)
                            console.log(`🔄 SWITCH DEBUG - Current form values:`, { title: localTitle, description: localDescription })
                            
                            // Save current content to currently selected country before switching
                            const currentCountry = selectedCountry
                            const defaultCountryBtn2 = generalCountry || 'DE'
                            
                            if (currentCountry !== defaultCountryBtn2 && currentCountry !== code) {
                              console.log(`🔄 SWITCH DEBUG - Saving ${currentCountry} values before switch`)
                              setCountryTranslations(prev => ({
                                ...prev,
                                [currentCountry]: {
                                  title: localTitle,
                                  description: localDescription,
                                  cover_image_url: localCoverDataUrl
                                }
                              }))
                            }
                            
                            setSelectedCountry(code)
                            // Load translation content
                            const t = countryTranslations[code]
                            console.log(`🔄 SWITCH DEBUG - Loading ${code} translation:`, t)
                            console.log(`🔄 SWITCH DEBUG - Available translations:`, countryTranslations)
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
                              const defaultCountryDelete = generalCountry || 'DE'
                              setSelectedCountry(defaultCountryDelete)
                              // Load default country translation or fallback to base podcast data
                              const defaultTranslation = countryTranslations[defaultCountryDelete]
                              setLocalTitle(defaultTranslation?.title || (podcast?.title ?? ''))
                              setLocalDescription(defaultTranslation?.description || (podcast?.description ?? ''))
                              setLocalCoverDataUrl(defaultTranslation?.cover_image_url || (podcast?.cover_image_url ?? null))
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
                      const defaultCountryAdd = generalCountry || 'DE'
                      
                      // Don't allow adding the default country as a translation
                      if (newCountry === defaultCountryAdd) {
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
                      
                      // Save current content to the currently selected country before switching
                      const currentCountry = selectedCountry
                      const defaultCountrySwitch = generalCountry || 'DE'
                      
                      // Update current country data with current form values
                      if (currentCountry !== defaultCountrySwitch) {
                        setCountryTranslations(prev => ({
                          ...prev,
                          [currentCountry]: {
                            title: localTitle,
                            description: localDescription,
                            cover_image_url: localCoverDataUrl
                          }
                        }))
                      }
                      
                      // Add new country translation (start with default podcast values, not current form values)
                      const newCountryData = {
                        title: podcast?.title || '',
                        description: podcast?.description || '',
                        cover_image_url: podcast?.cover_image_url || null
                      }
                      
                      console.log(`🆕 NEW COUNTRY DEBUG - Adding ${newCountry} with data:`, newCountryData)
                      console.log(`🆕 NEW COUNTRY DEBUG - Current countryTranslations before add:`, countryTranslations)
                      
                      setCountryTranslations(prev => {
                        const updated = {
                          ...prev,
                          [newCountry]: newCountryData
                        }
                        console.log(`🆕 NEW COUNTRY DEBUG - Updated countryTranslations:`, updated)
                        return updated
                      })
                      
                      // Select the new country and load its content (default values)
                      setSelectedCountry(newCountry)
                      setLocalTitle(newCountryData.title)
                      setLocalDescription(newCountryData.description)
                      setLocalCoverDataUrl(newCountryData.cover_image_url)
                      
                      console.log(`🆕 NEW COUNTRY DEBUG - Switched to ${newCountry}, loaded values:`, {
                        title: newCountryData.title,
                        description: newCountryData.description,
                        cover: newCountryData.cover_image_url
                      })
                      
                      addToast({ type: 'success', message: `Added ${countryNameByCode(newCountry)} translation` })
                      
                      // Reset dropdown
                      e.target.value = ''
                    }}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Select country to add...</option>
                    {COUNTRIES
                      .filter(country => {
                        const defaultCountrySelect = generalCountry || 'DE'
                        return country.code !== defaultCountrySelect && !countryTranslations[country.code]
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