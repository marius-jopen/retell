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
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
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
                showDeleteButton={false}
              />
            )}
            
            {/* English Script */}
            {podcast.script_english_url && (
              <PDFViewer
                file={podcast.script_english_url}
                title="English Script"
                className="w-full"
                showDeleteButton={false}
              />
            )}
          </div>
        </div>

        {/* Audio Content Section */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="text-2xl mr-3">🎵</span>
            Audio Content
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Audio Tracks */}
            {podcast.script_audio_tracks_url && (
              <AudioPlayer
                src={podcast.script_audio_tracks_url}
                title="Audio Tracks"
                className="w-full"
                showDeleteButton={false}
              />
            )}
            
            {/* Music Files */}
            {podcast.script_music_url && (
              <AudioPlayer
                src={podcast.script_music_url}
                title="Music & Sound Effects"
                className="w-full"
                showDeleteButton={false}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
