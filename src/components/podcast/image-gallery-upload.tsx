'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import Image from 'next/image'
import { X, Upload, Image as ImageIcon } from 'lucide-react'

interface ImageGalleryUploadProps {
  podcastId: string
  onImagesChange?: (images: any[]) => void
}

interface UploadedImage {
  id: string
  image_url: string
  image_name: string
  image_size: number
  image_type: string
  sort_order: number
}

export function ImageGalleryUpload({ podcastId, onImagesChange }: ImageGalleryUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createBrowserSupabaseClient()
  const { addToast } = useToast()

  // Load existing images on mount
  React.useEffect(() => {
    loadExistingImages()
  }, [podcastId])

  const loadExistingImages = async () => {
    try {
      const { data, error } = await supabase
        .from('podcast_image_gallery')
        .select('*')
        .eq('podcast_id', podcastId)
        .order('sort_order', { ascending: true })

      if (error) throw error
      console.log('Loaded images from database:', data)
      setImages(data || [])
      onImagesChange?.(data || [])
    } catch (error) {
      console.error('Error loading images:', error)
    }
  }

  const handleFiles = useCallback(async (files: FileList) => {
    if (!files.length) return

    setUploading(true)
    
    // Create preview images immediately
    const previewImages: UploadedImage[] = []
    const fileArray = Array.from(files)
    
    // Add preview images first
    fileArray.forEach((file, index) => {
      const previewUrl = URL.createObjectURL(file)
      const previewImage: UploadedImage = {
        id: `preview-${Date.now()}-${index}`,
        image_url: previewUrl,
        image_name: file.name,
        image_size: file.size,
        image_type: file.type,
        sort_order: images.length + index
      }
      previewImages.push(previewImage)
    })
    
    // Update UI immediately with previews
    const newImages = [...images, ...previewImages]
    setImages(newImages)
    onImagesChange?.(newImages)

    const uploadPromises = fileArray.map(async (file, index) => {
      try {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not an image file`)
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`${file.name} is too large. Maximum size is 10MB`)
        }

        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop()
        const fileName = `${podcastId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        
        console.log('Uploading file to storage:', fileName)
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('podcast-images')
          .upload(fileName, file)

        let publicUrl: string

        if (uploadError) {
          console.error('Storage upload error:', uploadError)
          // Fallback: convert to base64 and store in database
          console.log('Falling back to base64 storage')
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => {
              const result = reader.result as string
              console.log('Base64 conversion result length:', result.length)
              resolve(result)
            }
            reader.onerror = () => reject(reader.error)
            reader.readAsDataURL(file)
          })
          publicUrl = base64
        } else {
          // Get public URL from storage
          const { data: { publicUrl: storageUrl } } = supabase.storage
            .from('podcast-images')
            .getPublicUrl(fileName)
          publicUrl = storageUrl
          console.log('Storage upload successful, public URL:', publicUrl)
        }

        // Save to database
        console.log('Saving to database - URL length:', publicUrl.length)
        console.log('Saving to database - URL preview:', publicUrl.substring(0, 100))
        
        const { data: dbData, error: dbError } = await supabase
          .from('podcast_image_gallery')
          .insert({
            podcast_id: podcastId,
            image_url: publicUrl,
            image_name: file.name,
            image_size: file.size,
            image_type: file.type,
            sort_order: images.length + index
          })
          .select()
          .single()

        if (dbError) {
          console.error('Database insert error:', dbError)
          throw new Error(`Database error: ${dbError.message}`)
        }

        console.log('Successfully saved to database:', dbData)
        return dbData
      } catch (error: any) {
        console.error(`Error uploading ${file.name}:`, error)
        throw error
      }
    })

    try {
      const uploadedImages = await Promise.all(uploadPromises)
      
      // Replace preview images with real uploaded images
      const finalImages = images.concat(uploadedImages)
      setImages(finalImages)
      onImagesChange?.(finalImages)
      
      addToast({
        type: 'success',
        message: `${uploadedImages.length} image(s) uploaded successfully`
      })
    } catch (error: any) {
      console.error('Error uploading images:', error)
      
      // Remove preview images on error
      setImages(images)
      onImagesChange?.(images)
      
      addToast({
        type: 'error',
        message: error.message || 'Failed to upload images'
      })
    } finally {
      setUploading(false)
    }
  }, [podcastId, images, supabase, addToast, onImagesChange])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const removeImage = async (imageId: string) => {
    try {
      const imageToRemove = images.find(img => img.id === imageId)
      if (!imageToRemove) return

      // Delete from storage
      const fileName = imageToRemove.image_url.split('/').pop()
      if (fileName) {
        await supabase.storage
          .from('podcast-images')
          .remove([`${podcastId}/${fileName}`])
      }

      // Delete from database
      const { error } = await supabase
        .from('podcast_image_gallery')
        .delete()
        .eq('id', imageId)

      if (error) throw error

      const newImages = images.filter(img => img.id !== imageId)
      setImages(newImages)
      onImagesChange?.(newImages)
      
      addToast({
        type: 'success',
        message: 'Image has been removed from gallery'
      })
    } catch (error) {
      console.error('Error removing image:', error)
      addToast({
        type: 'error',
        message: 'Failed to remove image'
      })
    }
  }

  const reorderImages = async (fromIndex: number, toIndex: number) => {
    const newImages = [...images]
    const [movedImage] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, movedImage)

    // Update sort_order in database
    const updatePromises = newImages.map((image, index) =>
      supabase
        .from('podcast_image_gallery')
        .update({ sort_order: index })
        .eq('id', image.id)
    )

    try {
      await Promise.all(updatePromises)
      setImages(newImages)
      onImagesChange?.(newImages)
    } catch (error) {
      console.error('Error reordering images:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Image Gallery</h3>
        <p className="text-sm text-gray-600">Upload multiple images to showcase your podcast. Drag and drop or click to select files.</p>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-red-500 bg-red-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <Upload className="w-6 h-6 text-gray-600" />
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              {dragActive ? 'Drop images here' : 'Upload images'}
            </p>
            <p className="text-sm text-gray-600">
              Drag and drop images here, or click to select files
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Supports JPG, PNG, GIF up to 10MB each
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="mt-4"
          >
            {uploading ? 'Uploading...' : 'Choose Files'}
          </Button>
        </div>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">
            Uploaded Images ({images.length})
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square relative overflow-hidden rounded-lg border border-gray-200">
                  <img
                    src={image.image_url}
                    alt={image.image_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image load error for:', image.image_name, 'URL:', image.image_url)
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2U8L3RleHQ+PC9zdmc+'
                    }}
                    onLoad={() => console.log('Image loaded successfully:', image.image_name)}
                  />
                  
                  {/* Overlay with remove button - only visible on hover */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-sm hover:shadow-md h-9 px-3 text-sm rounded-full"
                      onClick={() => removeImage(image.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="mt-2 text-xs text-gray-500 truncate">
                  {image.image_name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {images.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No images uploaded yet</p>
          <p className="text-sm">Upload images to create your gallery</p>
        </div>
      )}
    </div>
  )
}
