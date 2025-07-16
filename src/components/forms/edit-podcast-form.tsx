'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, Select, TextArea, FileInput } from '@/components/ui'

interface EditPodcastFormProps {
  podcast: any
  isAdmin?: boolean
  workflowState?: any
  onSubmit: (formData: any, coverImage: File | null) => Promise<void>
  loading?: boolean
  error?: string
  isCreating?: boolean
}

export default function EditPodcastForm({
  podcast,
  isAdmin = false,
  workflowState,
  onSubmit,
  loading = false,
  error = '',
  isCreating = false
}: EditPodcastFormProps) {
  const [formData, setFormData] = useState({
    title: podcast?.title || '',
    description: podcast?.description || '',
    category: podcast?.category || '',
    language: podcast?.language || '',
    country: podcast?.country || '',
    status: podcast?.status || '',
    rss_url: podcast?.rss_url || '',
    auto_publish_episodes: podcast?.auto_publish_episodes || false
  })

  const [coverImage, setCoverImage] = useState<File | null>(null)

  const categories = [
    'Business', 'Technology', 'Entertainment', 'Education', 'News',
    'Health', 'Sports', 'Music', 'Comedy', 'True Crime', 'Science',
    'History', 'Politics', 'Arts', 'Other'
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
    'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany',
    'France', 'Spain', 'Italy', 'Netherlands', 'Japan', 'South Korea',
    'Brazil', 'Mexico', 'Argentina', 'India', 'China', 'Russia', 'Other'
  ]

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return
      }
      setCoverImage(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData, coverImage)
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-6 border-b border-gray-100">
        <CardTitle className="text-xl font-semibold text-gray-900">
          {isCreating ? 'Create New Podcast' : 'Podcast Details'}
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          {isCreating 
            ? 'Fill in the details below to create your podcast'
            : (isAdmin ? 'Administrative podcast editing and content management' : 'Update your podcast information and settings')
          }
        </p>
        
        {/* Workflow Status Indicator */}
        {workflowState && !isAdmin && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Current Mode: 
                </span>
                <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                  workflowState.mode === 'manual' 
                    ? 'bg-blue-100 text-blue-800'
                    : workflowState.mode === 'rss'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {workflowState.mode.toUpperCase()}
                </span>
              </div>
            </div>
            {workflowState.mode === 'hybrid' && (
              <p className="text-xs text-gray-500 mt-2">
                Some fields may be automatically synced from RSS feed
              </p>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <Input
              label="Podcast Title"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
              placeholder="Enter podcast title"
            />
            {workflowState?.manual_overrides?.title && (
              <span className="ml-2 text-xs text-purple-600">(Manual Override)</span>
            )}
          </div>

          {/* Description */}
          <div>
            <TextArea
              label="Description"
              id="description"
              rows={6}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
              placeholder="Describe the podcast"
              className="min-h-[140px]"
            />
            {workflowState?.manual_overrides?.description && (
              <span className="ml-2 text-xs text-purple-600">(Manual Override)</span>
            )}
          </div>

          {/* Status (Admin only) */}
          {isAdmin && (
            <Select
              label="Status"
              id="status"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              required
              placeholder="Select status"
            >
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </Select>
          )}

          {/* Category */}
          <div>
            <Select
              label="Category"
              id="category"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              required
              placeholder="Select a category"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </Select>
            {workflowState?.manual_overrides?.category && (
              <span className="ml-2 text-xs text-purple-600">(Manual Override)</span>
            )}
          </div>

          {/* Language */}
          <div>
            <Select
              label="Language"
              id="language"
              value={formData.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
              required
              placeholder="Select a language"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </Select>
            {workflowState?.manual_overrides?.language && (
              <span className="ml-2 text-xs text-purple-600">(Manual Override)</span>
            )}
          </div>

          {/* Country */}
          <div>
            <Select
              label="Country"
              id="country"
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              required
              placeholder="Select a country"
            >
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </Select>
            {workflowState?.manual_overrides?.country && (
              <span className="ml-2 text-xs text-purple-600">(Manual Override)</span>
            )}
          </div>

          {/* Cover Image */}
          <div>
            <FileInput
              label="Cover Image (Optional)"
              id="cover_image"
              accept="image/*"
              onChange={handleImageChange}
              helperText="Upload a cover image for the podcast (max 5MB)"
            />
            {workflowState?.manual_overrides?.cover_image && (
              <span className="ml-2 text-xs text-purple-600">(Manual Override)</span>
            )}
            {podcast?.cover_image_url && (
              <div className="mt-4">
                <img
                  src={podcast.cover_image_url}
                  alt="Current cover"
                  className="w-24 h-24 object-cover rounded-xl border border-gray-200"
                />
              </div>
            )}
          </div>

          {/* RSS Settings */}
          <Input
            label="RSS Feed URL (Optional)"
            type="url"
            id="rss_url"
            value={formData.rss_url}
            onChange={(e) => handleInputChange('rss_url', e.target.value)}
            placeholder="https://podcast-feed.com/rss"
          />

          <div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="auto_publish_episodes"
                checked={formData.auto_publish_episodes}
                onChange={(e) => handleInputChange('auto_publish_episodes', e.target.checked)}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="auto_publish_episodes" className="text-sm text-gray-700">
                Automatically publish new episodes from RSS feed
              </label>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              When enabled (default), new episodes from RSS feeds are automatically published. When disabled, they need approval.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              size="lg"
              rounded="full"
              className="font-semibold"
            >
              {loading 
                ? (isCreating ? 'Creating...' : 'Saving...') 
                : (isCreating ? 'Create Podcast' : 'Save Changes')
              }
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 