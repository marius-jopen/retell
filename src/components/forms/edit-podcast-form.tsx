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
  // Optional external control for country-specific fields
  countryTitle?: string
  countryDescription?: string
  countryCoverPreviewUrl?: string | null
  onCountryTitleChange?: (value: string) => void
  onCountryDescriptionChange?: (value: string) => void
  onCountryCoverFileChange?: (file: File) => void
}

export default function EditPodcastForm({
  podcast,
  isAdmin = false,
  workflowState,
  onSubmit,
  loading = false,
  error = '',
  isCreating = false,
  countryTitle,
  countryDescription,
  countryCoverPreviewUrl,
  onCountryTitleChange,
  onCountryDescriptionChange,
  onCountryCoverFileChange,
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

  // translations (title/description) for other languages; start with EN if different
  const [translations, setTranslations] = useState<Array<{ language_code: string; title: string; description: string }>>(
    podcast?.translations || []
  )

  // license countries (multi-select)
  const [licenseCountries, setLicenseCountries] = useState<string[]>(podcast?.license_countries || [])

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
      if (!file.type.startsWith('image/')) return
      if (file.size > 5 * 1024 * 1024) return
      setCoverImage(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const effectiveTitle = countryTitle ?? formData.title
    const effectiveDescription = countryDescription ?? formData.description
    await onSubmit({ ...formData, title: effectiveTitle, description: effectiveDescription, translations, license_countries: licenseCountries }, coverImage)
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
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* General Info moved to column 2 (admin panel) */}

          {/* Country-specific */}
          <div className="">
            {/* <h3 className="text-base font-semibold text-gray-900 mb-4">Country-specific</h3> */}
            <div className="space-y-6">
              <Input
                label="Podcast Title"
                id="title"
                value={countryTitle ?? formData.title}
                onChange={(e) => {
                  if (onCountryTitleChange) onCountryTitleChange(e.target.value)
                  else handleInputChange('title', e.target.value)
                }}
                required
                placeholder="Enter podcast title"
              />

              <TextArea
                label="Description"
                id="description"
                rows={6}
                value={countryDescription ?? formData.description}
                onChange={(e) => {
                  if (onCountryDescriptionChange) onCountryDescriptionChange(e.target.value)
                  else handleInputChange('description', e.target.value)
                }}
                required
                placeholder="Describe the podcast"
                className="min-h-[140px]"
              />

              <FileInput
                label="Cover Image (Optional)"
                id="cover_image"
                accept="image/*"
                onChange={(e) => {
                  const file = (e.target as HTMLInputElement).files?.[0]
                  if (file) {
                    if (onCountryCoverFileChange) onCountryCoverFileChange(file)
                    else handleImageChange(e as any)
                  }
                }}
                helperText="Upload a cover image for the podcast (max 5MB)"
              />
              {(countryCoverPreviewUrl || podcast?.cover_image_url) && (
                <div className="mt-2">
                  <div className="text-xs text-gray-500 mb-1">Current cover</div>
                  <img
                    src={(countryCoverPreviewUrl || podcast?.cover_image_url) as string}
                    alt="Current cover"
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Removed license countries and translations per request */}


        </form>
      </CardContent>
    </Card>
  )
} 