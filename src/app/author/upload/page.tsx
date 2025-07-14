'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { requireRole } from '@/lib/auth'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface User {
  id: string
  profile: {
    role: string
    full_name: string
  }
}

export default function AuthorUploadPage() {
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
    'English',
    'German',
    'Spanish',
    'French',
    'Italian',
    'Portuguese',
    'Dutch',
    'Polish',
    'Russian',
    'Mandarin',
    'Japanese',
    'Korean',
    'Arabic',
    'Hindi',
    'Other'
  ]

  const countries = [
    'United States',
    'United Kingdom',
    'Germany',
    'France',
    'Spain',
    'Italy',
    'Netherlands',
    'Canada',
    'Australia',
    'Brazil',
    'Mexico',
    'India',
    'Japan',
    'South Korea',
    'Other'
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
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
          status: 'draft'
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
      router.push('/author/podcasts')
    } catch (error) {
      console.error('Error creating podcast:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Podcast</h1>
            <p className="mt-2 text-lg text-gray-600">
              Upload your podcast and make it available for licensing
            </p>
          </div>
          <Link href="/author/podcasts">
            <Button variant="outline">Back to Podcasts</Button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Podcast Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter your podcast title"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Describe your podcast, its theme, and what listeners can expect"
            />
          </div>

          {/* Category and Language */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                Language *
              </label>
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Select a language</option>
                {languages.map(language => (
                  <option key={language} value={language}>{language}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Country */}
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
              Country of Origin *
            </label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Select a country</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          {/* RSS URL */}
          <div>
            <label htmlFor="rss_url" className="block text-sm font-medium text-gray-700">
              RSS Feed URL (Optional)
            </label>
            <input
              type="url"
              id="rss_url"
              name="rss_url"
              value={formData.rss_url}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="https://example.com/podcast.rss"
            />
            <p className="mt-2 text-sm text-gray-500">
              If you have an existing RSS feed, we can import episode metadata
            </p>
          </div>

          {/* Cover Image */}
          <div>
            <label htmlFor="cover_image" className="block text-sm font-medium text-gray-700">
              Cover Image
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="cover_image" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>Upload a file</span>
                    <input
                      id="cover_image"
                      name="cover_image"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>
            </div>
            {coverImage && (
              <p className="mt-2 text-sm text-gray-500">
                Selected: {coverImage.name}
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <Link href="/author/podcasts">
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Podcast'}
            </Button>
          </div>
        </form>
      </div>

      {/* Help Text */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Next Steps</h3>
        <p className="text-blue-800 mb-4">
          After creating your podcast, you'll be able to:
        </p>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-start">
            <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-blue-400 mt-2 mr-3"></span>
            Upload individual episodes with audio files and scripts
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-blue-400 mt-2 mr-3"></span>
            Fill out the licensing questionnaire for each episode
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-blue-400 mt-2 mr-3"></span>
            Submit your content for admin approval
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-blue-400 mt-2 mr-3"></span>
            Once approved, your podcast will be available for licensing
          </li>
        </ul>
      </div>
    </div>
  )
} 