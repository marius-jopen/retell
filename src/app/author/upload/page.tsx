'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useToast } from '@/components/ui/toast'
import RSSImport from '@/components/rss/rss-import'
import EditPodcastForm from '@/components/forms/edit-podcast-form'

export default function AuthorUploadPage() {
  const [activeTab, setActiveTab] = useState<'manual' | 'rss'>('manual')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()
  const { addToast } = useToast()

  const handleRSSImportSuccess = (podcastId: string) => {
    // Redirect to the podcast's episodes page
    router.push(`/author/podcasts/${podcastId}/episodes`)
  }

  const handleCreatePodcast = async (formData: any, coverImage: File | null) => {
    setLoading(true)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('You must be logged in to create a podcast')
      }

      // Upload cover image if provided
      let coverImageUrl = null
      if (coverImage) {
        // TEMPORARY: Use base64 until storage bucket is set up
        const base64Url = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            const base64 = reader.result as string
            resolve(base64)
          }
          reader.onerror = () => reject(new Error('Failed to read file'))
          reader.readAsDataURL(coverImage)
        })
        coverImageUrl = base64Url
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
          rss_url: formData.rss_url?.trim() || null,
          author_id: user.id,
          status: 'draft',
          auto_publish_episodes: formData.auto_publish_episodes,
          cover_image_url: coverImageUrl
        })
        .select()
        .single()

      if (podcastError) {
        throw new Error('Failed to create podcast. Please try again.')
      }

      // Show success message
      addToast({
        type: 'success',
        message: `Successfully created podcast "${formData.title}"`
      })

      // Redirect to podcast management page
      router.push('/author/podcasts')
    } catch (error) {
      console.error('Error creating podcast:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                Create New Podcast
              </h1>
              <p className="text-gray-600">
                Upload manually or import from your existing RSS feed
              </p>
            </div>
            <Link href="/author/podcasts">
              <Button variant="outline" size="lg" rounded="full">
                Back to Podcasts
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
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Manual Upload
              </button>
              <button
                onClick={() => setActiveTab('rss')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'rss'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                RSS Import
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'manual' ? (
          <div>
            <EditPodcastForm
              podcast={{
                title: '',
                description: '',
                category: '',
                language: '',
                country: '',
                rss_url: '',
                auto_publish_episodes: true,
                status: 'draft'
              }}
              onSubmit={handleCreatePodcast}
              loading={loading}
              isAdmin={false}
              isCreating={true}
            />
          </div>
      ) : (
        <div>
          <RSSImport onImportSuccess={handleRSSImportSuccess} />
        </div>
      )}
      </div>
    </div>
  )
} 