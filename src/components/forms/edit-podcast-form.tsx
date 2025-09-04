'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, TextArea, FileInput, PDFViewer, AudioPlayer } from '@/components/ui'
import { ImageGalleryUpload } from '@/components/podcast/image-gallery-upload'

interface EditPodcastFormProps {
  podcast: any
  isAdmin?: boolean
  workflowState?: any
  onSubmit: (formData: any, coverImage: File | null) => Promise<void>
  loading?: boolean
  error?: string
  isCreating?: boolean
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
  onFormDataChange,
}: EditPodcastFormProps) {
  const [formData, setFormData] = useState({
    title: podcast?.title || '',
    description: podcast?.description || '',
    title_english: podcast?.title_english || '',
    description_english: podcast?.description_english || '',
    category: podcast?.category || '',
    language: podcast?.language || 'en',
    country: podcast?.country || 'DE',
    status: podcast?.status || 'draft',
    rss_url: podcast?.rss_url || '',
    auto_publish_episodes: podcast?.auto_publish_episodes ?? false,
    script_audio_tracks_title: podcast?.script_audio_tracks_title || '',
    script_audio_tracks_description: podcast?.script_audio_tracks_description || '',
    script_music_title: podcast?.script_music_title || '',
    script_music_description: podcast?.script_music_description || '',
  })



  // license countries (multi-select)
  const [licenseCountries, setLicenseCountries] = useState<string[]>(podcast?.license_countries || [])

  const [coverImage, setCoverImage] = useState<File | null>(null)
  
  // Script file uploads
  const [scriptFile, setScriptFile] = useState<File | null>(null)
  const [scriptEnglishFile, setScriptEnglishFile] = useState<File | null>(null)
  const [scriptAudioTracksFile, setScriptAudioTracksFile] = useState<File | null>(null)
  const [scriptMusicFile, setScriptMusicFile] = useState<File | null>(null)
  
  // Track deleted files to hide them from UI
  const [deletedFiles, setDeletedFiles] = useState<{
    script: boolean
    scriptEnglish: boolean
    scriptAudioTracks: boolean
    scriptMusic: boolean
  }>({
    script: false,
    scriptEnglish: false,
    scriptAudioTracks: false,
    scriptMusic: false
  })

  // License agreement state
  const [licenseData, setLicenseData] = useState({
    format: podcast?.license_format || '',
    copyright: podcast?.license_copyright || '',
    territory: podcast?.license_territory || '',
    excludedCountries: podcast?.license_excluded_countries?.join(', ') || '',
    totalListeners: podcast?.license_total_listeners || '',
    listenersPerEpisode: podcast?.license_listeners_per_episode || '',
    genderMale: podcast?.license_demographics?.gender?.male || '',
    genderFemale: podcast?.license_demographics?.gender?.female || '',
    genderDiverse: podcast?.license_demographics?.gender?.diverse || '',
    age18_27: podcast?.license_demographics?.age?.age_18_27 || '',
    age27_34: podcast?.license_demographics?.age?.age_27_34 || '',
    age35_45: podcast?.license_demographics?.age?.age_35_45 || '',
    age45plus: podcast?.license_demographics?.age?.age_45_plus || '',
    rightsOwnership: podcast?.license_rights_ownership || ''
  })

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
    
    // Include script files in the form data
    const formDataWithScripts = {
      ...formData,
      scriptFile,
      scriptEnglishFile,
      scriptAudioTracksFile,
      scriptMusicFile
    }
    
    console.log('📋 Form handleSubmit called with:', {
      formData: formDataWithScripts,
      coverImage: coverImage?.name,
      scriptFiles: {
        scriptFile: scriptFile?.name,
        scriptEnglishFile: scriptEnglishFile?.name,
        scriptAudioTracksFile: scriptAudioTracksFile?.name,
        scriptMusicFile: scriptMusicFile?.name
      }
    })
    
    console.log('📋 About to call onSubmit with script files:', {
      scriptFile: scriptFile,
      scriptEnglishFile: scriptEnglishFile,
      scriptAudioTracksFile: scriptAudioTracksFile,
      scriptMusicFile: scriptMusicFile
    })
    
    onSubmit(formDataWithScripts, coverImage)
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
  }

  // Delete handlers for script files
  const handleDeleteScriptFile = () => {
    setScriptFile(null)
    setDeletedFiles(prev => ({ ...prev, script: true }))
    console.log('🗑️ Script file deleted')
  }

  const handleDeleteScriptEnglishFile = () => {
    setScriptEnglishFile(null)
    setDeletedFiles(prev => ({ ...prev, scriptEnglish: true }))
    console.log('🗑️ Script English file deleted')
  }

  const handleDeleteScriptAudioTracksFile = () => {
    setScriptAudioTracksFile(null)
    setDeletedFiles(prev => ({ ...prev, scriptAudioTracks: true }))
    console.log('🗑️ Script Audio Tracks file deleted')
  }

  const handleDeleteScriptMusicFile = () => {
    setScriptMusicFile(null)
    setDeletedFiles(prev => ({ ...prev, scriptMusic: true }))
    console.log('🗑️ Script Music file deleted')
  }

  // Notify parent component when form data changes (hosts moved to HostsManager)
  useEffect(() => {
    console.log('📋 Form data useEffect triggered:', {
      scriptFile: scriptFile?.name,
      scriptEnglishFile: scriptEnglishFile?.name,
      scriptAudioTracksFile: scriptAudioTracksFile?.name,
      scriptMusicFile: scriptMusicFile?.name
    })
    
    if (onFormDataChange) {
      const effectiveTitle = formData.title
      const effectiveDescription = formData.description
      
      // Prepare license demographics
      const demographics = {
        gender: {
          male: licenseData.genderMale ? parseInt(licenseData.genderMale) : null,
          female: licenseData.genderFemale ? parseInt(licenseData.genderFemale) : null,
          diverse: licenseData.genderDiverse ? parseInt(licenseData.genderDiverse) : null
        },
        age: {
          age_18_27: licenseData.age18_27 ? parseInt(licenseData.age18_27) : null,
          age_27_34: licenseData.age27_34 ? parseInt(licenseData.age27_34) : null,
          age_35_45: licenseData.age35_45 ? parseInt(licenseData.age35_45) : null,
          age_45_plus: licenseData.age45plus ? parseInt(licenseData.age45plus) : null
        }
      }
      
      onFormDataChange(
        { 
          ...formData, 
          title: effectiveTitle, 
          description: effectiveDescription, 
          license_countries: licenseCountries,
          // License agreement data
          license_format: licenseData.format || null,
          license_copyright: licenseData.copyright || null,
          license_territory: licenseData.territory || null,
          license_excluded_countries: licenseData.excludedCountries ? licenseData.excludedCountries.split(',').map((s: string) => s.trim()).filter(Boolean) : null,
          license_total_listeners: licenseData.totalListeners ? parseInt(licenseData.totalListeners) : null,
          license_listeners_per_episode: licenseData.listenersPerEpisode ? parseInt(licenseData.listenersPerEpisode) : null,
          license_demographics: demographics,
          license_rights_ownership: licenseData.rightsOwnership || null,
          // Script files
          scriptFile,
          scriptEnglishFile,
          scriptAudioTracksFile,
          scriptMusicFile
        },
        coverImage
      )
    }
  }, [formData, licenseCountries, coverImage, licenseData, scriptFile, scriptEnglishFile, scriptAudioTracksFile, scriptMusicFile, onFormDataChange])

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

            {/* Podcast Details */}
            <div className="space-y-8">
              {/* Basic Details */}
              <div className="space-y-6">
                {/* Title Fields - Side by Side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Input
                    label="Podcast Title*"
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                    placeholder="Enter podcast title"
                  />

                  <Input
                    label="Podcast Title (English)"
                    id="title_english"
                    value={formData.title_english}
                    onChange={(e) => handleInputChange('title_english', e.target.value)}
                    placeholder="Enter English title (optional)"
                  />
                </div>

                {/* Description Fields - Side by Side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <TextArea
                    label="Description*"
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    required
                    placeholder="Describe your podcast"
                    rows={4}
                  />

                  <TextArea
                    label="Description (English)"
                    id="description_english"
                    value={formData.description_english}
                    onChange={(e) => handleInputChange('description_english', e.target.value)}
                    placeholder="Enter English description (optional)"
                    rows={4}
                  />
                </div>

                {/* Helper Text */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        <strong>English Translation:</strong> If provided, the English versions will be displayed on the public page instead of the original language.
                      </p>
                    </div>
                  </div>
                </div>

                <FileInput
                  label="Cover Image (Optional)"
                  id="cover_image"
                  accept="image/*"
                  helperText="Upload a cover image for the podcast (max 5MB)"
                  onChange={(e) => {
                    const file = (e.target as HTMLInputElement).files?.[0]
                    if (file) {
                        setCoverImage(file)
                    }
                  }}
                />

                {/* Cover Image Preview */}
                {podcast?.cover_image_url && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">Current cover</div>
                    <img
                      src={podcast.cover_image_url}
                      alt="Cover preview"
                      className="w-32 h-32 object-cover rounded-lg shadow-sm border border-gray-200"
                    />
                  </div>
                )}
              </div>

              {/* Script Uploads */}
              <div className="space-y-6">
                <h3 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2">Script Uploads</h3>
                
                {/* Script File */}
                <div className="space-y-2">
                  <FileInput
                    label="Script"
                    id="script"
                    accept=".pdf,.doc,.docx,.txt"
                    helperText="Upload main script file (PDF, DOC, DOCX, TXT)"
                    onChange={(e) => {
                      const file = (e.target as HTMLInputElement).files?.[0]
                      console.log('📁 Script file selected:', file)
                      if (file) {
                        setScriptFile(file)
                        setDeletedFiles(prev => ({ ...prev, script: false }))
                        console.log('📁 Script file state set:', file.name)
                      }
                    }}
                  />
                  
                  {/* Script File Preview */}
                  {(scriptFile || (podcast?.script_url && !deletedFiles.script)) && (
                    <div className="mt-4">
                      <PDFViewer
                        file={scriptFile || podcast?.script_url}
                        title="Script File"
                        className="w-full"
                        onDelete={handleDeleteScriptFile}
                        showDeleteButton={true}
                      />
                    </div>
                  )}
                  
                  {/* Show placeholder when no file or file was deleted */}
                  {!scriptFile && (!podcast?.script_url || deletedFiles.script) && (
                    <div className="mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                      <p className="text-gray-500 mb-2">No script file uploaded</p>
                      <p className="text-xs text-gray-400">Upload a PDF file to see the viewer with delete functionality</p>
                    </div>
                  )}
                </div>

                {/* Script English File */}
                <div className="space-y-2">
                  <FileInput
                    label="Script English"
                    id="script_english"
                    accept=".pdf,.doc,.docx,.txt"
                    helperText="Upload English version of script (PDF, DOC, DOCX, TXT)"
                    onChange={(e) => {
                      const file = (e.target as HTMLInputElement).files?.[0]
                      console.log('📁 Script English file selected:', file)
                      if (file) {
                        setScriptEnglishFile(file)
                        setDeletedFiles(prev => ({ ...prev, scriptEnglish: false }))
                        console.log('📁 Script English file state set:', file.name)
                      }
                    }}
                  />
                  
                  {/* Script English File Preview */}
                  {(scriptEnglishFile || (podcast?.script_english_url && !deletedFiles.scriptEnglish)) && (
                    <div className="mt-4">
                      <PDFViewer
                        file={scriptEnglishFile || podcast?.script_english_url}
                        title="Script English File"
                        className="w-full"
                        onDelete={handleDeleteScriptEnglishFile}
                        showDeleteButton={true}
                      />
                    </div>
                  )}
                  
                  {/* Show placeholder when no file or file was deleted */}
                  {!scriptEnglishFile && (!podcast?.script_english_url || deletedFiles.scriptEnglish) && (
                    <div className="mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                      <p className="text-gray-500 mb-2">No script English file uploaded</p>
                      <p className="text-xs text-gray-400">Upload a PDF file to see the viewer with delete functionality</p>
                    </div>
                  )}
                </div>

                {/* Script Audio Tracks File */}
                <div className="space-y-2">
                  <FileInput
                    label="Script Audio Tracks"
                    id="script_audio_tracks"
                    accept="audio/*"
                    helperText="Upload script audio tracks (MP3, WAV, etc.)"
                    onChange={(e) => {
                      const file = (e.target as HTMLInputElement).files?.[0]
                      console.log('📁 Script Audio Tracks file selected:', file)
                      if (file) {
                        setScriptAudioTracksFile(file)
                        setDeletedFiles(prev => ({ ...prev, scriptAudioTracks: false }))
                        console.log('📁 Script Audio Tracks file state set:', file.name)
                      }
                    }}
                  />
                  
                  {/* Script Audio Tracks File Preview */}
                  {(scriptAudioTracksFile || (podcast?.script_audio_tracks_url && !deletedFiles.scriptAudioTracks)) && (
                    <div className="mt-4">
                      <AudioPlayer
                        src={scriptAudioTracksFile || podcast?.script_audio_tracks_url}
                        className="w-full"
                      />
                    </div>
                  )}
                  
                  {/* Audio Tracks Title and Description */}
                  <div className="mt-4 space-y-4">
                    <Input
                      label="Audio Tracks Title"
                      id="script_audio_tracks_title"
                      value={formData.script_audio_tracks_title}
                      onChange={(e) => setFormData(prev => ({ ...prev, script_audio_tracks_title: e.target.value }))}
                      placeholder="Enter title for audio tracks"
                    />
                    <TextArea
                      label="Audio Tracks Description"
                      id="script_audio_tracks_description"
                      value={formData.script_audio_tracks_description}
                      onChange={(e) => setFormData(prev => ({ ...prev, script_audio_tracks_description: e.target.value }))}
                      placeholder="Enter description for audio tracks"
                      rows={3}
                    />
                  </div>
                  
                  {/* Show placeholder when no file or file was deleted */}
                  {!scriptAudioTracksFile && (!podcast?.script_audio_tracks_url || deletedFiles.scriptAudioTracks) && (
                    <div className="mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                      <p className="text-gray-500 mb-2">No script audio tracks uploaded</p>
                      <p className="text-xs text-gray-400">Upload an audio file to see the player with delete functionality</p>
                    </div>
                  )}
                </div>

                {/* Script Music File */}
                <div className="space-y-2">
                  <FileInput
                    label="Script Music"
                    id="script_music"
                    accept="audio/*"
                    helperText="Upload script music files (MP3, WAV, etc.)"
                    onChange={(e) => {
                      const file = (e.target as HTMLInputElement).files?.[0]
                      console.log('📁 Script Music file selected:', file)
                      if (file) {
                        setScriptMusicFile(file)
                        setDeletedFiles(prev => ({ ...prev, scriptMusic: false }))
                        console.log('📁 Script Music file state set:', file.name)
                      }
                    }}
                  />
                  
                  {/* Script Music File Preview */}
                  {(scriptMusicFile || (podcast?.script_music_url && !deletedFiles.scriptMusic)) && (
                    <div className="mt-4">
                      <AudioPlayer
                        src={scriptMusicFile || podcast?.script_music_url}
                        className="w-full"
                      />
                    </div>
                  )}
                  
                  {/* Music Title and Description */}
                  <div className="mt-4 space-y-4">
                    <Input
                      label="Music Title"
                      id="script_music_title"
                      value={formData.script_music_title}
                      onChange={(e) => setFormData(prev => ({ ...prev, script_music_title: e.target.value }))}
                      placeholder="Enter title for music"
                    />
                    <TextArea
                      label="Music Description"
                      id="script_music_description"
                      value={formData.script_music_description}
                      onChange={(e) => setFormData(prev => ({ ...prev, script_music_description: e.target.value }))}
                      placeholder="Enter description for music"
                      rows={3}
                    />
                  </div>
                  
                  {/* Show placeholder when no file or file was deleted */}
                  {!scriptMusicFile && (!podcast?.script_music_url || deletedFiles.scriptMusic) && (
                    <div className="mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                      <p className="text-gray-500 mb-2">No script music uploaded</p>
                      <p className="text-xs text-gray-400">Upload an audio file to see the player with delete functionality</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Hosts section moved to right column (HostsManager component) in podcast-edit-content.tsx */}
            </div>

            {/* Image Gallery */}
            <div className="space-y-6 mt-8">
              <h3 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2">Image Gallery</h3>
              <ImageGalleryUpload 
                podcastId={podcast?.id}
                onImagesChange={(images) => {
                  // Store images in form data if needed
                  console.log('Gallery images updated:', images)
                }}
              />
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
                <input 
                  type="radio" 
                  name="format" 
                  value="always_on"
                  checked={licenseData.format === 'always_on'}
                  onChange={(e) => setLicenseData({...licenseData, format: e.target.value})}
                  className="mt-1 h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500" 
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Always on</span>
                  <p className="text-xs text-gray-600">This podcast is produced continuously without breaks</p>
                </div>
              </label>
              <label className="flex items-start space-x-3 cursor-pointer">
                <input 
                  type="radio" 
                  name="format" 
                  value="series"
                  checked={licenseData.format === 'series'}
                  onChange={(e) => setLicenseData({...licenseData, format: e.target.value})}
                  className="mt-1 h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500" 
                />
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
                <input 
                  type="radio" 
                  name="copyright" 
                  value="lifetime"
                  checked={licenseData.copyright === 'lifetime'}
                  onChange={(e) => setLicenseData({...licenseData, copyright: e.target.value})}
                  className="mt-1 h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500" 
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Lifetime of copyright</span>
                  <p className="text-xs text-gray-600">Copyright lasts for the lifetime of the creator plus 70 years</p>
                </div>
              </label>
              <label className="flex items-start space-x-3 cursor-pointer">
                <input 
                  type="radio" 
                  name="copyright" 
                  value="5_years"
                  checked={licenseData.copyright === '5_years'}
                  onChange={(e) => setLicenseData({...licenseData, copyright: e.target.value})}
                  className="mt-1 h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500" 
                />
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
                <input 
                  type="radio" 
                  name="territory" 
                  value="worldwide"
                  checked={licenseData.territory === 'worldwide'}
                  onChange={(e) => setLicenseData({...licenseData, territory: e.target.value})}
                  className="mt-1 h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500" 
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">All Countries</span>
                  <p className="text-xs text-gray-600">License applies worldwide</p>
                </div>
              </label>
              <label className="flex items-start space-x-3 cursor-pointer">
                <input 
                  type="radio" 
                  name="territory" 
                  value="except_countries"
                  checked={licenseData.territory === 'except_countries'}
                  onChange={(e) => setLicenseData({...licenseData, territory: e.target.value})}
                  className="mt-1 h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500" 
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">All countries except:</span>
                  <Input
                    id="excluded_countries"
                    placeholder="Enter excluded countries (comma-separated)"
                    value={licenseData.excludedCountries}
                    onChange={(e) => setLicenseData({...licenseData, excludedCountries: e.target.value})}
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
                  value={licenseData.totalListeners}
                  onChange={(e) => setLicenseData({...licenseData, totalListeners: e.target.value})}
                  helperText="Total listeners across all episodes"
                />
              </div>
              <div>
                <Input
                  label="Listeners per Episode"
                  id="listeners_per_episode"
                  type="number"
                  placeholder="5000"
                  value={licenseData.listenersPerEpisode}
                  onChange={(e) => setLicenseData({...licenseData, listenersPerEpisode: e.target.value})}
                  helperText="Average listeners per episode"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Gender Distribution</h4>
              <div className="grid grid-cols-3 gap-4">
                <Input 
                  label="Male %" 
                  id="male_percent" 
                  type="number" 
                  placeholder="45" 
                  value={licenseData.genderMale}
                  onChange={(e) => setLicenseData({...licenseData, genderMale: e.target.value})}
                />
                <Input 
                  label="Female %" 
                  id="female_percent" 
                  type="number" 
                  placeholder="52" 
                  value={licenseData.genderFemale}
                  onChange={(e) => setLicenseData({...licenseData, genderFemale: e.target.value})}
                />
                <Input 
                  label="Diverse %" 
                  id="diverse_percent" 
                  type="number" 
                  placeholder="3" 
                  value={licenseData.genderDiverse}
                  onChange={(e) => setLicenseData({...licenseData, genderDiverse: e.target.value})}
                />
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Age Distribution</h4>
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="18-27 years %" 
                  id="age_18_27" 
                  type="number" 
                  placeholder="25" 
                  value={licenseData.age18_27}
                  onChange={(e) => setLicenseData({...licenseData, age18_27: e.target.value})}
                />
                <Input 
                  label="27-34 years %" 
                  id="age_27_34" 
                  type="number" 
                  placeholder="35" 
                  value={licenseData.age27_34}
                  onChange={(e) => setLicenseData({...licenseData, age27_34: e.target.value})}
                />
                <Input 
                  label="35-45 years %" 
                  id="age_35_45" 
                  type="number" 
                  placeholder="25" 
                  value={licenseData.age35_45}
                  onChange={(e) => setLicenseData({...licenseData, age35_45: e.target.value})}
                />
                <Input 
                  label="45+ years %" 
                  id="age_45_plus" 
                  type="number" 
                  placeholder="15" 
                  value={licenseData.age45plus}
                  onChange={(e) => setLicenseData({...licenseData, age45plus: e.target.value})}
                />
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
                <input 
                  type="radio" 
                  name="rights" 
                  value="full_owner"
                  checked={licenseData.rightsOwnership === 'full_owner'}
                  onChange={(e) => setLicenseData({...licenseData, rightsOwnership: e.target.value})}
                  className="mt-1 h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500" 
                />
                <span className="text-sm text-gray-900">I am the owner of all rights</span>
              </label>
              <label className="flex items-start space-x-3 cursor-pointer">
                <input 
                  type="radio" 
                  name="rights" 
                  value="granted_rights"
                  checked={licenseData.rightsOwnership === 'granted_rights'}
                  onChange={(e) => setLicenseData({...licenseData, rightsOwnership: e.target.value})}
                  className="mt-1 h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500" 
                />
                <span className="text-sm text-gray-900">I have had all other rights granted to me (in addition to my own rights) and I am authorized to transfer these further</span>
              </label>
              <label className="flex items-start space-x-3 cursor-pointer">
                <input 
                  type="radio" 
                  name="rights" 
                  value="partial_rights"
                  checked={licenseData.rightsOwnership === 'partial_rights'}
                  onChange={(e) => setLicenseData({...licenseData, rightsOwnership: e.target.value})}
                  className="mt-1 h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500" 
                />
                <span className="text-sm text-gray-900">I only own part of the rights to the podcast</span>
              </label>
              <label className="flex items-start space-x-3 cursor-pointer">
                <input 
                  type="radio" 
                  name="rights" 
                  value="no_transfer"
                  checked={licenseData.rightsOwnership === 'no_transfer'}
                  onChange={(e) => setLicenseData({...licenseData, rightsOwnership: e.target.value})}
                  className="mt-1 h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500" 
                />
                <span className="text-sm text-gray-900">Other persons hold rights that have not been transferred to me</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
