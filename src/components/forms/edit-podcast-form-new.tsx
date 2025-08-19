'use client'

import React, { useState, useEffect } from 'react'
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
  // Callback to expose form data to parent (hosts moved to HostsManager)
  onFormDataChange?: (formData: any, coverImage: File | null) => void
}

export default function EditPodcastForm({
  podcast,
  isAdmin = false,
  workflowState,
  onSubmit,
  loading = false,
  error,
  isCreating = false,
  countryTitle,
  countryDescription,
  countryCoverPreviewUrl,
  onCountryTitleChange,
  onCountryDescriptionChange,
  onCountryCoverFileChange,
  onFormDataChange,
}: EditPodcastFormProps) {
  const [formData, setFormData] = useState({
    title: podcast?.title || '',
    description: podcast?.description || '',
    category: podcast?.category || '',
    language: podcast?.language || 'en',
    country: podcast?.country || 'DE',
    status: podcast?.status || 'draft',
    rss_url: podcast?.rss_url || '',
    auto_publish_episodes: podcast?.auto_publish_episodes ?? false,
  })

  // translation management
  const [translations, setTranslations] = useState<Array<{ language_code: string; title: string; description: string }>>(podcast?.translations || [])

  // license countries (multi-select)
  const [licenseCountries, setLicenseCountries] = useState<string[]>(podcast?.license_countries || [])

  const [coverImage, setCoverImage] = useState<File | null>(null)

  // Host management moved to HostsManager component

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
    { code: 'nl', name: 'Dutch' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'pl', name: 'Polish' },
    { code: 'sv', name: 'Swedish' },
    { code: 'da', name: 'Danish' },
    { code: 'no', name: 'Norwegian' },
    { code: 'fi', name: 'Finnish' },
    { code: 'ru', name: 'Russian' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'other', name: 'Other' }
  ]

  const countries = [
    { code: 'DE', name: 'Germany' },
    { code: 'AT', name: 'Austria' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'FR', name: 'France' },
    { code: 'ES', name: 'Spain' },
    { code: 'IT', name: 'Italy' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'BE', name: 'Belgium' },
    { code: 'SE', name: 'Sweden' },
    { code: 'DK', name: 'Denmark' },
    { code: 'NO', name: 'Norway' },
    { code: 'FI', name: 'Finland' },
    { code: 'PL', name: 'Poland' },
    { code: 'CZ', name: 'Czech Republic' },
    { code: 'AU', name: 'Australia' },
    { code: 'CA', name: 'Canada' },
    { code: 'NZ', name: 'New Zealand' },
    { code: 'JP', name: 'Japan' },
    { code: 'KR', name: 'South Korea' },
    { code: 'CN', name: 'China' },
    { code: 'IN', name: 'India' },
    { code: 'BR', name: 'Brazil' },
    { code: 'MX', name: 'Mexico' },
    { code: 'AR', name: 'Argentina' },
    { code: 'CL', name: 'Chile' },
    { code: 'CO', name: 'Colombia' },
    { code: 'PE', name: 'Peru' },
    { code: 'VE', name: 'Venezuela' },
    { code: 'UY', name: 'Uruguay' },
    { code: 'EC', name: 'Ecuador' },
    { code: 'BO', name: 'Bolivia' },
    { code: 'PY', name: 'Paraguay' },
    { code: 'SR', name: 'Suriname' },
    { code: 'GY', name: 'Guyana' },
    { code: 'FK', name: 'Falkland Islands' },
    { code: 'GF', name: 'French Guiana' },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    onSubmit(formData, coverImage)
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
  }

  // Notify parent component when form data changes (hosts moved to HostsManager)
  useEffect(() => {
    if (onFormDataChange) {
      const effectiveTitle = countryTitle ?? formData.title
      const effectiveDescription = countryDescription ?? formData.description
      onFormDataChange(
        { ...formData, title: effectiveTitle, description: effectiveDescription, translations, license_countries: licenseCountries },
        coverImage
      )
    }
  }, [formData, translations, licenseCountries, coverImage, countryTitle, countryDescription, onFormDataChange])

  return (
    <>
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

            {/* Country-specific Podcast Details */}
            <div className="space-y-8">
              {/* Basic Details */}
              <div className="space-y-6">
                <Input
                  label="Podcast Title*"
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
                  label="Description*"
                  id="description"
                  value={countryDescription ?? formData.description}
                  onChange={(e) => {
                    if (onCountryDescriptionChange) onCountryDescriptionChange(e.target.value)
                    else handleInputChange('description', e.target.value)
                  }}
                  required
                  placeholder="Describe your podcast"
                />

                <FileInput
                  label="Cover Image (Optional)"
                  id="cover_image"
                  accept="image/*"
                  helperText="Upload a cover image for the podcast (max 5MB)"
                  onChange={(e) => {
                    const file = (e.target as HTMLInputElement).files?.[0]
                    if (file) {
                      if (onCountryCoverFileChange) {
                        onCountryCoverFileChange(file)
                      } else {
                        setCoverImage(file)
                      }
                    }
                  }}
                />

                {/* Cover Image Preview */}
                {(countryCoverPreviewUrl || (podcast?.cover_image_url)) && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">Current cover</div>
                    <img
                      src={countryCoverPreviewUrl || podcast?.cover_image_url}
                      alt="Cover preview"
                      className="w-32 h-32 object-cover rounded-lg shadow-sm border border-gray-200"
                    />
                  </div>
                )}
              </div>

              {/* File Uploads */}
              <div className="space-y-6">
                <h3 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2">File Uploads</h3>
                
                <FileInput
                  label="Script"
                  id="script"
                  accept=".pdf,.doc,.docx,.txt"
                  helperText="Upload script file (PDF, DOC, DOCX, TXT)"
                />

                <FileInput
                  label="Audio Tracks"
                  id="audio_tracks"
                  accept="audio/*"
                  multiple
                  helperText="Upload audio tracks (MP3, WAV, etc.)"
                />

                <FileInput
                  label="Music"
                  id="music"
                  accept="audio/*"
                  multiple
                  helperText="Upload music files (MP3, WAV, etc.)"
                />
              </div>

              {/* Hosts section moved to right column (HostsManager component) in podcast-edit-content.tsx */}
            </div>

            {/* Removed license countries and translations per request */}

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Licensing Information - NOT affected by country translations */}
      <Card className="overflow-hidden mt-6">
        <CardHeader className="p-6 border-b border-gray-100">
          <CardTitle className="text-xl font-semibold text-gray-900">
            License Agreement
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            This information applies to all countries and is not affected by translations
          </p>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          {/* Machart des Podcasts */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              Machart des Podcasts* <span className="text-sm font-normal text-gray-600">(Podcast Format)</span>
            </h3>
            <div className="space-y-3">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input type="radio" name="format" className="mt-1 h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500" />
                <div>
                  <span className="text-sm font-medium text-gray-900">Always on</span>
                  <p className="text-xs text-gray-600">This podcast is produced continuously without breaks</p>
                </div>
              </label>
              <label className="flex items-start space-x-3 cursor-pointer">
                <input type="radio" name="format" className="mt-1 h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500" />
                <div>
                  <span className="text-sm font-medium text-gray-900">Series</span>
                  <p className="text-xs text-gray-600">This podcast is produced in seasonal series</p>
                </div>
              </label>
            </div>
          </div>

          {/* License Time / Copyright */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              License Time / Copyright* <span className="text-sm font-normal text-gray-600">🕐</span>
            </h3>
            <div className="space-y-3">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input type="radio" name="copyright" className="mt-1 h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500" />
                <div>
                  <span className="text-sm font-medium text-gray-900">Lifetime of copyright</span>
                  <p className="text-xs text-gray-600">Copyright lasts for the lifetime of the creator plus 70 years</p>
                </div>
              </label>
              <label className="flex items-start space-x-3 cursor-pointer">
                <input type="radio" name="copyright" className="mt-1 h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500" />
                <div>
                  <span className="text-sm font-medium text-gray-900">5 years of copyright</span>
                  <p className="text-xs text-gray-600">Copyright lasts for a specific number of years</p>
                </div>
              </label>
            </div>
          </div>

          {/* Territory */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              Territory* <span className="text-sm font-normal text-gray-600">🌍</span>
            </h3>
            <div className="space-y-3">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input type="radio" name="territory" className="mt-1 h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500" />
                <div>
                  <span className="text-sm font-medium text-gray-900">All Countries</span>
                  <p className="text-xs text-gray-600">License applies worldwide</p>
                </div>
              </label>
              <label className="flex items-start space-x-3 cursor-pointer">
                <input type="radio" name="territory" className="mt-1 h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500" />
                <div>
                  <span className="text-sm font-medium text-gray-900">All countries except:</span>
                  <Input
                    id="excluded_countries"
                    placeholder="Enter excluded countries (comma-separated)"
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-600 mt-1">These countries will be marked differently on the frontend map</p>
                </div>
              </label>
            </div>
          </div>

          {/* The Numbers */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              The Numbers* <span className="text-sm font-normal text-gray-600">(Demographics)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Total Listeners (from launch)"
                  id="total_listeners"
                  type="number"
                  placeholder="150000"
                  helperText="Total listeners across all episodes"
                />
              </div>
              <div>
                <Input
                  label="Listeners per Episode"
                  id="listeners_per_episode"
                  type="number"
                  placeholder="5000"
                  helperText="Average listeners per episode"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Gender Distribution</h4>
              <div className="grid grid-cols-3 gap-4">
                <Input label="Male %" id="male_percent" type="number" placeholder="45" />
                <Input label="Female %" id="female_percent" type="number" placeholder="52" />
                <Input label="Diverse %" id="diverse_percent" type="number" placeholder="3" />
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Age Distribution</h4>
              <div className="grid grid-cols-2 gap-4">
                <Input label="18-27 years %" id="age_18_27" type="number" placeholder="25" />
                <Input label="27-34 years %" id="age_27_34" type="number" placeholder="35" />
                <Input label="35-45 years %" id="age_35_45" type="number" placeholder="25" />
                <Input label="45+ years %" id="age_45_plus" type="number" placeholder="15" />
              </div>
            </div>
          </div>

          {/* Rights Management */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              Who currently has the rights to podcast/content?
            </h3>
            <p className="text-xs text-gray-600 mb-4">This information is only visible in the admin area</p>
            <div className="space-y-3">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input type="radio" name="rights" className="mt-1 h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500" />
                <span className="text-sm text-gray-900">I am the owner of all rights</span>
              </label>
              <label className="flex items-start space-x-3 cursor-pointer">
                <input type="radio" name="rights" className="mt-1 h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500" />
                <span className="text-sm text-gray-900">I have had all other rights granted to me (in addition to my own rights) and I am authorized to transfer these further</span>
              </label>
              <label className="flex items-start space-x-3 cursor-pointer">
                <input type="radio" name="rights" className="mt-1 h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500" />
                <span className="text-sm text-gray-900">I only own part of the rights to the podcast</span>
              </label>
              <label className="flex items-start space-x-3 cursor-pointer">
                <input type="radio" name="rights" className="mt-1 h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500" />
                <span className="text-sm text-gray-900">Other persons hold rights that have not been transferred to me</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
