'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input, TextArea } from '@/components/ui'
import Link from 'next/link'
import { useToast } from '@/components/ui/toast'

interface Podcast {
  id: string
  title: string
  author_id: string
  status: 'draft' | 'pending' | 'approved' | 'rejected'
}

export default function NewEpisodePage({ params }: { params: { id: string } }) {
  const [podcast, setPodcast] = useState<Podcast | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    episode_number: 1,
    season_number: 1,
    duration: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fetchError, setFetchError] = useState('')
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()
  const { addToast } = useToast()

  useEffect(() => {
    const fetchPodcast = async () => {
      try {
        const { id } = params

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setFetchError('You must be logged in to create an episode')
          return
        }

        const { data: podcastData, error: podcastError } = await supabase
          .from('podcasts')
          .select('*')
          .eq('id', id)
          .single()

        if (podcastError || !podcastData) {
          setFetchError('Podcast not found')
          return
        }

        if (podcastData.author_id !== user.id) {
          setFetchError('You do not have permission to add episodes to this podcast')
          return
        }

        setPodcast(podcastData)
      } catch (err) {
        console.error('Error fetching podcast:', err)
        setFetchError('Failed to load podcast')
      }
    }

    fetchPodcast()
  }, [params, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!podcast) return

    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be logged in')
        setLoading(false)
        return
      }

      // Create episode record
      const { data: episode, error: episodeError } = await supabase
        .from('episodes')
        .insert({
          podcast_id: podcast.id,
          title: formData.title,
          description: formData.description,
          episode_number: formData.episode_number,
          season_number: formData.season_number,
          duration: formData.duration,
          status: 'draft'
        })
        .select()
        .single()

      if (episodeError) {
        setError('Failed to create episode')
        setLoading(false)
        return
      }

      addToast({ type: 'success', message: 'Episode created successfully!' })
      router.push(`/author/podcasts/${podcast.id}/episodes`)
    } catch (err) {
      console.error('Error creating episode:', err)
      setError('Failed to create episode')
    } finally {
      setLoading(false)
    }
  }

  if (fetchError) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="text-6xl mb-6">❌</div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-3">Error</h1>
          <p className="text-gray-600 mb-8">{fetchError}</p>
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
        <h1 className="text-3xl font-bold text-gray-900">Create New Episode</h1>
        <p className="mt-2 text-lg text-gray-600">
          Add a new episode to "{podcast.title}"
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div>
          <Input
            label="Episode Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder="Enter episode title"
          />
        </div>

        <div>
          <TextArea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            placeholder="Enter episode description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              label="Episode Number"
              type="number"
              value={formData.episode_number}
              onChange={(e) => setFormData({ ...formData, episode_number: parseInt(e.target.value) })}
              required
              min="1"
            />
          </div>
          <div>
            <Input
              label="Season Number"
              type="number"
              value={formData.season_number}
              onChange={(e) => setFormData({ ...formData, season_number: parseInt(e.target.value) })}
              required
              min="1"
            />
          </div>
        </div>

        <div>
          <Input
            label="Duration"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            placeholder="e.g., 45:30"
          />
        </div>

        <div className="flex justify-end space-x-4">
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
  )
} 