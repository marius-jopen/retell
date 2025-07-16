'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { createBrowserSupabaseClient } from '@/lib/supabase'

interface RSSImportProps {
  onImportSuccess?: (podcastId: string) => void
  showPreview?: boolean
}

interface PodcastPreview {
  title: string
  description: string
  image: string | null
  category: string
  language: string
  author: string
  episodeCount: number
}

interface EpisodePreview {
  title: string
  description: string
  duration: string | null
  episodeNumber: number
  season: number
  audioUrl: string | null
  pubDate: string | null
}

export default function RSSImport({ onImportSuccess, showPreview = true }: RSSImportProps) {
  const [rssUrl, setRssUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [preview, setPreview] = useState<{
    podcast: PodcastPreview
    episodes: EpisodePreview[]
    totalEpisodes: number
  } | null>(null)
  const [error, setError] = useState('')
  const { addToast } = useToast()

  const handlePreview = async () => {
    if (!rssUrl.trim()) {
      setError('Please enter an RSS URL')
      return
    }

    setParsing(true)
    setError('')
    setPreview(null)

    try {
      const response = await fetch('/api/rss/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rssUrl: rssUrl.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse RSS feed')
      }

      setPreview({
        podcast: data.podcast,
        episodes: data.episodes,
        totalEpisodes: data.totalEpisodes
      })

    } catch (error) {
      console.error('Preview error:', error)
      setError(error instanceof Error ? error.message : 'Failed to preview RSS feed')
    } finally {
      setParsing(false)
    }
  }

  const handleImport = async () => {
    if (!rssUrl.trim()) {
      setError('Please enter an RSS URL')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/rss/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rssUrl: rssUrl.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import RSS feed')
      }

      addToast({
        type: 'success',
        message: `Successfully imported "${data.podcast.title}"! Added ${data.episodes.imported} episodes (${data.episodes.skipped} skipped).`
      })

      // Clear form
      setRssUrl('')
      setPreview(null)

      // Notify parent component
      if (onImportSuccess) {
        onImportSuccess(data.podcast.id)
      }

    } catch (error) {
      console.error('Import error:', error)
      setError(error instanceof Error ? error.message : 'Failed to import RSS feed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl p-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Import from RSS Feed</h3>
            <p className="text-gray-600">
              Got an existing podcast? Just paste your RSS feed URL and we'll import all your episodes automatically!
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="rss-url" className="block text-sm font-medium text-gray-700 mb-2">
              RSS Feed URL
            </label>
            <input
              type="url"
              id="rss-url"
              value={rssUrl}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRssUrl(e.target.value)}
              placeholder="https://your-podcast-feed.com/rss"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
            />
          </div>

          <div className="flex space-x-3">
            {showPreview && (
              <Button
                onClick={handlePreview}
                disabled={!rssUrl.trim() || parsing}
                variant="outline"
                size="lg"
                rounded="xl"
                className="flex-1"
              >
                {parsing ? 'Parsing...' : 'Preview'}
              </Button>
            )}
            <Button
              onClick={handleImport}
              disabled={!rssUrl.trim() || loading}
              variant="primary"
              size="lg"
              rounded="xl"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              {loading ? 'Importing...' : 'Import'}
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview */}
      {preview && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-500 rounded-xl flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-gray-900">Import Preview</h4>
              </div>
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                {preview.totalEpisodes} episodes found
              </span>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Podcast Info */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="flex items-start space-x-4">
                {preview.podcast.image ? (
                  <img
                    src={preview.podcast.image}
                    alt={preview.podcast.title}
                    className="w-16 h-16 rounded-2xl object-cover shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-sm">
                    <span className="text-white font-bold text-lg">
                      {preview.podcast.title.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h5 className="text-lg font-semibold text-gray-900 mb-2">
                    {preview.podcast.title}
                  </h5>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {preview.podcast.description}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded-full">
                      {preview.podcast.category}
                    </span>
                    <span className="bg-gray-100 px-2 py-1 rounded-full">
                      {preview.podcast.language}
                    </span>
                    {preview.podcast.author && (
                      <span className="bg-gray-100 px-2 py-1 rounded-full">
                        {preview.podcast.author}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Episodes Preview */}
            <div>
              <h6 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Episodes (showing first 5)
              </h6>
              <div className="space-y-3">
                {preview.episodes.map((episode, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h6 className="font-medium text-gray-900 mb-1 truncate">
                          {episode.title}
                        </h6>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {episode.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="bg-gray-100 px-2 py-1 rounded-full">
                            Episode {episode.episodeNumber}
                          </span>
                          {episode.duration && (
                            <span className="bg-gray-100 px-2 py-1 rounded-full">
                              {episode.duration}
                            </span>
                          )}
                          {episode.pubDate && (
                            <span className="bg-gray-100 px-2 py-1 rounded-full">
                              {new Date(episode.pubDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        {episode.audioUrl ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Audio
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            No Audio
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-blue-800 font-medium mb-2">Import Details:</p>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>• Episodes will be automatically published if auto-publish is enabled</li>
                    <li>• If auto-publish is disabled, episodes will need your approval</li>
                    <li>• Duplicates will be automatically skipped</li>
                    <li>• You can review and edit each episode after import</li>
                    <li>• Episodes need script URLs to be complete</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 