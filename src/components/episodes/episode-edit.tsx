'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input, TextArea } from '@/components/ui'
import Link from 'next/link'
import { useToast } from '@/components/ui/toast'
import AudioPlayer from '@/components/ui/audio-player'

interface Episode {
  id: string
  title: string
  description: string
  title_english: string | null
  description_english: string | null
  audio_url: string
  script_url: string
  duration: number | null
  episode_number: number
  season_number: number | null
  podcast_id: string
}

interface Podcast {
  id: string
  title: string
  author_id: string
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  cover_image_url: string | null
}

interface EpisodeEditProps {
  podcastId: string
  episodeId: string
  isAdmin?: boolean
  backUrl: string
  successRedirectUrl: string
}

export default function EpisodeEdit({ 
  podcastId, 
  episodeId, 
  isAdmin = false, 
  backUrl, 
  successRedirectUrl 
}: EpisodeEditProps) {
  const [podcast, setPodcast] = useState<Podcast | null>(null)
  const [episode, setEpisode] = useState<Episode | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    title_english: '',
    description_english: '',
    episode_number: 1,
    season_number: 1,
    duration: ''
  })
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [scriptFile, setScriptFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fetchError, setFetchError] = useState('')
  const [translatingTitle, setTranslatingTitle] = useState(false)
  const [translatingDescription, setTranslatingDescription] = useState(false)
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()
  const { addToast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setFetchError('You must be logged in to edit an episode')
          return
        }

        // Build podcast query based on role
        let podcastQuery = supabase
          .from('podcasts')
          .select('id, title, author_id, status, cover_image_url')
          .eq('id', podcastId)

        // If not admin, restrict to user's own podcasts
        if (!isAdmin) {
          podcastQuery = podcastQuery.eq('author_id', user.id)
        }

        const { data: podcastData, error: podcastError } = await podcastQuery.single()

        if (podcastError) {
          setFetchError(isAdmin 
            ? 'Error fetching podcast or podcast not found' 
            : 'Error fetching podcast or you don\'t have permission to edit episodes'
          )
          return
        }

        setPodcast(podcastData)

        // Get episode data
        const { data: episodeData, error: episodeError } = await supabase
          .from('episodes')
          .select('*')
          .eq('id', episodeId)
          .eq('podcast_id', podcastId)
          .single()

        if (episodeError) {
          setFetchError('Error fetching episode or episode not found')
          return
        }

        setEpisode(episodeData)
        
        // Format duration from seconds to MM:SS
        let durationString = ''
        if (episodeData.duration) {
          const minutes = Math.floor(episodeData.duration / 60)
          const seconds = episodeData.duration % 60
          durationString = `${minutes}:${seconds.toString().padStart(2, '0')}`
        }

        setFormData({
          title: episodeData.title || '',
          description: episodeData.description || '',
          title_english: episodeData.title_english || '',
          description_english: episodeData.description_english || '',
          episode_number: episodeData.episode_number || 1,
          season_number: episodeData.season_number || 1,
          duration: durationString
        })
      } catch (error) {
        console.error('Error loading data:', error)
        setFetchError('Error loading episode data')
      }
    }

    fetchData()
  }, [podcastId, episodeId, isAdmin, supabase])

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('audio/')) {
        setError('Please select a valid audio file')
        return
      }
      
      // Validate file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        setError('Audio file size must be less than 100MB')
        return
      }
      setAudioFile(file)
      setError('')
    }
  }

  const handleScriptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['text/plain', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a valid script file (TXT, PDF, DOC, DOCX)')
        return
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Script file size must be less than 10MB')
        return
      }
      setScriptFile(file)
      setError('')
    }
  }

  const uploadFile = async (file: File, bucket: string, path: string) => {
    // TEMPORARY: Use base64 until storage bucket is set up
    try {
      const base64Url = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const base64 = reader.result as string
          resolve(base64)
        }
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(file)
      })
      
      return base64Url
    } catch (error) {
      console.error('Error converting file to base64:', error)
      throw new Error('Failed to process file')
    }
  }

  const translateText = async (text: string, sourceLang: string = 'auto'): Promise<string | null> => {
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          sourceLang,
          targetLang: 'EN',
        }),
      })

      if (!response.ok) {
        let errorMessage = 'Translation failed'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.details || errorMessage
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      return data.translatedText || null
    } catch (error) {
      console.error('Translation error:', error)
      throw error
    }
  }

  const handleTranslateTitle = async () => {
    if (!formData.title.trim()) {
      addToast({
        type: 'error',
        message: 'Please enter a title to translate',
      })
      return
    }

    setTranslatingTitle(true)
    setError('')

    try {
      const translated = await translateText(formData.title)
      if (translated) {
        setFormData({ ...formData, title_english: translated })
        addToast({
          type: 'success',
          message: 'Title translated successfully',
        })
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to translate title')
      addToast({
        type: 'error',
        message: 'Failed to translate title. Please try again.',
      })
    } finally {
      setTranslatingTitle(false)
    }
  }

  const handleTranslateDescription = async () => {
    if (!formData.description.trim()) {
      addToast({
        type: 'error',
        message: 'Please enter a description to translate',
      })
      return
    }

    setTranslatingDescription(true)
    setError('')

    try {
      const translated = await translateText(formData.description)
      if (translated) {
        setFormData({ ...formData, description_english: translated })
        addToast({
          type: 'success',
          message: 'Description translated successfully',
        })
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to translate description')
      addToast({
        type: 'error',
        message: 'Failed to translate description. Please try again.',
      })
    } finally {
      setTranslatingDescription(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be logged in to update an episode')
        return
      }

      // Validate form
      if (!formData.title.trim()) {
        setError('Title is required')
        return
      }
      if (!formData.description.trim()) {
        setError('Description is required')
        return
      }
      if (formData.episode_number < 1) {
        setError('Episode number must be at least 1')
        return
      }
      if (formData.season_number < 1) {
        setError('Season number must be at least 1')
        return
      }

      // Check if episode number already exists (but not for this episode)
      const { data: existingEpisode } = await supabase
        .from('episodes')
        .select('id')
        .eq('podcast_id', podcastId)
        .eq('episode_number', formData.episode_number)
        .eq('season_number', formData.season_number)
        .neq('id', episodeId)
        .single()

      if (existingEpisode) {
        setError(`Episode ${formData.episode_number} already exists for season ${formData.season_number}`)
        return
      }

      // Upload new files if provided
      let audioUrl = episode?.audio_url || ''
      let scriptUrl = episode?.script_url || ''

      if (audioFile) {
        audioUrl = await uploadFile(audioFile, 'podcast-audio', `${podcastId}/${audioFile.name}`)
      }

      if (scriptFile) {
        scriptUrl = await uploadFile(scriptFile, 'podcast-scripts', `${podcastId}/${scriptFile.name}`)
      }
      
      // Ensure script_url is never null (database constraint requires NOT NULL)
      // Use empty string if no script is provided
      if (!scriptUrl) {
        scriptUrl = ''
      }
      
      // Ensure audio_url is never null (database constraint requires NOT NULL)
      // Use empty string if no audio is provided
      if (!audioUrl) {
        audioUrl = ''
      }

      // Parse duration from string (mm:ss format)
      let durationInSeconds = episode?.duration
      if (formData.duration) {
        const parts = formData.duration.split(':')
        if (parts.length === 2) {
          const minutes = parseInt(parts[0])
          const seconds = parseInt(parts[1])
          if (!isNaN(minutes) && !isNaN(seconds)) {
            durationInSeconds = minutes * 60 + seconds
          }
        }
      }

      // Prepare update data
      const updateData: any = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        episode_number: formData.episode_number,
        season_number: formData.season_number,
        duration: durationInSeconds,
        audio_url: audioUrl,
        script_url: scriptUrl,
        updated_at: new Date().toISOString()
      }

      // Only include translation fields if they have values (to avoid errors if columns don't exist)
      if (formData.title_english && formData.title_english.trim()) {
        updateData.title_english = formData.title_english.trim()
      } else if (formData.title_english === '') {
        updateData.title_english = null
      }

      if (formData.description_english && formData.description_english.trim()) {
        updateData.description_english = formData.description_english.trim()
      } else if (formData.description_english === '') {
        updateData.description_english = null
      }

      // Update episode
      const { data: updatedData, error: updateError } = await supabase
        .from('episodes')
        .update(updateData)
        .eq('id', episodeId)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating episode:', {
          error: updateError,
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          code: updateError.code,
          updateData
        })
        const errorMsg = updateError.message || updateError.details || updateError.hint || 'Failed to update episode. Please try again.'
        setError(errorMsg)
        addToast({
          type: 'error',
          message: errorMsg
        })
        return
      }

      if (!updatedData) {
        setError('Update completed but no data returned')
        return
      }

      // Redirect to episodes page
      addToast({
        type: 'success',
        message: `Successfully updated episode "${formData.title}"`
      })
      router.push(successRedirectUrl)
      router.refresh()
    } catch (error) {
      console.error('Error updating episode:', {
        error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
      setError(error instanceof Error ? error.message : 'Failed to update episode. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (fetchError) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{fetchError}</div>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <Link href={backUrl}>
            <Button variant="outline">Back to Podcasts</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!podcast || !episode) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <p className="mt-2 text-sm text-gray-600">Loading episode...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Podcast Cover Image */}
            <div className="flex-shrink-0">
              {podcast.cover_image_url ? (
                <img
                  src={podcast.cover_image_url}
                  alt={podcast.title}
                  className="w-16 h-16 rounded-2xl object-cover shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-lg">
                    {podcast.title.substring(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            
            {/* Title and Description */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isAdmin ? 'Admin Edit' : 'Edit'} {podcast.title}
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                Update episode "{episode?.title}"
              </p>
            </div>
          </div>
          <Link href={backUrl}>
            <Button variant="outline">Cancel</Button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Episode Information</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6" noValidate>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}

          {/* Title Fields - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Input
              label="Episode Title*"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter episode title"
              required
            />

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="title_english" className="block text-sm font-medium text-gray-700">
                  Episode Title (English)
                </label>
                <button
                  type="button"
                  onClick={handleTranslateTitle}
                  disabled={translatingTitle || !formData.title.trim()}
                  className="text-xs px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded border border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                >
                  {translatingTitle ? (
                    <>
                      <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Translating...
                    </>
                  ) : (
                    <>
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                      </svg>
                      Translate
                    </>
                  )}
                </button>
              </div>
              <Input
                id="title_english"
                value={formData.title_english}
                onChange={(e) => setFormData({ ...formData, title_english: e.target.value })}
                placeholder="Enter English title (optional)"
              />
            </div>
          </div>

          {/* Description Fields - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TextArea
              label="Description*"
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="Describe this episode"
              required
            />

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="description_english" className="block text-sm font-medium text-gray-700">
                  Description (English)
                </label>
                <button
                  type="button"
                  onClick={handleTranslateDescription}
                  disabled={translatingDescription || !formData.description.trim()}
                  className="text-xs px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded border border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                >
                  {translatingDescription ? (
                    <>
                      <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Translating...
                    </>
                  ) : (
                    <>
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                      </svg>
                      Translate
                    </>
                  )}
                </button>
              </div>
              <TextArea
                id="description_english"
                value={formData.description_english}
                onChange={(e) => setFormData({ ...formData, description_english: e.target.value })}
                rows={4}
                placeholder="Enter English description (optional)"
              />
            </div>
          </div>

          {/* Helper Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Translation fields:</strong> The English fields are optional. If provided, they will be used when displaying episodes to English-speaking audiences. If not provided, the original title and description will be used.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Episode Number"
              type="number"
              id="episode_number"
              value={formData.episode_number}
              onChange={(e) => setFormData({ ...formData, episode_number: parseInt(e.target.value) || 1 })}
              min="1"
              required
            />

            <Input
              label="Season Number"
              type="number"
              id="season_number"
              value={formData.season_number}
              onChange={(e) => setFormData({ ...formData, season_number: parseInt(e.target.value) || 1 })}
              min="1"
              required
            />

            <Input
              label="Duration (MM:SS)"
              id="duration"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="15:30"
              pattern="[0-9]{1,2}:[0-9]{2}"
            />
          </div>

          <div>
            <label htmlFor="audio_file" className="block text-sm font-medium text-gray-700 mb-2">
              Audio File
            </label>
            
                          {episode.audio_url ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          {episode.audio_url.includes('http') ? 'MP3 file from RSS feed already available' : 'Audio file already uploaded'}
                        </p>
                        <p className="text-xs text-green-600">
                          {episode.audio_url.includes('http') ? 'This episode uses the audio from your RSS feed' : 'Custom audio file is being used'}
                        </p>
                      </div>
                    </div>
                    {episode.audio_url.includes('http') && (
                      <a
                        href={episode.audio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-800 underline text-sm"
                      >
                        Listen
                      </a>
                    )}
                  </div>

                  {/* Audio Player */}
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-3">Current Audio</p>
                    <AudioPlayer 
                      src={episode.audio_url}
                    />
                  </div>
                  
                  <div className="border-t pt-3">
                  <input
                    type="file"
                    id="audio_file"
                    accept="audio/*"
                    onChange={handleAudioFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Optional: Upload a new audio file to replace the existing one (max 100MB)
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  id="audio_file"
                  accept="audio/*"
                  onChange={handleAudioFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                  required
                />
                <p className="mt-2 text-sm text-gray-500">
                  Upload an audio file for this episode (max 100MB)
                </p>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="script_file" className="block text-sm font-medium text-gray-700 mb-2">
              Script File (Optional)
            </label>
            
            {episode.script_url ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        Script file already uploaded
                      </p>
                      <p className="text-xs text-blue-600">
                        A script file is currently attached to this episode
                      </p>
                    </div>
                  </div>
                  {episode.script_url.includes('http') && (
                    <a
                      href={episode.script_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline text-sm"
                    >
                      View
                    </a>
                  )}
                </div>
                
                <div className="border-t pt-3">
                  <input
                    type="file"
                    id="script_file"
                    accept=".txt,.pdf,.doc,.docx"
                    onChange={handleScriptFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Optional: Upload a new script file to replace the existing one (TXT, PDF, DOC, DOCX - max 10MB)
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  id="script_file"
                  accept=".txt,.pdf,.doc,.docx"
                  onChange={handleScriptFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Optional: Upload a script file for this episode (TXT, PDF, DOC, DOCX - max 10MB)
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <Link href={backUrl}>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
              {loading ? 'Updating...' : 'Update Episode'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 