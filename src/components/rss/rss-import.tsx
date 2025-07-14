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
        message: `🎙️ Successfully imported "${data.podcast.title}"! Added ${data.episodes.imported} episodes (${data.episodes.skipped} skipped).`
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
      <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-3xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          📡 Import from RSS Feed ✨
        </h3>
        <p className="text-gray-600 mb-6">
          Got an existing podcast? Just paste your RSS feed URL and we'll import all your episodes automatically! 🚀
        </p>

        <div className="space-y-4">
          <div>
            <label htmlFor="rss-url" className="block text-sm font-medium text-gray-700 mb-2">
              RSS Feed URL
            </label>
            <div className="flex space-x-3">
              <input
                type="url"
                id="rss-url"
                value={rssUrl}
                onChange={(e) => setRssUrl(e.target.value)}
                placeholder="https://your-podcast-feed.com/rss"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              {showPreview && (
                <Button
                  onClick={handlePreview}
                  disabled={!rssUrl.trim() || parsing}
                  variant="outline"
                  className="px-6 py-3 rounded-2xl hover:bg-orange-50 transition-colors"
                >
                  {parsing ? '🔄 Parsing...' : '👀 Preview'}
                </Button>
              )}
              <Button
                onClick={handleImport}
                disabled={!rssUrl.trim() || loading}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105"
              >
                {loading ? '📥 Importing...' : '📥 Import'}
              </Button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center">
                <span className="text-red-600 mr-2">⚠️</span>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview */}
      {preview && (
        <div className="bg-white border border-gray-200 rounded-3xl p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-xl font-bold text-gray-900">
              📋 Import Preview
            </h4>
            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
              {preview.totalEpisodes} episodes found
            </span>
          </div>

          {/* Podcast Info */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6">
            <div className="flex items-start space-x-4">
              {preview.podcast.image && (
                <img
                  src={preview.podcast.image}
                  alt={preview.podcast.title}
                  className="w-16 h-16 rounded-xl object-cover"
                />
              )}
              <div className="flex-1">
                <h5 className="text-lg font-semibold text-gray-900 mb-2">
                  {preview.podcast.title}
                </h5>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {preview.podcast.description}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>🎭 {preview.podcast.category}</span>
                  <span>🌍 {preview.podcast.language}</span>
                  {preview.podcast.author && <span>👤 {preview.podcast.author}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Episodes Preview */}
          <div>
            <h6 className="text-lg font-semibold text-gray-900 mb-4">
              📻 Recent Episodes (showing first 5)
            </h6>
            <div className="space-y-3">
              {preview.episodes.map((episode, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-1">
                        {episode.title}
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {episode.description}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>📅 Episode {episode.episodeNumber}</span>
                        {episode.duration && <span>⏱️ {episode.duration}</span>}
                        {episode.pubDate && (
                          <span>📆 {new Date(episode.pubDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      {episode.audioUrl ? (
                        <span className="text-green-600 text-sm">✅ Audio</span>
                      ) : (
                        <span className="text-red-600 text-sm">❌ No Audio</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start">
              <span className="text-blue-600 mr-2">💡</span>
              <div>
                <p className="text-blue-800 font-medium mb-1">Import Details:</p>
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
      )}
    </div>
  )
} 