import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface Episode {
  id: string
}

interface Podcast {
  id: string
  language: string
  category: string
  country: string
  episodes?: Episode[]
}

interface PodcastSidebarProps {
  podcast: Podcast
}

export function PodcastSidebar({ podcast }: PodcastSidebarProps) {
  // Calculate estimated values for demo - in real app these would come from database
  const estimatedDuration = Math.round((podcast.episodes?.length || 0) * 35) // avg 35 min per episode
  const totalHours = Math.floor(estimatedDuration / 60)
  const remainingMinutes = estimatedDuration % 60

  return (
    <div className="w-full">
      {/* Main Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">About This Podcast</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Comprehensive licensing information and premium podcast content details
        </p>
      </div>

      {/* Basic Stats Cards - Top Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {/* Duration Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 text-center hover:shadow-xl transition-all duration-300">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{totalHours}h {remainingMinutes}m</div>
          <div className="text-sm text-gray-500 font-medium">Total Duration</div>
        </div>

        {/* Episodes Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 text-center hover:shadow-xl transition-all duration-300">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 616 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{podcast.episodes?.length || 0}</div>
          <div className="text-sm text-gray-500 font-medium">Episodes</div>
        </div>

        {/* Language Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 text-center hover:shadow-xl transition-all duration-300">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1 uppercase">{podcast.language}</div>
          <div className="text-sm text-gray-500 font-medium">Language</div>
        </div>

        {/* Genre Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 text-center hover:shadow-xl transition-all duration-300">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1 capitalize">{podcast.category}</div>
          <div className="text-sm text-gray-500 font-medium">Genre</div>
        </div>
      </div>

      {/* Premium Licensing CTA - Full Width */}
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center mb-8 border border-gray-200 hover:shadow-xl transition-all duration-300 mt-12">
        <div className="max-w-3xl mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Ready to License This Podcast?</h2>
          <p className="text-lg text-gray-600 mb-6 leading-relaxed max-w-2xl mx-auto">
            Get instant access to premium podcast content with comprehensive licensing terms. 
            Perfect for platforms, networks, and content creators.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-lg mx-auto">
            <Link href="https://google.com" className="flex-1" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-red-600 text-white hover:bg-red-700 font-semibold w-full py-3 rounded-xl text-sm shadow-lg hover:shadow-xl transition-all duration-300 whitespace-nowrap">
                🚀 Start Licensing
              </Button>
            </Link>
            <Link href="/catalog" className="flex-1">
              <Button variant="outline" size="lg" className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold w-full py-3 rounded-xl text-sm whitespace-nowrap">
                📚 Browse Catalog
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 