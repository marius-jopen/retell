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
  // Callback to expose form data to parent
  onFormDataChange?: (formData: any, coverImage: File | null, hosts: any[]) => void
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
  onFormDataChange,
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

  // Host management state - Initialize from podcast data or default
  const [hosts, setHosts] = useState<Array<{ id: string; name: string; language: string; image?: File | string; imagePreviewUrl?: string }>>(() => {
    if (podcast?.hosts && podcast.hosts.length > 0) {
      return podcast.hosts.map((host: any, index: number) => ({
        id: host.id || `host_${index}`,
        name: host.name || '',
        language: host.language || 'en',
        image: host.image_url || '',
        imagePreviewUrl: host.image_url || undefined
      }))
    }
    return [{ id: '1', name: '', language: 'en' }]
  })

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

  // Notify parent component when form data changes
  useEffect(() => {
    if (onFormDataChange) {
      const effectiveTitle = countryTitle ?? formData.title
      const effectiveDescription = countryDescription ?? formData.description
      onFormDataChange(
        { ...formData, title: effectiveTitle, description: effectiveDescription, translations, license_countries: licenseCountries },
        coverImage,
        hosts
      )
    }
  }, [formData, translations, licenseCountries, coverImage, hosts, countryTitle, countryDescription, onFormDataChange])

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
                rows={20}
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

            {/* Hosts Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2 flex-1">Hosts</h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="ml-4"
                  onClick={() => {
                    const newHost = {
                      id: Date.now().toString(),
                      name: '',
                      language: 'en'
                    }
                    setHosts([...hosts, newHost])
                  }}
                >
                  + Add Host
                </Button>
              </div>
              
              {hosts.map((host, index) => (
                <div key={host.id} className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Host {index + 1}</span>
                    {hosts.length > 1 && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => {
                          setHosts(hosts.filter(h => h.id !== host.id))
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  <FileInput
                    label="Host Image"
                    id={`host_${host.id}_image`}
                    accept="image/*"
                    helperText="Upload host photo (max 5MB)"
                    onChange={async (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0]
                      if (file) {
                        if (!file.type.startsWith('image/')) {
                          alert('Please select an image file')
                          return
                        }
                        if (file.size > 5 * 1024 * 1024) {
                          alert('Image size must be less than 5MB')
                          return
                        }
                        
                        // Create preview URL immediately
                        const reader = new FileReader()
                        reader.onload = () => {
                          setHosts(hosts.map(h => 
                            h.id === host.id ? { 
                              ...h, 
                              image: file, 
                              imagePreviewUrl: reader.result as string 
                            } : h
                          ))
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                  />
                  
                  {/* Host Image Preview */}
                  {(host.imagePreviewUrl || (typeof host.image === 'string' && host.image)) && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-500 mb-1">Current host image</div>
                      <img
                        src={host.imagePreviewUrl || (typeof host.image === 'string' ? host.image : '')}
                        alt={`${host.name} profile`}
                        className="w-16 h-16 object-cover rounded-full border border-gray-200"
                      />
                    </div>
                  )}

                  <Input
                    label="Host Name*"
                    id={`host_${host.id}_name`}
                    placeholder="Enter host name"
                    value={host.name}
                    onChange={(e) => {
                      setHosts(hosts.map(h => 
                        h.id === host.id ? { ...h, name: e.target.value } : h
                      ))
                    }}
                    required
                  />

                  <Select
                    label="Host Language*"
                    id={`host_${host.id}_language`}
                    value={host.language}
                    onChange={(e) => {
                      setHosts(hosts.map(h => 
                        h.id === host.id ? { ...h, language: e.target.value } : h
                      ))
                    }}
                    required
                  >
                    <option value="">Select language</option>
                    <option value="en">English</option>
                    <option value="de">German</option>
                    <option value="fr">French</option>
                    <option value="es">Spanish</option>
                    <option value="it">Italian</option>
                    <option value="nl">Dutch</option>
                    <option value="pt">Portuguese</option>
                    <option value="pl">Polish</option>
                    <option value="sv">Swedish</option>
                    <option value="da">Danish</option>
                    <option value="no">Norwegian</option>
                    <option value="fi">Finnish</option>
                    <option value="ru">Russian</option>
                    <option value="zh">Chinese</option>
                    <option value="ja">Japanese</option>
                    <option value="ko">Korean</option>
                    <option value="ar">Arabic</option>
                    <option value="hi">Hindi</option>
                    <option value="other">Other</option>
                  </Select>
                </div>
              ))}
            </div>
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

      <CardContent className="p-6">
        <div className="space-y-10">
          {/* Podcast Format */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Machart des Podcasts* (Podcast Format)
            </label>
            <div className="space-y-3">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input type="checkbox" className="mt-1 h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500" />
                <div>
                  <span className="text-sm font-medium text-gray-900">Always on</span>
                  <p className="text-xs text-gray-500">This podcast is produced continuously without breaks</p>
                </div>
              </label>
              <label className="flex items-start space-x-3 cursor-pointer">
                <input type="checkbox" className="mt-1 h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500" />
                <div>
                  <span className="text-sm font-medium text-gray-900">Series</span>
                  <p className="text-xs text-gray-500">This podcast is produced in seasonal series</p>
                </div>
              </label>
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-gray-200"></div>

          {/* License Time / Copyright */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              License Time / Copyright* 🕐
            </label>
            <div className="space-y-3">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input type="radio" name="copyright" className="mt-1 h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500" />
                <div>
                  <span className="text-sm font-medium text-gray-900">Lifetime of copyright</span>
                  <p className="text-xs text-gray-500">Copyright lasts for the lifetime of the creator plus 70 years</p>
                </div>
              </label>
              <label className="flex items-start space-x-3 cursor-pointer">
                <input type="radio" name="copyright" className="mt-1 h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500" />
                <div className="flex items-center space-x-2">
                  <input 
                    type="number" 
                    placeholder="5" 
                    className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
                  />
                  <span className="text-sm font-medium text-gray-900">years of copyright</span>
                </div>
                <p className="text-xs text-gray-500 ml-2">Copyright lasts for a specific number of years</p>
              </label>
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-gray-200"></div>

          {/* Territory */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Territory* 🌍
            </label>
            <div className="space-y-4">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input type="radio" name="territory" className="mt-1 h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500" />
                <div>
                  <span className="text-sm font-medium text-gray-900">All Countries</span>
                  <p className="text-xs text-gray-500">License applies worldwide</p>
                </div>
              </label>
              <label className="flex items-start space-x-3 cursor-pointer">
                <input type="radio" name="territory" className="mt-1 h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">All countries except:</span>
                  <div className="mt-2">
                    <input 
                      type="text" 
                      placeholder="Enter excluded countries (comma-separated)"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">These countries will be marked differently on the frontend map</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-gray-200"></div>

          {/* Demographics */}
          <div className="space-y-6">
            <label className="block text-sm font-medium text-gray-700">
              The Numbers* (Demographics)
            </label>
            
            {/* Listener Numbers */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Total Listeners (from launch)"
                  id="total_listeners"
                  type="number"
                  placeholder="150000"
                  helperText="Total listeners across all episodes"
                />
                <Input
                  label="Listeners per Episode"
                  id="listeners_per_episode"
                  type="number"
                  placeholder="5000"
                  helperText="Average listeners per episode"
                />
              </div>
            </div>
            
            {/* Gender Distribution */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">Gender Distribution</label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Male %</label>
                  <input 
                    type="number" 
                    max="100" 
                    placeholder="45"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Female %</label>
                  <input 
                    type="number" 
                    max="100" 
                    placeholder="52"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Diverse %</label>
                  <input 
                    type="number" 
                    max="100" 
                    placeholder="3"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>
            </div>

            {/* Age Distribution */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">Age Distribution</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">18-27 years %</label>
                  <input 
                    type="number" 
                    max="100" 
                    placeholder="25"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">27-34 years %</label>
                  <input 
                    type="number" 
                    max="100" 
                    placeholder="35"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">35-45 years %</label>
                  <input 
                    type="number" 
                    max="100" 
                    placeholder="25"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">45+ years %</label>
                  <input 
                    type="number" 
                    max="100" 
                    placeholder="15"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-gray-200"></div>

          {/* Rights Ownership - Admin Only */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Who currently has the rights to podcast/content?
              </label>
              <p className="text-xs text-gray-500 mt-1">This information is only visible in the admin area</p>
            </div>
            <div className="space-y-3 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
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
        </div>
      </CardContent>
      </Card>
    </>
  )
} 