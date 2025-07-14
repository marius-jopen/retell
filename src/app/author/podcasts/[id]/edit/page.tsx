'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

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
}

export default function EditPodcastPage({ params }: { params: Promise<{ id: string }> }) {
  const [podcast, setPodcast] = useState<Podcast | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    language: '',
    country: '',
    rss_url: ''
  })
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fetchError, setFetchError] = useState('')
  const [podcastId, setPodcastId] = useState<string>('')
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()

  const categories = [
    'Business',
    'Technology',
    'Entertainment',
    'Education',
    'News',
    'Health',
    'Sports',
    'Music',
    'Comedy',
    'True Crime',
    'Science',
    'History',
    'Politics',
    'Arts',
    'Other'
  ]

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'other', name: 'Other' }
  ]

  const countries = [
    'United States',
    'Canada',
    'United Kingdom',
    'Australia',
    'Germany',
    'France',
    'Spain',
    'Italy',
    'Japan',
    'South Korea',
    'Brazil',
    'Mexico',
    'Argentina',
    'India',
    'China',
    'Russia',
    'Other'
  ]

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

        const { data, error } = await supabase
          .from('podcasts')
          .select('*')
          .eq('id', id)
          .eq('author_id', user.id)
          .single()

        if (error) {
          setFetchError('Error fetching podcast or you don\'t have permission to edit it')
          return
        }

        setPodcast(data)
        setFormData({
          title: data.title || '',
          description: data.description || '',
          category: data.category || '',
          language: data.language || '',
          country: data.country || '',
          rss_url: data.rss_url || ''
        })
      } catch (error) {
        console.error('Error loading podcast:', error)
        setFetchError('Error loading podcast')
      }
    }

    fetchPodcast()
  }, [params, supabase])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB')
        return
      }
      setCoverImage(file)
      setError('')
    }
  }

  const uploadCoverImage = async (file: File, _podcastId: string) => {
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
      console.error('Error converting image to base64:', error)
      setError('Failed to process image. Please try again.')
      return null
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
        setError('You must be logged in to update a podcast')
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
      if (!formData.category) {
        setError('Category is required')
        return
      }
      if (!formData.language) {
        setError('Language is required')
        return
      }
      if (!formData.country) {
        setError('Country is required')
        return
      }

      // Upload cover image if provided
      let coverImageUrl = podcast?.cover_image_url
      if (coverImage) {
        const imageUrl = await uploadCoverImage(coverImage, podcastId)
        if (imageUrl) {
          coverImageUrl = imageUrl
        }
      }

      // Update podcast
      const { error: updateError } = await supabase
        .from('podcasts')
        .update({
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category,
          language: formData.language,
          country: formData.country,
          rss_url: formData.rss_url.trim() || null,
          cover_image_url: coverImageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', podcastId)
        .eq('author_id', user.id)

      if (updateError) {
        console.error('Error updating podcast:', updateError)
        setError('Failed to update podcast. Please try again.')
        return
      }

      // Redirect to podcasts page
      router.push('/author/podcasts')
      router.refresh()
    } catch (error) {
      console.error('Error updating podcast:', error)
      setError('Failed to update podcast. Please try again.')
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
            <h1 className="text-3xl font-bold text-gray-900">Edit Podcast</h1>
            <p className="mt-2 text-lg text-gray-600">
              Update your podcast information
            </p>
          </div>
          <Link href="/author/podcasts">
            <Button variant="outline">Cancel</Button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Podcast Information</h2>
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
              Podcast Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your podcast title"
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
              placeholder="Describe your podcast"
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                Language *
              </label>
              <select
                id="language"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a language</option>
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                Country/Region *
              </label>
              <select
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a country</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="rss_url" className="block text-sm font-medium text-gray-700 mb-2">
              RSS Feed URL (Optional)
            </label>
            <input
              type="url"
              id="rss_url"
              value={formData.rss_url}
              onChange={(e) => setFormData({ ...formData, rss_url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://your-podcast-feed.com/rss"
            />
          </div>

          <div>
            <label htmlFor="cover_image" className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image
            </label>
            <div className="flex items-center space-x-4">
              {podcast.cover_image_url && (
                <img
                  src={podcast.cover_image_url}
                  alt="Current cover"
                  className="h-16 w-16 rounded-lg object-cover"
                />
              )}
              <input
                type="file"
                id="cover_image"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {podcast.cover_image_url ? 'Upload a new image to replace the current one' : 'Upload an image (max 5MB)'}
            </p>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <Link href="/author/podcasts">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Podcast'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 