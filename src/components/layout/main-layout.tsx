import { getCurrentUser } from '@/lib/auth'
import Navbar from './navbar'

interface MainLayoutProps {
  children: React.ReactNode
}

export default async function MainLayout({ children }: MainLayoutProps) {
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      <main className="flex-1">
        {children}
      </main>
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="mb-4 inline-flex items-center">
                <img src="/logo-text.avif" alt="RETELL" className="h-6 w-auto" />
              </div>
              <p className="text-gray-600 leading-relaxed">
                The modern platform for podcast licensing and distribution.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">For Authors</h4>
              <ul className="space-y-2">
                <li><a href="/author" className="text-gray-600 hover:text-orange-600">Upload Content</a></li>
                <li><a href="/author/podcasts" className="text-gray-600 hover:text-orange-600">My Podcasts</a></li>
                <li><a href="/pricing" className="text-gray-600 hover:text-orange-600">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><a href="/catalog" className="text-gray-600 hover:text-orange-600">Browse Catalog</a></li>
                <li><a href="/about" className="text-gray-600 hover:text-orange-600">About</a></li>
                <li><a href="/privacy" className="text-gray-600 hover:text-orange-600">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-center text-gray-600">
              © 2024 RETELL. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
} 