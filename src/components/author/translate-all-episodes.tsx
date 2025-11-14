'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { createBrowserSupabaseClient } from '@/lib/supabase'

interface Episode {
  id: string
  title: string
  description: string
  title_english: string | null
  description_english: string | null
}

interface TranslateAllEpisodesProps {
  podcastId: string
  episodes: Episode[]
}

export default function TranslateAllEpisodes({ podcastId, episodes }: TranslateAllEpisodesProps) {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const { addToast } = useToast()
  const supabase = createBrowserSupabaseClient()

  const translateText = async (text: string): Promise<string | null> => {
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          sourceLang: 'auto',
          targetLang: 'EN',
        }),
      })

      if (!response.ok) {
        let errorMessage = 'Translation failed'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.details || errorMessage
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      return data.translatedText || null
    } catch (error) {
      console.error('Translation error:', error)
      throw error
    }
  }

  const handleTranslateAll = async () => {
    if (episodes.length === 0) {
      addToast({
        type: 'error',
        message: 'No episodes to translate',
      })
      return
    }

    // Filter episodes that need translation (don't have English translations yet)
    const episodesToTranslate = episodes.filter(
      (ep) => !ep.title_english || !ep.description_english
    )

    if (episodesToTranslate.length === 0) {
      addToast({
        type: 'info',
        message: 'All episodes already have English translations',
      })
      return
    }

    const confirmMessage = `This will translate ${episodesToTranslate.length} episode(s) to English using DeepL API. This may take a few moments. Continue?`
    if (!confirm(confirmMessage)) {
      return
    }

    setLoading(true)
    setProgress({ current: 0, total: episodesToTranslate.length })

    let successCount = 0
    let errorCount = 0
    const errors: string[] = []

    try {
      for (let i = 0; i < episodesToTranslate.length; i++) {
        const episode = episodesToTranslate[i]
        setProgress({ current: i + 1, total: episodesToTranslate.length })

        try {
          const updates: { title_english?: string; description_english?: string } = {}

          // Translate title if needed
          if (!episode.title_english && episode.title) {
            const translatedTitle = await translateText(episode.title)
            if (translatedTitle) {
              updates.title_english = translatedTitle
            }
          }

          // Translate description if needed
          if (!episode.description_english && episode.description) {
            const translatedDescription = await translateText(episode.description)
            if (translatedDescription) {
              updates.description_english = translatedDescription
            }
          }

          // Update episode if we have translations
          if (Object.keys(updates).length > 0) {
            const { error: updateError } = await supabase
              .from('episodes')
              .update({
                ...updates,
                updated_at: new Date().toISOString(),
              })
              .eq('id', episode.id)

            if (updateError) {
              throw new Error(`Failed to update episode: ${updateError.message}`)
            }

            successCount++
          } else {
            // Episode already had translations or translation failed
            if (!episode.title_english && !episode.description_english) {
              errors.push(`Episode "${episode.title}": Translation returned empty results`)
              errorCount++
            }
          }

          // Small delay to avoid rate limiting
          if (i < episodesToTranslate.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 500))
          }
        } catch (error) {
          errorCount++
          const errorMsg = error instanceof Error ? error.message : 'Unknown error'
          errors.push(`Episode "${episode.title}": ${errorMsg}`)
          console.error(`Error translating episode ${episode.id}:`, error)
        }
      }

      // Show results
      if (successCount > 0) {
        addToast({
          type: 'success',
          message: `Successfully translated ${successCount} episode(s) to English`,
        })
      }

      if (errorCount > 0) {
        addToast({
          type: 'error',
          message: `Failed to translate ${errorCount} episode(s). Check console for details.`,
        })
        console.error('Translation errors:', errors)
      }

      // Refresh the page to show updated translations
      window.location.reload()
    } catch (error) {
      console.error('Error translating episodes:', error)
      addToast({
        type: 'error',
        message: 'An error occurred while translating episodes. Please try again.',
      })
    } finally {
      setLoading(false)
      setProgress({ current: 0, total: 0 })
    }
  }

  const episodesNeedingTranslation = episodes.filter(
    (ep) => !ep.title_english || !ep.description_english
  )

  if (episodes.length === 0) {
    return null
  }

  return (
    <Button
      onClick={handleTranslateAll}
      disabled={loading || episodesNeedingTranslation.length === 0}
      className="bg-blue-500 hover:bg-blue-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Translating... ({progress.current}/{progress.total})
        </>
      ) : (
        <>
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
          Translate All Episodes {episodesNeedingTranslation.length > 0 && `(${episodesNeedingTranslation.length})`}
        </>
      )}
    </Button>
  )
}

