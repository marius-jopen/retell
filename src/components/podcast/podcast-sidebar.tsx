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
  return (
    <div className="lg:col-span-1">
      <div className="sticky top-8">
        <h3 className="text-2xl font-light text-stone-800 mb-8">About This Podcast</h3>
        
        <div className="space-y-8">
          {/* Content Details */}
          <div>
            <h4 className="font-medium text-stone-800 mb-4 text-sm uppercase tracking-wider">Content Details</h4>
            <ul className="space-y-3 text-stone-600">
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-4"></div>
                {podcast.episodes?.length || 0} episodes available
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-4"></div>
                {podcast.language} language
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-4"></div>
                {podcast.category} category
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-4"></div>
                From {podcast.country}
              </li>
            </ul>
          </div>

          {/* Quality & Format */}
          <div>
            <h4 className="font-medium text-stone-800 mb-4 text-sm uppercase tracking-wider">Quality & Format</h4>
            <ul className="space-y-3 text-stone-600">
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-4"></div>
                High-quality audio files
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-4"></div>
                Complete episode scripts
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-4"></div>
                Professional production
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-4"></div>
                Curated content
              </li>
            </ul>
          </div>
          
          {/* Licensing CTA */}
          <div className="mt-8 p-6 bg-white/70 backdrop-blur-sm rounded-lg border border-stone-200/50">
            <h4 className="font-medium text-stone-800 mb-2">Interested in licensing?</h4>
            <p className="text-sm text-stone-600 mb-5 leading-relaxed">
              Get access to high-quality podcast content for your platform or project.
            </p>
            <div className="flex flex-col space-y-2">
              <Link href="/auth/signup?role=client">
                <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white w-full">
                  Get Started
                </Button>
              </Link>
              <Link href="/catalog">
                <Button variant="outline" size="sm" className="border-stone-300 text-stone-600 hover:bg-stone-50 w-full">
                  Browse More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 