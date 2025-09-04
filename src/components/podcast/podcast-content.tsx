'use client'

import { PDFViewer, AudioPlayer } from '@/components/ui'

interface PodcastContentProps {
  podcast: any
}

export function PodcastContent({ podcast }: PodcastContentProps) {
  if (!podcast.script_url && !podcast.script_english_url && !podcast.script_audio_tracks_url && !podcast.script_music_url) {
    return null
  }

  return (
    <div className=" border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">Script & Audio Content</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Access the complete script files and audio content for this podcast
          </p>
        </div>

        {/* Script Files Section */}
        <div className="mb-12">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
            <span className="text-2xl mr-3">📄</span>
            Script Files
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Main Script */}
            {podcast.script_url && (
              <PDFViewer
                file={podcast.script_url}
                title="Main Script"
                className="w-full"
              />
            )}
            
            {/* English Script */}
            {podcast.script_english_url && (
              <PDFViewer
                file={podcast.script_english_url}
                title="English Script"
                className="w-full"
              />
            )}
          </div>
        </div>

        {/* Audio Content Section */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
            <span className="text-2xl mr-3">🎵</span>
            Audio Content
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Audio Tracks Card */}
            {podcast.script_audio_tracks_url && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {podcast.script_audio_tracks_title || 'Audio Tracks'}
                  </h4>
                  {podcast.script_audio_tracks_description && (
                    <p className="text-gray-600 text-sm">
                      {podcast.script_audio_tracks_description}
                    </p>
                  )}
                </div>
                <AudioPlayer
                  src={podcast.script_audio_tracks_url}
                  className="w-full"
                />
              </div>
            )}
            
            {/* Music Files Card */}
            {podcast.script_music_url && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {podcast.script_music_title || 'Music & Sound Effects'}
                  </h4>
                  {podcast.script_music_description && (
                    <p className="text-gray-600 text-sm">
                      {podcast.script_music_description}
                    </p>
                  )}
                </div>
                <AudioPlayer
                  src={podcast.script_music_url}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
