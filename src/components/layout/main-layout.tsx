import { getCurrentUser } from '@/lib/auth'
import Navbar from './navbar'

interface MainLayoutProps {
  children: React.ReactNode
}

export default async function MainLayout({ children }: MainLayoutProps) {
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <Navbar user={user} />
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <div>
              <div className="mb-3 sm:mb-4 inline-flex items-center">
                <img src="/logo-text.avif" alt="RETELL" className="h-5 sm:h-6 w-auto" />
              </div>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                The modern platform for podcast licensing and distribution.
              </p>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3 sm:mb-4">For Authors</h4>
              <ul className="space-y-1.5 sm:space-y-2">
                <li><a href="/author" className="text-xs sm:text-sm text-gray-600 hover:text-orange-600">Upload Content</a></li>
                <li><a href="/author/podcasts" className="text-xs sm:text-sm text-gray-600 hover:text-orange-600">My Podcasts</a></li>
                <li><a href="/pricing" className="text-xs sm:text-sm text-gray-600 hover:text-orange-600">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3 sm:mb-4">Platform</h4>
              <ul className="space-y-1.5 sm:space-y-2">
                <li><a href="/catalog" className="text-xs sm:text-sm text-gray-600 hover:text-orange-600">Browse Catalog</a></li>
                <li><a href="/about" className="text-xs sm:text-sm text-gray-600 hover:text-orange-600">About</a></li>
                <li><a href="/privacy" className="text-xs sm:text-sm text-gray-600 hover:text-orange-600">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
            <p className="text-center text-xs sm:text-sm text-gray-600">
              © 2024 RETELL. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
} 