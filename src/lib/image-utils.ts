import { createServerSupabaseClient } from '@/lib/supabase'

export interface ImageDownloadResult {
  success: boolean
  imageUrl?: string
  error?: string
  isBase64?: boolean
}

/**
 * Download an image from a URL and convert it to base64 or upload to storage
 * @param imageUrl - The URL of the image to download
 * @param podcastId - The podcast ID for storage organization
 * @param fileName - Optional custom filename
 * @returns Promise with download result
 */
export async function downloadAndStoreImage(
  imageUrl: string,
  podcastId: string,
  fileName?: string
): Promise<ImageDownloadResult> {
  try {
    // Validate URL format
    if (!imageUrl || !isValidImageUrl(imageUrl)) {
      return {
        success: false,
        error: 'Invalid image URL provided'
      }
    }

    // Download the image
    const response = await fetch(imageUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'RETELL-RSS-Bot/1.0'
      }
    })

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to download image: ${response.status} ${response.statusText}`
      }
    }

    // Validate content type
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.startsWith('image/')) {
      return {
        success: false,
        error: 'URL does not point to a valid image'
      }
    }

    // Get image data
    const imageBuffer = await response.arrayBuffer()
    const imageFile = new File([imageBuffer], fileName || 'rss-image.jpg', {
      type: contentType
    })

    // Validate file size (max 5MB)
    if (imageFile.size > 5 * 1024 * 1024) {
      return {
        success: false,
        error: 'Image file size exceeds 5MB limit'
      }
    }

    // For now, use base64 storage (same as manual upload)
    const base64Url = await convertFileToBase64(imageFile)
    
    return {
      success: true,
      imageUrl: base64Url,
      isBase64: true
    }

    // TODO: Uncomment when proper storage buckets are set up
    /*
    const supabase = await createServerSupabaseClient()
    const fileExt = getFileExtension(contentType)
    const storageFileName = `${podcastId}/rss-cover.${fileExt}`
    
    try {
      const { data, error } = await supabase.storage
        .from('podcast-covers')
        .upload(storageFileName, imageFile, {
          cacheControl: '3600',
          upsert: true
        })
      
      if (error) {
        console.error('Storage upload error:', error)
        // Fall back to base64
        const base64Url = await convertFileToBase64(imageFile)
        return {
          success: true,
          imageUrl: base64Url,
          isBase64: true
        }
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('podcast-covers')
        .getPublicUrl(storageFileName)
      
      return {
        success: true,
        imageUrl: urlData.publicUrl,
        isBase64: false
      }
    } catch (storageError) {
      console.error('Storage error:', storageError)
      // Fall back to base64
      const base64Url = await convertFileToBase64(imageFile)
      return {
        success: true,
        imageUrl: base64Url,
        isBase64: true
      }
    }
    */

  } catch (error) {
    console.error('Image download error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error downloading image'
    }
  }
}

/**
 * Convert a File object to base64 data URL
 */
async function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      resolve(base64)
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Validate if a URL is a valid image URL
 */
function isValidImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Get file extension from MIME type
 */
function getFileExtension(mimeType: string): string {
  const mimeToExt: { [key: string]: string } = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg'
  }
  
  return mimeToExt[mimeType] || 'jpg'
}

/**
 * Check if an image URL is accessible and valid
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'RETELL-RSS-Bot/1.0'
      }
    })
    
    if (!response.ok) {
      return false
    }
    
    const contentType = response.headers.get('content-type')
    return contentType ? contentType.startsWith('image/') : false
  } catch {
    return false
  }
} 