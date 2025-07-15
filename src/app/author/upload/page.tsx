'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { requireRole } from '@/lib/auth'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useToast } from '@/components/ui/toast'
import RSSImport from '@/components/rss/rss-import'

interface User {
  id: string
  profile: {
    role: string
    full_name: string
  }
}

export default function AuthorUploadPage() {
  const [activeTab, setActiveTab] = useState<'manual' | 'rss'>('manual')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    language: '',
    country: '',
    rss_url: '',
    auto_publish_episodes: true // Default to true (checked)
  })
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()
  const { addToast } = useToast()

  const handleRSSImportSuccess = (podcastId: string) => {
    // Redirect to the podcast's episodes page
    router.push(`/author/podcasts/${podcastId}/episodes`)
  }

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
    { code: 'nl', name: 'Dutch' },
    { code: 'pl', name: 'Polish' },
    { code: 'ru', name: 'Russian' },
    { code: 'zh', name: 'Chinese (Mandarin)' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
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
    'Netherlands',
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const uploadCoverImage = async (file: File, podcastId: string) => {
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
    
    // PRODUCTION: Uncomment this code after running setup-storage-buckets.sql
    /*
    const fileExt = file.name.split('.').pop()
    const fileName = `${podcastId}/cover.${fileExt}`
    
    try {
      const { data, error } = await supabase.storage
        .from('podcast-covers')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })
      
      if (error) {
        console.error('Error uploading cover image:', error)
        return null
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('podcast-covers')
        .getPublicUrl(fileName)
      
      return urlData.publicUrl
    } catch (error) {
      console.error('Unexpected error uploading cover image:', error)
      setError('Failed to upload cover image. Please try again.')
      return null
    }
    */
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be logged in to create a podcast')
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

      // Create podcast
      const { data: podcast, error: podcastError } = await supabase
        .from('podcasts')
        .insert({
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category,
          language: formData.language,
          country: formData.country,
          rss_url: formData.rss_url.trim() || null,
          author_id: user.id,
          status: 'draft',
          auto_publish_episodes: formData.auto_publish_episodes
        })
        .select()
        .single()

      if (podcastError) {
        console.error('Error creating podcast:', podcastError)
        setError('Failed to create podcast. Please try again.')
        return
      }

      // Upload cover image if provided
      let coverImageUrl = null
      if (coverImage && podcast) {
        coverImageUrl = await uploadCoverImage(coverImage, podcast.id)
        
        if (coverImageUrl) {
          // Update podcast with cover image URL
          const { error: updateError } = await supabase
            .from('podcasts')
            .update({ cover_image_url: coverImageUrl })
            .eq('id', podcast.id)
          
          if (updateError) {
            console.error('Error updating cover image:', updateError)
            // Continue anyway, the podcast was created successfully
          }
        }
      }

      // Redirect to podcast management page
      addToast({
        type: 'success',
        message: `Successfully created podcast "${formData.title}"`
      })
      router.push('/author/podcasts')
      router.refresh()
    } catch (error) {
      console.error('Error creating podcast:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              🎙️ Create New Podcast ✨
            </h1>
            <p className="text-lg text-gray-600">
              Upload manually or import from your existing RSS feed! 🚀
            </p>
          </div>
          <Link href="/author/podcasts">
            <Button variant="outline">
              ← Back to Podcasts
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('manual')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'manual'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📝 Manual Upload
            </button>
            <button
              onClick={() => setActiveTab('rss')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'rss'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📡 RSS Import
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'manual' ? (
        <div className="bg-white rounded-3xl shadow-lg border border-gray-200">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              📝 Manual Podcast Upload
            </h2>
            <p className="text-gray-600 mb-6">
              Fill in the details below to create your podcast manually. Perfect for new podcasts! ✨
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Podcast Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter your amazing podcast title"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Tell us about your podcast - what makes it special?"
                />
              </div>

              {/* Category and Language */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                    Language *
                  </label>
                  <select
                    id="language"
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Select a language</option>
                    {languages.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Country */}
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                  Country of Origin *
                </label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select a country</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              {/* RSS URL */}
              <div>
                <label htmlFor="rss_url" className="block text-sm font-medium text-gray-700 mb-2">
                  RSS Feed URL (Optional)
                </label>
                <input
                  type="url"
                  id="rss_url"
                  name="rss_url"
                  value={formData.rss_url}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="https://example.com/podcast.rss"
                />
                <p className="mt-2 text-sm text-gray-500">
                  💡 Add your RSS feed URL to automatically sync episodes later
                </p>
              </div>

              {/* Auto-publish Episodes */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="auto_publish_episodes"
                  name="auto_publish_episodes"
                  checked={formData.auto_publish_episodes}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="auto_publish_episodes" className="text-sm text-gray-700">
                  Auto-publish RSS episodes immediately
                </label>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                ✨ When enabled (default), new episodes from RSS feeds are automatically published. When disabled, they need your manual approval.
              </p>

              {/* Cover Image */}
              <div>
                <label htmlFor="cover_image" className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Image
                </label>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="cover_image"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG or GIF (max 5MB)</p>
                    </div>
                                         <input
                       id="cover_image"
                       type="file"
                       accept="image/*"
                       onChange={handleFileChange}
                       className="hidden"
                     />
                  </label>
                </div>
                {coverImage && (
                  <div className="mt-4 flex items-center space-x-2">
                    <span className="text-sm text-gray-600">📎 {coverImage.name}</span>
                    <button
                      type="button"
                      onClick={() => setCoverImage(null)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                  <div className="flex items-center">
                    <span className="text-red-600 mr-2">⚠️</span>
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Link href="/author/podcasts">
                  <Button variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105"
                >
                  {loading ? '🚀 Creating...' : '🚀 Create Podcast'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div>
          <RSSImport onImportSuccess={handleRSSImportSuccess} />
        </div>
      )}
    </div>
  )
} 