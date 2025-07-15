'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useToast } from '@/components/ui/toast'

interface Podcast {
  id: string
  title: string
  author_id: string
  status: 'draft' | 'pending' | 'approved' | 'rejected'
}

export default function NewEpisodePage({ params }: { params: Promise<{ id: string }> }) {
  const [podcast, setPodcast] = useState<Podcast | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    episode_number: 1,
    season_number: 1,
    duration: ''
  })
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [scriptFile, setScriptFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fetchError, setFetchError] = useState('')
  const [podcastId, setPodcastId] = useState<string>('')
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
          setFetchError('You must be logged in to create an episode')
          return
        }

        // Get podcast and check permissions
        const { data: podcastData, error: podcastError } = await supabase
          .from('podcasts')
          .select('id, title, author_id, status')
          .eq('id', id)
          .eq('author_id', user.id)
          .single()

        if (podcastError) {
          setFetchError('Error fetching podcast or you don\'t have permission to add episodes')
          return
        }

        setPodcast(podcastData)

        // Get the next episode number
        const { data: episodes, error: episodeError } = await supabase
          .from('episodes')
          .select('episode_number')
          .eq('podcast_id', id)
          .order('episode_number', { ascending: false })
          .limit(1)

        if (!episodeError && episodes && episodes.length > 0) {
          setFormData(prev => ({ ...prev, episode_number: episodes[0].episode_number + 1 }))
        }
      } catch (error) {
        console.error('Error loading podcast:', error)
        setFetchError('Error loading podcast')
      }
    }

    fetchPodcast()
  }, [params, supabase])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be logged in to create an episode')
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
      if (!audioFile) {
        setError('Audio file is required')
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

      // Check if episode number already exists
      const { data: existingEpisode } = await supabase
        .from('episodes')
        .select('id')
        .eq('podcast_id', podcastId)
        .eq('episode_number', formData.episode_number)
        .eq('season_number', formData.season_number)
        .single()

      if (existingEpisode) {
        setError(`Episode ${formData.episode_number} already exists for season ${formData.season_number}`)
        return
      }

      // Upload files
      const audioUrl = await uploadFile(audioFile, 'podcast-audio', `${podcastId}/${audioFile.name}`)
      const scriptUrl = await uploadFile(scriptFile, 'podcast-scripts', `${podcastId}/${scriptFile.name}`)

      // Parse duration from string (mm:ss format)
      let durationInSeconds = null
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

      // Create episode
      const { error: createError } = await supabase
        .from('episodes')
        .insert({
          podcast_id: podcastId,
          title: formData.title.trim(),
          description: formData.description.trim(),
          episode_number: formData.episode_number,
          season_number: formData.season_number,
          duration: durationInSeconds,
          audio_url: audioUrl,
          script_url: scriptUrl
        })

      if (createError) {
        console.error('Error creating episode:', createError)
        setError('Failed to create episode. Please try again.')
        return
      }

      // Redirect to episodes page
      addToast({
        type: 'success',
        message: `Successfully created episode "${formData.title}"`
      })
      router.push(`/author/podcasts/${podcastId}/episodes`)
      router.refresh()
    } catch (error) {
      console.error('Error creating episode:', error)
      setError('Failed to create episode. Please try again.')
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
          <Link href="/author/podcasts">
            <Button variant="outline">Back to Podcasts</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!podcast) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">Loading podcast...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Episode</h1>
            <p className="mt-2 text-lg text-gray-600">
              Add a new episode to "{podcast.title}"
            </p>
          </div>
          <Link href={`/author/podcasts/${podcast.id}/episodes`}>
            <Button variant="outline">Cancel</Button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Episode Information</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Episode Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter episode title"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe this episode"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="episode_number" className="block text-sm font-medium text-gray-700 mb-2">
                Episode Number *
              </label>
              <input
                type="number"
                id="episode_number"
                value={formData.episode_number}
                onChange={(e) => setFormData({ ...formData, episode_number: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
                required
              />
            </div>

            <div>
              <label htmlFor="season_number" className="block text-sm font-medium text-gray-700 mb-2">
                Season Number *
              </label>
              <input
                type="number"
                id="season_number"
                value={formData.season_number}
                onChange={(e) => setFormData({ ...formData, season_number: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
                required
              />
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                Duration (MM:SS)
              </label>
              <input
                type="text"
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="15:30"
                pattern="[0-9]{1,2}:[0-9]{2}"
              />
            </div>
          </div>

          <div>
            <label htmlFor="audio_file" className="block text-sm font-medium text-gray-700 mb-2">
              Audio File *
            </label>
            <input
              type="file"
              id="audio_file"
              accept="audio/*"
              onChange={handleAudioFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              required
            />
            <p className="mt-2 text-sm text-gray-500">
              Upload your episode audio file (max 100MB)
            </p>
          </div>

          <div>
            <label htmlFor="script_file" className="block text-sm font-medium text-gray-700 mb-2">
              Script File (Optional)
            </label>
            <input
              type="file"
              id="script_file"
              accept=".txt,.pdf,.doc,.docx"
              onChange={handleScriptFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
            />
            <p className="mt-2 text-sm text-gray-500">
              Upload your episode script if available (TXT, PDF, DOC, DOCX - max 10MB)
            </p>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <Link href={`/author/podcasts/${podcast.id}/episodes`}>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Episode'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 