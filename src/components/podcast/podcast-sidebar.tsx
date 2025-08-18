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
      <div className="text-center mb-16">
        <h2 className="text-5xl font-bold text-gray-900 mb-6">About This Podcast</h2>
        <p className="text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Comprehensive licensing information and premium podcast content details
        </p>
      </div>

      {/* Basic Stats Cards - Top Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {/* Duration Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{totalHours}h {remainingMinutes}m</div>
          <div className="text-sm text-gray-500 font-medium">Total Duration</div>
        </div>

        {/* Episodes Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 616 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{podcast.episodes?.length || 0}</div>
          <div className="text-sm text-gray-500 font-medium">Episodes</div>
        </div>

        {/* Language Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1 uppercase">{podcast.language}</div>
          <div className="text-sm text-gray-500 font-medium">Language</div>
        </div>

        {/* Genre Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1 capitalize">{podcast.category}</div>
          <div className="text-sm text-gray-500 font-medium">Genre</div>
        </div>
      </div>

      {/* Main Licensing Information Header */}
      <div className="text-center mb-12">
        <h3 className="text-4xl font-bold text-gray-900 mb-4">🏛️ Licensing Information</h3>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Complete licensing details and terms for this premium podcast content
        </p>
      </div>

      {/* Licensing Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {/* Copyright Terms Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center mb-6">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mr-4">
              <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Copyright Terms</h3>
          </div>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="text-gray-600 text-sm mb-1">License Duration</div>
              <div className="text-gray-900 font-bold text-lg">Lifetime + 70 years</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="text-gray-600 text-sm mb-1">Content Rights</div>
              <div className="text-gray-900 font-bold text-lg">Full Commercial Use</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="text-gray-600 text-sm mb-1">Territory</div>
              <div className="text-gray-900 font-bold text-lg">Worldwide</div>
            </div>
          </div>
        </div>

        {/* Content Package Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center mb-6">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mr-4">
              <svg className="w-8 h-8 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Content Package</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center py-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-gray-700">High-quality audio files (320kbps)</span>
            </div>
            <div className="flex items-center py-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-gray-700">Complete episode scripts</span>
            </div>
            <div className="flex items-center py-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-gray-700">Metadata & show notes</span>
            </div>
            <div className="flex items-center py-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-gray-700">Cover art & branding</span>
            </div>
            <div className="flex items-center py-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-gray-700">Professional production</span>
            </div>
          </div>
        </div>

        {/* Demographics Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-green-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center mb-6">
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mr-4">
              <svg className="w-8 h-8 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Demographics</h3>
          </div>
          <div className="space-y-4">
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <div className="text-green-700 text-sm mb-1">Total Listeners</div>
              <div className="text-gray-900 font-bold text-lg">150K+ per launch</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <div className="text-green-700 text-sm mb-1">Per Episode</div>
              <div className="text-gray-900 font-bold text-lg">5K+ average</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <div className="text-green-700 text-sm mb-1">Age Groups</div>
              <div className="text-gray-900 font-bold text-lg">25-45 (70%)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Licensing CTA - Full Width */}
      <div className="bg-white rounded-3xl shadow-2xl p-12 text-center mb-12 border border-gray-200 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="max-w-4xl mx-auto">
          <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <svg className="w-12 h-12 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold mb-6 text-gray-900">Ready to License This Podcast?</h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
            Get instant access to premium podcast content with comprehensive licensing terms. 
            Perfect for platforms, networks, and content creators.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
            <Link href="/auth/signup?role=client" className="flex-1">
              <Button size="lg" className="bg-red-600 text-white hover:bg-red-700 font-bold w-full py-4 rounded-2xl text-base shadow-lg hover:shadow-xl transition-all duration-300 whitespace-nowrap">
                🚀 Start Licensing
              </Button>
            </Link>
            <Link href="/catalog" className="flex-1">
              <Button variant="outline" size="lg" className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-bold w-full py-4 rounded-2xl text-base whitespace-nowrap">
                📚 Browse Catalog
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 