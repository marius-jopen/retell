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

interface TranslateAllPodcastProps {
  podcastId: string
  podcastTitle: string
  podcastDescription: string
  podcastTitleEnglish: string | null
  podcastDescriptionEnglish: string | null
  episodes: Episode[]
  onUpdate?: () => void
  fetchAllEpisodes?: boolean // If true, fetch all episodes instead of using passed episodes
}

export default function TranslateAllPodcast({
  podcastId,
  podcastTitle,
  podcastDescription,
  podcastTitleEnglish,
  podcastDescriptionEnglish,
  episodes,
  onUpdate,
  fetchAllEpisodes = true,
}: TranslateAllPodcastProps) {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0, stage: '' })
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
    // Always fetch ALL episodes to get accurate count (not just the preview ones)
    let allEpisodes: Episode[] = []
    try {
      // Fetch ALL episodes - Supabase default limit is 1000 rows
      // If there are more than 1000 episodes, we'll need pagination, but that's unlikely
      const { data: allEpisodesData, error: episodesError, count } = await supabase
        .from('episodes')
        .select('id, title, description, title_english, description_english', { count: 'exact' })
        .eq('podcast_id', podcastId)
        // No .limit() means we get up to 1000 (Supabase default max)
        // If there are more episodes, we'd need pagination, but that's very unlikely
      
      if (episodesError) {
        throw new Error(`Failed to fetch episodes: ${episodesError.message}`)
      }
      
      // Log for debugging
      console.log(`[TranslateAllPodcast] Fetched ${allEpisodesData?.length || 0} episodes (total count in DB: ${count})`)
      
      if (!allEpisodesData || allEpisodesData.length === 0) {
        // No episodes to translate
        allEpisodes = []
      } else {
        allEpisodes = allEpisodesData.map(ep => ({
          ...ep,
          title_english: ep.title_english || null,
          description_english: ep.description_english || null
        }))
        
        // Warn if we might have hit the limit
        if (count && count > 1000 && allEpisodesData.length === 1000) {
          console.warn(`[TranslateAllPodcast] Warning: Podcast has ${count} episodes but only fetched 1000 (Supabase limit). Some episodes may not be translated.`)
        }
      }
    } catch (error) {
      console.error('Error fetching all episodes for translation:', error)
      addToast({
        type: 'error',
        message: 'Failed to fetch episodes. Please try again.',
      })
      return
    }
    
    // Check what needs translation
    const needsPodcastTitleTranslation = !podcastTitleEnglish || podcastTitleEnglish.trim() === ''
    const needsPodcastDescriptionTranslation = !podcastDescriptionEnglish || podcastDescriptionEnglish.trim() === ''
    
    const episodesToTranslate = allEpisodes.filter(
      (ep) => {
        const hasTitleTranslation = ep.title_english && ep.title_english.trim() !== ''
        const hasDescriptionTranslation = ep.description_english && ep.description_english.trim() !== ''
        return !hasTitleTranslation || !hasDescriptionTranslation
      }
    )

    console.log(`[TranslateAllPodcast] Total episodes: ${allEpisodes.length}, Episodes needing translation: ${episodesToTranslate.length}`)

    const totalItems = (needsPodcastTitleTranslation ? 1 : 0) + 
                      (needsPodcastDescriptionTranslation ? 1 : 0) + 
                      episodesToTranslate.length

    if (totalItems === 0) {
      addToast({
        type: 'info',
        message: 'Everything already has English translations',
      })
      return
    }

    // Build confirmation message with accurate counts
    const podcastParts: string[] = []
    if (needsPodcastTitleTranslation) podcastParts.push('title')
    if (needsPodcastDescriptionTranslation) podcastParts.push('description')
    
    const podcastText = podcastParts.length > 0 ? `the podcast ${podcastParts.join(' and ')}` : ''
    const episodesText = episodesToTranslate.length > 0 ? `${episodesToTranslate.length} episode(s)` : ''
    const itemsText = [podcastText, episodesText].filter(Boolean).join(' and ')
    
    const confirmMessage = `This will translate ${itemsText} to English using DeepL API.\n\n⚠️ Please do not leave the page during translation.\n\nContinue?`
    if (!confirm(confirmMessage)) {
      return
    }

    setLoading(true)
    const total = totalItems // Use consistent variable name
    setProgress({ current: 0, total, stage: 'Starting...' })

    let successCount = 0
    let errorCount = 0
    const errors: string[] = []
    let currentProgress = 0

    try {
      // Translate podcast title
      if (needsPodcastTitleTranslation && podcastTitle && podcastTitle.trim() !== '') {
        setProgress({ current: ++currentProgress, total, stage: 'Translating podcast title...' })
        try {
          const translatedTitle = await translateText(podcastTitle)
          if (translatedTitle) {
            const { error: updateError } = await supabase
              .from('podcasts')
              .update({
                title_english: translatedTitle,
                updated_at: new Date().toISOString(),
              })
              .eq('id', podcastId)

            if (updateError) {
              throw new Error(`Failed to update podcast title: ${updateError.message}`)
            }
            successCount++
          }
        } catch (error) {
          errorCount++
          const errorMsg = error instanceof Error ? error.message : 'Unknown error'
          errors.push(`Podcast title: ${errorMsg}`)
          console.error('Error translating podcast title:', error)
        }
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      // Translate podcast description
      if (needsPodcastDescriptionTranslation && podcastDescription && podcastDescription.trim() !== '') {
        setProgress({ current: ++currentProgress, total, stage: 'Translating podcast description...' })
        try {
          const translatedDescription = await translateText(podcastDescription)
          if (translatedDescription) {
            const { error: updateError } = await supabase
              .from('podcasts')
              .update({
                description_english: translatedDescription,
                updated_at: new Date().toISOString(),
              })
              .eq('id', podcastId)

            if (updateError) {
              throw new Error(`Failed to update podcast description: ${updateError.message}`)
            }
            successCount++
          }
        } catch (error) {
          errorCount++
          const errorMsg = error instanceof Error ? error.message : 'Unknown error'
          errors.push(`Podcast description: ${errorMsg}`)
          console.error('Error translating podcast description:', error)
        }
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      // Translate episodes
      for (let i = 0; i < episodesToTranslate.length; i++) {
        const episode = episodesToTranslate[i]
        setProgress({ 
          current: ++currentProgress, 
          total, 
          stage: `Translating episode ${i + 1}/${episodesToTranslate.length}...` 
        })

        try {
          const updates: { title_english?: string; description_english?: string } = {}

          // Translate title only if it doesn't already have an English translation
          const hasTitleTranslation = episode.title_english && episode.title_english.trim() !== ''
          if (!hasTitleTranslation && episode.title && episode.title.trim() !== '') {
            const translatedTitle = await translateText(episode.title)
            if (translatedTitle) {
              updates.title_english = translatedTitle
            }
          }

          // Translate description only if it doesn't already have an English translation
          const hasDescriptionTranslation = episode.description_english && episode.description_english.trim() !== ''
          if (!hasDescriptionTranslation && episode.description && episode.description.trim() !== '') {
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
          message: `Successfully translated ${successCount} item(s) to English`,
        })
      }

      if (errorCount > 0) {
        addToast({
          type: 'error',
          message: `Failed to translate ${errorCount} item(s). Check console for details.`,
        })
        console.error('Translation errors:', errors)
      }

      // Refresh the page to show updated translations
      if (onUpdate) {
        onUpdate()
      } else {
        window.location.reload()
      }
    } catch (error) {
      console.error('Error translating podcast:', error)
      addToast({
        type: 'error',
        message: 'An error occurred while translating. Please try again.',
      })
    } finally {
      setLoading(false)
      setProgress({ current: 0, total: 0, stage: '' })
    }
  }

  // Count items needing translation for button state
  // Don't show episode count in button - will fetch all episodes when clicked
  const needsPodcastTitleTranslation = !podcastTitleEnglish || podcastTitleEnglish.trim() === ''
  const needsPodcastDescriptionTranslation = !podcastDescriptionEnglish || podcastDescriptionEnglish.trim() === ''
  
  // Only count podcast fields for button display (not episodes)
  // Episodes will be fetched and counted when button is clicked
  const totalNeedingTranslation = (needsPodcastTitleTranslation ? 1 : 0) + 
                                  (needsPodcastDescriptionTranslation ? 1 : 0)

  // Show button if podcast fields need translation OR if there are any episodes
  // (episodes will be checked when clicked)

  return (
    <>
      <Button
        onClick={handleTranslateAll}
        disabled={loading}
        size="sm"
        className="bg-blue-500 hover:bg-blue-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {progress.current}/{progress.total}
          </>
        ) : (
          <>
            <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            Translate
          </>
        )}
      </Button>
      {loading && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-orange-600 font-medium">
              ⚠️ Please do not leave the page
            </p>
            <span className="text-xs text-gray-600">{progress.current}/{progress.total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            ></div>
          </div>
          {progress.stage && (
            <p className="text-xs text-gray-600">{progress.stage}</p>
          )}
        </div>
      )}
    </>
  )
}

